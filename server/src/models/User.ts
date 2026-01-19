import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "patient" | "doctor" | "admin";
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster email lookups
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
