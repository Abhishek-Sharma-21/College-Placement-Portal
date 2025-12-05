import JobApplication from "../model/jobApplication.model.js";
import Job from "../model/job.model.js";

export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
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
    const existingApplication = await JobApplication.findOne({
      job: jobId,
      student: studentId,
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }

    // Create application
    const application = new JobApplication({
      job: jobId,
      student: studentId,
    });

    await application.save();
    await application.populate("student", "fullName email");
    await application.populate("job", "title company");

    res.status(201).json({
      message: "Application submitted successfully!",
      application,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    if (error.code === 11000) {
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

    // Verify job exists and user is the creator
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if user is the job poster (TPO)
    if (job.postedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view applications for this job" });
    }

    const applications = await JobApplication.find({ job: jobId })
      .populate("student", "fullName email")
      .populate("job", "title company")
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching applications." });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    // Get all jobs posted by this TPO
    const jobs = await Job.find({ postedBy: req.user.id }).select("_id");
    const jobIds = jobs.map((job) => job._id);

    const applications = await JobApplication.find({ job: { $in: jobIds } })
      .populate("student", "fullName email")
      .populate("job", "title company")
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
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

    // Verify job exists and user is the creator
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const count = await JobApplication.countDocuments({ job: jobId });
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

    const application = await JobApplication.findById(applicationId).populate(
      "job"
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if user is the job poster
    if (application.job.postedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this application" });
    }

    if (
      status &&
      !["pending", "reviewed", "shortlisted", "rejected", "accepted"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;

    await application.save();
    await application.populate("student", "fullName email");
    await application.populate("job", "title company");

    res.status(200).json({
      message: "Application status updated successfully",
      application,
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
    const applications = await JobApplication.find({ student: req.user.id })
      .populate("job", "title company location ctc deadline status")
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching my applications:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching applications." });
  }
};
