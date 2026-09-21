import { api, setToken, type TokenRole } from "./client";

export type AuthResponse = {
  token: string;
  userId: number;
  fullName: string;
  phone: string;
  role: string;
};

export type RiderMe = {
  riderId: number;
  fullName: string;
  phone: string;
};

export type DriverMe = {
  driverId: number;
  fullName: string;
  phone: string;
  status: string;
};

export const riderAuthApi = {
  register: (body: { fullName: string; phone: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/register", body, "rider"),
  login: (body: { phone: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", body, "rider"),
  me: () => api.get<RiderMe>("/api/auth/me", "rider"),
  logout: () => setToken("rider", null),
};

export const driverAuthApi = {
  register: (body: { fullName: string; phone: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/drivers/register", body, "driver"),
  login: (body: { phone: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/drivers/login", body, "driver"),
  me: () => api.get<DriverMe>("/api/auth/drivers/me", "driver"),
  logout: () => setToken("driver", null),
};

export function persistAuth(role: TokenRole, res: AuthResponse) {
  setToken(role, res.token);
}
