export type UserRole = "patient" | "doctor" | "admin";
export enum WeekDay {
  Monday = 1,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}
export type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
export interface Doctor {
  _id: string;
  userId: string;
  name: string;
  email: string;
  specialization: string;

  availableDays: WeekDay[];
  availableTimeSlots: string[];

  maxAppointmentsPerDay: number;
  unavailableDates: string[];

  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  createdAt: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}
