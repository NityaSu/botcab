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

/** Compact local datetime for history rows. */
export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
