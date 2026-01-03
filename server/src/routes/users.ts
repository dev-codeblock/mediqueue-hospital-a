import express, { Response } from "express";
import { User } from "../models/User.js";
import { authenticate, authorize, AuthRequest } from "../middleware/auth.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Get all users (admin only)
router.get(
  "/",
  authenticate,
  authorize("admin"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Create user (admin only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({ error: "Email already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
      });

      res.status(201).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update user (admin only)
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, role, avatar } = req.body;

      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (role) user.role = role;
      if (avatar !== undefined) user.avatar = avatar;

      await user.save();

      res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete user (admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
