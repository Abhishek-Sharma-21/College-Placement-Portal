import { prisma } from "../config/prisma.js";
import { broadcastNotification } from "../config/socket.js";
import { logAudit } from "../utils/audit.js";
import { checkEligibility } from "../services/eligibility.service.js";

const formatJob = (job) => {
  if (!job) return null;
  return {
    ...job,
    _id: job.id,
    postedBy: job.postedBy ? {
      ...job.postedBy,
      _id: job.postedBy.id,
    } : null,
  };
};

export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      skills,
      ctc,
      location,
      deadline,
      applicationLink,
      status,
      minCgpa,
      allowedBranches,
      gradYear,
      backlogRules,
      experience,
    } = req.body;

    if (
      !title ||
      !company ||
      !description ||
      !skills ||
      !ctc ||
      !location ||
      !deadline
    ) {
      return res
        .status(400)
        .json({ message: "All fields except applicationLink are required." });
    }

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim())
      : [];

    const parsedBranches = Array.isArray(allowedBranches)
      ? allowedBranches
      : typeof allowedBranches === "string"
      ? allowedBranches.split(",").map((b) => b.trim())
      : [];

    const job = await prisma.job.create({
      data: {
        title,
        company,
        description,
        skills: parsedSkills,
        ctc: parseFloat(ctc),
        location,
        deadline: new Date(deadline),
        applicationLink: applicationLink || null,
        postedById: req.user.id,
        status: status && ["active", "completed"].includes(status) ? status : "active",
        minCgpa: minCgpa !== undefined && minCgpa !== "" ? parseFloat(minCgpa) : null,
        allowedBranches: parsedBranches,
        gradYear: gradYear !== undefined && gradYear !== "" ? parseInt(gradYear) : null,
        backlogRules: backlogRules !== undefined && backlogRules !== "" ? parseInt(backlogRules) : 0,
        experience: experience !== undefined && experience !== "" ? parseFloat(experience) : 0,
      },
      include: {
        postedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    broadcastNotification("job_posted", {
      jobId: job.id,
      title: job.title,
      company: job.company,
    });

    await logAudit(req.user.id, "CREATE_JOB", `job:${job.id}`, null, { title: job.title, company: job.company });

    res.status(201).json({ message: "Job created successfully!", job: formatJob(job) });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error while creating job." });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        postedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let formattedJobs = jobs.map(formatJob);

    // If student, calculate eligibility for each job
    if (req.user && req.user.role === "student") {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      formattedJobs = formattedJobs.map((job) => {
        const evaluation = checkEligibility(req.user, studentProfile, job);
        return {
          ...job,
          eligibility: evaluation,
        };
      });
    }

    res.status(200).json(formattedJobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error while fetching jobs." });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        postedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    let formattedJob = formatJob(job);
    if (req.user && req.user.role === "student") {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      const evaluation = checkEligibility(req.user, studentProfile, job);
      formattedJob.eligibility = evaluation;
    }
    res.status(200).json(formattedJob);
  } catch (error) {
    console.error("Error fetching job by id:", error);
    res.status(500).json({ message: "Server error while fetching job." });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    // Only allow TPO who posted the job to update it
    if (job.postedById !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this job." });
    }

    const updates = req.body;
    const updateData = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.company !== undefined) updateData.company = updates.company;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.skills !== undefined) {
      updateData.skills = Array.isArray(updates.skills)
        ? updates.skills
        : typeof updates.skills === "string"
        ? updates.skills.split(",").map((s) => s.trim())
        : [];
    }
    if (updates.ctc !== undefined) updateData.ctc = parseFloat(updates.ctc);
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.deadline !== undefined) updateData.deadline = new Date(updates.deadline);
    if (updates.applicationLink !== undefined) updateData.applicationLink = updates.applicationLink;
    if (updates.minCgpa !== undefined) updateData.minCgpa = updates.minCgpa !== "" && updates.minCgpa !== null ? parseFloat(updates.minCgpa) : null;
    if (updates.allowedBranches !== undefined) {
      updateData.allowedBranches = Array.isArray(updates.allowedBranches)
        ? updates.allowedBranches
        : typeof updates.allowedBranches === "string"
        ? updates.allowedBranches.split(",").map((b) => b.trim())
        : [];
    }
    if (updates.gradYear !== undefined) updateData.gradYear = updates.gradYear !== "" && updates.gradYear !== null ? parseInt(updates.gradYear) : null;
    if (updates.backlogRules !== undefined) updateData.backlogRules = updates.backlogRules !== "" && updates.backlogRules !== null ? parseInt(updates.backlogRules) : 0;
    if (updates.experience !== undefined) updateData.experience = updates.experience !== "" && updates.experience !== null ? parseFloat(updates.experience) : 0;
    if (updates.status !== undefined) {
      if (!["active", "completed"].includes(updates.status)) {
        return res.status(400).json({ message: "Invalid status value." });
      }
      updateData.status = updates.status;
    }

    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        postedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await logAudit(req.user.id, "UPDATE_JOB", `job:${job.id}`, { status: job.status, title: job.title }, { status: updatedJob.status, title: updatedJob.title });

    res.status(200).json({ message: "Job updated successfully!", job: formatJob(updatedJob) });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Server error while updating job." });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const exists = await prisma.job.findUnique({
      where: { id },
    });
    if (!exists) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (exists.postedById !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this job." });
    }

    await prisma.job.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Job deleted successfully!" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res
      .status(500)
      .json({ message: "Server error while deleting job." });
  }
};
