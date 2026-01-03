import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "./api-client";

interface User {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  avatar?: string;
}

interface Doctor {
  id: string;
  specialization: string;
}

interface AuthContextType {
  user: User | null;
  doctor: Doctor | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        try {
          const response = await authAPI.getSession();
          setUser(response.data.user);
          setDoctor(response.data.doctor);
        } catch (error) {
          localStorage.removeItem("authToken");
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    const {
      token: newToken,
      user: userData,
      doctor: doctorData,
    } = response.data;

    localStorage.setItem("authToken", newToken);
    setToken(newToken);
    setUser(userData);
    setDoctor(doctorData);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    setDoctor(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, doctor, token, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
