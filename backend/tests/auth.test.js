import { describe, it, expect, afterAll, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("Authentication & Session API Tests", () => {
  const uniqueId = Math.floor(100000 + Math.random() * 900000);
  const testStudent = {
    fullName: "Test Student",
    email: `student_${uniqueId}@test.com`,
    password: "password123",
    role: "student",
  };

  const testTPO = {
    fullName: "Test TPO",
    email: `tpo_${uniqueId}@test.com`,
    password: "password123",
    role: "tpo",
  };

  let studentCookie = "";

  beforeAll(async () => {
    // Clean up if there are leftover users from aborted runs
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testStudent.email, testTPO.email],
        },
      },
    });
  });

  afterAll(async () => {
    // Delete created users to ensure clean DB state
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testStudent.email, testTPO.email],
        },
      },
    });
  });

  it("should register a new student successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testStudent);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe(testStudent.email);
    expect(res.body.role).toBe("student");
    expect(res.headers["set-cookie"]).toBeDefined();
    
    // Store cookie for subsequent requests
    studentCookie = res.headers["set-cookie"].join("; ");
  });

  it("should prevent duplicate registration for the same role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testStudent);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("already exists");
  });

  it("should register a new TPO successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testTPO);

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("tpo");
  });

  it("should log in successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testStudent.email,
        password: testStudent.password,
        role: "student",
      });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testStudent.email);
    expect(res.headers["set-cookie"]).toBeDefined();
    studentCookie = res.headers["set-cookie"].join("; ");
  });

  it("should reject login with incorrect credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testStudent.email,
        password: "wrongpassword",
        role: "student",
      });

    expect(res.status).toBe(401);
  });

  it("should refresh tokens successfully using refresh token", async () => {
    if (!studentCookie) return;
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", studentCookie)
      .send();

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should log out and clear cookies successfully", async () => {
    if (!studentCookie) return;
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", studentCookie)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });
});
