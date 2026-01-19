import axios from "axios";
import type { Doctor } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }),

  getSession: () => api.get("/auth/session"),
};

// Users API
export const usersAPI = {
  getAll: () => api.get("/users").then((response) => response.data),
  create: (data: any) => api.post("/users", data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Doctors API
export const doctorsAPI = {
  getAll: () => api.get<Doctor[]>("/doctors").then((response) => response.data),
  getById: (id: string) =>
    api.get<Doctor>(`/doctors/${id}`).then((response) => response.data),
  getAvailableSlots: (id: string, date: string) =>
    api
      .get(`/doctors/${id}/available-slots`, { params: { date } })
      .then((response) => response.data),
  create: (data: any) => api.post("/doctors", data),
  update: (id: string, data: any) => api.put(`/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/doctors/${id}`),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => api.get("/appointments").then((response) => response.data),
  getById: (id: string) =>
    api.get(`/appointments/${id}`).then((response) => response.data),
  getMyAppointments: () =>
    api.get("/appointments").then((response) => response.data),
  create: (data: any) => api.post("/appointments", data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/appointments/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};
