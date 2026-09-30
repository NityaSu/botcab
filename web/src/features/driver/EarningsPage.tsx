import { Navigate } from "react-router-dom";
import { driversApi } from "@/api/rides";
import type { DriverEarningsSummary } from "@/api/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n";
import { formatKhr, formatWhen } from "@/lib/format";
import { useSessionUser } from "@/features/auth/useSessionUser";
import { useCallback, useEffect, useState } from "react";

/** `/earnings` — driver ledger from completed trips and rider cancel fees. */
export function EarningsPage() {
  const { t } = useI18n();
  const { current, loading } = useSessionUser();
  const [summary, setSummary] = useState<DriverEarningsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setSummary(await driversApi.earnings());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (current?.role === "driver") void load();
  }, [current?.role, load]);

  if (!loading && !current) return <Navigate to="/login?as=driver" replace />;
  if (!loading && current?.role !== "driver") return <Navigate to="/profile" replace />;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{t("earningsTitle")}</h1>
        <Button variant="secondary" size="sm" disabled={busy} onClick={load}>
          {t("tripsRefresh")}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <Card className="p-6 mb-6">
        <p className="text-sm text-neutral-500">{t("earningsTotal")}</p>
        <p className="text-3xl font-extrabold mt-1">{formatKhr(summary?.totalCents)}</p>
        <p className="text-sm text-neutral-500 mt-2">
          {t("earningsTrips")}: {summary?.tripCount ?? 0} · {t("earningsCancelFees")}:{" "}
          {summary?.cancelFeeCount ?? 0}
        </p>
      </Card>

      {!summary || summary.recent.length === 0 ? (
        <Card className="p-10 text-center text-sm text-neutral-500">{t("earningsEmpty")}</Card>
      ) : (
        <Card className="divide-y divide-neutral-100">
          {summary.recent.map((row) => (
            <div key={row.rideId} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="font-semibold">
                  Ride #{row.rideId} ·{" "}
                  {row.kind === "TRIP" ? t("earningsKindTrip") : t("earningsKindCancel")}
                </div>
                <div className="text-sm text-neutral-500">{formatWhen(row.createdAt)}</div>
              </div>
              <div className="font-bold">{formatKhr(row.amountCents)}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
