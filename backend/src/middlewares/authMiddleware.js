import jwt from "jsonwebtoken";
import User from "../model/auth.model.js";

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

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found." });
    }

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
