import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // === Registration Fields ===
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      // unique: true, // Ensures no two users have the same email
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "tpo"], // Defines the allowed roles
      default: "student", // Sets the default role if not provided
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
export default User;

export const generateHash = async (plainTextPassword) => {
  const hash = await bcrypt.hash(plainTextPassword, 10);
  return hash;
};
export const comparePassword = async (plainTextPassword, hashedPassword) => {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};
