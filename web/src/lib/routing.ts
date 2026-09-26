export type LatLng = { lat: number; lng: number };

/** GeoJSON LineString coordinates as [lng, lat][]. */
export type RouteResult = {
  coordinates: [number, number][];
  distanceKm: number;
  durationSec: number;
};

/**
 * Driving route via public OSRM demo (proxied in Vite as /osrm to avoid CORS).
 * Falls back to empty if the service is unavailable.
 */
export async function fetchDrivingRoute(
  from: LatLng,
  to: LatLng,
  signal?: AbortSignal,
): Promise<RouteResult | null> {
  const path = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url =
    `/osrm/route/v1/driving/${path}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      code?: string;
      routes?: Array<{
        distance: number;
        duration: number;
        geometry?: { coordinates?: [number, number][] };
      }>;
    };
    const route = data.routes?.[0];
    const coordinates = route?.geometry?.coordinates;
    if (!route || !coordinates || coordinates.length < 2) return null;
    return {
      coordinates,
      distanceKm: route.distance / 1000,
      durationSec: route.duration,
    };
  } catch {
    return null;
  }
}

/** Point along a polyline at fraction t in [0, 1] (by cumulative distance). */
export function pointAlongRoute(
  coordinates: [number, number][],
  t: number,
): [number, number] {
  if (coordinates.length === 0) return [0, 0];
  if (coordinates.length === 1 || t <= 0) return coordinates[0];
  if (t >= 1) return coordinates[coordinates.length - 1];

  const segLens: number[] = [];
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const [lng0, lat0] = coordinates[i - 1];
    const [lng1, lat1] = coordinates[i];
    const d = Math.hypot(lng1 - lng0, lat1 - lat0);
    segLens.push(d);
    total += d;
  }
  if (total === 0) return coordinates[0];

  let remain = total * t;
  for (let i = 0; i < segLens.length; i++) {
    const len = segLens[i];
    if (remain <= len) {
      const f = len === 0 ? 0 : remain / len;
      const [lng0, lat0] = coordinates[i];
      const [lng1, lat1] = coordinates[i + 1];
      return [lng0 + (lng1 - lng0) * f, lat0 + (lat1 - lat0) * f];
    }
    remain -= len;
  }
  return coordinates[coordinates.length - 1];
}
