export type Mode = "rider" | "driver";

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
  version: number;
  offer: OfferMessage | null;
  fare: FareView | null;
};

export type Place = {
  name: string;
  detail: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  distanceLabel: string;
};

/** Phnom Penh sketch destinations (matches Publix BotCab demo). */
export const PLACES: Place[] = [
  {
    name: "Home",
    detail: "BKK1 · Chamkar Mon",
    pickupLat: 11.55,
    pickupLng: 104.921,
    dropoffLat: 11.576,
    dropoffLng: 104.923,
    distanceLabel: "9.4 km · about 22 min",
  },
  {
    name: "Work",
    detail: "Aeon Mall Sen Sok",
    pickupLat: 11.588,
    pickupLng: 104.885,
    dropoffLat: 11.576,
    dropoffLng: 104.923,
    distanceLabel: "7.2 km · about 18 min",
  },
  {
    name: "Gym",
    detail: "Wat Botum Park",
    pickupLat: 11.556,
    pickupLng: 104.928,
    dropoffLat: 11.576,
    dropoffLng: 104.923,
    distanceLabel: "3.1 km · about 12 min",
  },
];

/** Seeded by Flyway V4 (`Demo Rider Maya`). */
export const DEFAULT_RIDER_ID = 1;
/** Seeded by Flyway V2 (`Demo Driver Sophea`). */
export const DEFAULT_DRIVER_ID = 1;
