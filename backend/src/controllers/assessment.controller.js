import Assessment from "../model/assessment.model.js";

export const createAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      passingScore,
      startDate,
      endDate,
      difficulty,
      category,
      instructions,
      questions,
      status,
      job,
    } = req.body;

    // Validation
    if (!title || !description || !duration) {
      return res
        .status(400)
        .json({ message: "Title, description, and duration are required." });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one question is required." });
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question || !q.options || !Array.isArray(q.options)) {
        return res
          .status(400)
          .json({ message: "Each question must have text and options." });
      }
      if (q.options.length < 2) {
        return res
          .status(400)
          .json({ message: "Each question must have at least 2 options." });
      }
    }

    const assessment = new Assessment({
      title,
      description,
      duration,
      passingScore,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      difficulty,
      category,
      instructions,
      questions,
      createdBy: req.user.id,
      job: job || undefined,
      status:
        status && ["draft", "published", "archived"].includes(status)
          ? status
          : "draft",
    });

    await assessment.save();
    await assessment.populate("createdBy", "fullName email role");
    await assessment.populate("job", "title company");

    res.status(201).json({
      message: "Assessment created successfully!",
      assessment,
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    res
      .status(500)
      .json({ message: "Server error while creating assessment." });
  }
};

export const getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({})
      .populate("createdBy", "fullName email role")
      .populate("job", "title company")
      .sort({ createdAt: -1 });
    res.status(200).json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching assessments." });
  }
};

export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate("createdBy", "fullName email role")
      .populate("job", "title company");
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json(assessment);
  } catch (error) {
    console.error("Error fetching assessment by id:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching assessment." });
  }
};

export const updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Only allow TPO who created the assessment to update it
    if (assessment.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this assessment." });
    }

    const updates = req.body;

    // Validate status if provided
    if (
      updates.status &&
      !["draft", "published", "archived"].includes(updates.status)
    ) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Convert date strings to Date objects if provided
    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }
    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    }

    // Validate questions if provided
    if (updates.questions) {
      if (!Array.isArray(updates.questions) || updates.questions.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one question is required." });
      }
      for (const q of updates.questions) {
        if (!q.question || !q.options || !Array.isArray(q.options)) {
          return res
            .status(400)
            .json({ message: "Each question must have text and options." });
        }
        if (q.options.length < 2) {
          return res
            .status(400)
            .json({ message: "Each question must have at least 2 options." });
        }
      }
    }

    Object.assign(assessment, updates);
    await assessment.save();
    await assessment.populate("createdBy", "fullName email role");
    await assessment.populate("job", "title company");

    res.status(200).json({
      message: "Assessment updated successfully!",
      assessment,
    });
  } catch (error) {
    console.error("Error updating assessment:", error);
    res
      .status(500)
      .json({ message: "Server error while updating assessment." });
  }
};

export const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure only the creator can delete
    const deleted = await Assessment.findOneAndDelete({
      _id: id,
      createdBy: req.user.id,
    });
    if (!deleted) {
      // Determine if not found or forbidden
      const exists = await Assessment.findById(id);
      if (!exists) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this assessment." });
    }
    return res
      .status(200)
      .json({ message: "Assessment deleted successfully!" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return res
      .status(500)
      .json({ message: "Server error while deleting assessment." });
  }
};

export const getMyAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ createdBy: req.user.id })
      .populate("createdBy", "fullName email role")
      .populate("job", "title company")
      .sort({ createdAt: -1 });
    res.status(200).json(assessments);
  } catch (error) {
    console.error("Error fetching my assessments:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching assessments." });
  }
};
