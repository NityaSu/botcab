import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { driverAuthApi, riderAuthApi } from "@/api/auth";
import { getToken, setToken, type TokenRole } from "@/api/client";

export type SessionUser = {
  role: TokenRole;
  id: number;
  name: string;
  phone: string;
};

/**
 * Website-level session: resolves "who is logged in" for header/profile,
 * independent of the rider/driver console hooks. Re-checks on route change.
 */
export function useSessionUser() {
  const location = useLocation();
  const [rider, setRider] = useState<SessionUser | null>(null);
  const [driver, setDriver] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [riderRes, driverRes] = await Promise.all([
        getToken("rider")
          ? riderAuthApi.me().catch(() => null)
          : Promise.resolve(null),
        getToken("driver")
          ? driverAuthApi.me().catch(() => null)
          : Promise.resolve(null),
      ]);
      if (cancelled) return;
      setRider(
        riderRes
          ? { role: "rider", id: riderRes.riderId, name: riderRes.fullName, phone: riderRes.phone }
          : null,
      );
      setDriver(
        driverRes
          ? {
              role: "driver",
              id: driverRes.driverId,
              name: driverRes.fullName,
              phone: driverRes.phone,
            }
          : null,
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const logout = useCallback((role: TokenRole) => {
    setToken(role, null);
    if (role === "rider") setRider(null);
    else setDriver(null);
  }, []);

  /** The "current" user for account surfaces — prefers the role of the page you're on. */
  const current: SessionUser | null =
    location.pathname.startsWith("/driver") ? (driver ?? rider) : (rider ?? driver);

  return { rider, driver, current, loading, logout };
}
