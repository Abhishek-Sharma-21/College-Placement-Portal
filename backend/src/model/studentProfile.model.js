import mongoose from "mongoose";

const StudentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },
    gradYear: {
      type: Number,
      min: 2020,
    },
    resumeLink: {
      type: String,
      trim: true,
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxLength: [500, "Bio must be 20 characters or less"],
    },
    profilePicUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const StudentProfile = mongoose.model("StudentProfile", StudentProfileSchema);
export default StudentProfile;
