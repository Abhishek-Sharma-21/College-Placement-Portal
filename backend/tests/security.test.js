import { describe, it, expect, afterAll, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("RBAC Endpoint Security Tests", () => {
  const uniqueId = Math.floor(100000 + Math.random() * 900000);
  const testStudent = {
    fullName: "Security Student",
    email: `sec_stud_${uniqueId}@test.com`,
    password: "password123",
    role: "student",
  };

  const testTPO = {
    fullName: "Security TPO",
    email: `sec_tpo_${uniqueId}@test.com`,
    password: "password123",
    role: "tpo",
  };

  let studentCookie = "";
  let tpoCookie = "";

  beforeAll(async () => {
    // Register student
    const studentRes = await request(app)
      .post("/api/auth/register")
      .send(testStudent);
    if (studentRes.headers["set-cookie"]) {
      studentCookie = studentRes.headers["set-cookie"].join("; ");
    }

    // Register TPO
    const tpoRes = await request(app)
      .post("/api/auth/register")
      .send(testTPO);
    if (tpoRes.headers["set-cookie"]) {
      tpoCookie = tpoRes.headers["set-cookie"].join("; ");
    }
  });

  afterAll(async () => {
    // Delete test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testStudent.email, testTPO.email],
        },
      },
    });
  });

  describe("TPO Jobs Endpoint Security", () => {
    it("should return 401 Unauthorized for unauthenticated POST /api/jobs", async () => {
      const res = await request(app).post("/api/jobs").send({});
      expect(res.status).toBe(401);
    });

    it("should return 403 Forbidden for Student role on POST /api/jobs", async () => {
      const res = await request(app)
        .post("/api/jobs")
        .set("Cookie", studentCookie)
        .send({
          title: "Software Developer Intern",
          company: "Acme Corp",
          description: "Develop cool features",
          skills: "React, Node.js",
          ctc: 6.5,
          location: "Remote",
          deadline: new Date(Date.now() + 86400000).toISOString(),
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Not authorized as a TPO");
    });
  });

  describe("TPO Assessments Endpoint Security", () => {
    it("should return 401 Unauthorized for unauthenticated POST /api/assessments", async () => {
      const res = await request(app).post("/api/assessments").send({});
      expect(res.status).toBe(401);
    });

    it("should return 403 Forbidden for Student role on POST /api/assessments", async () => {
      const res = await request(app)
        .post("/api/assessments")
        .set("Cookie", studentCookie)
        .send({
          title: "Cheat Exam",
          description: "Student created test",
          duration: 30,
          questions: [{ question: "A?", options: ["A", "B"], correctAnswer: 0 }],
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Not authorized as a TPO");
    });
  });

  describe("TPO Announcements Endpoint Security", () => {
    it("should return 401 Unauthorized for unauthenticated POST /api/announcements", async () => {
      const res = await request(app).post("/api/announcements").send({});
      expect(res.status).toBe(401);
    });

    it("should return 403 Forbidden for Student role on POST /api/announcements", async () => {
      const res = await request(app)
        .post("/api/announcements")
        .set("Cookie", studentCookie)
        .send({
          title: "Malicious Notice",
          content: "Student forged announcement",
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Not authorized as a TPO");
    });
  });

  describe("Candidate Listing Endpoint Security", () => {
    it("should return 403 Forbidden for Student listing candidate profiles on GET /api/students", async () => {
      const res = await request(app)
        .get("/api/students")
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });

    it("should return 200 OK for TPO listing candidate profiles on GET /api/students", async () => {
      const res = await request(app)
        .get("/api/students")
        .set("Cookie", tpoCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("profiles");
    });
  });

  describe("Assessment Answer Leak Security Check", () => {
    let testAssessmentId = "";

    beforeAll(async () => {
      // TPO creates an assessment
      const res = await request(app)
        .post("/api/assessments")
        .set("Cookie", tpoCookie)
        .send({
          title: "Leaky Test",
          description: "Evaluating leak risk",
          duration: 20,
          passingScore: 50,
          questions: [
            {
              question: "Capital of France?",
              options: ["Paris", "Berlin", "Rome", "Madrid"],
              correctAnswer: 0,
              points: 10,
              topic: "Geography",
              difficulty: "easy",
            },
          ],
        });
      testAssessmentId = res.body.assessment._id || res.body.assessment.id;
    });

    afterAll(async () => {
      if (testAssessmentId) {
        await prisma.assessment.delete({ where: { id: testAssessmentId } });
      }
    });

    it("should NOT return correctAnswer to student on GET /api/assessments/:id", async () => {
      const res = await request(app)
        .get(`/api/assessments/${testAssessmentId}`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.questions[0]).not.toHaveProperty("correctAnswer");
      expect(res.body.questions[0]).not.toHaveProperty("explanation");
    });

    it("should preserve correctAnswer for TPO on GET /api/assessments/:id", async () => {
      const res = await request(app)
        .get(`/api/assessments/${testAssessmentId}`)
        .set("Cookie", tpoCookie);

      expect(res.status).toBe(200);
      expect(res.body.questions[0]).toHaveProperty("correctAnswer", 0);
    });
  });

  describe("Interview Endpoint Security Check", () => {
    it("should block student from POST /api/interviews", async () => {
      const res = await request(app)
        .post("/api/interviews")
        .set("Cookie", studentCookie)
        .send({});
      expect(res.status).toBe(403);
    });

    it("should block student from PUT /api/interviews/:id", async () => {
      const res = await request(app)
        .put("/api/interviews/some-id")
        .set("Cookie", studentCookie)
        .send({});
      expect(res.status).toBe(403);
    });

    it("should block student from DELETE /api/interviews/:id", async () => {
      const res = await request(app)
        .delete("/api/interviews/some-id")
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });
  });
});
