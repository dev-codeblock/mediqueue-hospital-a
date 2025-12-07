import { User, Doctor, Appointment } from './types'
import { generateId, DEFAULT_TIME_SLOTS } from './appointment-utils'

declare const spark: any

export async function initializeDatabase() {
  const hasInitialized = await spark.kv.get('db-initialized') as boolean | undefined
  
  if (hasInitialized) {
    return
  }

  const initialUsers: User[] = [
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@care.com',
      role: 'admin',
    },
    {
      id: 'doctor-1',
      name: 'Dr. Sarah Johnson',
      email: 'doctor@care.com',
      role: 'doctor',
    },
    {
      id: 'patient-1',
      name: 'John Smith',
      email: 'patient@care.com',
      role: 'patient',
    },
  ]

  const initialDoctors: Doctor[] = [
    {
      id: 'doctor-1',
      name: 'Dr. Sarah Johnson',
      email: 'doctor@care.com',
      specialization: 'Cardiology',
      availableDays: [1, 2, 3, 4, 5],
      availableTimeSlots: DEFAULT_TIME_SLOTS,
      maxAppointmentsPerDay: 12,
    },
    {
      id: 'doctor-2',
      name: 'Dr. Michael Chen',
      email: 'mchen@care.com',
      specialization: 'Neurology',
      availableDays: [1, 3, 5],
      availableTimeSlots: [
        '09:00 AM',
        '10:00 AM',
        '11:00 AM',
        '02:00 PM',
        '03:00 PM',
        '04:00 PM',
      ],
      maxAppointmentsPerDay: 8,
    },
    {
      id: 'doctor-3',
      name: 'Dr. Emily Rodriguez',
      email: 'erodriguez@care.com',
      specialization: 'Pediatrics',
      availableDays: [1, 2, 3, 4, 5],
      availableTimeSlots: [
        '09:00 AM',
        '09:30 AM',
        '10:00 AM',
        '10:30 AM',
        '11:00 AM',
        '02:00 PM',
        '02:30 PM',
        '03:00 PM',
        '03:30 PM',
        '04:00 PM',
      ],
      maxAppointmentsPerDay: 15,
    },
    {
      id: 'doctor-4',
      name: 'Dr. James Williams',
      email: 'jwilliams@care.com',
      specialization: 'Orthopedics',
      availableDays: [2, 3, 4, 5, 6],
      availableTimeSlots: DEFAULT_TIME_SLOTS,
      maxAppointmentsPerDay: 10,
    },
    {
      id: 'doctor-5',
      name: 'Dr. Lisa Anderson',
      email: 'landerson@care.com',
      specialization: 'Dermatology',
      availableDays: [1, 2, 4, 5],
      availableTimeSlots: [
        '09:00 AM',
        '10:00 AM',
        '11:00 AM',
        '12:00 PM',
        '02:00 PM',
        '03:00 PM',
        '04:00 PM',
        '05:00 PM',
      ],
      maxAppointmentsPerDay: 10,
    },
  ]

  const initialAppointments: Appointment[] = []

  await spark.kv.set('users', initialUsers)
  await spark.kv.set('doctors', initialDoctors)
  await spark.kv.set('appointments', initialAppointments)
  await spark.kv.set('db-initialized', true)
}

export async function resetDatabase() {
  await spark.kv.delete('db-initialized')
  await spark.kv.delete('users')
  await spark.kv.delete('doctors')
  await spark.kv.delete('appointments')
  await spark.kv.delete('current-user')
  await initializeDatabase()
}

export async function addUser(user: User) {
  const users = (await spark.kv.get('users') as User[] | undefined) || []
  users.push(user)
  await spark.kv.set('users', users)
}

export async function updateUser(updatedUser: User) {
  const users = (await spark.kv.get('users') as User[] | undefined) || []
  const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u)
  await spark.kv.set('users', updatedUsers)
}

export async function getUsers(): Promise<User[]> {
  return (await spark.kv.get('users') as User[] | undefined) || []
}

export async function getDoctors(): Promise<Doctor[]> {
  return (await spark.kv.get('doctors') as Doctor[] | undefined) || []
}

export async function getAppointments(): Promise<Appointment[]> {
  return (await spark.kv.get('appointments') as Appointment[] | undefined) || []
}
