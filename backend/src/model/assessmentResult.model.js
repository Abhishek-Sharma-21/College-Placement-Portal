import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  selectedAnswer: {
    type: Number,
    default: null,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
});

const AssessmentResultSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
      type: [AnswerSchema],
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    timeTaken: {
      type: Number, // in minutes
      default: 0,
    },
    autoSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate submissions from same student for same assessment
AssessmentResultSchema.index({ assessment: 1, student: 1 }, { unique: true });

const AssessmentResult = mongoose.model("AssessmentResult", AssessmentResultSchema);
export default AssessmentResult;

