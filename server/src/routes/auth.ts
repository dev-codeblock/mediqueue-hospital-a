import express, { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Login
router.post("/login", async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as any
    );

    // Get doctor info if user is a doctor
    let doctorInfo = null;
    if (user.role === "doctor") {
      doctorInfo = await Doctor.findOne({ userId: user._id });
    }

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      doctor: doctorInfo
        ? {
            id: doctorInfo._id.toString(),
            specialization: doctorInfo.specialization,
          }
        : null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Register (for patients)
router.post("/register", async (req, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "patient",
    });

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as any
    );

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get current user session
router.get(
  "/session",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findById(req.userId).select("-password");
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      let doctorInfo = null;
      if (user.role === "doctor") {
        doctorInfo = await Doctor.findOne({ userId: user._id });
      }

      res.json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        doctor: doctorInfo
          ? {
              id: doctorInfo._id.toString(),
              specialization: doctorInfo.specialization,
            }
          : null,
      });
    } catch (error) {
      console.error("Session error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
