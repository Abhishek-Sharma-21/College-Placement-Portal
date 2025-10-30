import Job from "../model/job.model.js";

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

    const job = new Job({
      title,
      company,
      description,
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim())
        : [],
      ctc,
      location,
      deadline,
      applicationLink,
      postedBy: req.user.id, // assumes auth middleware sets req.user
      status:
        status && ["active", "completed"].includes(status) ? status : undefined,
    });
    await job.save();
    res.status(201).json({ message: "Job created successfully!", job });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error while creating job." });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({})
      .populate("postedBy", "fullName email role")
      .sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error while fetching jobs." });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "fullName email role"
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error("Error fetching job by id:", error);
    res.status(500).json({ message: "Server error while fetching job." });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    // Only allow TPO who posted the job to update it
    if (job.postedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this job." });
    }
    const updates = req.body;
    if (updates.skills && typeof updates.skills === "string") {
      updates.skills = updates.skills.split(",").map((s) => s.trim());
    }
    if (updates.status && !["active", "completed"].includes(updates.status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }
    Object.assign(job, updates);
    await job.save();
    res.status(200).json({ message: "Job updated successfully!", job });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Server error while updating job." });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure only the posting user can delete; do it atomically
    const deleted = await Job.findOneAndDelete({
      _id: id,
      postedBy: req.user.id,
    });
    if (!deleted) {
      // Determine if not found or forbidden by checking existence without owner
      const exists = await Job.findById(id);
      if (!exists) {
        return res.status(404).json({ message: "Job not found" });
      }
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this job." });
    }
    return res.status(200).json({ message: "Job deleted successfully!" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res
      .status(500)
      .json({ message: "Server error while deleting job." });
  }
};
