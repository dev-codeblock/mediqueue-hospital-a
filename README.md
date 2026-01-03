# ✨ CareConnect - Hospital Appointment System

> **Status**: ✅ FULLY OPERATIONAL - Complete full-stack application with MongoDB integration

A comprehensive hospital appointment booking system with role-based dashboards for Patients, Doctors, and Administrators. Built with modern technologies and best practices.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB installed and running
- Git

### Start the Application

```powershell
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Seed the database (first time only)
cd server && npm run seed && cd ..

# 3. Start backend (Terminal 1)
cd server && npm run dev

# 4. Start frontend (Terminal 2)
npm run dev
```

**Access**: Open <http://localhost:5173> in your browser

### Demo Accounts

| Role    | Email               | Password     |
|---------|---------------------|--------------|
| Patient | <patient@care.com>    | password123  |
| Doctor  | <doctor@care.com>     | password123  |
| Admin   | <admin@care.com>      | password123  |

---

## ✨ Features

### Patient Portal

- 📅 Browse doctors by specialization
- 🕐 Check real-time slot availability
- 📝 Book appointments with validation
- 👀 View appointment status updates

### Doctor Portal

- 📋 View all assigned appointments
- ✅ Accept or reject appointment requests
- ✔️ Mark appointments as completed
- 📊 View appointment statistics

### Admin Portal

- 👥 Manage doctors (Create/Update/Delete)
- 📈 View system-wide statistics
- 🗂️ Access all appointments
- 🔍 Filter by appointment status

---

## 🏗️ Tech Stack

### Frontend

- **React 19** with TypeScript 5.7
- **Vite 7** for blazing fast development
- **TailwindCSS 4** with OKLCH color system
- **React Query** for data fetching & caching
- **shadcn/ui** component library

### Backend

- **Express 4.18** with TypeScript
- **MongoDB** with Mongoose ODM
- **JWT** authentication + bcrypt
- **RESTful API** with role-based access control

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference guide (START HERE!)
- **[FULL_STACK_STATUS.md](FULL_STACK_STATUS.md)** - Complete system documentation
- **[MONGODB_SETUP.md](MONGODB_SETUP.md)** - Detailed setup instructions
- **[VERIFICATION_REPORT.md](VERIFICATION_REPORT.md)** - System verification & testing
- **[PRD.md](PRD.md)** - Product requirements & design system

---

## 🔧 Development

### Project Structure

```
mediqueue-hospital-a/
├── src/                      # Frontend source code
│   ├── components/           # React components
│   │   ├── patient/         # Patient portal
│   │   ├── doctor/          # Doctor portal
│   │   ├── admin/           # Admin portal
│   │   └── auth/            # Authentication
│   ├── lib/                 # Utilities & API client
│   └── hooks/               # Custom React hooks
├── server/                   # Backend source code
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth middleware
│   │   └── seeds/           # Database seeding
│   └── .env                 # Environment variables
└── docs/                    # Documentation
```

### Available Scripts

**Frontend**

```powershell
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

**Backend**

```powershell
cd server
npm run dev      # Start with auto-reload
npm run build    # Compile TypeScript
npm start        # Run production server
npm run seed     # Seed database with demo data
```

---

## 🔐 Security Features

- ✅ Bcrypt password hashing (10 rounds)
- ✅ JWT token authentication (24h expiration)
- ✅ Role-based authorization
- ✅ Protected API endpoints
- ✅ MongoDB injection prevention
- ✅ CORS configuration

---

## 🧪 Testing

The application has been fully tested with:

- ✅ User authentication flow
- ✅ Patient appointment booking
- ✅ Doctor appointment management
- ✅ Admin CRUD operations
- ✅ Real-time data synchronization
- ✅ Double-booking prevention
- ✅ Role-based access control

See [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md) for detailed test results.

---

## 🚀 What's Working

- ✅ Frontend fully functional with backend
- ✅ MongoDB integrated and seeded
- ✅ All API endpoints operational
- ✅ Authentication & authorization
- ✅ Real-time appointment booking
- ✅ Doctor management system
- ✅ Role-based dashboards
- ✅ Double-booking prevention
- ✅ Complete documentation

---

## 📊 System Status

```
🟢 Frontend:  http://localhost:5173 (Running)
🟢 Backend:   http://localhost:4000 (Running)
🟢 Database:  MongoDB (Connected & Seeded)
🟢 API:       All endpoints operational
```

---

## 🐛 Troubleshooting

### MongoDB not running

```powershell
# Check status
Get-Service MongoDB

# Start service (requires admin)
net start MongoDB
```

### Port conflicts

- Backend: Change `PORT` in `server/.env`
- Frontend: Vite will auto-increment (5174, 5175, etc.)

### Login fails

```powershell
# Re-seed database
cd server && npm run seed
```

---

## 🎯 Migration History

This project was successfully migrated from:

- **Before**: Client-only app with localStorage
- **After**: Full-stack app with MongoDB backend
- **Lines Changed**: 2,500+ across 20+ files
- **Status**: 100% complete and operational

See [MIGRATION_STATUS.md](MIGRATION_STATUS.md) for complete migration details.

---

## 📄 License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

This is a fully functional application ready for further development:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Support

- **Documentation**: See `/docs` folder or markdown files in root
- **Issues**: Check troubleshooting section in documentation
- **Quick Help**: See [QUICKSTART.md](QUICKSTART.md)

---

**Built with ❤️ using React, Express, and MongoDB**

*Last Updated: January 3, 2026 | Version 2.0.0*
