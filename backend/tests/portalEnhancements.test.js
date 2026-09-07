import { describe, it, expect, afterAll, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("College Placement Portal Enhancements Test Suite", () => {
  const uniqueId = Math.floor(100000 + Math.random() * 900000);
  const studentEmail = `enh_stud_${uniqueId}@test.com`;
  const tpoEmail = `enh_tpo_${uniqueId}@test.com`;

  const studentUser = {
    fullName: "Enhance Student",
    email: studentEmail,
    password: "password123",
    role: "student",
  };

  const tpoUser = {
    fullName: "Enhance TPO",
    email: tpoEmail,
    password: "password123",
    role: "tpo",
  };

  let studentCookie = "";
  let tpoCookie = "";
  let studentId = "";
  let tpoId = "";

  let jobId = "";
  let assessmentId = "";
  let questionId = "";
  let applicationId = "";
  let interviewId = "";

  beforeAll(async () => {
    // Force AI mock mode
    process.env.AI_MODE = "mock";

    // Register Student
    const studentRes = await request(app).post("/api/auth/register").send(studentUser);
    if (studentRes.headers["set-cookie"]) studentCookie = studentRes.headers["set-cookie"].join("; ");
    studentId = studentRes.body._id || studentRes.body.id;

    // Register TPO
    const tpoRes = await request(app).post("/api/auth/register").send(tpoUser);
    if (tpoRes.headers["set-cookie"]) tpoCookie = tpoRes.headers["set-cookie"].join("; ");
    tpoId = tpoRes.body._id || tpoRes.body.id;

    // Create a student profile
    await prisma.studentProfile.create({
      data: {
        userId: studentId,
        branch: "Computer Science",
        cgpa: 6.8, // Ineligible for job requiring 7.5
        gradYear: 2026,
        skills: ["Node.js", "Postgres"],
      },
    });
  });

  afterAll(async () => {
    // Delete database records
    await prisma.auditLog.deleteMany({ where: { userId: tpoId } });
    await prisma.notification.deleteMany({ where: { userId: studentId } });
    if (interviewId) await prisma.interview.deleteMany({ where: { id: interviewId } });
    if (applicationId) await prisma.jobApplication.deleteMany({ where: { id: applicationId } });
    if (assessmentId) await prisma.assessment.deleteMany({ where: { id: assessmentId } });
    if (jobId) await prisma.job.deleteMany({ where: { id: jobId } });
    if (questionId) await prisma.questionBank.deleteMany({ where: { id: questionId } });
    await prisma.studentProfile.deleteMany({ where: { userId: studentId } });
    await prisma.user.deleteMany({ where: { email: { in: [studentEmail, tpoEmail] } } });
  });

  // ==========================================
  // PHASE 2 — QUESTION BANK TESTS
  // ==========================================
  describe("Question Bank Services", () => {
    it("should allow a TPO to save a question to the Question Bank", async () => {
      const res = await request(app)
        .post("/api/question-bank")
        .set("Cookie", tpoCookie)
        .send({
          question: "What is the Big O time complexity of binary search?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
          correctAnswer: 1,
          topic: "Algorithms",
          skill: "DSA",
          difficulty: "easy",
          questionType: "MCQ",
        });

      expect(res.status).toBe(201);
      expect(res.body.question).toHaveProperty("_id");
      questionId = res.body.question._id;
    });

    it("should allow searching and filtering questions in the Question Bank", async () => {
      const res = await request(app)
        .get("/api/question-bank?topic=Algorithms&difficulty=easy")
        .set("Cookie", tpoCookie);

      expect(res.status).toBe(200);
      expect(res.body.questions.length).toBeGreaterThan(0);
      expect(res.body.questions[0].topic).toBe("Algorithms");
    });
  });

  // ==========================================
  // PHASE 3 & 4 — ELIGIBILITY & PIPELINE TESTS
  // ==========================================
  describe("Eligibility Engine & Job Application Pipeline", () => {
    it("should allow a TPO to create a Job Drive with eligibility requirements", async () => {
      const res = await request(app)
        .post("/api/jobs")
        .set("Cookie", tpoCookie)
        .send({
          title: "Senior Backend Developer",
          company: "Acme Corp",
          description: "Develop services with node.js",
          skills: "Node.js, Postgres",
          ctc: 12.5,
          location: "Remote",
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          minCgpa: 7.5, // Student CGPA is 6.8
          allowedBranches: "Computer Science, Information Technology",
          gradYear: 2026,
          experience: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.job).toHaveProperty("_id");
      jobId = res.body.job._id;
    });

    it("should block job application if the student does not satisfy eligibility criteria", async () => {
      const res = await request(app)
        .post(`/api/applications/job/${jobId}`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("not eligible");
      expect(res.body.reasons[0]).toContain("Required CGPA: 7.5");
    });

    it("should allow job application once student profile is updated to meet eligibility requirements", async () => {
      // Meet CGPA and experience criteria
      await prisma.studentProfile.update({
        where: { userId: studentId },
        data: { cgpa: 7.8, experience: 2 },
      });

      const res = await request(app)
        .post(`/api/applications/job/${jobId}`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(201);
      expect(res.body.application).toHaveProperty("_id");
      expect(res.body.application.status).toBe("applied");
      expect(res.body.application.statusHistory[0].status).toBe("applied");
      applicationId = res.body.application._id;
    });

    it("should support status transitions and statusHistory timestamps logging", async () => {
      if (!applicationId) return;

      const res = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Cookie", tpoCookie)
        .send({
          status: "under_review",
          notes: "Resumes look promising.",
        });

      expect(res.status).toBe(200);
      expect(res.body.application.status).toBe("under_review");
      expect(res.body.application.statusHistory.length).toBe(2);
      expect(res.body.application.statusHistory[1].status).toBe("under_review");
      expect(res.body.application.statusHistory[1].notes).toBe("Resumes look promising.");
    });
  });

  // ==========================================
  // PHASE 1 — ADVANCED ASSESSMENT TESTS
  // ==========================================
  describe("Advanced Assessment Services", () => {
    it("should create an assessment with negative marking and allowed attempts", async () => {
      const res = await request(app)
        .post("/api/assessments")
        .set("Cookie", tpoCookie)
        .send({
          title: "Math & Logic Test",
          description: "Shuffled negative marking evaluation",
          duration: 30,
          passingScore: 50, // 50%
          positiveMarks: 10,
          negativeMarks: 5, // Deduct 5 on failure
          allowedAttempts: 2,
          randomizeQuestions: true,
          randomizeOptions: true,
          questions: [
            {
              question: "What is 10 + 20?",
              options: ["10", "20", "30", "40"],
              correctAnswer: 2,
              points: 10,
              topic: "Arithmetic",
              skill: "Math",
              difficulty: "easy",
              questionType: "MCQ",
            },
            {
              question: "What is 5 * 6?",
              options: ["11", "25", "30", "45"],
              correctAnswer: 2,
              points: 10,
              topic: "Arithmetic",
              skill: "Math",
              difficulty: "easy",
              questionType: "MCQ",
            },
          ],
          status: "live",
          jobId,
        });

      expect(res.status).toBe(201);
      assessmentId = res.body.assessment._id;
    });

    it("should return the assessment details for taking with custom configurations", async () => {
      const res = await request(app)
        .get(`/api/assessments/${assessmentId}/take`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("randomizeQuestions", true);
      expect(res.body).toHaveProperty("randomizeOptions", true);
      expect(res.body).toHaveProperty("positiveMarks", 10);
      expect(res.body).toHaveProperty("negativeMarks", 5);
      expect(res.body).toHaveProperty("attemptsCount", 0);
    });

    it("should calculate grades correctly, deducting points for incorrect answers", async () => {
      // 1 correct (10 points), 1 incorrect (-5 points) -> score = 5. Total points = 20. percentage = 25% (Failed)
      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/submit`)
        .set("Cookie", studentCookie)
        .send({
          answers: [
            { questionIndex: 0, selectedAnswer: 2 }, // Correct (30)
            { questionIndex: 1, selectedAnswer: 0 }, // Incorrect (11)
          ],
          startedAt: new Date(Date.now() - 2 * 60000).toISOString(),
          autoSubmitted: false,
          warnings: 0,
        });

      expect(res.status).toBe(200);
      expect(res.body.result.score).toBe(5);
      expect(res.body.result.percentage).toBe(25);
      expect(res.body.result.passed).toBe(false);
      expect(res.body.result.attemptsCount).toBe(1);
    });

    it("should permit retaking the test when attempts count is less than allowedAttempts limit", async () => {
      // First attempt failed, let's retake it and get 100%
      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/submit`)
        .set("Cookie", studentCookie)
        .send({
          answers: [
            { questionIndex: 0, selectedAnswer: 2 }, // Correct (30)
            { questionIndex: 1, selectedAnswer: 2 }, // Correct (30)
          ],
          startedAt: new Date(Date.now() - 1 * 60000).toISOString(),
          autoSubmitted: false,
          warnings: 0,
        });

      expect(res.status).toBe(200);
      expect(res.body.result.score).toBe(20);
      expect(res.body.result.percentage).toBe(100);
      expect(res.body.result.passed).toBe(true);
      expect(res.body.result.attemptsCount).toBe(2);
    });

    it("should block starting the assessment once attempts count exceeds allowedAttempts limit", async () => {
      const res = await request(app)
        .get(`/api/assessments/${assessmentId}/take`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("maximum allowed attempts");
    });
  });

  // ==========================================
  // PHASE 9 — INTERVIEW SCHEDULER TESTS
  // ==========================================
  describe("Interview Scheduler & Conflicts Engine", () => {
    it("should schedule a student interview successfully", async () => {
      const scheduledTime = new Date(Date.now() + 10 * 3600 * 1000); // 10 hours from now
      const res = await request(app)
        .post("/api/interviews")
        .set("Cookie", tpoCookie)
        .send({
          jobId,
          studentId,
          title: "Technical Coding Round 1",
          type: "technical",
          scheduledAt: scheduledTime.toISOString(),
          duration: 60,
          link: "https://zoom.us/test",
          notes: "Focus on graphs and dynamic programming.",
          interviewer: "Hiring Manager A",
          roundNumber: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.interview).toHaveProperty("_id");
      interviewId = res.body.interview._id;
    });

    it("should flag a conflict if trying to schedule overlapping interview for same student", async () => {
      const scheduledTime = new Date(Date.now() + 10 * 3600 * 1000 + 30 * 60000); // Overlapping by 30 minutes
      const res = await request(app)
        .post("/api/interviews")
        .set("Cookie", tpoCookie)
        .send({
          jobId,
          studentId,
          title: "HR Fit Round",
          type: "hr",
          scheduledAt: scheduledTime.toISOString(),
          duration: 45,
          interviewer: "HR Manager B",
          roundNumber: 2,
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("Conflict detected");
    });
  });

  // ==========================================
  // PHASE 8 & 11 — NOTIFICATIONS & AUDIT LOGS TESTS
  // ==========================================
  describe("Notifications History & Admin Audits", () => {
    it("should persist notifications in database notification history", async () => {
      const res = await request(app)
        .get("/api/notifications")
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.notifications.length).toBeGreaterThan(0);
      // Last notification must be "Interview Scheduled"
      const noticeTypes = res.body.notifications.map((n) => n.title);
      expect(noticeTypes).toContain("Interview Scheduled");
    });

    it("should store TPO actions inside append-only Audit Logs", async () => {
      const res = await request(app)
        .get("/api/audit-logs")
        .set("Cookie", tpoCookie);

      expect(res.status).toBe(200);
      expect(res.body.logs.length).toBeGreaterThan(0);
      const actions = res.body.logs.map((l) => l.action);
      expect(actions).toContain("CREATE_JOB");
      expect(actions).toContain("SCHEDULE_INTERVIEW");
    });
  });
});
