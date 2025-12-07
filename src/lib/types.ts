export type UserRole = 'patient' | 'doctor' | 'admin'

export type AppointmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface Doctor {
  id: string
  name: string
  email: string
  specialization: string
  availableDays: number[]
  availableTimeSlots: string[]
  maxAppointmentsPerDay: number
  avatar?: string
  unavailableDates?: string[]
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  doctorSpecialization: string
  date: string
  time: string
  status: AppointmentStatus
  createdAt: number
}

export interface TimeSlot {
  time: string
  available: boolean
  appointmentId?: string
}
