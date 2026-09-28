export type RideStatus =
  | "REQUESTED"
  | "MATCHED"
  | "DRIVER_EN_ROUTE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type OfferMessage = {
  offerId: string;
  rideId: number;
  driverId: number;
  pickupLat: number;
  pickupLng: number;
  distanceKm: number;
  expiresAt: string;
  status: string;
  note: string;
};

/** STOMP payload on `/topic/rides/{id}` when the assigned driver pings. */
export type DriverLocationMessage = {
  event: "location";
  rideId: number;
  driverId: number;
  lat: number;
  lng: number;
  at: string;
};

export function isDriverLocationMessage(body: unknown): body is DriverLocationMessage {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  return o.event === "location" && typeof o.lat === "number" && typeof o.lng === "number";
}

export type FareView = {
  totalCents: number;
  currency: string;
  distanceKm: number | null;
  surgeMultiplier: number | null;
  demandRatio: number | null;
};

export type RideResponse = {
  id: number;
  riderId: number;
  driverId: number | null;
  status: RideStatus;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  requestedAt?: string;
  matchedAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  version: number;
  offer: OfferMessage | null;
  fare: FareView | null;
};
