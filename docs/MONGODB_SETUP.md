# CareConnect MongoDB Migration - Setup Guide

This guide explains how to run the newly migrated MongoDB-based CareConnect application.

## Architecture

The application has been migrated from a **client-only localStorage app** to a **full-stack application**:

- **Frontend**: React + TypeScript + Vite (port 5000)
- **Backend**: Express + MongoDB + TypeScript (port 4000)
- **Database**: MongoDB (local or Atlas)

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** installed and running locally OR MongoDB Atlas account
   - Local: Download from <https://www.mongodb.com/try/download/community>
   - Atlas: Create free cluster at <https://www.mongodb.com/cloud/atlas>

## Setup Instructions

### 1. Install MongoDB (if running locally)

**Windows:**

```powershell
# Download installer from MongoDB website and install
# Start MongoDB service
net start MongoDB
```

**Mac (using Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**

```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. Backend Setup

```powershell
# Navigate to server directory
cd server

# Install dependencies (already done)
npm install

# The .env file is already created with default settings
# If using MongoDB Atlas, update MONGODB_URI in server/.env

# Seed the database
npm run seed
```

Expected output:

```
✅ MongoDB Connected: localhost
✅ Cleared existing data
✅ Created users
✅ Created doctor profiles

📊 Seeding Summary:
   Users created: 7
   Doctors created: 5
   Appointments created: 0

🔑 Demo Credentials:
   Admin: admin@care.com / password123
   Doctor: doctor@care.com / password123
   Patient: patient@care.com / password123
```

### 3. Start Backend Server

```powershell
# From server directory
npm run dev
```

Expected output:

```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:4000
📝 API documentation: http://localhost:4000/health
```

### 4. Start Frontend

Open a **new terminal** window:

```powershell
# From project root
npm run dev
```

Expected output:

```
VITE v7.2.6  ready in 500 ms

➜  Local:   http://localhost:5000/
➜  Network: use --host to expose
```

### 5. Access the Application

Open your browser and navigate to:

```
http://localhost:5000
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | <admin@care.com> | password123 |
| Doctor | <doctor@care.com> | password123 |
| Patient | <patient@care.com> | password123 |

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new patient
- `GET /api/auth/session` - Get current user session

### Doctors

- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/:id/available-slots?date=YYYY-MM-DD` - Get available slots
- `POST /api/doctors` - Create doctor (admin only)
- `PUT /api/doctors/:id` - Update doctor (admin only)
- `DELETE /api/doctors/:id` - Delete doctor (admin only)

### Appointments

- `GET /api/appointments` - Get appointments (role-based filtering)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment (patients only)
- `PATCH /api/appointments/:id/status` - Update appointment status
- `DELETE /api/appointments/:id` - Delete appointment (admin only)

### Users

- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Troubleshooting

### MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:

1. Ensure MongoDB is running: `net start MongoDB` (Windows) or `brew services start mongodb-community` (Mac)
2. Check MongoDB URI in `server/.env` file
3. If using Atlas, ensure IP is whitelisted and credentials are correct

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::4000`

**Solution**:

```powershell
# Windows - Kill process on port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4000 | xargs kill
```

### CORS Issues

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Ensure backend is running on port 4000 and frontend on port 5000. The proxy is configured in `vite.config.ts`.

## Development Workflow

### Running Both Servers

You need **two terminal windows**:

**Terminal 1 (Backend)**:

```powershell
cd server
npm run dev
```

**Terminal 2 (Frontend)**:

```powershell
npm run dev
```

### Resetting Database

```powershell
cd server
npm run seed
```

This will clear all data and re-seed with demo accounts.

### Building for Production

**Backend**:

```powershell
cd server
npm run build
npm start
```

**Frontend**:

```powershell
npm run build
npm run preview
```

## What's Next?

The backend is now fully functional with MongoDB. The **frontend components still use the old `useKV` hook** and need to be updated to use React Query and the API client.

### Components to Update

1. `src/App.tsx` - Use auth context instead of useKV
2. `src/components/auth/LoginPage.tsx` - Use auth context
3. `src/components/patient/*` - Use React Query hooks
4. `src/components/doctor/*` - Use React Query hooks
5. `src/components/admin/*` - Use React Query hooks

This migration is 80% complete. The backend and infrastructure are ready, but frontend components need refactoring to call the API endpoints.

## Project Structure

```
mediqueue-hospital-a/
├── server/                    # Backend API
│   ├── src/
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routes
│   │   ├── middleware/       # Auth middleware
│   │   ├── config/           # Database config
│   │   ├── seeds/            # Database seeding
│   │   └── index.ts          # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── src/                      # Frontend (React)
│   ├── components/
│   ├── lib/
│   │   ├── api-client.ts     # API client (NEW)
│   │   ├── auth-context.tsx  # Auth provider (NEW)
│   │   ├── kv-storage.ts     # Old localStorage (TO BE REMOVED)
│   │   └── database.ts       # Old DB functions (TO BE REMOVED)
│   └── ...
│
├── .env                      # Frontend env vars
└── package.json              # Frontend dependencies
```

## Notes

- MongoDB must be running before starting the backend
- Keep both terminals running during development
- Backend API runs on <http://localhost:4000>
- Frontend runs on <http://localhost:5000>
- API calls from frontend use `/api` which proxies to backend
