import { prisma } from "../config/prisma.js";
import { logAudit } from "../utils/audit.js";
import { broadcastNotification } from "../config/socket.js";

const formatAnnouncement = (ann) => {
  if (!ann) return null;
  return {
    ...ann,
    _id: ann.id,
    createdBy: ann.createdBy ? {
      ...ann.createdBy,
      _id: ann.createdBy.id,
      id: ann.createdBy.id,
    } : null,
  };
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, scheduledAt, pdfUrl, pdfFileName } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        pdfUrl: pdfUrl || null,
        pdfFileName: pdfFileName || null,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, role: true },
        },
      },
    });

    // Broadcast notification to all student dashboards
    broadcastNotification("announcement_created", {
      title: `Announcement: ${announcement.title}`,
      content: announcement.content,
      category: "general",
    });

    await logAudit(req.user.id, "CREATE_ANNOUNCEMENT", `announcement:${announcement.id}`, null, { title: announcement.title });

    res.status(201).json({ message: "Announcement created", announcement: formatAnnouncement(announcement) });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: "Server error while creating announcement." });
  }
};

export const listAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const whereClause = {};

    if (req.user.role === "student") {
      whereClause.OR = [
        { scheduledAt: null },
        { scheduledAt: { lte: now } },
      ];
    }

    const list = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: { id: true, fullName: true, role: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({ announcements: list.map(formatAnnouncement) });
  } catch (error) {
    console.error("Error listing announcements:", error);
    res.status(500).json({ message: "Server error while fetching announcements." });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const exists = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!exists) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (exists.createdById !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this announcement" });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    res.status(200).json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ message: "Server error while deleting announcement." });
  }
};
