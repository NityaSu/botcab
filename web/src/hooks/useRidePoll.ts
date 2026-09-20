import { useCallback, useEffect, useRef, useState } from "react";
import { ridesApi } from "../api/rides";
import type { RideResponse } from "../api/types";

/** Poll ride until status leaves `whileStatuses` or timeout. */
export function useRidePoll(
  rideId: number | null,
  whileStatuses: string[],
  intervalMs = 1500,
) {
  const [ride, setRide] = useState<RideResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const statusesRef = useRef(whileStatuses);
  statusesRef.current = whileStatuses;

  const refresh = useCallback(async () => {
    if (rideId == null) return null;
    try {
      const next = await ridesApi.get(rideId);
      setRide(next);
      setError(null);
      return next;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }, [rideId]);

  useEffect(() => {
    if (rideId == null) {
      setRide(null);
      return;
    }
    let cancelled = false;
    let timer: number | undefined;

    const tick = async () => {
      const next = await refresh();
      if (cancelled || !next) return;
      if (statusesRef.current.includes(next.status)) {
        timer = window.setTimeout(tick, intervalMs);
      }
    };

    void tick();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [rideId, intervalMs, refresh]);

  return { ride, setRide, error, refresh };
}
