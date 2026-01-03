# 🚀 CareConnect Quick Start Guide

## Current Status: ✅ FULLY OPERATIONAL

Both frontend and backend are running and fully integrated with MongoDB.

---

## 🌐 Access Points

| Service  | URL                          | Status |
|----------|------------------------------|--------|
| Frontend | <http://localhost:5173>        | ✅ Running |
| Backend  | <http://localhost:4000>        | ✅ Running |
| Health   | <http://localhost:4000/health> | ✅ Active |

---

## 🔑 Quick Login

**Use these demo accounts at <http://localhost:5173>:**

```
Patient Account:
Email: patient@care.com
Password: password123

Doctor Account:
Email: doctor@care.com
Password: password123

Admin Account:
Email: admin@care.com
Password: password123
```

---

## ⚡ Quick Commands

### Start Everything

```powershell
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

### Re-seed Database

```powershell
cd server
npm run seed
```

### Build for Production

```powershell
npm run build
cd server && npm run build
```

---

## 🧪 Test Features

### As Patient (<patient@care.com>)

1. ✅ Book appointment → Select specialization → Choose doctor → Pick date/time
2. ✅ View "My Appointments" tab
3. ✅ See appointment status (pending/accepted/rejected)

### As Doctor (<doctor@care.com>)

1. ✅ View all assigned appointments
2. ✅ Accept or reject pending requests
3. ✅ Mark completed appointments
4. ✅ Filter by status tabs

### As Admin (<admin@care.com>)

1. ✅ View system statistics
2. ✅ Add/Edit/Delete doctors
3. ✅ View all appointments system-wide
4. ✅ Check database status

---

## 📂 Key Files

### Frontend (React + TypeScript)

- `src/App.tsx` - Main app with auth routing
- `src/lib/auth-context.tsx` - Authentication provider
- `src/lib/api-client.ts` - Axios API client
- `src/components/patient/*` - Patient portal
- `src/components/doctor/*` - Doctor portal
- `src/components/admin/*` - Admin portal

### Backend (Express + MongoDB)

- `server/src/index.ts` - Express server
- `server/src/routes/*` - API endpoints
- `server/src/models/*` - Mongoose schemas
- `server/src/middleware/auth.ts` - JWT authentication
- `server/src/seeds/init.ts` - Database seeding

---

## 🐛 Troubleshooting

### Backend won't start

```powershell
# Check if MongoDB is running
Get-Service MongoDB

# If not running (requires admin):
# Open PowerShell as Administrator
net start MongoDB
```

### Database empty after seed

```powershell
# Re-run seed script
cd server
npm run seed
```

### Frontend can't reach backend

- Verify backend is running on port 4000
- Check browser console for CORS errors
- Ensure `vite.config.ts` has proxy configured

### Login not working

- Clear browser localStorage (F12 → Application → Local Storage)
- Re-seed database to reset passwords
- Check network tab for API response

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│         http://localhost:5173           │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   React Query (State Mgmt)       │  │
│  │   Auth Context (Global State)    │  │
│  │   Axios (HTTP Client)            │  │
│  └──────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST API
                  │ JWT Authentication
                  ↓
┌─────────────────────────────────────────┐
│      Backend (Express + Node.js)        │
│         http://localhost:4000           │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   JWT Middleware                 │  │
│  │   Role-Based Auth                │  │
│  │   RESTful Endpoints              │  │
│  └──────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │ Mongoose ODM
                  ↓
┌─────────────────────────────────────────┐
│       Database (MongoDB)                │
│      mongodb://localhost:27017          │
│                                         │
│  Collections:                           │
│  • users (7 documents)                  │
│  • doctors (5 documents)                │
│  • appointments (dynamic)               │
└─────────────────────────────────────────┘
```

---

## ✅ What's Working

- ✅ User authentication (login/register)
- ✅ Session management with JWT
- ✅ Role-based dashboards (patient/doctor/admin)
- ✅ Appointment booking with validation
- ✅ Real-time slot availability checking
- ✅ Doctor management (CRUD)
- ✅ Appointment status updates
- ✅ System-wide statistics
- ✅ Double-booking prevention
- ✅ Data persistence in MongoDB

---

## 📚 Full Documentation

See [FULL_STACK_STATUS.md](FULL_STACK_STATUS.md) for:

- Complete API documentation
- Database schemas
- Security features
- Migration history
- Testing checklist
- Known issues
- Future enhancements

---

**Happy coding! 🎉**
