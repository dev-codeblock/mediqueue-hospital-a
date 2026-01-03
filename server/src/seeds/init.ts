import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";
import { Appointment } from "../models/Appointment.js";
import { connectDB } from "../config/database.js";

dotenv.config();

const DEFAULT_TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

const DEFAULT_PASSWORD = "password123";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    console.log("✅ Cleared existing data");

    // Hash default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // Create users
    await User.create({
      name: "Admin User",
      email: "admin@care.com",
      password: hashedPassword,
      role: "admin",
    });

    const doctorUser1 = await User.create({
      name: "Dr. Sarah Johnson",
      email: "doctor@care.com",
      password: hashedPassword,
      role: "doctor",
    });

    const doctorUser2 = await User.create({
      name: "Dr. Michael Chen",
      email: "mchen@care.com",
      password: hashedPassword,
      role: "doctor",
    });

    const doctorUser3 = await User.create({
      name: "Dr. Emily Rodriguez",
      email: "erodriguez@care.com",
      password: hashedPassword,
      role: "doctor",
    });

    const doctorUser4 = await User.create({
      name: "Dr. James Williams",
      email: "jwilliams@care.com",
      password: hashedPassword,
      role: "doctor",
    });

    const doctorUser5 = await User.create({
      name: "Dr. Lisa Anderson",
      email: "landerson@care.com",
      password: hashedPassword,
      role: "doctor",
    });

    await User.create({
      name: "John Smith",
      email: "patient@care.com",
      password: hashedPassword,
      role: "patient",
    });

    console.log("✅ Created users");

    // Create doctor profiles
    await Doctor.create({
      userId: doctorUser1._id,
      name: "Dr. Sarah Johnson",
      email: "doctor@care.com",
      specialization: "Cardiology",
      availableDays: [1, 2, 3, 4, 5],
      availableTimeSlots: DEFAULT_TIME_SLOTS,
      maxAppointmentsPerDay: 12,
    });

    await Doctor.create({
      userId: doctorUser2._id,
      name: "Dr. Michael Chen",
      email: "mchen@care.com",
      specialization: "Neurology",
      availableDays: [1, 3, 5],
      availableTimeSlots: [
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
      ],
      maxAppointmentsPerDay: 8,
    });

    await Doctor.create({
      userId: doctorUser3._id,
      name: "Dr. Emily Rodriguez",
      email: "erodriguez@care.com",
      specialization: "Pediatrics",
      availableDays: [1, 2, 3, 4, 5],
      availableTimeSlots: [
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
        "03:30 PM",
        "04:00 PM",
      ],
      maxAppointmentsPerDay: 15,
    });

    await Doctor.create({
      userId: doctorUser4._id,
      name: "Dr. James Williams",
      email: "jwilliams@care.com",
      specialization: "Orthopedics",
      availableDays: [2, 3, 4, 5, 6],
      availableTimeSlots: DEFAULT_TIME_SLOTS,
      maxAppointmentsPerDay: 10,
    });

    await Doctor.create({
      userId: doctorUser5._id,
      name: "Dr. Lisa Anderson",
      email: "landerson@care.com",
      specialization: "Dermatology",
      availableDays: [1, 2, 4, 5],
      availableTimeSlots: [
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
        "05:00 PM",
      ],
      maxAppointmentsPerDay: 10,
    });

    console.log("✅ Created doctor profiles");

    // Summary
    console.log("\n📊 Seeding Summary:");
    console.log(`   Users created: ${await User.countDocuments()}`);
    console.log(`   Doctors created: ${await Doctor.countDocuments()}`);
    console.log(
      `   Appointments created: ${await Appointment.countDocuments()}`
    );
    console.log("\n🔑 Demo Credentials:");
    console.log("   Admin: admin@care.com / password123");
    console.log("   Doctor: doctor@care.com / password123");
    console.log("   Patient: patient@care.com / password123");
    console.log("\n✨ Database seeding completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Connect to database and run seeder
connectDB().then(seedDatabase);
