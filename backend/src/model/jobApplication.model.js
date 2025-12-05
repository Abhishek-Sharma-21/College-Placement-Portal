import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "accepted"],
      default: "pending",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications from same student for same job
JobApplicationSchema.index({ job: 1, student: 1 }, { unique: true });

const JobApplication = mongoose.model("JobApplication", JobApplicationSchema);
export default JobApplication;

