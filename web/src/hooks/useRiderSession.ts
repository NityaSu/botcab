import { useCallback, useEffect, useRef, useState } from "react";
import { persistAuth, riderAuthApi } from "../api/auth";
import { getToken, setActiveRole, setToken, ApiRequestError } from "../api/client";
import { ridesApi } from "../api/rides";
import { DEMO_PASSWORD, DEMO_RIDER_PHONE, PLACES, type Place, type RideResponse } from "../api/types";
import type { RiderUiState } from "../components/RiderPanel";

function statusToUi(status: string | undefined): RiderUiState | null {
  switch (status) {
    case "REQUESTED":
      return "FINDING";
    case "MATCHED":
      return "MATCHED";
    case "DRIVER_EN_ROUTE":
      return "ENROUTE";
    case "IN_PROGRESS":
      return "TRIP";
    case "COMPLETED":
      return "DONE";
    case "CANCELLED":
      return "IDLE";
    default:
      return null;
  }
}

function pillFor(ui: RiderUiState, riderName: string | null): string {
  if (!riderName) return "LOGIN";
  const map: Record<RiderUiState, string> = {
    IDLE: "IDLE",
    ESTIMATE: "REQUESTED",
    FINDING: "REQUESTED",
    MATCHED: "MATCHED",
    ENROUTE: "DRIVER_EN_ROUTE",
    TRIP: "IN_PROGRESS",
    DONE: "COMPLETED",
  };
  return map[ui];
}

export function useRiderSession() {
  const [riderId, setRiderId] = useState<number | null>(null);
  const [riderName, setRiderName] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [ui, setUi] = useState<RiderUiState>("IDLE");
  const [place, setPlace] = useState<Place | null>(null);
  const [ride, setRide] = useState<RideResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [carT, setCarT] = useState(0.12);
  const [carVisible, setCarVisible] = useState(false);
  const [progress, setProgress] = useState(15);

  const pollRef = useRef<number | null>(null);
  const carTimerRef = useRef<number | null>(null);

  const clearPoll = () => {
    if (pollRef.current != null) {
      window.clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  const stopCar = () => {
    if (carTimerRef.current != null) {
      window.clearInterval(carTimerRef.current);
      carTimerRef.current = null;
    }
  };

  const startCar = useCallback(() => {
    stopCar();
    carTimerRef.current = window.setInterval(() => {
      setCarT((t) => Math.min(t + 0.0035, 0.97));
    }, 50);
  }, []);

  const fail = (e: unknown) => {
    if (e instanceof ApiRequestError) {
      setFieldErrors(e.fields);
      setError(Object.keys(e.fields).length > 0 ? null : e.message);
      return;
    }
    setError(e instanceof Error ? e.message : String(e));
    setFieldErrors({});
  };

  const run = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      return await fn();
    } catch (e) {
      fail(e);
      return null;
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    setActiveRole("rider");
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken("rider")) {
        setAuthReady(true);
        return;
      }
      try {
        const me = await riderAuthApi.me();
        if (cancelled) return;
        setRiderId(me.riderId);
        setRiderName(me.fullName);
      } catch {
        if (!cancelled) {
          setToken("rider", null);
          setRiderId(null);
          setRiderName(null);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyAuth = (token: string, id: number, name: string) => {
    setToken("rider", token);
    setRiderId(id);
    setRiderName(name);
    setError(null);
    setFieldErrors({});
  };

  const login = async (phone: string, password: string) => {
    const res = await run(() => riderAuthApi.login({ phone, password }));
    if (res) {
      persistAuth("rider", res);
      applyAuth(res.token, res.userId, res.fullName);
    }
  };

  const register = async (fullName: string, phone: string, password: string) => {
    const res = await run(() => riderAuthApi.register({ fullName, phone, password }));
    if (res) {
      persistAuth("rider", res);
      applyAuth(res.token, res.userId, res.fullName);
    }
  };

  const logout = () => {
    riderAuthApi.logout();
    setRiderId(null);
    setRiderName(null);
    resetRider();
  };

  const resetRider = () => {
    clearPoll();
    stopCar();
    setUi("IDLE");
    setPlace(null);
    setRide(null);
    setProgress(15);
    setCarVisible(false);
    setCarT(0.12);
    setError(null);
  };

  useEffect(() => {
    const pollUi =
      ui === "FINDING" || ui === "MATCHED" || ui === "ENROUTE" || ui === "TRIP";
    if (!ride || !pollUi) {
      clearPoll();
      return;
    }
    let cancelled = false;
    const tick = async () => {
      try {
        const next = await ridesApi.get(ride.id, "rider");
        if (cancelled) return;
        setRide(next);
        const mapped = statusToUi(next.status);
        if (!mapped) {
          pollRef.current = window.setTimeout(tick, 1500);
          return;
        }
        if (mapped === "IDLE") {
          resetRider();
          return;
        }
        setUi(mapped);
        if (mapped === "MATCHED") {
          setCarVisible(true);
          setProgress(15);
        }
        if (mapped === "DONE") {
          setProgress(100);
          setCarVisible(true);
          setCarT(0.97);
          return;
        }
        if (mapped === "FINDING") {
          pollRef.current = window.setTimeout(tick, 1500);
          return;
        }
        // Keep following driver-driven transitions
        pollRef.current = window.setTimeout(tick, 1500);
      } catch (e) {
        if (!cancelled) fail(e);
      }
    };
    pollRef.current = window.setTimeout(tick, 1200);
    return () => {
      cancelled = true;
      clearPoll();
    };
  }, [ride?.id, ui]);

  useEffect(() => {
    if (ui === "ENROUTE" || ui === "TRIP") {
      setCarVisible(true);
      startCar();
      const bar = window.setInterval(() => {
        setProgress((p) => Math.min(p + 2, ui === "TRIP" ? 92 : 70));
      }, 400);
      return () => {
        stopCar();
        window.clearInterval(bar);
      };
    }
    if (ui === "IDLE" || ui === "DONE") {
      stopCar();
      setCarT(0.12);
      if (ui === "IDLE") setCarVisible(false);
    }
    if (ui === "MATCHED") {
      setCarVisible(true);
      setCarT(0.12);
    }
  }, [ui, startCar]);

  useEffect(
    () => () => {
      clearPoll();
      stopCar();
    },
    [],
  );

  const pickPlace = (p: Place) => {
    setPlace(p);
    setUi("ESTIMATE");
    setError(null);
  };

  const requestRide = async () => {
    if (!place || !riderId) return;
    const body = await run(() =>
      ridesApi.book({
        pickupLat: place.pickupLat,
        pickupLng: place.pickupLng,
        dropoffLat: place.dropoffLat,
        dropoffLng: place.dropoffLng,
      }),
    );
    if (!body) return;
    setRide(body);
    setUi("FINDING");
    setCarVisible(false);
  };

  const cancelRide = async () => {
    if (!ride) {
      resetRider();
      return;
    }
    const body = await run(() => ridesApi.cancel(ride.id, "rider"));
    if (body) resetRider();
  };
  const showDrop =
    ui === "ESTIMATE" ||
    ui === "FINDING" ||
    ui === "MATCHED" ||
    ui === "ENROUTE" ||
    ui === "TRIP" ||
    ui === "DONE";

  const redisHint =
    ui === "FINDING"
      ? "redis> GEOSEARCH drivers expanding radius…"
      : "redis> GEOSEARCH drivers +500m → online";

  return {
    authReady,
    riderName,
    login,
    register,
    logout,
    ui,
    place,
    places: PLACES,
    ride,
    busy,
    error,
    fieldErrors,
    carT,
    carVisible,
    progress,
    showDrop,
    redisHint,
    statusPill: pillFor(ui, riderName),
    demoHint: `Demo: ${DEMO_RIDER_PHONE} / ${DEMO_PASSWORD}`,
    pickPlace,
    backIdle: resetRider,
    requestRide,
    cancelRide,
    bookAgain: resetRider,
  };
}
