import Assessment from "../model/assessment.model.js";
import AssessmentResult from "../model/assessmentResult.model.js";

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

    // Create new assessment
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
      status:
        status && ["draft", "published", "archived"].includes(status)
          ? status
          : "draft",
    });

    await assessment.save();
    await assessment.populate("createdBy", "fullName email role");

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
    const assessment = await Assessment.findById(req.params.id).populate(
      "createdBy",
      "fullName email role"
    );
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
      !["draft", "published", "live", "archived"].includes(updates.status)
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
      .sort({ createdAt: -1 });
    res.status(200).json(assessments);
  } catch (error) {
    console.error("Error fetching my assessments:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching assessments." });
  }
};

// Get live assessments for students
export const getLiveAssessments = async (req, res) => {
  try {
    const now = new Date();

    // Get assessments that are live
    // If startDate/endDate exist, check time frame, otherwise show all live assessments
    const assessments = await Assessment.find({
      status: "live",
      $and: [
        {
          $or: [
            // If startDate doesn't exist, include it
            { startDate: { $exists: false } },
            // If startDate exists, check if current time is after startDate
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            // If endDate doesn't exist, include it
            { endDate: { $exists: false } },
            // If endDate exists, check if current time is before endDate
            { endDate: { $gte: now } },
          ],
        },
      ],
    })
      .populate("createdBy", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json(assessments);
  } catch (error) {
    console.error("Error fetching live assessments:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching live assessments." });
  }
};

// Get assessment results for TPO
export const getAssessmentResults = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify assessment exists and user is the creator
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Only allow TPO who created the assessment to view results
    if (assessment.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view results for this assessment" });
    }

    // Get all results for this assessment
    const results = await AssessmentResult.find({ assessment: id })
      .populate("student", "fullName email")
      .populate("assessment", "title questions")
      .sort({ submittedAt: -1 });

    // Calculate statistics
    const totalStudents = results.length;
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = totalStudents - passedCount;
    const averageScore =
      totalStudents > 0
        ? results.reduce((sum, r) => sum + r.percentage, 0) / totalStudents
        : 0;
    const averageTime =
      totalStudents > 0
        ? results.reduce((sum, r) => sum + (r.timeTaken || 0), 0) /
          totalStudents
        : 0;

    res.status(200).json({
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        duration: assessment.duration,
        passingScore: assessment.passingScore,
        totalQuestions: assessment.questions.length,
        questions: assessment.questions, // Include questions for answer details view
      },
      results,
      statistics: {
        totalStudents,
        passedCount,
        failedCount,
        averageScore: averageScore.toFixed(2),
        averageTime: averageTime.toFixed(1),
      },
    });
  } catch (error) {
    console.error("Error fetching assessment results:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching assessment results." });
  }
};

// Get assessment for taking (without correct answers)
export const getAssessmentForTaking = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Check if assessment is live
    if (assessment.status !== "live") {
      return res.status(403).json({ message: "Assessment is not live" });
    }

    // Check if within time frame
    if (assessment.startDate && now < assessment.startDate) {
      return res.status(403).json({
        message: `Assessment will be available starting ${assessment.startDate.toLocaleString()}`,
      });
    }
    if (assessment.endDate && now > assessment.endDate) {
      return res.status(403).json({
        message: `Assessment has ended on ${assessment.endDate.toLocaleString()}`,
      });
    }

    // Check if student has already submitted
    const existingResult = await AssessmentResult.findOne({
      assessment: id,
      student: req.user.id,
    });

    if (existingResult && existingResult.submittedAt) {
      return res.status(403).json({
        message: "You have already submitted this assessment",
        result: existingResult,
      });
    }

    // Remove correct answers from questions
    const questionsForStudent = assessment.questions.map((q) => ({
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points,
    }));

    const assessmentForStudent = {
      _id: assessment._id,
      title: assessment.title,
      description: assessment.description,
      duration: assessment.duration,
      passingScore: assessment.passingScore,
      instructions: assessment.instructions,
      questions: questionsForStudent,
      startedAt: existingResult?.startedAt || new Date(),
    };

    res.status(200).json(assessmentForStudent);
  } catch (error) {
    console.error("Error fetching assessment for taking:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching assessment." });
  }
};

// Submit assessment answers
export const submitAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, startedAt, autoSubmitted } = req.body;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Check if student has already submitted
    let result = await AssessmentResult.findOne({
      assessment: id,
      student: req.user.id,
    });

    if (result && result.submittedAt) {
      return res.status(403).json({
        message: "You have already submitted this assessment",
        result,
      });
    }

    // Calculate score
    let totalScore = 0;
    let totalPoints = 0;
    const processedAnswers = assessment.questions.map((question, index) => {
      totalPoints += question.points || 1;
      const studentAnswer = answers.find((a) => a.questionIndex === index);
      const selectedAnswer = studentAnswer?.selectedAnswer ?? null;
      const isCorrect = selectedAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points || 1 : 0;
      totalScore += pointsEarned;

      return {
        questionIndex: index,
        selectedAnswer,
        isCorrect,
        pointsEarned,
      };
    });

    const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
    const passed = assessment.passingScore
      ? percentage >= assessment.passingScore
      : false;

    const submittedAt = new Date();
    const timeTaken = startedAt
      ? Math.round((submittedAt - new Date(startedAt)) / 1000 / 60)
      : 0;

    if (result) {
      // Update existing result
      result.answers = processedAnswers;
      result.score = totalScore;
      result.totalPoints = totalPoints;
      result.percentage = percentage;
      result.passed = passed;
      result.submittedAt = submittedAt;
      result.timeTaken = timeTaken;
      result.autoSubmitted = autoSubmitted || false;
      await result.save();
    } else {
      // Create new result
      result = new AssessmentResult({
        assessment: id,
        student: req.user.id,
        answers: processedAnswers,
        score: totalScore,
        totalPoints,
        percentage,
        passed,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        submittedAt,
        timeTaken,
        autoSubmitted: autoSubmitted || false,
      });
      await result.save();
    }

    await result.populate("assessment", "title");
    await result.populate("student", "fullName email");

    res.status(200).json({
      message: "Assessment submitted successfully!",
      result,
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already submitted this assessment",
      });
    }
    res
      .status(500)
      .json({ message: "Server error while submitting assessment." });
  }
};
