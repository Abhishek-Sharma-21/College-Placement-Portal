import StudentProfile from "../model/studentProfile.model.js";

export const getAllStudentProfiles = async (req, res) => {
  try {
    const profiles = await StudentProfile.find({})
      .populate("user", "fullName email role")
      .sort({ createdAt: -1 });
    res.status(200).json({ profiles });
  } catch (error) {
    console.error("Error fetching student profiles:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching student profiles." });
  }
};
