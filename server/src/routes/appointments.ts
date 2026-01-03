import express, { Response } from "express";
import { Appointment } from "../models/Appointment.js";
import { Doctor } from "../models/Doctor.js";
import { User } from "../models/User.js";
import { authenticate, authorize, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// Get appointments (role-based access)
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    // Filter based on role
    if (req.userRole === "patient") {
      query.patientId = req.userId;
    } else if (req.userRole === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.userId });
      if (doctor) {
        query.doctorId = doctor._id;
      }
    }
    // Admin sees all appointments (no filter)

    const appointments = await Appointment.find(query).sort({
      date: -1,
      time: -1,
    });
    res.json(appointments);
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get appointment by ID
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    // Check access permissions
    if (
      req.userRole === "patient" &&
      appointment.patientId.toString() !== req.userId
    ) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (req.userRole === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.userId });
      if (doctor && appointment.doctorId.toString() !== doctor._id.toString()) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
    }

    res.json(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create appointment (patients only)
router.post(
  "/",
  authenticate,
  authorize("patient"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { doctorId, date, time } = req.body;

      if (!doctorId || !date || !time) {
        res.status(400).json({ error: "Doctor, date, and time are required" });
        return;
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({ error: "Date must be in YYYY-MM-DD format" });
        return;
      }

      // Get doctor details
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        res.status(404).json({ error: "Doctor not found" });
        return;
      }

      // Get patient details
      const patient = await User.findById(req.userId);
      if (!patient) {
        res.status(404).json({ error: "Patient not found" });
        return;
      }

      // Check if doctor is available on this day
      const dayOfWeek = new Date(date).getDay();
      if (!doctor.availableDays.includes(dayOfWeek)) {
        res.status(400).json({ error: "Doctor is not available on this day" });
        return;
      }

      // Check if time slot is valid
      if (!doctor.availableTimeSlots.includes(time)) {
        res.status(400).json({ error: "Invalid time slot" });
        return;
      }

      // Check if date is unavailable
      if (doctor.unavailableDates && doctor.unavailableDates.includes(date)) {
        res.status(400).json({ error: "Doctor is not available on this date" });
        return;
      }

      // Check existing appointments for this slot
      const existingAppointment = await Appointment.findOne({
        doctorId: doctor._id,
        date,
        time,
        status: { $in: ["pending", "accepted"] },
      });

      if (existingAppointment) {
        res.status(400).json({ error: "This time slot is already booked" });
        return;
      }

      // Check daily appointment limit
      const dailyAppointments = await Appointment.countDocuments({
        doctorId: doctor._id,
        date,
        status: { $in: ["pending", "accepted"] },
      });

      if (dailyAppointments >= doctor.maxAppointmentsPerDay) {
        res.status(400).json({
          error: "Doctor has reached maximum appointments for this day",
        });
        return;
      }

      // Create appointment
      const appointment = await Appointment.create({
        patientId: patient._id,
        patientName: patient.name,
        doctorId: doctor._id,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
        date,
        time,
        status: "pending",
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update appointment status (doctors can accept/reject, patients can cancel pending)
router.patch(
  "/:id/status",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;

      if (
        !status ||
        !["pending", "accepted", "rejected", "completed"].includes(status)
      ) {
        res.status(400).json({ error: "Invalid status" });
        return;
      }

      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) {
        res.status(404).json({ error: "Appointment not found" });
        return;
      }

      // Check permissions
      if (req.userRole === "doctor") {
        const doctor = await Doctor.findOne({ userId: req.userId });
        if (
          !doctor ||
          appointment.doctorId.toString() !== doctor._id.toString()
        ) {
          res.status(403).json({ error: "Access denied" });
          return;
        }
        // Doctors can accept, reject, or complete
        if (!["accepted", "rejected", "completed"].includes(status)) {
          res.status(400).json({ error: "Invalid status for doctor" });
          return;
        }
      } else if (req.userRole === "patient") {
        if (appointment.patientId.toString() !== req.userId) {
          res.status(403).json({ error: "Access denied" });
          return;
        }
        // Patients can only cancel (reject) pending appointments
        if (appointment.status !== "pending" || status !== "rejected") {
          res
            .status(400)
            .json({ error: "Can only cancel pending appointments" });
          return;
        }
      }
      // Admin can change any status

      appointment.status = status;
      await appointment.save();

      res.json(appointment);
    } catch (error) {
      console.error("Update appointment status error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete appointment (admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const appointment = await Appointment.findByIdAndDelete(req.params.id);
      if (!appointment) {
        res.status(404).json({ error: "Appointment not found" });
        return;
      }

      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Delete appointment error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
