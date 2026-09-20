import { useCallback, useEffect, useRef, useState } from "react";
import { driversApi, ridesApi } from "../api/rides";
import {
  DEFAULT_DRIVER_ID,
  DEFAULT_RIDER_ID,
  PLACES,
  type Mode,
  type OfferMessage,
  type Place,
  type RideResponse,
} from "../api/types";
import type { DriverPhase } from "../components/DriverPanel";
import type { RiderUiState } from "../components/RiderPanel";
import { useDriverOffers } from "./useDriverOffers";

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

function statusPill(mode: Mode, ui: RiderUiState, online: boolean): string {
  if (mode === "driver") return online ? "DRIVER · ONLINE" : "DRIVER";
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

export function useBotCabSession() {
  const riderId = DEFAULT_RIDER_ID;
  const driverId = DEFAULT_DRIVER_ID;

  const [mode, setMode] = useState<Mode>("rider");
  const [ui, setUi] = useState<RiderUiState>("IDLE");
  const [place, setPlace] = useState<Place | null>(null);
  const [ride, setRide] = useState<RideResponse | null>(null);
  const [offer, setOffer] = useState<OfferMessage | null>(null);
  const [online, setOnline] = useState(false);
  const [driverPhase, setDriverPhase] = useState<DriverPhase>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
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
    setError(e instanceof Error ? e.message : String(e));
  };

  const run = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      fail(e);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const onOffer = useCallback((msg: OfferMessage) => {
    setOffer(msg);
    if (msg.status === "PENDING") {
      setDriverPhase("request");
    } else if (msg.status === "ACCEPTED" || msg.note === "accepted") {
      setDriverPhase("accepted");
    } else if (msg.note?.includes("expir") || msg.status === "EXPIRED") {
      setDriverPhase("expired");
    } else if (msg.status === "REJECTED" || msg.note === "rejected") {
      setDriverPhase("declined");
    }
  }, []);

  const { connected } = useDriverOffers(driverId, online && mode === "driver", onOffer);

  // Offer countdown
  useEffect(() => {
    if (!offer || offer.status !== "PENDING") {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((new Date(offer.expiresAt).getTime() - Date.now()) / 1000),
      );
      setSecondsLeft(left);
      if (left <= 0) setDriverPhase((p) => (p === "request" ? "expired" : p));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [offer]);

  // Poll ride while REQUESTED / after book
  useEffect(() => {
    if (!ride || (ui !== "FINDING" && ride.status !== "REQUESTED")) {
      clearPoll();
      return;
    }
    let cancelled = false;
    const tick = async () => {
      try {
        const next = await ridesApi.get(ride.id);
        if (cancelled) return;
        setRide(next);
        const mapped = statusToUi(next.status);
        if (mapped && mapped !== "FINDING") {
          setUi(mapped);
          if (mapped === "MATCHED") {
            setCarVisible(true);
            setProgress(15);
          }
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
  }, [ride?.id, ride?.status, ui]);

  // Map car animation when en route / trip
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

  useEffect(() => () => {
    clearPoll();
    stopCar();
  }, []);

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

  const setTab = (next: Mode) => {
    setMode(next);
    setError(null);
    if (next === "rider") {
      /* keep ride if mid-trip */
    } else {
      setDriverPhase(online ? "waiting" : "idle");
    }
  };

  const pickPlace = (p: Place) => {
    setPlace(p);
    setUi("ESTIMATE");
    setError(null);
  };

  const requestRide = async () => {
    if (!place) return;
    const body = await run(() =>
      ridesApi.book({
        riderId,
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
    if (body.offer) setOffer(body.offer);
  };

  const cancelRide = async () => {
    if (!ride) {
      resetRider();
      return;
    }
    const body = await run(() =>
      ridesApi.cancel(ride.id, { cancelledBy: "RIDER", actorId: riderId }),
    );
    if (body) resetRider();
  };

  const enRoute = async () => {
    if (!ride) return;
    const body = await run(() => ridesApi.enRoute(ride.id));
    if (!body) return;
    setRide(body);
    setUi("ENROUTE");
    setProgress(20);
  };

  const startTrip = async () => {
    if (!ride) return;
    const body = await run(() => ridesApi.start(ride.id));
    if (!body) return;
    setRide(body);
    setUi("TRIP");
    setProgress(40);
  };

  const completeTrip = async () => {
    if (!ride) return;
    const body = await run(() => ridesApi.complete(ride.id));
    if (!body) return;
    setRide(body);
    setUi("DONE");
    setProgress(100);
    setCarVisible(true);
    setCarT(0.97);
  };

  const toggleOnline = async (next: boolean) => {
    await run(async () => {
      if (next) {
        await driversApi.available(driverId);
        // Ping near Home / BKK1 so GEO match finds this driver
        const home = PLACES[0];
        await driversApi.ping(driverId, home.pickupLat + 0.002, home.pickupLng + 0.002);
        setOnline(true);
        setDriverPhase("waiting");
      } else {
        await driversApi.offline(driverId);
        setOnline(false);
        setDriverPhase("idle");
        setOffer(null);
      }
    });
  };

  const acceptOffer = async () => {
    if (!offer) return;
    const msg = await run(() => ridesApi.accept(offer.rideId, driverId));
    if (!msg) return;
    setOffer(msg);
    setDriverPhase("accepted");
    const next = await ridesApi.get(offer.rideId).catch(() => null);
    if (next) {
      setRide(next);
      const mapped = statusToUi(next.status);
      if (mapped) {
        setUi(mapped);
        if (mapped === "MATCHED") setCarVisible(true);
      }
    }
  };

  const declineOffer = async () => {
    if (!offer) return;
    await run(() => ridesApi.reject(offer.rideId, driverId));
    setDriverPhase("declined");
    setOffer(null);
  };

  const showDrop =
    ui === "ESTIMATE" ||
    ui === "FINDING" ||
    ui === "MATCHED" ||
    ui === "ENROUTE" ||
    ui === "TRIP" ||
    ui === "DONE";

  const redisHint =
    online && mode === "driver"
      ? `redis> GEOSEARCH drivers · driver ${driverId} online`
      : ui === "FINDING"
        ? "redis> GEOSEARCH drivers expanding radius…"
        : "redis> GEOSEARCH drivers +500m → online";

  return {
    mode,
    setTab,
    ui,
    place,
    places: PLACES,
    ride,
    offer,
    online,
    driverPhase,
    busy,
    error,
    secondsLeft,
    connected,
    carT,
    carVisible,
    progress,
    showDrop,
    redisHint,
    statusPill: statusPill(mode, ui, online),
    pickPlace,
    backIdle: resetRider,
    requestRide,
    cancelRide,
    enRoute,
    startTrip,
    completeTrip,
    bookAgain: resetRider,
    toggleOnline,
    acceptOffer,
    declineOffer,
  };
}
