import { useEffect, useRef, useState } from "react";
import { driversApi } from "../api/rides";
import type { RideResponse } from "../api/types";
import { fetchDrivingRoute, pointAlongRoute } from "../lib/routing";
import type { DriverPhase } from "../components/DriverPanel";

type LatLng = { lat: number; lng: number };

/**
 * Demo stand-in for a real GPS stream: walk the driver along an OSRM path and
 * POST `/api/drivers/me/location` so Redis GEO + ride STOMP stay live.
 */
export function useDriverLivePings(
  ride: RideResponse | null,
  phase: DriverPhase,
  enabled: boolean,
) {
  const [position, setPosition] = useState<LatLng | null>(null);
  const tRef = useRef(0);
  const coordsRef = useRef<[number, number][]>([]);
  const lastPhaseRef = useRef<DriverPhase | null>(null);

  useEffect(() => {
    if (!enabled || !ride) {
      setPosition(null);
      return;
    }
    if (phase !== "accepted" && phase !== "enroute" && phase !== "trip") {
      if (phase === "done" || phase === "idle" || phase === "waiting") {
        setPosition(null);
      }
      return;
    }

    if (lastPhaseRef.current !== phase) {
      tRef.current = 0;
      coordsRef.current = [];
      lastPhaseRef.current = phase;
    }

    let cancelled = false;
    let timer: number | null = null;
    const ac = new AbortController();

    async function loadPath() {
      const from: LatLng =
        phase === "trip"
          ? { lat: ride!.pickupLat, lng: ride!.pickupLng }
          : {
              lat: ride!.pickupLat - 0.012,
              lng: ride!.pickupLng - 0.008,
            };
      const to: LatLng =
        phase === "trip"
          ? { lat: ride!.dropoffLat, lng: ride!.dropoffLng }
          : { lat: ride!.pickupLat, lng: ride!.pickupLng };

      const route = await fetchDrivingRoute(from, to, ac.signal);
      if (cancelled) return;
      coordsRef.current = route?.coordinates ?? [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ];

      const [lng0, lat0] = pointAlongRoute(coordsRef.current, 0);
      setPosition({ lat: lat0, lng: lng0 });
      await driversApi.ping(lat0, lng0).catch(() => undefined);

      timer = window.setInterval(() => {
        if (coordsRef.current.length < 2) return;
        tRef.current = Math.min(tRef.current + 0.025, 0.98);
        const [lng, lat] = pointAlongRoute(coordsRef.current, tRef.current);
        setPosition({ lat, lng });
        void driversApi.ping(lat, lng).catch(() => undefined);
      }, 900);
    }

    void loadPath();

    return () => {
      cancelled = true;
      ac.abort();
      if (timer != null) window.clearInterval(timer);
    };
  }, [enabled, ride?.id, ride?.pickupLat, ride?.pickupLng, ride?.dropoffLat, ride?.dropoffLng, phase]);

  return { position };
}
