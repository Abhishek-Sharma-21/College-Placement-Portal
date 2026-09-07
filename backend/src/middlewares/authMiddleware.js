import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Set req.user and alias _id for MongoDB backward compatibility
    req.user = {
      ...user,
      _id: user.id,
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Not authorized, token failed." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "tpo") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as a TPO." });
  }
};

export { protect, isAdmin };
