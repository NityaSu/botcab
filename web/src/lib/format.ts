export function formatKhr(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `៛${Math.round(cents).toLocaleString("en-US")}`;
}

export function formatDistanceKm(km: number | null | undefined): string {
  if (km == null) return "—";
  return `${km.toFixed(1)} km`;
}

export function shortPlace(lat: number, lng: number): string {
  return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
}
