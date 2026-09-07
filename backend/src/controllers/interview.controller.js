import { prisma } from "../config/prisma.js";
import { sendNotification } from "../config/socket.js";
import { logAudit } from "../utils/audit.js";

const formatInterview = (interview) => {
  if (!interview) return null;
  return {
    ...interview,
    _id: interview.id,
    job: interview.job ? { ...interview.job, _id: interview.job.id } : null,
    student: interview.student ? { ...interview.student, _id: interview.student.id } : null,
    createdBy: interview.createdBy ? { ...interview.createdBy, _id: interview.createdBy.id } : null,
  };
};

// 1. Create a new scheduled interview (TPO only)
export const scheduleInterview = async (req, res) => {
  try {
    const { jobId, studentId, title, type, scheduledAt, duration, link, notes, interviewer, roundNumber } = req.body;

    if (!jobId || !studentId || !title || !type || !scheduledAt || !duration) {
      return res.status(400).json({ message: "All fields except link, notes, interviewer, and roundNumber are required." });
    }

    if (req.user.role !== "tpo") {
      return res.status(403).json({ message: "Only TPOs can schedule interviews." });
    }

    // Verify job and student exist
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found." });
    }

    // Conflict detection
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + parseInt(duration) * 60000);

    const overlapping = await prisma.interview.findMany({
      where: { studentId },
    });

    for (const existing of overlapping) {
      const existStart = new Date(existing.scheduledAt);
      const existEnd = new Date(existStart.getTime() + existing.duration * 60000);

      if (start < existEnd && end > existStart) {
        return res.status(409).json({
          message: `Conflict detected. Student already has an interview "${existing.title}" scheduled from ${existStart.toLocaleString()} to ${existEnd.toLocaleString()}.`,
        });
      }
    }

    const interview = await prisma.interview.create({
      data: {
        jobId,
        studentId,
        title,
        type,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration),
        link: link || null,
        notes: notes || null,
        interviewer: interviewer || null,
        roundNumber: roundNumber ? parseInt(roundNumber) : 1,
        createdById: req.user.id,
      },
      include: {
        job: true,
        student: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Send real-time socket alert to student
    sendNotification(studentId, "interview_scheduled", {
      id: interview.id,
      title: interview.title,
      company: job.company,
      jobTitle: job.title,
      scheduledAt: interview.scheduledAt,
      link: interview.link,
    });

    await logAudit(req.user.id, "SCHEDULE_INTERVIEW", `interview:${interview.id}`, null, { title: interview.title, scheduledAt: interview.scheduledAt });

    res.status(201).json({
      message: "Interview scheduled successfully.",
      interview: formatInterview(interview),
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({ message: "Server error while scheduling interview." });
  }
};

// 2. Fetch interviews (all roles, with role-based visibility filtering)
export const getInterviews = async (req, res) => {
  try {
    const whereClause = {};

    if (req.user.role === "student") {
      // Students can only see their own interviews
      whereClause.studentId = req.user.id;
    }

    const interviews = await prisma.interview.findMany({
      where: whereClause,
      include: {
        job: true,
        student: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    res.status(200).json(interviews.map(formatInterview));
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Server error while retrieving interviews." });
  }
};

// 3. Update an interview (TPO only)
export const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, scheduledAt, duration, link, notes, status, interviewer, feedback, result, roundNumber, reason } = req.body;

    if (req.user.role !== "tpo") {
      return res.status(403).json({ message: "Only TPOs can update interviews." });
    }

    const existing = await prisma.interview.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Interview not found." });
    }

    // Past interview lock check
    const now = new Date();
    if (new Date(existing.scheduledAt) < now) {
      return res.status(400).json({ message: "Past interviews are locked and cannot be updated." });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (type) updateData.type = type;
    if (duration) updateData.duration = parseInt(duration);
    if (link !== undefined) updateData.link = link;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;
    if (interviewer !== undefined) updateData.interviewer = interviewer;
    if (feedback !== undefined) updateData.feedback = feedback;
    if (result !== undefined) updateData.result = result;
    if (roundNumber !== undefined) updateData.roundNumber = parseInt(roundNumber);

    // Rescheduling conflict check and log history
    if (scheduledAt) {
      const newScheduledDate = new Date(scheduledAt);
      if (newScheduledDate.getTime() !== new Date(existing.scheduledAt).getTime()) {
        // Conflict check
        const targetDuration = duration ? parseInt(duration) : existing.duration;
        const start = newScheduledDate;
        const end = new Date(start.getTime() + targetDuration * 60000);

        const overlapping = await prisma.interview.findMany({
          where: {
            studentId: existing.studentId,
            id: { not: id },
          },
        });

        for (const overlapItem of overlapping) {
          const existStart = new Date(overlapItem.scheduledAt);
          const existEnd = new Date(existStart.getTime() + overlapItem.duration * 60000);

          if (start < existEnd && end > existStart) {
            return res.status(409).json({
              message: `Conflict detected. Student already has an interview "${overlapItem.title}" scheduled from ${existStart.toLocaleString()} to ${existEnd.toLocaleString()}.`,
            });
          }
        }

        updateData.scheduledAt = newScheduledDate;

        // Save history logs
        const existingHistory = Array.isArray(existing.history) ? existing.history : [];
        updateData.history = [
          ...existingHistory,
          {
            rescheduledFrom: existing.scheduledAt.toISOString(),
            rescheduledTo: newScheduledDate.toISOString(),
            timestamp: new Date().toISOString(),
            reason: reason || "Rescheduled by TPO",
          },
        ];
      }
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        job: true,
        student: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Notify student about reschedule/update
    sendNotification(updated.studentId, "interview_updated", {
      id: updated.id,
      title: updated.title,
      company: updated.job.company,
      jobTitle: updated.job.title,
      scheduledAt: updated.scheduledAt,
      link: updated.link,
      status: updated.status,
    });

    await logAudit(req.user.id, "UPDATE_INTERVIEW", `interview:${updated.id}`, { status: existing.status, scheduledAt: existing.scheduledAt }, { status: updated.status, scheduledAt: updated.scheduledAt });

    res.status(200).json({
      message: "Interview updated successfully.",
      interview: formatInterview(updated),
    });
  } catch (error) {
    console.error("Error updating interview:", error);
    res.status(500).json({ message: "Server error while updating interview." });
  }
};

// 4. Cancel / Delete an interview (TPO only)
export const cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "tpo") {
      return res.status(403).json({ message: "Only TPOs can cancel interviews." });
    }

    const existing = await prisma.interview.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Interview not found." });
    }

    // Past interview lock check
    const now = new Date();
    if (new Date(existing.scheduledAt) < now) {
      return res.status(400).json({ message: "Past interviews are locked and cannot be cancelled." });
    }

    await prisma.interview.delete({ where: { id } });

    // Notify student about cancellation
    sendNotification(existing.studentId, "interview_cancelled", {
      id: existing.id,
      title: existing.title,
      company: existing.job.company,
      jobTitle: existing.job.title,
    });

    await logAudit(req.user.id, "CANCEL_INTERVIEW", `interview:${id}`, { status: existing.status, title: existing.title }, null);

    res.status(200).json({ message: "Interview cancelled successfully." });
  } catch (error) {
    console.error("Error cancelling interview:", error);
    res.status(500).json({ message: "Server error while cancelling interview." });
  }
};
