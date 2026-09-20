import { api } from "./client";
import type { OfferMessage, RideResponse } from "./types";

export type BookRideBody = {
  riderId: number;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
};

export type CancelBody = {
  cancelledBy: "RIDER" | "DRIVER" | "SYSTEM";
  actorId: number;
};

export const ridesApi = {
  book: (body: BookRideBody) => api.post<RideResponse>("/api/rides", body),
  get: (id: number) => api.get<RideResponse>(`/api/rides/${id}`),
  cancel: (id: number, body: CancelBody) =>
    api.post<RideResponse>(`/api/rides/${id}/cancel`, body),
  enRoute: (id: number) => api.post<RideResponse>(`/api/rides/${id}/en-route`),
  start: (id: number) => api.post<RideResponse>(`/api/rides/${id}/start`),
  complete: (id: number) => api.post<RideResponse>(`/api/rides/${id}/complete`),
  accept: (rideId: number, driverId: number) =>
    api.post<OfferMessage>(`/api/rides/${rideId}/accept`, { driverId }),
  reject: (rideId: number, driverId: number) =>
    api.post<OfferMessage>(`/api/rides/${rideId}/reject`, { driverId }),
};

export const driversApi = {
  available: (id: number) => api.post<void>(`/api/drivers/${id}/available`),
  offline: (id: number) => api.post<void>(`/api/drivers/${id}/offline`),
  ping: (id: number, lat: number, lng: number) =>
    api.post<void>(`/api/drivers/${id}/location`, { lat, lng }),
};
