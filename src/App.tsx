import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { User } from './lib/types'
import LoginPage from './components/auth/LoginPage'
import PatientDashboard from './components/patient/PatientDashboard'
import DoctorDashboard from './components/doctor/DoctorDashboard'
import AdminDashboard from './components/admin/AdminDashboard'
import { Toaster } from './components/ui/sonner'

function App() {
  const [currentUser, setCurrentUser] = useKV<User | null>('current-user', null)

  const handleLogout = () => {
    setCurrentUser(null)
  }

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={setCurrentUser} />
        <Toaster />
      </>
    )
  }

  return (
    <>
      {currentUser.role === 'patient' && (
        <PatientDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.role === 'doctor' && (
        <DoctorDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.role === 'admin' && (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  )
}

export default App