# CareConnect - AI Coding Assistant Instructions

## Project Overview

CareConnect is a hospital appointment booking system built with React + TypeScript in a browser-based environment. It features role-based dashboards (Patient/Doctor/Admin), intelligent slot booking with double-booking prevention, and persistent data storage.

## Critical Architecture Decisions

### Database: Browser Key-Value Store (Not MongoDB/Prisma)

- **Why**: Browser-based environment doesn't support Node.js-only packages like Prisma or direct database connections
- **Location**: All data operations in [src/lib/database.ts](src/lib/database.ts)
- **Schema**: Key-value store with keys: `users`, `doctors`, `appointments`, `current-user`, `db-initialized`
- **Data Access Pattern**: Use `useKV` custom hook for reactive state management
- **Seed Data**: Auto-initialized on first load via `initializeDatabase()` - includes 3 demo users and 5 doctors

### State Management Pattern

```typescript
// ✅ CORRECT - Functional updates prevent stale closures
const [appointments, setAppointments] = useKV<Appointment[]>(
  "appointments",
  []
);
setAppointments((prev) => [...prev, newAppointment]);

// ❌ WRONG - Direct state mutation
setAppointments([...appointments, newAppointment]);
```

### Type System

All types defined in [src/lib/types.ts](src/lib/types.ts):

- `User` with role: `'patient' | 'doctor' | 'admin'`
- `Doctor` with schedule arrays: `availableDays` (0-6), `availableTimeSlots`, `maxAppointmentsPerDay`
- `Appointment` with status: `'pending' | 'accepted' | 'rejected' | 'completed'`
- Date format: **ISO strings (YYYY-MM-DD)** for storage, Date objects for UI components

## Business Logic Rules

### Appointment Booking Logic ([src/lib/appointment-utils.ts](src/lib/appointment-utils.ts))

1. **Double-Booking Prevention**: Check both time slot AND daily limit before booking
2. **Status Filtering**: Count only `pending` and `accepted` appointments toward daily limits
3. **Day Matching**: Convert date to day-of-week (0-6) and check against `doctor.availableDays`
4. **Unavailability**: Respect `doctor.unavailableDates` array (ISO date strings)

```typescript
// Example: Correct availability check
const dateAppointments = appointments.filter(
  (apt) =>
    apt.doctorId === doctor.id &&
    apt.date === date &&
    (apt.status === "pending" || apt.status === "accepted")
);
const isSlotTaken = dateAppointments.some((apt) => apt.time === time);
const limitReached = dateAppointments.length >= doctor.maxAppointmentsPerDay;
```

## Development Workflows

### Running the App

```bash
npm run dev          # Start dev server (default: http://localhost:5000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Key Files to Modify

- **Add new feature**: Start with route in [src/App.tsx](src/App.tsx) → Create component in `src/components/{role}/`
- **Database changes**: Extend types in [src/lib/types.ts](src/lib/types.ts) → Update seed data in [src/lib/database.ts](src/lib/database.ts)
- **Styling**: Use Tailwind + OKLCH colors (see [PRD.md](PRD.md) for palette)

### Path Aliases

Import using `@/` prefix: `import { User } from '@/lib/types'` (resolves to `src/`)

## Component Patterns

### Role-Based Rendering

All dashboards follow this pattern in [src/App.tsx](src/App.tsx):

```typescript
{
  currentUser.role === "patient" && (
    <PatientDashboard user={currentUser} onLogout={handleLogout} />
  );
}
{
  currentUser.role === "doctor" && (
    <DoctorDashboard user={currentUser} onLogout={handleLogout} />
  );
}
{
  currentUser.role === "admin" && (
    <AdminDashboard user={currentUser} onLogout={handleLogout} />
  );
}
```

### Calendar Integration (Date Selection)

When using `Calendar` component from shadcn/ui:

- Disable past dates: `disabled={(date) => date < new Date()}`
- Disable unavailable days: Check `isDoctorAvailableOnDate()` before showing slots
- **Always use functional state updates** when date changes clear dependent state (e.g., selected time)

Example from [src/components/patient/BookAppointment.tsx](src/components/patient/BookAppointment.tsx):

```typescript
const handleDateSelect = (date: Date | undefined) => {
  setSelectedDate(date);
  setSelectedTime(""); // Clear time when date changes
};
```

## Styling Conventions

### Color System (OKLCH Format)

- Primary (Medical Blue): `oklch(0.45 0.12 250)` - Use for CTAs, primary actions
- Success (Mint Green): `oklch(0.65 0.18 145)` - Use for accepted appointments
- Warning (Amber): `oklch(0.75 0.15 80)` - Use for pending states
- Error (Coral Red): `oklch(0.60 0.18 25)` - Use for rejections
- Reference: [PRD.md](PRD.md#color-selection) for complete palette

### UI Component Library

Uses shadcn/ui components from `src/components/ui/`:

- Import path: `@/components/ui/{component-name}`
- Pre-configured with Tailwind v4 and Radix UI primitives
- Icons: Phosphor Icons (`@phosphor-icons/react`)

## Testing & Debugging

### Demo Credentials (from [DATABASE.md](DATABASE.md))

- Admin: `admin@care.com`
- Doctor: `doctor@care.com`
- Patient: `patient@care.com`

### Database Reset

Access via Admin Dashboard → Database tab → "Reset Database" button (seeds fresh data)

### Common Issues

1. **Data not persisting**: Ensure using `setXxx(prev => ...)` functional updates with `useKV`
2. **Calendar date bug**: Check timezone handling in `formatDate()` - use `date.toISOString().split('T')[0]`
3. **Double bookings**: Verify `canBookAppointment()` is called before `setAppointments`

## Documentation References

- **[PRD.md](PRD.md)**: Product requirements, user flows, edge cases
- **[DATABASE.md](DATABASE.md)**: Complete database schema and CRUD examples
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)**: Implementation history and solved issues
