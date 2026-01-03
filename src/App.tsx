import { useState, useEffect } from "react";
import { useKV } from "./hooks/use-kv";
import { User } from "./lib/types";
import { initializeDatabase } from "./lib/database";
import LoginPage from "./components/auth/LoginPage";
import PatientDashboard from "./components/patient/PatientDashboard";
import DoctorDashboard from "./components/doctor/DoctorDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import { Toaster } from "./components/ui/sonner";

function App() {
  const [currentUser, setCurrentUser] = useKV<User | null>(
    "current-user",
    null
  );
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => {
      setIsDbReady(true);
    });
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.96_0.02_200)] via-background to-[oklch(0.96_0.03_250)]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-muted-foreground">Loading CareConnect...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={setCurrentUser} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {currentUser.role === "patient" && (
        <PatientDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.role === "doctor" && (
        <DoctorDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.role === "admin" && (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}

export default App;
