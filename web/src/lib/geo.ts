/** Approximate Phnom Penh bounds mapped onto the decorative LiveMap SVG (600×400). */
export const MAP_BOUNDS = {
  west: 104.88,
  east: 104.95,
  south: 11.52,
  north: 11.60,
  width: 600,
  height: 400,
};

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Rough fare preview matching backend base + per-km (no surge). */
export function estimateFareCents(distanceKm: number): number {
  const BASE = 4_000;
  const PER_KM = 2_000;
  return Math.round(BASE + distanceKm * PER_KM);
}

export function svgToLatLng(x: number, y: number): { lat: number; lng: number } {
  const { west, east, south, north, width, height } = MAP_BOUNDS;
  const lng = west + (x / width) * (east - west);
  const lat = north - (y / height) * (north - south);
  return {
    lat: Math.round(lat * 1e6) / 1e6,
    lng: Math.round(lng * 1e6) / 1e6,
  };
}

export function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const { west, east, south, north, width, height } = MAP_BOUNDS;
  const x = ((lng - west) / (east - west)) * width;
  const y = ((north - lat) / (north - south)) * height;
  return { x, y };
}
