import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["multiple-choice", "true-false"],
    default: "multiple-choice",
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: Number,
    default: null,
  },
  points: {
    type: Number,
    default: 1,
    min: 1,
  },
});

const AssessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    passingScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
    category: {
      type: String,
    },
    instructions: {
      type: String,
    },
    questions: {
      type: [QuestionSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Assessment must have at least one question",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    status: {
      type: String,
      enum: ["draft", "published", "live", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const Assessment = mongoose.model("Assessment", AssessmentSchema);
export default Assessment;
