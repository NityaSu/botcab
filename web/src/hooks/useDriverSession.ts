import { useCallback, useEffect, useState } from "react";
import { driverAuthApi, persistAuth } from "../api/auth";
import { getToken, setActiveRole, setToken, ApiRequestError } from "../api/client";
import { driversApi, ridesApi } from "../api/rides";
import {
  DEFAULT_PICKUP,
  DEMO_DRIVER_PHONE,
  DEMO_PASSWORD,
  type OfferMessage,
  type RideResponse,
} from "../api/types";
import type { DriverPhase } from "../components/DriverPanel";
import { useDriverOffers } from "./useDriverOffers";
import { useDriverLivePings } from "./useDriverLivePings";

function statusToPhase(status: string | undefined): DriverPhase | null {
  switch (status) {
    case "MATCHED":
      return "accepted";
    case "DRIVER_EN_ROUTE":
      return "enroute";
    case "IN_PROGRESS":
      return "trip";
    case "COMPLETED":
      return "done";
    case "CANCELLED":
      return "idle";
    default:
      return null;
  }
}

export function useDriverSession() {
  const [driverId, setDriverId] = useState<number | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [online, setOnline] = useState(false);
  const [phase, setPhase] = useState<DriverPhase>("idle");
  const [offer, setOffer] = useState<OfferMessage | null>(null);
  const [ride, setRide] = useState<RideResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

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
    setActiveRole("driver");
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken("driver")) {
        setAuthReady(true);
        return;
      }
      try {
        const me = await driverAuthApi.me();
        if (cancelled) return;
        setDriverId(me.driverId);
        setDriverName(me.fullName);
        if (me.status === "AVAILABLE") {
          setOnline(true);
          setPhase("waiting");
        }
      } catch {
        if (!cancelled) {
          setToken("driver", null);
          setDriverId(null);
          setDriverName(null);
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
    setToken("driver", token);
    setDriverId(id);
    setDriverName(name);
    setError(null);
    setFieldErrors({});
  };

  const login = async (phone: string, password: string) => {
    const res = await run(() => driverAuthApi.login({ phone, password }));
    if (res) {
      persistAuth("driver", res);
      applyAuth(res.token, res.userId, res.fullName);
    }
  };

  const register = async (fullName: string, phone: string, password: string) => {
    const res = await run(() => driverAuthApi.register({ fullName, phone, password }));
    if (res) {
      persistAuth("driver", res);
      applyAuth(res.token, res.userId, res.fullName);
    }
  };

  const logout = () => {
    driverAuthApi.logout();
    setDriverId(null);
    setDriverName(null);
    setOnline(false);
    setPhase("idle");
    setOffer(null);
    setRide(null);
    setError(null);
  };

  const onOffer = useCallback((msg: OfferMessage) => {
    setOffer(msg);
    if (msg.status === "PENDING") {
      setPhase("request");
    } else if (msg.status === "ACCEPTED" || msg.note === "accepted") {
      setPhase("accepted");
    } else if (msg.note?.includes("expir") || msg.status === "EXPIRED") {
      setPhase("expired");
    } else if (msg.status === "REJECTED" || msg.note === "rejected") {
      setPhase("declined");
    }
  }, []);

  const { connected } = useDriverOffers(
    driverId ?? 0,
    Boolean(driverId && online),
    onOffer,
  );

  const liveEnabled =
    Boolean(ride) &&
    (phase === "accepted" || phase === "enroute" || phase === "trip");
  const { position: livePosition } = useDriverLivePings(ride, phase, liveEnabled);

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
      if (left <= 0) setPhase((p) => (p === "request" ? "expired" : p));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [offer]);

  const toggleOnline = async (next: boolean) => {
    await run(async () => {
      if (next) {
        await driversApi.available();
        const home = DEFAULT_PICKUP;
        await driversApi.ping(home.lat + 0.002, home.lng + 0.002);
        setOnline(true);
        setPhase("waiting");
      } else {
        await driversApi.offline();
        setOnline(false);
        setPhase("idle");
        setOffer(null);
      }
    });
  };

  const acceptOffer = async () => {
    if (!offer) return;
    const msg = await run(() => ridesApi.accept(offer.rideId));
    if (!msg) return;
    setOffer(msg);
    setPhase("accepted");
    const next = await ridesApi.get(offer.rideId, "driver").catch(() => null);
    if (next) setRide(next);
  };

  const declineOffer = async () => {
    if (!offer) return;
    await run(() => ridesApi.reject(offer.rideId));
    setPhase("declined");
    setOffer(null);
  };

  const enRoute = async () => {
    if (!ride) return;
    const body = await run(() => ridesApi.enRoute(ride.id));
    if (!body) return;
    setRide(body);
    setPhase("enroute");
  };

  const startTrip = async () => {
    if (!ride) return;
    const body = await run(() => ridesApi.start(ride.id));
    if (!body) return;
    setRide(body);
    setPhase("trip");
  };

  const completeTrip = async () => {
    if (!ride) return;
    const body = await run(() => ridesApi.complete(ride.id));
    if (!body) return;
    setRide(body);
    setPhase("done");
    setOnline(true);
  };

  // After done, return to waiting
  useEffect(() => {
    if (phase !== "done") return;
    const id = window.setTimeout(() => {
      setPhase(online ? "waiting" : "idle");
      setOffer(null);
      setRide(null);
    }, 2500);
    return () => window.clearTimeout(id);
  }, [phase, online]);

  // Sync phase if ride status somehow drifts
  useEffect(() => {
    const mapped = statusToPhase(ride?.status);
    if (mapped && mapped !== phase && (phase === "accepted" || phase === "enroute" || phase === "trip")) {
      setPhase(mapped);
    }
  }, [ride?.status, phase]);

  const redisHint = livePosition
    ? `live ${livePosition.lat.toFixed(4)}, ${livePosition.lng.toFixed(4)} · GEO + STOMP`
    : online
      ? `redis> GEOSEARCH drivers · driver ${driverId ?? "?"} online`
      : "redis> GEOSEARCH drivers (offline)";

  return {
    authReady,
    driverName,
    login,
    register,
    logout,
    online,
    connected,
    phase,
    offer,
    secondsLeft,
    ride,
    busy,
    error,
    fieldErrors,
    livePosition,
    redisHint,
    statusPill: online ? "DRIVER · ONLINE" : "DRIVER",
    demoHint: `Demo: ${DEMO_DRIVER_PHONE} / ${DEMO_PASSWORD}`,
    toggleOnline,
    acceptOffer,
    declineOffer,
    enRoute,
    startTrip,
    completeTrip,
  };
}
