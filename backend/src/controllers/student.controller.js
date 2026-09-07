import { prisma } from "../config/prisma.js";

const formatProfile = (profile) => {
  if (!profile) return null;
  return {
    ...profile,
    _id: profile.id,
    user: profile.user ? {
      ...profile.user,
      _id: profile.user.id,
      id: profile.user.id,
    } : null,
  };
};

export const getAllStudentProfiles = async (req, res) => {
  try {
    const profiles = await prisma.studentProfile.findMany({
      include: {
        user: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({ profiles: profiles.map(formatProfile) });
  } catch (error) {
    console.error("Error fetching student profiles:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching student profiles." });
  }
};
