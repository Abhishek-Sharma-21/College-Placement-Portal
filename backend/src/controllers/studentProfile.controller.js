import StudentProfile from "../model/studentProfile.model.js";

export const completeStudentProfile = async (req, res) => {
  const userId = req.user.id;

  const { branch, cgpa, gradYear, resumeLink, linkedIn, bio } = req.body;

  // Cloudinary automatically uploads and provides the secure URL
  const profilePicUrl = req.file ? req.file.path : "";

  try {
    const profileData = {
      user: userId,
      branch,
      cgpa: cgpa ? parseFloat(cgpa) : undefined,
      gradYear: gradYear ? parseInt(gradYear) : undefined,
      resumeLink,
      linkedIn,
      bio,
    };

    // Only add profilePicUrl if a file was uploaded
    if (req.file) {
      profileData.profilePicUrl = profilePicUrl;
    }

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { user: userId },
      { $set: profileData },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate("user", "fullName email role");

    res.status(200).json({
      message: "Profile updated successfully!",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed", details: error.errors });
    }

    res.status(500).json({ message: "Server error while updating profile." });
  }
};

// New controller to fetch the profile
export const getStudentProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const profile = await StudentProfile.findOne({ user: userId }).populate(
      "user",
      "fullName email role"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
};
