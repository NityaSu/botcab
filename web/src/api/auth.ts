import { api, setToken } from "./client";

export type AuthResponse = {
  token: string;
  riderId: number;
  fullName: string;
  phone: string;
};

export type RiderMe = {
  riderId: number;
  fullName: string;
  phone: string;
};

export const authApi = {
  register: (body: { fullName: string; phone: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/register", body),
  login: (body: { phone: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", body),
  me: () => api.get<RiderMe>("/api/auth/me"),
  logout: () => setToken(null),
};
