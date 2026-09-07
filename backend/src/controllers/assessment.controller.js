import { prisma } from "../config/prisma.js";
import { sendNotification, getIo } from "../config/socket.js";
import { generateMockAssessment } from "../services/aiAssessment.service.js";
import { logAudit } from "../utils/audit.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getComputedStatus = (asm) => {
  if (!asm) return "draft";
  const now = new Date();
  
  if (asm.status === "draft") return "draft";
  if (asm.status === "ready") return "ready";
  if (asm.status === "archived") return "archived";
  
  // If the status is "live"
  if (asm.endDate && now > new Date(asm.endDate)) {
    return "ended";
  }
  if (asm.startDate && now < new Date(asm.startDate)) {
    return "upcoming";
  }
  return "live";
};

export const runAssessmentValidation = (asm) => {
  const issues = [];
  if (!asm.title || asm.title.trim().length < 3) {
    issues.push("Title must be at least 3 characters long.");
  }
  if (!asm.description || asm.description.trim().length < 5) {
    issues.push("Description must be at least 5 characters long.");
  }
  if (asm.duration === undefined || asm.duration === null || parseInt(asm.duration) <= 0) {
    issues.push("Duration must be a positive integer.");
  }
  if (asm.startDate && asm.endDate && new Date(asm.startDate) >= new Date(asm.endDate)) {
    issues.push("End time must be after start time.");
  }
  
  const questions = Array.isArray(asm.questions) ? asm.questions : [];
  if (questions.length === 0) {
    issues.push("Assessment must contain at least 1 question.");
  } else {
    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      if (!q.question || q.question.trim().length < 3) {
        issues.push(`Question ${qNum} text is empty or too short.`);
      }
      if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
        issues.push(`Question ${qNum} must have exactly 4 options.`);
      } else {
        const seenOpts = new Set();
        q.options.forEach((opt, optIdx) => {
          if (!opt || opt.trim() === "") {
            issues.push(`Question ${qNum} Option ${String.fromCharCode(65 + optIdx)} cannot be empty.`);
          }
          const normalized = opt.toLowerCase().trim();
          if (seenOpts.has(normalized)) {
            issues.push(`Question ${qNum} has duplicate option: "${opt}".`);
          }
          seenOpts.add(normalized);
        });
      }
      if (q.correctAnswer === null || q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
        issues.push(`Question ${qNum} must have a valid correct answer selected (0-3).`);
      }
    });
  }
  return issues;
};

const formatAssessment = (asm, userRole = null) => {
  if (!asm) return null;
  const formatted = {
    ...asm,
    _id: asm.id,
    computedStatus: getComputedStatus(asm),
    createdBy: asm.createdBy ? {
      ...asm.createdBy,
      _id: asm.createdBy.id,
      id: asm.createdBy.id,
    } : null,
  };
  if (userRole === "student" && Array.isArray(formatted.questions)) {
    formatted.questions = formatted.questions.map(q => {
      const { correctAnswer, explanation, ...rest } = q;
      return rest;
    });
  }
  return formatted;
};

const formatAssessmentResult = (res) => {
  if (!res) return null;
  const answersList = Array.isArray(res.answers) ? res.answers : [];
  const correct = answersList.filter((a) => a.isCorrect === true).length;
  const unanswered = answersList.filter((a) => a.selectedAnswer === null || a.selectedAnswer === undefined).length;
  const incorrect = answersList.length - correct - unanswered;

  return {
    ...res,
    _id: res.id,
    totalQuestions: answersList.length,
    correct,
    incorrect,
    unanswered,
    assessment: res.assessment ? {
      ...res.assessment,
      _id: res.assessment.id,
      id: res.assessment.id,
    } : null,
    student: res.student ? {
      ...res.student,
      _id: res.student.id,
      id: res.student.id,
    } : null,
  };
};

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
      jobId,
      positiveMarks,
      negativeMarks,
      allowedAttempts,
      randomizeQuestions,
      randomizeOptions,
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

    if (passingScore !== undefined && passingScore !== null) {
      const ps = parseFloat(passingScore);
      if (ps < 0 || ps > 100) {
        return res.status(400).json({ message: "Passing percentage must be between 0 and 100." });
      }
    }

    if (allowedAttempts !== undefined && allowedAttempts !== null) {
      if (parseInt(allowedAttempts) < 1) {
        return res.status(400).json({ message: "Allowed attempts must be at least 1." });
      }
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
    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        duration: parseInt(duration),
        passingScore: passingScore ? parseFloat(passingScore) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        difficulty: difficulty || null,
        category: category || null,
        instructions: instructions || null,
        questions: questions,
        createdById: req.user.id,
        status: status && ["draft", "published", "live", "archived"].includes(status) ? status : "draft",
        jobId: jobId || null,
        positiveMarks: positiveMarks !== undefined ? parseFloat(positiveMarks) : 10,
        negativeMarks: negativeMarks !== undefined ? parseFloat(negativeMarks) : 0,
        allowedAttempts: allowedAttempts !== undefined ? parseInt(allowedAttempts) : 1,
        randomizeQuestions: randomizeQuestions === true || randomizeQuestions === "true",
        randomizeOptions: randomizeOptions === true || randomizeOptions === "true",
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    if (jobId) {
      try {
        const applications = await prisma.jobApplication.findMany({
          where: { jobId },
          select: { studentId: true },
        });
        applications.forEach((app) => {
          sendNotification(app.studentId, "assessment_linked", {
            assessmentId: assessment.id,
            title: assessment.title,
            jobId,
          });
        });
      } catch (err) {
        console.error("Error sending socket alert to applicants:", err);
      }
    }

    await logAudit(req.user.id, "CREATE_ASSESSMENT", `assessment:${assessment.id}`, null, { title: assessment.title, status: assessment.status });

    res.status(201).json({
      message: "Assessment created successfully!",
      assessment: formatAssessment(assessment),
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
    const assessments = await prisma.assessment.findMany({
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(assessments.map(formatAssessment));
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching assessments." });
  }
};

export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json(formatAssessment(assessment, req.user?.role));
  } catch (error) {
    console.error("Error fetching assessment by id:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching assessment." });
  }
};

export const updateAssessment = async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
    });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Only allow TPO who created the assessment to update it
    if (assessment.createdById !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this assessment." });
    }

    const updates = req.body;
    const updateData = {};

    // Validate status if provided
    if (
      updates.status &&
      !["draft", "ready", "published", "live", "archived"].includes(updates.status)
    ) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Archived assessments cannot be updated or restored
    if (assessment.status === "archived" && updates.status && updates.status !== "archived") {
      return res.status(400).json({ message: "Archived assessments cannot be updated or restored." });
    }

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.duration !== undefined) updateData.duration = parseInt(updates.duration);
    if (updates.passingScore !== undefined) {
      const ps = updates.passingScore ? parseFloat(updates.passingScore) : null;
      if (ps !== null && (ps < 0 || ps > 100)) {
        return res.status(400).json({ message: "Passing percentage must be between 0 and 100." });
      }
      updateData.passingScore = ps;
    }
    if (updates.startDate !== undefined) updateData.startDate = updates.startDate ? new Date(updates.startDate) : null;
    if (updates.endDate !== undefined) updateData.endDate = updates.endDate ? new Date(updates.endDate) : null;
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.instructions !== undefined) updateData.instructions = updates.instructions;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.jobId !== undefined) updateData.jobId = updates.jobId || null;
    if (updates.questions !== undefined) updateData.questions = updates.questions;
    if (updates.positiveMarks !== undefined) updateData.positiveMarks = parseFloat(updates.positiveMarks);
    if (updates.negativeMarks !== undefined) updateData.negativeMarks = parseFloat(updates.negativeMarks);
    if (updates.allowedAttempts !== undefined) {
      const allowed = parseInt(updates.allowedAttempts);
      if (allowed < 1) {
        return res.status(400).json({ message: "Allowed attempts must be at least 1." });
      }
      updateData.allowedAttempts = allowed;
    }
    if (updates.randomizeQuestions !== undefined) updateData.randomizeQuestions = updates.randomizeQuestions === true || updates.randomizeQuestions === "true";
    if (updates.randomizeOptions !== undefined) updateData.randomizeOptions = updates.randomizeOptions === true || updates.randomizeOptions === "true";

    // Validate if trying to transit to ready or live
    const targetStatus = updates.status || assessment.status;
    if (["ready", "live"].includes(targetStatus)) {
      const mergedAssessment = {
        title: updateData.title !== undefined ? updateData.title : assessment.title,
        description: updateData.description !== undefined ? updateData.description : assessment.description,
        duration: updateData.duration !== undefined ? updateData.duration : assessment.duration,
        startDate: updateData.startDate !== undefined ? updateData.startDate : assessment.startDate,
        endDate: updateData.endDate !== undefined ? updateData.endDate : assessment.endDate,
        questions: updateData.questions !== undefined ? updateData.questions : assessment.questions,
      };
      
      const validationIssues = runAssessmentValidation(mergedAssessment);
      if (validationIssues.length > 0) {
        return res.status(400).json({
          message: "Assessment validation failed. Cannot publish with issues.",
          issues: validationIssues,
        });
      }
    }

    const updated = await prisma.assessment.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    // Notify students on live transition
    const isTransitioningToLive = (updates.status === "live" && assessment.status !== "live");
    const activeJobId = updated.jobId;
    if (isTransitioningToLive && activeJobId) {
      try {
        const applications = await prisma.jobApplication.findMany({
          where: { jobId: activeJobId },
          select: { studentId: true },
        });
        applications.forEach((app) => {
          sendNotification(app.studentId, "assessment_linked", {
            assessmentId: updated.id,
            title: updated.title,
            jobId: activeJobId,
          });
        });
      } catch (err) {
        console.error("Error sending socket alert to applicants on live transition:", err);
      }
    }

    await logAudit(req.user.id, "UPDATE_ASSESSMENT", `assessment:${updated.id}`, { status: assessment.status, title: assessment.title }, { status: updated.status, title: updated.title });

    res.status(200).json({
      message: "Assessment updated successfully!",
      assessment: formatAssessment(updated),
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
    const exists = await prisma.assessment.findUnique({
      where: { id },
      include: {
        _count: {
          select: { results: true },
        },
      },
    });
    if (!exists) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    if (exists.createdById !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this assessment." });
    }

    if (exists._count.results > 0) {
      return res.status(400).json({
        message: "This assessment contains student attempts/results. Deleting it may affect historical records. Consider archiving instead.",
        hasResults: true,
      });
    }

    await prisma.assessment.delete({
      where: { id },
    });

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
    const assessments = await prisma.assessment.findMany({
      where: { createdById: req.user.id },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(assessments.map(formatAssessment));
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

    const assessments = await prisma.assessment.findMany({
      where: {
        status: "live",
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        results: {
          where: { studentId: req.user.id },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check student applied job drives
    const studentApplications = await prisma.jobApplication.findMany({
      where: { studentId: req.user.id },
      select: { jobId: true },
    });
    const appliedJobIds = new Set(studentApplications.map((app) => app.jobId));

    const eligibleAssessments = assessments.filter((asm) => {
      if (!asm.jobId) return true; // Open assessment
      return appliedJobIds.has(asm.jobId);
    });

    res.status(200).json(eligibleAssessments.map((asm) => formatAssessment(asm, req.user?.role)));
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

    // Verify assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Only allow TPO who created the assessment to view results
    if (assessment.createdById !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view results for this assessment" });
    }

    // Get all results for this assessment
    const results = await prisma.assessmentResult.findMany({
      where: { assessmentId: id },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        assessment: { select: { id: true, title: true, questions: true } },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

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
        _id: assessment.id,
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        duration: assessment.duration,
        passingScore: assessment.passingScore,
        totalQuestions: Array.isArray(assessment.questions) ? assessment.questions.length : 0,
        questions: assessment.questions, // Include questions for answer details view
      },
      results: results.map(formatAssessmentResult),
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

    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Check if assessment is live
    if (assessment.status !== "live") {
      return res.status(403).json({ message: "Assessment is not live" });
    }

    // Check student job application eligibility
    if (assessment.jobId) {
      const application = await prisma.jobApplication.findUnique({
        where: {
          jobId_studentId: {
            jobId: assessment.jobId,
            studentId: req.user.id,
          },
        },
      });
      if (!application) {
        return res.status(403).json({ message: "You are not eligible for this assessment (not applied to linked job drive)." });
      }
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
    const existingResult = await prisma.assessmentResult.findUnique({
      where: {
        assessmentId_studentId: {
          assessmentId: id,
          studentId: req.user.id,
        },
      },
    });

    if (existingResult && existingResult.submittedAt) {
      const allowed = assessment.allowedAttempts || 1;
      if (existingResult.attemptsCount >= allowed) {
        return res.status(403).json({
          message: `You have already submitted this assessment. maximum allowed attempts (${allowed}) reached.`,
          result: formatAssessmentResult(existingResult),
        });
      }
    }

    // Remove correct answers from questions and attach metadata
    const questionsList = Array.isArray(assessment.questions) ? assessment.questions : [];
    const questionsForStudent = questionsList.map((q, idx) => ({
      questionIndex: idx, // Pass the original index so mapping works during shuffle
      question: q.question,
      type: q.type || q.questionType || "MCQ",
      options: q.options,
      points: q.points || assessment.positiveMarks || 10,
      topic: q.topic || "General",
      skill: q.skill || "General",
      difficulty: q.difficulty || "medium",
      questionType: q.questionType || "MCQ",
    }));

    const assessmentForStudent = {
      _id: assessment.id,
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      duration: assessment.duration,
      passingScore: assessment.passingScore,
      instructions: assessment.instructions,
      questions: questionsForStudent,
      startedAt: (existingResult && !existingResult.submittedAt) ? existingResult.startedAt : new Date(),
      randomizeQuestions: assessment.randomizeQuestions,
      randomizeOptions: assessment.randomizeOptions,
      allowedAttempts: assessment.allowedAttempts,
      attemptsCount: existingResult?.attemptsCount || 0,
      positiveMarks: assessment.positiveMarks,
      negativeMarks: assessment.negativeMarks,
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
    const { answers, startedAt, autoSubmitted, warnings } = req.body;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Check if student has already submitted
    let result = await prisma.assessmentResult.findUnique({
      where: {
        assessmentId_studentId: {
          assessmentId: id,
          studentId: req.user.id,
        },
      },
    });

    if (result && result.submittedAt) {
      const allowed = assessment.allowedAttempts || 1;
      if (result.attemptsCount >= allowed) {
        return res.status(403).json({
          message: `You have already submitted this assessment. maximum allowed attempts (${allowed}) reached.`,
          result: formatAssessmentResult(result),
        });
      }
    }

    // Calculate score with negative marking
    let totalScore = 0;
    let totalPoints = 0;
    const questionsList = Array.isArray(assessment.questions) ? assessment.questions : [];
    const processedAnswers = questionsList.map((question, index) => {
      const qPoints = question.points || assessment.positiveMarks || 10;
      totalPoints += qPoints;

      const studentAnswer = answers.find((a) => a.questionIndex === index);
      const selectedAnswer = studentAnswer?.selectedAnswer ?? null;
      const isCorrect = selectedAnswer === question.correctAnswer;

      let pointsEarned = 0;
      if (selectedAnswer !== null && selectedAnswer !== undefined) {
        if (isCorrect) {
          pointsEarned = qPoints;
        } else {
          pointsEarned = -Math.abs(assessment.negativeMarks || 0);
        }
      }
      totalScore += pointsEarned;

      return {
        questionIndex: index,
        selectedAnswer,
        isCorrect,
        pointsEarned,
      };
    });

    const percentage = totalPoints > 0 ? (Math.max(0, totalScore) / totalPoints) * 100 : 0;
    const passed = assessment.passingScore
      ? percentage >= assessment.passingScore
      : false;

    const submittedAt = new Date();
    const timeTaken = startedAt
      ? Math.round((submittedAt - new Date(startedAt)) / 1000 / 60)
      : 0;

    let updatedResult;
    const warningsCount = parseInt(warnings) || 0;

    if (result) {
      // Update existing result, incrementing attempts count
      updatedResult = await prisma.assessmentResult.update({
        where: { id: result.id },
        data: {
          answers: processedAnswers,
          score: totalScore,
          totalPoints,
          percentage,
          passed,
          submittedAt,
          timeTaken,
          autoSubmitted: autoSubmitted || false,
          warnings: warningsCount,
          attemptsCount: result.attemptsCount + 1,
        },
        include: {
          assessment: { select: { id: true, title: true, jobId: true } },
          student: { select: { id: true, fullName: true, email: true } },
        },
      });
    } else {
      // Create new result
      updatedResult = await prisma.assessmentResult.create({
        data: {
          assessmentId: id,
          studentId: req.user.id,
          answers: processedAnswers,
          score: totalScore,
          totalPoints,
          percentage,
          passed,
          startedAt: startedAt ? new Date(startedAt) : new Date(),
          submittedAt,
          timeTaken,
          autoSubmitted: autoSubmitted || false,
          warnings: warningsCount,
          attemptsCount: 1,
        },
        include: {
          assessment: { select: { id: true, title: true, jobId: true } },
          student: { select: { id: true, fullName: true, email: true } },
        },
      });
    }

    // If student passed and assessment is linked to a job, automatically shortlist them
    if (passed && updatedResult.assessment && updatedResult.assessment.jobId) {
      try {
        const jobApplication = await prisma.jobApplication.findUnique({
          where: {
            jobId_studentId: {
              jobId: updatedResult.assessment.jobId,
              studentId: req.user.id,
            },
          },
        });

        if (jobApplication && jobApplication.status !== "accepted") {
          // Only update if not already accepted
          await prisma.jobApplication.update({
            where: { id: jobApplication.id },
            data: { status: "shortlisted" },
          });
          console.log(
            `Student ${req.user.id} automatically shortlisted for job ${updatedResult.assessment.jobId} after passing assessment`
          );
        }
      } catch (jobAppError) {
        // Log error but don't fail the assessment submission
        console.error("Error auto-shortlisting student for job:", jobAppError);
      }
    }

    res.status(200).json({
      message: "Assessment submitted successfully!",
      result: formatAssessmentResult(updatedResult),
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "You have already submitted this assessment" });
    }
    res
      .status(500)
      .json({ message: "Server error while submitting assessment." });
  }
};

// Generate PDF for assessment passed students
export const generateAssessmentPassedStudentsPDF = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Only allow TPO who created the assessment
    if (assessment.createdById !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to generate PDF for this assessment" });
    }

    // Get all passed students
    const results = await prisma.assessmentResult.findMany({
      where: {
        assessmentId: id,
        passed: true,
      },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [
        { percentage: "desc" },
        { submittedAt: "desc" },
      ],
    });

    if (results.length === 0) {
      return res.status(404).json({
        message: "No students have passed this assessment yet.",
      });
    }

    // Create PDF directory if it doesn't exist
    const pdfDir = path.join(__dirname, "../../uploads/pdfs");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeTitle = assessment.title.replace(/[^a-z0-9]/gi, "_");
    const filename = `assessment-${safeTitle}-passed-students-${timestamp}.pdf`;
    const filepath = path.join(pdfDir, filename);

    // Generate PDF
    await generatePDF(assessment, results, filepath);

    // Return the file URL dynamically based on hosting headers
    const host = req.get("host") || "localhost:4000";
    const protocol = req.protocol || "http";
    const pdfUrl = `${protocol}://${host}/uploads/pdfs/${filename}`;

    res.status(200).json({
      message: "File generated successfully",
      pdfUrl,
      filename,
      passedStudentsCount: results.length,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Server error while generating PDF." });
  }
};

// Helper function to generate PDF using PDFKit
const generatePDF = async (assessment, results, filepath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Styling Constants
    const primaryColor = "#2C3E50"; // Dark Navy
    const accentColor = "#27AE60"; // Success Green
    const secondaryColor = "#7F8C8D"; // Gray

    // Header Background & Title
    doc.rect(0, 0, 612, 80).fill(primaryColor);
    doc
      .fillColor("#FFFFFF")
      .fontSize(22)
      .text("ASSESSMENT RESULTS", 50, 30, { characterSpacing: 2 });
    doc
      .fontSize(12)
      .text("Generated Placement Report", 50, 55, { opacity: 0.8 });
    doc.moveDown(4);

    // Assessment Info Section
    doc
      .fillColor(primaryColor)
      .fontSize(16)
      .text("Assessment Details", { underline: true });
    doc.moveDown(0.5);

    // Draw a thin divider line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#EEEEEE").stroke();
    doc.moveDown(1);

    doc.fillColor(secondaryColor).fontSize(10).text("TITLE");
    doc
      .fillColor("#000000")
      .fontSize(12)
      .text(`${assessment.title}`)
      .moveDown(0.5);

    doc.fillColor(secondaryColor).fontSize(10).text("DESCRIPTION");
    doc
      .fillColor("#000000")
      .fontSize(12)
      .text(`${assessment.description}`)
      .moveDown(0.5);

    doc.fillColor(secondaryColor).fontSize(10).text("METRICS");
    const questionsCount = Array.isArray(assessment.questions) ? assessment.questions.length : 0;
    doc
      .fillColor("#000000")
      .fontSize(11)
      .text(
         `Passing Score: ${assessment.passingScore || "N/A"}%  |  Questions: ${
           questionsCount
         }  |  Date: ${new Date().toLocaleString()}`
      );
    doc.moveDown(2.5);

    // Passed Students Section Header
    doc
      .fillColor(primaryColor)
      .fontSize(16)
      .text(`Passed Students (${results.length})`, {
        underline: true,
      });
    doc.moveDown(1);

    // Student List
    results.forEach((result, index) => {
      // Background row for each student
      const rowY = doc.y;
      doc.rect(50, rowY - 5, 500, 75).fill("#F9F9F9");

      doc
        .fillColor(accentColor)
        .fontSize(12)
        .text(
          `${index + 1}. ${result.student?.fullName || "Unknown"}`,
          60,
          rowY
        );

      doc.fillColor(secondaryColor).fontSize(10);
      doc.text(`Email: ${result.student?.email || "N/A"}`, 75, doc.y);

      doc
        .fillColor("#333333")
        .text(
          `Score: ${result.score}/${
            result.totalPoints
          } (${result.percentage.toFixed(2)}%)`,
          { indent: 15 }
        );

      doc.text(
        `Time Taken: ${result.timeTaken} mins  |  Submitted: ${new Date(
          result.submittedAt
        ).toLocaleDateString()}`,
        { indent: 15 }
      );

      doc.moveDown(2); // Spacing for next entry
    });

    // Footer
    const pages = doc.bufferedPageRange();
    doc
      .fillColor(secondaryColor)
      .fontSize(10)
      .text("End of Official Report", 50, 750, { align: "center" });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

export const getAssessmentByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    const assessment = await prisma.assessment.findFirst({
      where: { jobId, status: "live" },
    });
    if (!assessment) {
      return res.status(200).json(null);
    }
    res.status(200).json(formatAssessment(assessment, req.user?.role));
  } catch (error) {
    console.error("Error fetching assessment by job id:", error);
    res.status(500).json({ message: "Server error while fetching job assessment." });
  }
};

export const duplicateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const original = await prisma.assessment.findUnique({
      where: { id },
    });
    if (!original) {
      return res.status(404).json({ message: "Assessment not found." });
    }

    // Create duplicate copy in draft status with clear title
    const duplicate = await prisma.assessment.create({
      data: {
        title: `Copy of ${original.title}`,
        description: original.description,
        duration: original.duration,
        passingScore: original.passingScore,
        difficulty: original.difficulty,
        category: original.category,
        instructions: original.instructions,
        questions: original.questions,
        createdById: req.user.id,
        status: "draft",
        jobId: null, // Clear jobId to prevent overlapping drive linkages
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    res.status(201).json({
      message: "Assessment duplicated successfully!",
      assessment: formatAssessment(duplicate),
    });
  } catch (error) {
    console.error("Error duplicating assessment:", error);
    res.status(500).json({ message: "Server error while duplicating assessment." });
  }
};

export const validateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found." });
    }

    const issues = runAssessmentValidation(assessment);
    res.status(200).json({
      id: assessment.id,
      isValid: issues.length === 0,
      issues,
    });
  } catch (error) {
    console.error("Error validating assessment:", error);
    res.status(500).json({ message: "Server error while validating assessment." });
  }
};

export const previewAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    const questionsList = Array.isArray(assessment.questions) ? assessment.questions : [];
    const previewQuestions = questionsList.map((q, idx) => ({
      questionIndex: idx,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points || assessment.positiveMarks || 10,
      topic: q.topic || "General",
      skill: q.skill || "General",
      difficulty: q.difficulty || "medium",
      questionType: q.questionType || "MCQ"
    }));

    res.status(200).json({
      ...formatAssessment(assessment),
      questions: previewQuestions
    });
  } catch (error) {
    console.error("Error previewing assessment:", error);
    res.status(500).json({ message: "Server error while previewing assessment." });
  }
};
