import { useEffect, useMemo, useRef, useState } from "react";
import { persistAuth, riderAuthApi } from "../api/auth";
import { getToken, setActiveRole, setToken, ApiRequestError } from "../api/client";
import { ridesApi } from "../api/rides";
import {
  DEFAULT_PICKUP,
  DEMO_PASSWORD,
  DEMO_RIDER_PHONE,
  findLocation,
  mapPinPoint,
  SAVED_TRIPS,
  searchLocations,
  type LocationPoint,
  type RideResponse,
  type SavedTrip,
} from "../api/types";
import type { MapPickMode } from "../components/LiveMap";
import type { RiderUiState } from "../components/RiderPanel";
import { useRideLocation } from "./useRideLocation";

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
  const [pickup, setPickup] = useState<LocationPoint>(DEFAULT_PICKUP);
  const [dropoff, setDropoff] = useState<LocationPoint | null>(null);
  const [pickMode, setPickMode] = useState<MapPickMode>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ride, setRide] = useState<RideResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [carT, setCarT] = useState(0.12);
  const [carVisible, setCarVisible] = useState(false);
  const [progress, setProgress] = useState(15);
  const [routeKm, setRouteKm] = useState<number | null>(null);

  const pollRef = useRef<number | null>(null);
  const carTimerRef = useRef<number | null>(null);

  const liveTracking =
    ui === "MATCHED" || ui === "ENROUTE" || ui === "TRIP" || ui === "DONE";
  const { position: liveLocation, connected: liveConnected } = useRideLocation(
    ride?.id ?? null,
    "rider",
    Boolean(ride && liveTracking),
  );
  const driverPosition = liveLocation
    ? { lat: liveLocation.lat, lng: liveLocation.lng }
    : null;

  const searchResults = useMemo(
    () => searchLocations(searchQuery, pickup.id),
    [searchQuery, pickup.id],
  );

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
    setPickup(DEFAULT_PICKUP);
    setDropoff(null);
    setPickMode(null);
    setSearchQuery("");
    setRide(null);
    setProgress(15);
    setCarVisible(false);
    setCarT(0.12);
    setError(null);
    setRouteKm(null);
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
    // Live GPS drives the car; keep a soft progress bar for the panel only.
    if (ui === "ENROUTE" || ui === "TRIP") {
      setCarVisible(true);
      const bar = window.setInterval(() => {
        setProgress((p) => Math.min(p + 2, ui === "TRIP" ? 92 : 70));
      }, 400);
      return () => {
        window.clearInterval(bar);
      };
    }
    if (ui === "IDLE") {
      stopCar();
      setCarT(0.12);
      setCarVisible(false);
    }
    if (ui === "DONE") {
      stopCar();
      setCarVisible(true);
    }
    if (ui === "MATCHED") {
      setCarVisible(true);
      setCarT(0.12);
    }
  }, [ui]);

  useEffect(
    () => () => {
      clearPoll();
      stopCar();
    },
    [],
  );

  const goEstimate = (nextPickup: LocationPoint, nextDropoff: LocationPoint) => {
    setPickup(nextPickup);
    setDropoff(nextDropoff);
    setPickMode(null);
    setUi("ESTIMATE");
    setError(null);
  };

  const pickDropoff = (loc: LocationPoint) => {
    goEstimate(pickup, loc);
  };

  const pickSavedTrip = (trip: SavedTrip) => {
    const from = findLocation(trip.pickupId) ?? DEFAULT_PICKUP;
    const to = findLocation(trip.dropoffId);
    if (!to) return;
    goEstimate(from, to);
  };

  const setPickModeSafe = (mode: MapPickMode) => {
    setPickMode(mode);
    setError(null);
  };

  const onMapPick = (lat: number, lng: number) => {
    if (!pickMode) return;
    if (pickMode === "pickup") {
      const point = mapPinPoint(lat, lng, "Pickup");
      setPickup(point);
      setPickMode(dropoff ? null : "dropoff");
      if (dropoff) setUi("ESTIMATE");
      return;
    }
    const point = mapPinPoint(lat, lng, "Dropoff");
    goEstimate(pickup, point);
  };

  const requestRide = async () => {
    if (!dropoff || !riderId) return;
    const body = await run(() =>
      ridesApi.book({
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
      }),
    );
    if (!body) return;
    setRide(body);
    setUi("FINDING");
    setPickMode(null);
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
    ui === "DONE" ||
    dropoff != null;

  const redisHint =
    pickMode === "pickup"
      ? "tap map → set pickup"
      : pickMode === "dropoff"
        ? "tap map → set dropoff"
        : driverPosition
          ? `live driver · ${driverPosition.lat.toFixed(4)}, ${driverPosition.lng.toFixed(4)}${liveConnected ? "" : " · reconnecting"}`
          : dropoff
            ? liveTracking
              ? "waiting for driver GPS · STOMP /topic/rides"
              : "OSRM driving route · OpenFreeMap"
            : "OpenFreeMap · tap or search a destination";

  return {
    authReady,
    riderName,
    login,
    register,
    logout,
    ui,
    pickup,
    dropoff,
    pickMode,
    searchQuery,
    searchResults,
    savedTrips: SAVED_TRIPS,
    ride,
    busy,
    error,
    fieldErrors,
    carT,
    carVisible: carVisible || driverPosition != null,
    driverPosition,
    progress,
    showDrop,
    routeKm,
    setRouteKm,
    redisHint,
    statusPill: pillFor(ui, riderName),
    demoHint: `Demo: ${DEMO_RIDER_PHONE} / ${DEMO_PASSWORD}`,
    onSearch: setSearchQuery,
    pickDropoff,
    pickSavedTrip,
    setPickMode: setPickModeSafe,
    onMapPick,
    backIdle: resetRider,
    requestRide,
    cancelRide,
    bookAgain: resetRider,
  };
}
