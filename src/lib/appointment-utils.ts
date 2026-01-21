import { Appointment, Doctor, TimeSlot } from "./types";

export const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
];

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DEFAULT_TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isDoctorAvailableOnDate(doctor: Doctor, date: string): boolean {
  // JavaScript getDay() returns 0-6 (Sunday=0, Saturday=6)
  // Convert to 1-7 format (Monday=1, Sunday=7) to match WeekDay enum
  const jsDay = new Date(date + "T00:00:00").getDay();
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;

  if (!doctor.availableDays.includes(dayOfWeek)) {
    return false;
  }

  if (doctor.unavailableDates?.includes(date)) {
    return false;
  }

  return true;
}

export function getAvailableSlots(
  doctor: Doctor,
  date: string,
  appointments: Appointment[],
): TimeSlot[] {
  if (!isDoctorAvailableOnDate(doctor, date)) {
    return [];
  }

  const dateAppointments = appointments.filter(
    (apt) =>
      apt.doctorId === doctor._id &&
      apt.date === date &&
      (apt.status === "pending" || apt.status === "accepted"),
  );

  if (dateAppointments.length >= doctor.maxAppointmentsPerDay) {
    return doctor.availableTimeSlots.map((time) => ({
      time,
      available: false,
    }));
  }

  const bookedTimes = new Set(dateAppointments.map((apt) => apt.time));

  return doctor.availableTimeSlots.map((time) => ({
    time,
    available: !bookedTimes.has(time),
  }));
}

export function canBookAppointment(
  doctor: Doctor,
  date: string,
  time: string,
  appointments: Appointment[],
): { canBook: boolean; message?: string } {
  if (!isDoctorAvailableOnDate(doctor, date)) {
    return {
      canBook: false,
      message: "Doctor is not available on this date.",
    };
  }

  if (!doctor.availableTimeSlots.includes(time)) {
    return {
      canBook: false,
      message: "This time slot is not in the doctor's schedule.",
    };
  }

  const dateAppointments = appointments.filter(
    (apt) =>
      apt.doctorId === doctor._id &&
      apt.date === date &&
      (apt.status === "pending" || apt.status === "accepted"),
  );

  if (dateAppointments.length >= doctor.maxAppointmentsPerDay) {
    return {
      canBook: false,
      message: "Doctor has reached maximum appointments for this day.",
    };
  }

  const isSlotTaken = dateAppointments.some((apt) => apt.time === time);
  if (isSlotTaken) {
    return {
      canBook: false,
      message: "Selected slot is already taken. Please choose another time.",
    };
  }

  return { canBook: true };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-[oklch(0.75_0.15_80)] text-[oklch(0.35_0.08_70)]";
    case "accepted":
      return "bg-[oklch(0.65_0.18_145)] text-[oklch(0.30_0.10_145)]";
    case "rejected":
      return "bg-[oklch(0.60_0.18_25)] text-white";
    case "completed":
      return "bg-[oklch(0.60_0.02_240)] text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}
