import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  specialization: string;
  availableDays: number[];
  availableTimeSlots: string[];
  maxAppointmentsPerDay: number;
  avatar?: string;
  unavailableDates?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      enum: [
        "Cardiology",
        "Neurology",
        "Pediatrics",
        "Orthopedics",
        "Dermatology",
        "Psychiatry",
        "Oncology",
        "Ophthalmology",
        "ENT",
        "General Medicine",
      ],
    },
    availableDays: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.every((day) => day >= 0 && day <= 6),
        message: "Available days must be between 0-6 (Sunday-Saturday)",
      },
    },
    availableTimeSlots: {
      type: [String],
      required: true,
    },
    maxAppointmentsPerDay: {
      type: Number,
      required: true,
      min: 1,
    },
    avatar: {
      type: String,
    },
    unavailableDates: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
doctorSchema.index({ userId: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ email: 1 });

export const Doctor = mongoose.model<IDoctor>("Doctor", doctorSchema);
