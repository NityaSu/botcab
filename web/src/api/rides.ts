import { api } from "./client";
import type { OfferMessage, RideResponse } from "./types";

export type BookRideBody = {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
};

export const ridesApi = {
  book: (body: BookRideBody) => api.post<RideResponse>("/api/rides", body, "rider"),
  get: (id: number, role: "rider" | "driver" = "rider") =>
    api.get<RideResponse>(`/api/rides/${id}`, role),
  cancel: (id: number, role: "rider" | "driver") =>
    api.post<RideResponse>(`/api/rides/${id}/cancel`, undefined, role),
  enRoute: (id: number) => api.post<RideResponse>(`/api/rides/${id}/en-route`, undefined, "driver"),
  start: (id: number) => api.post<RideResponse>(`/api/rides/${id}/start`, undefined, "driver"),
  complete: (id: number) => api.post<RideResponse>(`/api/rides/${id}/complete`, undefined, "driver"),
  accept: (rideId: number) =>
    api.post<OfferMessage>(`/api/rides/${rideId}/accept`, undefined, "driver"),
  reject: (rideId: number) =>
    api.post<OfferMessage>(`/api/rides/${rideId}/reject`, undefined, "driver"),
};

export const driversApi = {
  available: () => api.post<void>("/api/drivers/me/available", undefined, "driver"),
  offline: () => api.post<void>("/api/drivers/me/offline", undefined, "driver"),
  ping: (lat: number, lng: number) =>
    api.post<void>("/api/drivers/me/location", { lat, lng }, "driver"),
};
