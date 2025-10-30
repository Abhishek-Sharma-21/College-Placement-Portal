import StudentProfile from "../model/studentProfile.model.js"; // Assuming the model is here

export const completeStudentProfile = async (req, res) => {
  const userId = req.user.id;

  const { branch, cgpa, gradYear, resumeLink, linkedIn, bio } = req.body;

  const profilePicUrl = req.file ? req.file.path : "";

  try {
    const profileData = {
      user: userId,
      branch,
      cgpa,
      gradYear,
      resumeLink,
      linkedIn,
      bio,
    };

    if (req.file) {
      profileData.profilePicUrl = profilePicUrl;
    }

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { user: userId }, // Find the profile by the user ID
      { $set: profileData }, // Set the new data
      {
        new: true, // Return the *updated* document, not the old one
        upsert: true, // Create the document if it doesn't exist
        runValidators: true, // Run the Mongoose validation (e.g., 'required' on branch)
      }
    );

    res.status(200).json({
      message: "Profile updated successfully!",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed", details: error.errors });
    }

    // Handle general server errors
    res.status(500).json({ message: "Server error while updating profile." });
  }
};
