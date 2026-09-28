import { useCallback, useEffect, useState } from "react";
import { ridesApi } from "@/api/rides";
import type { RideResponse } from "@/api/types";
import { ApiRequestError } from "@/api/client";

export function useRideHistory(role: "rider" | "driver", enabled: boolean) {
  const [items, setItems] = useState<RideResponse[]>([]);
  const [selected, setSelected] = useState<RideResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const list = await ridesApi.history(role, 20);
      setItems(list);
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [role]);

  useEffect(() => {
    if (!enabled) {
      setSelected(null);
      return;
    }
    void load();
  }, [enabled, load]);

  const select = async (ride: RideResponse) => {
    setBusy(true);
    setError(null);
    try {
      const detail = await ridesApi.get(ride.id, role);
      setSelected(detail);
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError(e instanceof Error ? e.message : String(e));
      setSelected(ride);
    } finally {
      setBusy(false);
    }
  };

  const clearSelect = () => setSelected(null);

  const rate = async (stars: number) => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const detail = await ridesApi.rate(selected.id, stars, role);
      setSelected(detail);
      setItems((prev) => prev.map((r) => (r.id === detail.id ? { ...r, ratings: detail.ratings } : r)));
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setSelected(null);
    setError(null);
  };

  return {
    items,
    selected,
    busy,
    error,
    load,
    select,
    rate,
    clearSelect,
    reset,
  };
}
