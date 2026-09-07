import { prisma } from "../config/prisma.js";

const formatProfile = (profile) => {
  if (!profile) return null;
  return {
    ...profile,
    _id: profile.id,
    user: profile.user ? {
      ...profile.user,
      _id: profile.user.id,
    } : null,
  };
};

export const completeStudentProfile = async (req, res) => {
  const userId = req.user.id;
  const { branch, cgpa, gradYear, resumeLink, linkedIn, bio } = req.body;

  // Cloudinary automatically uploads and provides the secure URL
  const profilePicUrl = req.file ? req.file.path : "";

  try {
    const profileData = {
      branch,
      cgpa: cgpa ? parseFloat(cgpa) : null,
      gradYear: gradYear ? parseInt(gradYear) : null,
      resumeLink: resumeLink || null,
      linkedIn: linkedIn || null,
      bio: bio || null,
    };

    // Only add profilePicUrl if a file was uploaded
    if (req.file) {
      profileData.profilePicUrl = profilePicUrl;
    }

    const updatedProfile = await prisma.studentProfile.upsert({
      where: { userId: userId },
      update: profileData,
      create: {
        userId: userId,
        ...profileData,
        profilePicUrl: profilePicUrl || "",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Profile updated successfully!",
      profile: formatProfile(updatedProfile),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error while updating profile." });
  }
};

// Fetch the profile
export const getStudentProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      profile: formatProfile(profile),
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
};
