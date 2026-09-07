import { prisma } from "../config/prisma.js";
import { sendNotification } from "../config/socket.js";
import { checkEligibility } from "../services/eligibility.service.js";
import { logAudit } from "../utils/audit.js";

const formatJobApplication = (app) => {
  if (!app) return null;
  return {
    ...app,
    _id: app.id,
    job: app.job ? {
      ...app.job,
      _id: app.job.id,
      id: app.job.id,
    } : null,
    student: app.student ? {
      ...app.student,
      _id: app.student.id,
      id: app.student.id,
    } : null,
  };
};

export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.id;

    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if job is active
    if (job.status !== "active") {
      return res
        .status(400)
        .json({ message: "This job is not accepting applications" });
    }

    // Check if student already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_studentId: {
          jobId: jobId,
          studentId: studentId,
        },
      },
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }

    // Fetch candidate student profile details
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
    });

    // Check candidate eligibility
    const { eligible, reasons } = checkEligibility(req.user, profile, job);
    if (!eligible) {
      return res.status(403).json({
        message: "You are not eligible for this placement drive.",
        reasons,
      });
    }

    // Create application with initial status history JSON log
    const application = await prisma.jobApplication.create({
      data: {
        jobId: jobId,
        studentId: studentId,
        status: "applied",
        statusHistory: [
          {
            status: "applied",
            timestamp: new Date().toISOString(),
            changedBy: req.user.role,
            notes: "Application submitted.",
          }
        ]
      },
      include: {
        student: {
          select: { id: true, fullName: true, email: true },
        },
        job: {
          select: { id: true, title: true, company: true },
        },
      },
    });

    res.status(201).json({
      message: "Application submitted successfully!",
      application: formatJobApplication(application),
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }
    res
      .status(500)
      .json({ message: "Server error while submitting application." });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { search, status, sortBy = "appliedAt", sortOrder = "desc", page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Verify job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if user is the job poster (TPO)
    if (job.postedById !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view applications for this job" });
    }

    // Automatically mark all applied applications as under_review when viewed by TPO
    await prisma.jobApplication.updateMany({
      where: {
        jobId: jobId,
        status: "applied",
      },
      data: {
        status: "under_review",
      },
    });

    // Build query filter
    const where = { jobId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.student = {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const orderBy = {};
    if (sortBy === "fullName") {
      orderBy.student = { fullName: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [total, applications] = await prisma.$transaction([
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profile: true,
            },
          },
          job: { select: { id: true, title: true, company: true } },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
    ]);

    res.status(200).json({
      applications: applications.map(formatJobApplication),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching applications." });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const { search, status, sortBy = "appliedAt", sortOrder = "desc", page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get all jobs posted by this TPO
    const jobs = await prisma.job.findMany({
      where: { postedById: req.user.id },
      select: { id: true },
    });
    const jobIds = jobs.map((job) => job.id);

    const where = { jobId: { in: jobIds } };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { student: { fullName: { contains: search, mode: "insensitive" } } },
        { student: { email: { contains: search, mode: "insensitive" } } },
        { job: { title: { contains: search, mode: "insensitive" } } },
        { job: { company: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orderBy = {};
    if (sortBy === "fullName") {
      orderBy.student = { fullName: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [total, applications] = await prisma.$transaction([
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profile: true,
            },
          },
          job: { select: { id: true, title: true, company: true } },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
    ]);

    res.status(200).json({
      applications: applications.map(formatJobApplication),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error fetching all applications:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching applications." });
  }
};

export const getApplicationCount = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedById !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const count = await prisma.jobApplication.count({ where: { jobId: jobId } });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error getting application count:", error);
    res
      .status(500)
      .json({ message: "Server error while getting application count." });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if user is the job poster
    if (application.job.postedById !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this application" });
    }

    const validStatuses = [
      "applied",
      "under_review",
      "shortlisted",
      "assessment",
      "interview",
      "selected",
      "rejected"
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value. Must be one of: " + validStatuses.join(", ") });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // Append to status history
    const existingHistory = Array.isArray(application.statusHistory) ? application.statusHistory : [];
    const transition = {
      status: status || application.status,
      timestamp: new Date().toISOString(),
      changedBy: req.user.fullName,
      notes: notes || "",
    };
    updateData.statusHistory = [...existingHistory, transition];

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: updateData,
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        job: { select: { id: true, title: true, company: true } },
      },
    });

    sendNotification(updated.studentId, "status_updated", {
      jobId: updated.jobId,
      title: updated.job.title,
      company: updated.job.company,
      status: updated.status,
    });

    await logAudit(req.user.id, "UPDATE_APPLICATION_STATUS", `application:${applicationId}`, { status: application.status }, { status: updated.status });

    res.status(200).json({
      message: "Application status updated successfully",
      application: formatJobApplication(updated),
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res
      .status(500)
      .json({ message: "Server error while updating application status." });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { studentId: req.user.id },
      include: {
        job: { select: { id: true, title: true, company: true, location: true, ctc: true, deadline: true, status: true } },
      },
      orderBy: { appliedAt: "desc" },
    });

    res.status(200).json(applications.map(formatJobApplication));
  } catch (error) {
    console.error("Error fetching my applications:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching applications." });
  }
};
