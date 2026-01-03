# 🗄️ CareConnect Database Documentation

## Overview

CareConnect uses a **browser-based key-value store** as its persistent database. This is a browser-compatible, session-persistent storage system that maintains data across page refreshes and user sessions.

## Why Browser-Based KV Instead of MongoDB/Prisma?

The browser-based environment doesn't support Node.js-only packages like Prisma or direct database connections. Browser-based KV storage provides:

- ✅ **Persistent storage** - Data survives page refreshes
- ✅ **Browser-compatible** - Works natively in the browser
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Simple API** - Easy to use with React hooks
- ✅ **Atomic updates** - Prevents race conditions

## Database Structure

### Key-Value Schema

```typescript
{
  // All registered users (patients, doctors, admins)
  "users": User[]
  
  // Doctor profiles with schedules and availability
  "doctors": Doctor[]
  
  // All appointment bookings
  "appointments": Appointment[]
  
  // Currently logged-in user
  "current-user": User | null
  
  // Database initialization flag
  "db-initialized": boolean
}
```

### Type Definitions

```typescript
interface User {
  id: string
  name: string
  email: string
  role: 'patient' | 'doctor' | 'admin'
  avatar?: string
}

interface Doctor {
  id: string
  name: string
  email: string
  specialization: string
  availableDays: number[]        // 0-6 (Sunday-Saturday)
  availableTimeSlots: string[]   // e.g., ["09:00 AM", "09:30 AM"]
  maxAppointmentsPerDay: number
  unavailableDates?: string[]    // ISO date strings
}

interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  doctorSpecialization: string
  date: string                   // ISO date string (YYYY-MM-DD)
  time: string                   // e.g., "09:00 AM"
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  createdAt: number              // Unix timestamp
}
```

## Database Operations

### Initialization

Located in `src/lib/database.ts`:

```typescript
// Called once on app startup
await initializeDatabase()
```

Seeds the database with:

- 3 demo users (1 admin, 1 doctor, 1 patient)
- 5 doctors across different specializations
- Empty appointments array

### CRUD Operations

#### Using React Hooks (Preferred)

```typescript
import { useKV } from '@/hooks/use-kv'

// Reading data
const [doctors] = useKV<Doctor[]>('doctors', [])

// Updating data (ALWAYS use functional updates!)
const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])

// ✅ CORRECT - Uses current value from closure
setAppointments((current) => [...current, newAppointment])

// ❌ WRONG - May use stale value, causes data loss
setAppointments([...appointments, newAppointment])

// Deleting individual items
setAppointments((current) => 
  current.filter(apt => apt.id !== appointmentId)
)
```

#### Using Direct API

```typescript
// Get data
const users = await kv.get('users') as User[]

// Set data
await kv.set('users', updatedUsers)

// Delete key
await kv.delete('current-user')

// List all keys
const allKeys = await kv.keys()
```

### Helper Functions

```typescript
// Add new user
await addUser(user)

// Update existing user
await updateUser(updatedUser)

// Retrieve data
const users = await getUsers()
const doctors = await getDoctors()
const appointments = await getAppointments()

// Reset to initial state (admin only)
await resetDatabase()
```

## Seed Data

### Demo Accounts

**Admin Account:**

```
Email: admin@care.com
Role: admin
```

**Doctor Account:**

```
Email: doctor@care.com
Name: Dr. Sarah Johnson
Specialization: Cardiology
```

**Patient Account:**

```
Email: patient@care.com
Name: John Smith
```

### Initial Doctors

1. **Dr. Sarah Johnson** - Cardiology
   - Days: Monday-Friday
   - Slots: 14 time slots (9 AM - 5 PM)
   - Max: 12 appointments/day

2. **Dr. Michael Chen** - Neurology
   - Days: Monday, Wednesday, Friday
   - Slots: 6 time slots
   - Max: 8 appointments/day

3. **Dr. Emily Rodriguez** - Pediatrics
   - Days: Monday-Friday
   - Slots: 10 time slots (9 AM - 4 PM)
   - Max: 15 appointments/day

4. **Dr. James Williams** - Orthopedics
   - Days: Tuesday-Saturday
   - Slots: 14 time slots
   - Max: 10 appointments/day

5. **Dr. Lisa Anderson** - Dermatology
   - Days: Monday, Tuesday, Thursday, Friday
   - Slots: 8 time slots
   - Max: 10 appointments/day

## Data Integrity

### Preventing Double-Bookings

The system prevents conflicts through:

1. **Availability Check**: Before booking

```typescript
const slots = getAvailableSlots(doctor, date, appointments)
```

1. **Validation**: Before saving

```typescript
const { canBook, message } = canBookAppointment(doctor, date, time, appointments)
```

1. **Atomic Updates**: Using functional state

```typescript
setAppointments((current) => [...current, newAppointment])
```

### Date Handling

All dates use ISO format (`YYYY-MM-DD`):

```typescript
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
```

## Database Management

### Admin Dashboard → Database Tab

Admins can:

- View total counts (users, doctors, appointments)
- See breakdown by role and status
- Reset database to initial state

### Reset Database

⚠️ **Warning**: This deletes all custom data!

```typescript
await resetDatabase()
```

Resets to:

- 3 demo accounts
- 5 initial doctors
- 0 appointments

## Best Practices

### 1. Always Use Functional Updates

```typescript
// ✅ Good
setData((current) => current.map(item => 
  item.id === id ? { ...item, updated: true } : item
))

// ❌ Bad
setData(data.map(item => 
  item.id === id ? { ...item, updated: true } : item
))
```

### 2. Handle Empty States

```typescript
const users = await kv.get('users') as User[] | undefined
const safeUsers = users || []
```

### 3. Type Safety

```typescript
// Always cast return values
const data = await kv.get('key') as TypeName | undefined
```

### 4. Validation Before Save

```typescript
// Validate before writing
if (!data.email || !data.name) {
  throw new Error('Missing required fields')
}
await kv.set('users', data)
```

## Troubleshooting

### Data Not Persisting?

1. Check you're using `useKV` not `useState`
2. Verify functional updates: `(current) => ...`
3. Ensure database initialized: `await initializeDatabase()`

### Stale Data?

1. Use functional updates
2. Don't reference closure variables
3. Force refresh with `window.location.reload()`

### Lost Data After Refresh?

1. Verify `db-initialized` flag is set
2. Check browser storage isn't cleared
3. Ensure no errors during `initializeDatabase()`

## Migration from Mock Data

This app previously used local state. Now all data is persisted in browser-based KV storage:

**Before:**

```typescript
const [appointments, setAppointments] = useState<Appointment[]>([])
```

**After:**

```typescript
const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
```

All CRUD operations remain the same - just swap `useState` for `useKV`!
