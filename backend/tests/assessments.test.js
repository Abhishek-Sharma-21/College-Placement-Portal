import { describe, it, expect, afterAll, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("Assessments Lifecycle & Business Logic Tests", () => {
  const uniqueId = Math.floor(100000 + Math.random() * 900000);
  const testStudent = {
    fullName: "Assessment Student",
    email: `asm_stud_${uniqueId}@test.com`,
    password: "password123",
    role: "student",
  };

  const testTPO = {
    fullName: "Assessment TPO",
    email: `asm_tpo_${uniqueId}@test.com`,
    password: "password123",
    role: "tpo",
  };

  let studentCookie = "";
  let tpoCookie = "";
  let assessmentId = "";

  beforeAll(async () => {
    // Register users
    const studentRes = await request(app).post("/api/auth/register").send(testStudent);
    if (studentRes.headers["set-cookie"]) studentCookie = studentRes.headers["set-cookie"].join("; ");

    const tpoRes = await request(app).post("/api/auth/register").send(testTPO);
    if (tpoRes.headers["set-cookie"]) tpoCookie = tpoRes.headers["set-cookie"].join("; ");
  });

  afterAll(async () => {
    // Clean up created assessment and users
    if (assessmentId) {
      await prisma.assessment.deleteMany({ where: { id: assessmentId } });
    }
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testStudent.email, testTPO.email],
        },
      },
    });
  });

  it("should generate mock questions successfully in mock mode", async () => {
    // Force mock mode dynamically during tests
    process.env.AI_MODE = "mock";

    const res = await request(app)
      .post("/api/ai-assessments/generate")
      .set("Cookie", tpoCookie)
      .send({
        domain: "Computer Science",
        topic: "React Slices",
        difficulty: "medium",
        numberOfQuestions: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.assessment).toHaveProperty("questions");
    expect(res.body.assessment.questions.length).toBe(3);
    expect(res.body.assessment.questions[0].question).toContain("React Slices");
  });

  it("should create an assessment successfully (TPO)", async () => {
    const res = await request(app)
      .post("/api/assessments")
      .set("Cookie", tpoCookie)
      .send({
        title: "Dynamic Assessment Tests",
        description: "Unit testing exam",
        duration: 20,
        passingScore: 50,
        questions: [
          {
            question: "Is Javascript single threaded?",
            options: ["Yes", "No", "Depends", "Both"],
            correctAnswer: 0,
            points: 10,
          },
          {
            question: "What is Prisma?",
            options: ["Library", "Framework", "ORM", "Database"],
            correctAnswer: 2,
            points: 10,
          },
        ],
        status: "live", // Mark it live so students can take it
      });

    expect(res.status).toBe(201);
    expect(res.body.assessment).toHaveProperty("_id");
    assessmentId = res.body.assessment._id;
  });

  it("should allow a student to submit answers, correctly calculating passing score and percentage", async () => {
    if (!assessmentId) return;

    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/submit`)
      .set("Cookie", studentCookie)
      .send({
        answers: [
          { questionIndex: 0, selectedAnswer: 0 }, // Correct (Yes)
          { questionIndex: 1, selectedAnswer: 2 }, // Correct (ORM)
        ],
        startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
        autoSubmitted: false,
        warnings: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.result.score).toBe(20);
    expect(res.body.result.percentage).toBe(100);
    expect(res.body.result.passed).toBe(true);
    expect(res.body.result.warnings).toBe(1);
  });

  it("should block a student from submitting the same assessment twice", async () => {
    if (!assessmentId) return;

    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/submit`)
      .set("Cookie", studentCookie)
      .send({
        answers: [
          { questionIndex: 0, selectedAnswer: 1 },
        ],
        startedAt: new Date().toISOString(),
        autoSubmitted: false,
        warnings: 0,
      });

    // Unique constraint on studentId + assessmentId enforces rejection
    expect([400, 403]).toContain(res.status);
    expect(res.body.message).toContain("already");
  });
});
