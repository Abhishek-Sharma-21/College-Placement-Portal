import User, { generateHash, comparePassword } from "../model/auth.model.js";
import jwt from "jsonwebtoken";

// --- Register Controller ---
export const register = async (req, res) => {
  // 1. Get all data from the request body
  const { fullName, email, password, role } = req.body;
  const userRole = role || "student"; // Determine the role

  try {
    // It now checks for both email AND role
    const userExists = await User.findOne({ email, role: userRole });
    if (userExists) {
      return res.status(400).json({
        message: `An account with this email already exists for the '${userRole}' role.`,
      });
    }

    // 3. Hash the password (using your function)
    const hashedPassword = await generateHash(password);

    // 4. Build the new user object
    const newUser = {
      fullName,
      email,
      password: hashedPassword,
      role: userRole, // Use the determined role
    };

    // 5. Create the user in the database
    const user = await User.create(newUser);

    // 6. Send success response (as your frontend expects)
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Login Controller ---
export const login = async (req, res) => {
  // 1. Get email, password, AND role from the request
  const { email, password, role } = req.body;

  // 1b. Role is now required for login
  if (!role) {
    return res
      .status(400)
      .json({ message: "Role (student or tpo) is required to login." });
  }

  try {
    // 2. Find the user by email AND role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials or role." });
    }

    // 3. Compare the password (using your function)
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials or role." });
    }

    // 4. Create a JWT with the user's role
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Payload
      process.env.JWT_SECRET, // Your secret key
      { expiresIn: "1d" } // Expires in 1 day
    );

    // 5. Set the httpOnly cookie (Market Standard)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // 6. Send user data to frontend (for Redux)
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role, // Send the role to the frontend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Logout Controller ---
export const logout = (req, res) => {
  // Clear the cookie by setting an expired date
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};
