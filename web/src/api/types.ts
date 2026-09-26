export type LocationPoint = {
  id: string;
  name: string;
  detail: string;
  lat: number;
  lng: number;
};

/** Default “near you” for the demo rider (BKK1 area). */
export const DEFAULT_PICKUP: LocationPoint = {
  id: "near-you",
  name: "Near you",
  detail: "BKK1 · Chamkar Mon",
  lat: 11.55,
  lng: 104.921,
};

/** Searchable Phnom Penh landmarks (pickup or dropoff). */
export const LOCATIONS: LocationPoint[] = [
  DEFAULT_PICKUP,
  {
    id: "wat-phnom",
    name: "Wat Phnom",
    detail: "Daun Penh",
    lat: 11.576,
    lng: 104.923,
  },
  {
    id: "aeon-sen-sok",
    name: "Aeon Mall Sen Sok",
    detail: "Sen Sok",
    lat: 11.588,
    lng: 104.885,
  },
  {
    id: "wat-botum",
    name: "Wat Botum Park",
    detail: "Chamkar Mon",
    lat: 11.556,
    lng: 104.928,
  },
  {
    id: "russian-market",
    name: "Russian Market",
    detail: "Toul Tom Poung",
    lat: 11.54,
    lng: 104.917,
  },
  {
    id: "central-market",
    name: "Central Market",
    detail: "Phsar Thmei",
    lat: 11.5695,
    lng: 104.921,
  },
  {
    id: "independence",
    name: "Independence Monument",
    detail: "Norodom Blvd",
    lat: 11.5564,
    lng: 104.928,
  },
  {
    id: "airport",
    name: "Phnom Penh Airport",
    detail: "Pochentong",
    lat: 11.5465,
    lng: 104.8441,
  },
  {
    id: "tonle-bassac",
    name: "Tonle Bassac",
    detail: "Bassac Lane",
    lat: 11.548,
    lng: 104.931,
  },
  {
    id: "olympic",
    name: "Olympic Stadium",
    detail: "Veal Sbov",
    lat: 11.559,
    lng: 104.911,
  },
  {
    id: "royal-palace",
    name: "Royal Palace",
    detail: "Daun Penh",
    lat: 11.5625,
    lng: 104.9312,
  },
  {
    id: "tuk-tuk-night",
    name: "Street 308",
    detail: "BKK1 nightlife",
    lat: 11.551,
    lng: 104.925,
  },
];

/** Quick saved trips (still available as shortcuts). */
export type SavedTrip = {
  id: string;
  label: string;
  detail: string;
  pickupId: string;
  dropoffId: string;
};

export const SAVED_TRIPS: SavedTrip[] = [
  {
    id: "home-wat-phnom",
    label: "Home → Wat Phnom",
    detail: "Usual evening ride",
    pickupId: "near-you",
    dropoffId: "wat-phnom",
  },
  {
    id: "work-commute",
    label: "Aeon → Wat Phnom",
    detail: "From the office",
    pickupId: "aeon-sen-sok",
    dropoffId: "wat-phnom",
  },
  {
    id: "gym-run",
    label: "Gym → Wat Phnom",
    detail: "After workout",
    pickupId: "wat-botum",
    dropoffId: "wat-phnom",
  },
];

export function findLocation(id: string): LocationPoint | undefined {
  return LOCATIONS.find((l) => l.id === id);
}

export function searchLocations(query: string, excludeId?: string): LocationPoint[] {
  const q = query.trim().toLowerCase();
  return LOCATIONS.filter((l) => {
    if (excludeId && l.id === excludeId) return false;
    if (l.id === "near-you" && q.length > 0) return false;
    if (!q) return l.id !== "near-you";
    return l.name.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q);
  });
}

export function mapPinPoint(lat: number, lng: number, label = "Map pin"): LocationPoint {
  return {
    id: `map-${lat.toFixed(5)}-${lng.toFixed(5)}`,
    name: label,
    detail: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    lat,
    lng,
  };
}

/** @deprecated Prefer LocationPoint; kept only if any leftover imports need it. */
export type Place = {
  name: string;
  detail: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  distanceLabel: string;
};

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

/** Demo rider (V4+V9): +855000000101 / Demo1234 */
export const DEMO_RIDER_PHONE = "+855000000101";
/** Demo driver Sophea (V3+V9): +855000000011 / Demo1234 */
export const DEMO_DRIVER_PHONE = "+855000000011";
export const DEMO_PASSWORD = "Demo1234";
