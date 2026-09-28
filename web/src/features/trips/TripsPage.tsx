import { Navigate } from "react-router-dom";
import type { RideResponse } from "@/api/types";
import type { TokenRole } from "@/api/client";
import { RateTripCard } from "@/components/RateTripCard";
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { StarRating } from "@/components/ui/StarRating";
import { useI18n } from "@/i18n";
import { formatKhr, formatWhen, shortPlace } from "@/lib/format";
import { useRideHistory } from "@/hooks/useRideHistory";
import { useSessionUser } from "../auth/useSessionUser";

/** `/trips` — ride history & receipts for whichever role is logged in. */
export function TripsPage() {
  const { t } = useI18n();
  const { current, loading } = useSessionUser();
  const history = useRideHistory(current?.role ?? "rider", Boolean(current));

  if (!loading && !current) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{t("tripsTitle")}</h1>
        <Button variant="secondary" size="sm" disabled={history.busy} onClick={history.load}>
          {t("tripsRefresh")}
        </Button>
      </div>

      {history.error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {history.error}
        </div>
      )}

      {history.selected ? (
        <Receipt
          ride={history.selected}
          role={current?.role ?? "rider"}
          busy={history.busy}
          onRate={history.rate}
          onBack={history.clearSelect}
        />
      ) : history.busy && history.items.length === 0 ? (
        <div className="grid place-items-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-neutral-200 border-t-brand animate-spin" />
        </div>
      ) : history.items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-neutral-500">{t("tripsEmpty")}</Card>
      ) : (
        <Card className="divide-y divide-neutral-100">
          {history.items.map((ride) => (
            <button
              key={ride.id}
              type="button"
              onClick={() => history.select(ride)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-neutral-50 cursor-pointer"
            >
              <span className="flex-1 min-w-0">
                <span className="block font-semibold">
                  Ride #{ride.id} ·{" "}
                  {ride.status === "COMPLETED" ? t("tripsCompleted") : t("tripsCancelled")}
                </span>
                <span className="block text-sm text-neutral-500 truncate">
                  {formatWhen(ride.endedAt ?? ride.requestedAt)} ·{" "}
                  {shortPlace(ride.pickupLat, ride.pickupLng)} →{" "}
                  {shortPlace(ride.dropoffLat, ride.dropoffLng)}
                </span>
              </span>
              <span className="font-bold shrink-0">
                {ride.status === "COMPLETED" ? formatKhr(ride.fare?.totalCents) : "—"}
              </span>
              <ChevronRightIcon size={16} className="text-neutral-300 shrink-0" />
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}

function Receipt({
  ride,
  role,
  busy,
  onRate,
  onBack,
}: {
  ride: RideResponse;
  role: TokenRole;
  busy: boolean;
  onRate: (stars: number) => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const fare = ride.fare;

  return (
    <Card className="p-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-ink mb-4 cursor-pointer"
      >
        <ArrowLeftIcon size={16} />
        {t("tripsTitle")}
      </button>

      <Chip>{`${t("tripsReceipt")} · Ride #${ride.id}`}</Chip>
      <h2 className="text-xl font-extrabold mt-3">
        {ride.status === "COMPLETED" ? t("tripsCompleted") : t("tripsCancelled")}
      </h2>
      <p className="text-sm text-neutral-500 mb-5">
        {formatWhen(ride.endedAt ?? ride.requestedAt)}
      </p>

      <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100 text-sm">
        <Row label={t("homePickup")} value={shortPlace(ride.pickupLat, ride.pickupLng)} />
        <Row label="Dropoff" value={shortPlace(ride.dropoffLat, ride.dropoffLng)} />
        <Row label="Status" value={ride.status} />
        {ride.driverId != null && <Row label="Driver" value={`#${ride.driverId}`} />}
        {fare?.distanceKm != null && (
          <Row label={t("tripDistance")} value={`${fare.distanceKm.toFixed(1)} km`} />
        )}
        <div className="flex justify-between px-4 py-3">
          <span className="text-neutral-500">{t("tripTotal")}</span>
          <span className="font-extrabold text-lg">
            {ride.status === "COMPLETED" ? formatKhr(fare?.totalCents) : "—"}{" "}
            <span className="text-xs text-neutral-400">· {fare?.currency ?? "KHR"}</span>
          </span>
        </div>
      </div>

      {ride.status === "COMPLETED" && (
        <div className="mt-5 space-y-3">
          {role === "rider" && ride.ratings?.driverStars != null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">{t("ratingTheirRating")}</span>
              <StarRating value={ride.ratings.driverStars} />
            </div>
          )}
          {role === "driver" && ride.ratings?.riderStars != null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">{t("ratingTheirRating")}</span>
              <StarRating value={ride.ratings.riderStars} />
            </div>
          )}
          <RateTripCard ride={ride} role={role} busy={busy} onRate={onRate} />
        </div>
      )}

      {ride.status === "COMPLETED" && (
        <div className="mx-auto mt-6 w-12 h-12 rounded-full bg-brand-soft text-brand-dark grid place-items-center">
          <CheckIcon size={22} />
        </div>
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-4 py-3">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
