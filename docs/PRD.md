# Planning Guide

CareConnect is a comprehensive online hospital appointment system that eliminates double-booking, reduces wait times, and streamlines the connection between patients, doctors, and administrators through intelligent scheduling and real-time availability management. The application uses a persistent key-value database to store all users, doctors, and appointments with automatic initialization of seed data.

**Experience Qualities**:

1. **Professional** - Instills trust through a clean, medical-grade interface that feels reliable and authoritative
2. **Efficient** - Minimizes clicks and cognitive load, enabling quick appointment booking and management with clear visual feedback
3. **Transparent** - Provides complete visibility into doctor availability, appointment status, and scheduling conflicts with honest, upfront communication

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This system requires sophisticated role-based access control (patient/doctor/admin), real-time slot availability checking, multi-view dashboards for different user types, appointment state management, comprehensive notification systems, and persistent database storage—all requiring complex state coordination and data persistence.

## Data Persistence Architecture

The application uses a key-value store as its persistent database with the following structure:

- **users**: Array of User objects containing patient, doctor, and admin accounts
- **doctors**: Array of Doctor objects with schedules, specializations, and availability
- **appointments**: Array of Appointment objects tracking all bookings
- **current-user**: Currently authenticated user session
- **db-initialized**: Flag to prevent duplicate initialization

On first load, the system automatically seeds the database with:

- 3 demo users (1 admin, 1 doctor, 1 patient)
- 5 doctors across different specializations with varied schedules
- Empty appointments array ready for bookings

All data modifications use functional updates with useKV hook to prevent race conditions and ensure data consistency.

## Essential Features

### User Authentication & Role Management

- **Functionality**: Secure login system with three distinct user roles (Patient, Doctor, Admin) each with tailored permissions and interfaces
- **Purpose**: Ensures data privacy, provides appropriate access levels, and personalizes the experience for each user type
- **Trigger**: User clicks "Login" or "Register" from landing page
- **Progression**: Select role → Enter credentials → Validate → Redirect to role-specific dashboard
- **Success criteria**: Users can only access features appropriate to their role; session persists across page refreshes

### Doctor Search & Discovery (Patient)

- **Functionality**: Searchable directory of doctors filtered by specialization with real-time availability indicators
- **Purpose**: Helps patients find the right specialist quickly and see immediate availability
- **Trigger**: Patient clicks "Book Appointment" from dashboard
- **Progression**: View specializations → Select specialization → Browse matching doctors → See doctor details & availability → Select doctor
- **Success criteria**: Patients can discover doctors within 2 clicks; availability is accurate and real-time

### Intelligent Slot Booking (Patient)

- **Functionality**: Calendar-based time slot selection that prevents double-booking and respects doctor limits
- **Purpose**: Ensures zero scheduling conflicts and optimal resource utilization
- **Trigger**: Patient selects a doctor
- **Progression**: View available dates → Select date → See free time slots (taken slots disabled) → Select slot → Confirm booking → Receive pending status notification
- **Success criteria**: No double-bookings ever occur; slot availability updates in real-time; clear messaging when slots are unavailable

### Appointment Management (Doctor)

- **Functionality**: Dashboard showing all pending, accepted, and upcoming appointments with accept/reject controls
- **Purpose**: Gives doctors control over their schedule and workload
- **Trigger**: Doctor logs in or navigates to "My Appointments"
- **Progression**: View appointment requests → Review patient details → Accept or Reject → Update appointment status (Pending/Accepted/Rejected/Completed) → Patient receives notification
- **Success criteria**: Doctors can process requests within 3 clicks; status changes reflect immediately for patients

### Schedule Configuration (Admin)

- **Functionality**: Interface to add/edit doctors, set available days, define time slots, and configure daily appointment limits
- **Purpose**: Centralized control over hospital resources and scheduling capacity
- **Trigger**: Admin selects "Manage Doctors" or "Configure Schedules"
- **Progression**: Select doctor (or add new) → Set specialization → Define available days → Set time slots → Set daily limit → Save configuration
- **Success criteria**: Admin can fully configure a doctor's schedule in under 2 minutes; changes apply immediately to patient-facing availability

### Appointment Status Tracking (Patient)

- **Functionality**: Real-time view of all appointments with current status and doctor information
- **Purpose**: Keeps patients informed and reduces uncertainty about appointment confirmations
- **Trigger**: Patient navigates to "My Appointments"
- **Progression**: View appointment list → See status badges (Pending/Accepted/Rejected/Completed) → View appointment details → Receive notifications on status changes
- **Success criteria**: Status updates appear within seconds of doctor action; clear visual distinction between states

### Availability Management (Doctor)

- **Functionality**: Toggle to mark specific days/times as unavailable
- **Purpose**: Accommodates doctor vacations, emergencies, and schedule changes
- **Trigger**: Doctor clicks "Manage Availability"
- **Progression**: View calendar → Select date range → Mark as unavailable → Confirm → Existing bookings flagged for rescheduling
- **Success criteria**: Unavailable slots immediately removed from patient booking options

## Edge Case Handling

- **Concurrent Booking Attempts** - When two patients try booking the same slot simultaneously, first successful save wins; second patient receives immediate error with alternative slots suggested
- **Doctor Limit Reached** - When daily appointment limit is hit, all remaining slots for that day become unavailable with clear messaging explaining the limit
- **Deleted Doctor with Active Appointments** - System prevents doctor deletion if appointments exist; admin must reassign or cancel appointments first
- **Patient Books During Doctor Availability Change** - Optimistic locking ensures slot claimed during admin edit remains valid; new restrictions apply to future bookings only
- **Network Failure During Booking** - Failed saves rollback completely; patient sees error and slot remains available; no phantom bookings created
- **Invalid Date Selection** - Past dates disabled in UI; validation prevents API calls with invalid dates
- **Empty States** - Graceful messages when no doctors match specialization, no appointments exist, or no slots available

## Design Direction

The design should evoke **trust, clarity, and medical professionalism** while remaining warm and approachable. Think clean hospital corridors with natural light—sterile but not cold. The interface should feel like a premium healthcare facility: organized, precise, and reassuring. Visual hierarchy should be sharp to guide urgent vs. routine actions, with calming colors that reduce anxiety associated with medical appointments.

## Color Selection

A sophisticated medical palette balancing professionalism with warmth:

- **Primary Color**: Deep Medical Blue `oklch(0.45 0.12 250)` - Conveys trust, expertise, and medical authority; used for primary CTAs like "Book Appointment" and key navigation
- **Secondary Colors**:
  - Soft Mint `oklch(0.94 0.04 160)` - Calming background color for secondary sections and cards
  - Warm Slate `oklch(0.35 0.02 240)` - Professional text and icons
- **Accent Color**: Vibrant Teal `oklch(0.60 0.15 200)` - Energetic highlight for active states, accepted appointments, and success messages
- **Status Colors**:
  - Pending: Amber `oklch(0.75 0.15 80)`
  - Accepted: Green `oklch(0.65 0.18 145)`
  - Rejected: Coral Red `oklch(0.60 0.18 25)`
  - Completed: Cool Gray `oklch(0.60 0.02 240)`
- **Foreground/Background Pairings**:
  - Primary Blue Background `oklch(0.45 0.12 250)`: White text `oklch(1 0 0)` - Ratio 8.2:1 ✓
  - Accent Teal Background `oklch(0.60 0.15 200)`: White text `oklch(1 0 0)` - Ratio 5.8:1 ✓
  - Soft Mint Background `oklch(0.94 0.04 160)`: Warm Slate text `oklch(0.35 0.02 240)` - Ratio 9.1:1 ✓
  - Main Background `oklch(0.98 0.01 180)`: Warm Slate text `oklch(0.35 0.02 240)` - Ratio 10.5:1 ✓

## Font Selection

Typography should balance medical precision with human approachability—clinical but not robotic.

- **Primary Font**: **Inter** (clean, highly legible, professional without being sterile)
- **Accent Font**: **Outfit** (friendly geometric sans for headings, adds warmth)

- **Typographic Hierarchy**:
  - H1 (Dashboard Titles): Outfit Bold/32px/tight (-0.02em) letter spacing
  - H2 (Section Headers): Outfit Semibold/24px/tight (-0.01em)
  - H3 (Card Titles): Inter Semibold/18px/normal
  - Body (Primary Content): Inter Regular/15px/relaxed (1.6 line-height)
  - Small (Meta Info): Inter Regular/13px/normal - Muted color for timestamps, status details
  - Button Labels: Inter Semibold/14px/wide (0.02em) uppercase for primary actions

## Animations

Animations should feel **precise and medical-grade**—quick, purposeful transitions that enhance clarity without feeling playful. Use subtle micro-interactions for status changes (appointment accepted = gentle scale + color shift), smooth page transitions between dashboards (slide with 300ms ease-out), and loading states that feel progress-oriented (skeleton screens, not spinners). Calendar date selection should have satisfying tactile feedback. Avoid bouncy or elastic effects; prefer linear easing with slight deceleration for a professional feel.

## Component Selection

- **Components**:
  - `Dialog` - Appointment confirmation modals, doctor detail views
  - `Card` - Doctor cards, appointment cards, dashboard stats
  - `Calendar` - Date picker for appointment booking (react-day-picker integration)
  - `Select` - Specialization filter, time slot selection
  - `Badge` - Status indicators (Pending, Accepted, Rejected, Completed)
  - `Avatar` - Doctor profile images
  - `Button` - Primary actions with variants (default, outline, destructive)
  - `Table` - Admin view of all appointments
  - `Tabs` - Switching between appointment states (Pending/Upcoming/Past)
  - `Alert` - Error messaging for unavailable slots
  - `Separator` - Visual section breaks
  - `ScrollArea` - Time slot lists, long appointment histories

- **Customizations**:
  - Custom `AppointmentCard` component combining Card + Badge + Avatar with role-specific actions
  - Custom `DoctorProfileCard` with availability indicators and booking CTA
  - Custom `TimeSlotPicker` grid component showing available/unavailable visual states
  - Custom `StatusTimeline` for appointment progression visualization

- **States**:
  - Buttons: Solid primary (Medical Blue), Outline secondary (Teal border), Disabled (muted with 50% opacity)
  - Calendar dates: Default (white), Available (subtle teal highlight), Selected (solid teal), Disabled/Past (gray strikethrough)
  - Time slots: Available (white card with teal border on hover), Taken (gray with lock icon, disabled), Selected (solid teal)
  - Status badges: Pending (amber bg + dark amber text), Accepted (green bg + dark green text), Rejected (red bg + dark red text), Completed (gray bg + dark gray text)

- **Icon Selection**:
  - `CalendarDots` - Appointment booking and scheduling
  - `UserCircle` - User profiles and authentication
  - `MagnifyingGlass` - Doctor search
  - `Clock` - Time slots and scheduling
  - `CheckCircle` - Accepted appointments
  - `XCircle` - Rejected appointments
  - `HourglassMedium` - Pending status
  - `Stethoscope` - Medical/doctor-related actions
  - `CaretRight` - Navigation and next steps
  - `Bell` - Notifications
  - `SignOut` - Logout

- **Spacing**:
  - Section padding: `p-6` (24px) for cards, `p-8` (32px) for page containers
  - Element gaps: `gap-4` (16px) for card grids, `gap-2` (8px) for inline elements
  - Margins: `mb-6` (24px) between major sections, `mb-4` (16px) between subsections
  - Button padding: `px-6 py-3` for primary CTAs, `px-4 py-2` for secondary

- **Mobile**:
  - Navigation: Sticky top bar with hamburger menu collapsing to bottom sheet
  - Doctor cards: Stack vertically, full width with image repositioned above content
  - Calendar: Responsive date picker with touch-friendly tap targets (min 44px)
  - Time slots: Grid becomes 2-column on mobile vs 4-column on desktop
  - Tables: Transform to stacked cards on mobile with key info prioritized
  - Dashboard: Single column layout with most urgent info (pending appointments) at top
  - Spacing: Reduce padding to `p-4` on mobile, maintain `gap-4` for readability
