import express, { Response } from "express";
import { Doctor } from "../models/Doctor.js";
import { User } from "../models/User.js";
import { Appointment } from "../models/Appointment.js";
import { authenticate, authorize, AuthRequest } from "../middleware/auth.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Get all doctors (public)
router.get("/", async (_req, res: Response) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.json(doctors);
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get doctor by ID (public)
router.get("/:id", async (req, res: Response) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    res.json(doctor);
  } catch (error) {
    console.error("Get doctor error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get available slots for a doctor on a specific date
router.get("/:id/available-slots", async (req, res: Response) => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      res.status(400).json({ error: "Date parameter is required" });
      return;
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }

    // Check if doctor is available on this date
    const dayOfWeek = new Date(date).getDay();
    if (!doctor.availableDays.includes(dayOfWeek)) {
      res.json({ availableSlots: [] });
      return;
    }

    // Check if date is in unavailable dates
    if (doctor.unavailableDates && doctor.unavailableDates.includes(date)) {
      res.json({ availableSlots: [] });
      return;
    }

    // Get existing appointments for this doctor on this date
    const appointments = await Appointment.find({
      doctorId: doctor._id,
      date,
      status: { $in: ["pending", "accepted"] },
    });

    // Check if daily limit is reached
    if (appointments.length >= doctor.maxAppointmentsPerDay) {
      res.json({ availableSlots: [] });
      return;
    }

    // Filter out booked slots
    const bookedTimes = appointments.map((apt) => apt.time);
    const availableSlots = doctor.availableTimeSlots.filter(
      (slot) => !bookedTimes.includes(slot),
    );

    res.json({ availableSlots });
  } catch (error) {
    console.error("Get available slots error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create doctor (admin only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      console.log(req.body);
      const {
        name,
        email,
        specialization,
        availableDays,
        availableTimeSlots,
        maxAppointmentsPerDay,
        avatar,
      } = req.body;

      if (
        !name ||
        !email ||
        !specialization ||
        !availableDays ||
        !availableTimeSlots ||
        !maxAppointmentsPerDay
      ) {
        res.status(400).json({ error: "All required fields must be provided" });
        return;
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({ error: "Email already exists" });
        return;
      }

      // Create user account for doctor
      const hashedPassword = await bcrypt.hash("password123", 10);
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "doctor",
        avatar,
      });

      // Create doctor profile
      const doctor = await Doctor.create({
        userId: user._id,
        name,
        email: email.toLowerCase(),
        specialization,
        availableDays,
        availableTimeSlots,
        maxAppointmentsPerDay,
        avatar,
      });

      res.status(201).json(doctor);
    } catch (error) {
      console.error("Create doctor error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

// Update doctor (admin only)
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        name,
        specialization,
        availableDays,
        availableTimeSlots,
        maxAppointmentsPerDay,
        avatar,
        unavailableDates,
      } = req.body;

      const doctor = await Doctor.findById(req.params.id);
      if (!doctor) {
        res.status(404).json({ error: "Doctor not found" });
        return;
      }

      if (name) doctor.name = name;
      if (specialization) doctor.specialization = specialization;
      if (availableDays) doctor.availableDays = availableDays;
      if (availableTimeSlots) doctor.availableTimeSlots = availableTimeSlots;
      if (maxAppointmentsPerDay)
        doctor.maxAppointmentsPerDay = maxAppointmentsPerDay;
      if (avatar !== undefined) doctor.avatar = avatar;
      if (unavailableDates !== undefined)
        doctor.unavailableDates = unavailableDates;

      await doctor.save();

      // Update corresponding user account
      if (name) {
        await User.findByIdAndUpdate(doctor.userId, { name, avatar });
      }

      res.json(doctor);
    } catch (error) {
      console.error("Update doctor error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

// Delete doctor (admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const doctor = await Doctor.findByIdAndDelete(req.params.id);
      if (!doctor) {
        res.status(404).json({ error: "Doctor not found" });
        return;
      }

      // Delete corresponding user account
      await User.findByIdAndDelete(doctor.userId);

      res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
      console.error("Delete doctor error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

export default router;
