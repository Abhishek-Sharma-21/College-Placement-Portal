import { prisma } from "../config/prisma.js";

// Fetch notification history for the authenticated user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      notifications: notifications.map((n) => ({
        ...n,
        _id: n.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error while fetching notifications." });
  }
};

// Mark a specific notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notif) {
      return res.status(404).json({ message: "Notification not found." });
    }

    if (notif.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this notification." });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json({
      message: "Notification marked as read.",
      notification: {
        ...updated,
        _id: updated.id,
      },
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error while updating notification." });
  }
};

// Mark all notifications for the user as read
export const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error while updating notifications." });
  }
};
