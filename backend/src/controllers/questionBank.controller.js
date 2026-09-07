import { prisma } from "../config/prisma.js";

// Format a single QuestionBank record
const formatQuestion = (q) => {
  if (!q) return null;
  return {
    ...q,
    _id: q.id, // For frontend compatibility
  };
};

// Create a new question in the bank
export const createQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation, points, topic, skill, difficulty, questionType } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "Question text and at least 2 options are required." });
    }

    if (correctAnswer === undefined || correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ message: "Valid 0-indexed correctAnswer is required." });
    }

    const newQuestion = await prisma.questionBank.create({
      data: {
        question,
        options,
        correctAnswer: parseInt(correctAnswer),
        explanation: explanation || "",
        points: points ? parseInt(points) : 10,
        topic: topic || "General",
        skill: skill || "General",
        difficulty: difficulty || "medium",
        questionType: questionType || "MCQ",
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    res.status(201).json({
      message: "Question added to Question Bank successfully!",
      question: formatQuestion(newQuestion),
    });
  } catch (error) {
    console.error("Error creating question in bank:", error);
    res.status(500).json({ message: "Server error while creating question." });
  }
};

// Get all questions in the bank (with search, filter, pagination)
export const getQuestions = async (req, res) => {
  try {
    const { search, topic, skill, difficulty, questionType, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma query filter
    const where = {};

    if (search) {
      where.question = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (topic) {
      where.topic = {
        equals: topic,
        mode: "insensitive",
      };
    }

    if (skill) {
      where.skill = {
        equals: skill,
        mode: "insensitive",
      };
    }

    if (difficulty) {
      where.difficulty = {
        equals: difficulty,
        mode: "insensitive",
      };
    }

    if (questionType) {
      where.questionType = {
        equals: questionType,
        mode: "insensitive",
      };
    }

    const [total, questions] = await prisma.$transaction([
      prisma.questionBank.count({ where }),
      prisma.questionBank.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
    ]);

    res.status(200).json({
      questions: questions.map(formatQuestion),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error fetching questions from bank:", error);
    res.status(500).json({ message: "Server error while fetching questions." });
  }
};

// Edit a question in the bank
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const questionExists = await prisma.questionBank.findUnique({
      where: { id },
    });

    if (!questionExists) {
      return res.status(404).json({ message: "Question not found in bank." });
    }

    // Only creator TPO can update
    if (questionExists.createdById !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this question." });
    }

    const updateData = {};
    if (updates.question !== undefined) updateData.question = updates.question;
    if (updates.options !== undefined) {
      if (!Array.isArray(updates.options) || updates.options.length < 2) {
        return res.status(400).json({ message: "Options must be an array of at least 2 choices." });
      }
      updateData.options = updates.options;
    }
    if (updates.correctAnswer !== undefined) {
      const idx = parseInt(updates.correctAnswer);
      const optionsLen = updates.options ? updates.options.length : questionExists.options.length;
      if (idx < 0 || idx >= optionsLen) {
        return res.status(400).json({ message: "Invalid correctAnswer index." });
      }
      updateData.correctAnswer = idx;
    }
    if (updates.explanation !== undefined) updateData.explanation = updates.explanation;
    if (updates.points !== undefined) updateData.points = parseInt(updates.points);
    if (updates.topic !== undefined) updateData.topic = updates.topic;
    if (updates.skill !== undefined) updateData.skill = updates.skill;
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
    if (updates.questionType !== undefined) updateData.questionType = updates.questionType;

    const updated = await prisma.questionBank.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    res.status(200).json({
      message: "Question updated successfully!",
      question: formatQuestion(updated),
    });
  } catch (error) {
    console.error("Error updating question in bank:", error);
    res.status(500).json({ message: "Server error while updating question." });
  }
};

// Delete a question from the bank
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const questionExists = await prisma.questionBank.findUnique({
      where: { id },
    });

    if (!questionExists) {
      return res.status(404).json({ message: "Question not found in bank." });
    }

    if (questionExists.createdById !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this question." });
    }

    await prisma.questionBank.delete({
      where: { id },
    });

    res.status(200).json({ message: "Question deleted successfully from Question Bank!" });
  } catch (error) {
    console.error("Error deleting question from bank:", error);
    res.status(500).json({ message: "Server error while deleting question." });
  }
};
