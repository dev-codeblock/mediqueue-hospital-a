import LoginPage from "./components/auth/LoginPage";
import PatientDashboard from "./components/patient/PatientDashboard";
import DoctorDashboard from "./components/doctor/DoctorDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./lib/auth-context";

function App() {
  const { user, doctor, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.96_0.02_200)] via-background to-[oklch(0.96_0.03_250)]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-muted-foreground">Loading CareConnect...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {user.role === "patient" && (
        <PatientDashboard user={user} onLogout={logout} />
      )}
      {user.role === "doctor" && doctor && (
        <DoctorDashboard user={user} doctor={doctor} onLogout={logout} />
      )}
      {user.role === "admin" && (
        <AdminDashboard user={user} onLogout={logout} />
      )}
      <Toaster />
    </>
  );
}

export default App;
