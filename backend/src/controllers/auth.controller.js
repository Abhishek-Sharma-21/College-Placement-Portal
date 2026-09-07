import { prisma } from "../config/prisma.js";
import { generateHash, comparePassword } from "../utils/auth.js";
import jwt from "jsonwebtoken";

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_keys_19827";

// Helper to generate a unique role-prefixed ID (e.g. student_584)
const generateCustomId = async (role) => {
  let isUnique = false;
  let customId;
  while (!isUnique) {
    // Generate a random 3-digit number to match format like student_584
    const randomNum = Math.floor(100 + Math.random() * 900);
    customId = `${role}_${randomNum}`;
    const existing = await prisma.user.findUnique({ where: { id: customId } });
    if (!existing) {
      isUnique = true;
    }
  }
  return customId;
};

// Token generators
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // 15 mins short-lived access
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: "7d" } // 7 days long-lived refresh
  );
};

// Cookies helpers
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// --- Register Controller ---
export const register = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const userRole = role || "student";

  try {
    const userExists = await prisma.user.findFirst({
      where: { email, role: userRole },
    });
    if (userExists) {
      return res.status(400).json({
        message: `An account with this email already exists for the '${userRole}' role.`,
      });
    }

    // Generate custom unique ID
    const customId = await generateCustomId(userRole);
    const hashedPassword = await generateHash(password);

    const user = await prisma.user.create({
      data: {
        id: customId,
        fullName,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: "User registered and logged in successfully.",
      _id: user.id,
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- Login Controller ---
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { email, role },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials or role." });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials or role." });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Delete old refresh tokens for safety
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    // Save new refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      _id: user.id,
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- Logout Controller ---
export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  try {
    if (refreshToken) {
      // Remove refresh token from DB
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }
  } catch (err) {
    console.error("Failed to delete refresh token from DB:", err);
  } finally {
    // Clear cookies
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.cookie("refreshToken", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  }
};

// --- Refresh Token Controller ---
export const refresh = async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken;
  if (!oldRefreshToken) {
    return res.status(401).json({ message: "Refresh token not found." });
  }

  try {
    // 1. Verify token signature
    const decoded = jwt.verify(oldRefreshToken, REFRESH_SECRET);

    // 2. Look up token in database
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      // Token is deleted or expired
      if (dbToken) {
        await prisma.refreshToken.delete({ where: { id: dbToken.id } });
      }
      return res.status(401).json({ message: "Invalid or expired refresh token." });
    }

    const user = dbToken.user;

    // 3. Rotate tokens (generate new access and refresh tokens)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // 4. Update refresh token in DB
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: dbToken.id } }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
      message: "Token refreshed successfully.",
      _id: user.id,
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({ message: "Unauthorized token refresh failed." });
  }
};

// --- Get Me Controller ---
// Requires the `protect` middleware to be applied on the route
export const getMe = (req, res) => {
  // req.user is populated by the protect middleware
  res.status(200).json({
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    role: req.user.role,
  });
};
