import { Server } from "socket.io";

let io;
const activeUsers = new Map(); // Map of userId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("WebSocket client connected:", socket.id);

    // Register user to room
    socket.on("register", (userId) => {
      if (userId) {
        activeUsers.set(userId, socket.id);
        socket.join(userId);
        console.log(`User ${userId} registered WebSocket room`);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          console.log(`User ${userId} unregistered WebSocket room`);
          break;
        }
      }
    });
  });

  return io;
};

import { prisma } from "./prisma.js";

export const getIo = () => io;

// Send direct alert to specific user's socket room and save to DB
export const sendNotification = async (userId, type, data) => {
  let title = "Placement Update";
  let content = "You have a new update in your portal.";
  let category = "general";
  let deepLink = "/student/dashboard";

  if (type === "status_updated") {
    title = "Application Status Update";
    content = `Your application to ${data.company} for ${data.title} is now: ${data.status.toUpperCase().replace("_", " ")}.`;
    category = "placement";
    deepLink = "/student/jobs";
  } else if (type === "assessment_linked") {
    title = "New Assessment Assigned";
    content = `You are required to attempt the skills evaluation: ${data.title}.`;
    category = "assessment";
    deepLink = "/student/assessments";
  } else if (type === "interview_scheduled") {
    title = "Interview Scheduled";
    content = `An interview round has been scheduled for ${data.title}.`;
    category = "interview";
    deepLink = "/student/interviews";
  } else if (type === "job_posted") {
    title = "New Job Placement Drive";
    content = `A new drive has been posted by ${data.company} for ${data.title}.`;
    category = "placement";
    deepLink = "/student/jobs";
  }

  try {
    const dbNotif = await prisma.notification.create({
      data: {
        userId,
        title,
        content,
        category,
        deepLink,
        isRead: false,
      },
    });

    if (io) {
      io.to(userId).emit("notification", {
        id: dbNotif.id,
        _id: dbNotif.id,
        title: dbNotif.title,
        content: dbNotif.content,
        category: dbNotif.category,
        deepLink: dbNotif.deepLink,
        isRead: dbNotif.isRead,
        createdAt: dbNotif.createdAt,
      });
    }
  } catch (err) {
    console.error("Error saving notification to DB:", err);
  }
};

// Broadcast alert to all student users and save to DB
export const broadcastNotification = async (type, data) => {
  let title = "Placement Announcement";
  let content = "New announcement posted in portal.";
  let category = "general";
  let deepLink = "/student/dashboard";

  if (type === "job_posted") {
    title = "New Job Placement Drive";
    content = `A new drive has been posted by ${data.company} for ${data.title}.`;
    category = "placement";
    deepLink = "/student/jobs";
  } else if (type === "announcement_created") {
    title = data.title || "TPO Notice";
    content = data.content || "Please read the updated announcement board notice.";
    category = data.category || "general";
    deepLink = "/student/announcements";
  }

  try {
    const students = await prisma.user.findMany({
      where: { role: "student" },
      select: { id: true },
    });

    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map((std) => ({
          userId: std.id,
          title,
          content,
          category,
          deepLink,
          isRead: false,
        })),
      });
    }

    if (io) {
      io.emit("notification", {
        title,
        content,
        category,
        deepLink,
        createdAt: new Date(),
      });
    }
  } catch (err) {
    console.error("Error broadcasting notifications:", err);
  }
};
