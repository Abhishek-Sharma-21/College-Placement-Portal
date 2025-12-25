import Announcement from "../model/announcement.model.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, scheduledAt, pdfUrl, pdfFileName } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }
    const announcement = await Announcement.create({
      title,
      content,
      scheduledAt: scheduledAt || undefined,
      pdfUrl: pdfUrl || undefined,
      pdfFileName: pdfFileName || undefined,
      createdBy: req.user.id,
    });
    res.status(201).json({ message: "Announcement created", announcement });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: "Server error while creating announcement." });
  }
};

export const listAnnouncements = async (_req, res) => {
  try {
    const list = await Announcement.find({})
      .populate("createdBy", "fullName role")
      .sort({ createdAt: -1 });
    res.status(200).json({ announcements: list });
  } catch (error) {
    console.error("Error listing announcements:", error);
    res.status(500).json({ message: "Server error while fetching announcements." });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Announcement.findOneAndDelete({ _id: id, createdBy: req.user.id });
    if (!deleted) {
      const exists = await Announcement.findById(id);
      if (!exists) return res.status(404).json({ message: "Announcement not found" });
      return res.status(403).json({ message: "Unauthorized to delete this announcement" });
    }
    res.status(200).json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ message: "Server error while deleting announcement." });
  }
};
