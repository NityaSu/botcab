import type { RideResponse } from "@/api/types";
import { PaymentLine } from "@/components/PaymentLine";
import { RateTripCard } from "@/components/RateTripCard";
import { CheckIcon, StarIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { formatDistanceKm, formatKhr } from "@/lib/format";
import { useI18n } from "@/i18n";
import type { RiderUiState } from "../types";

type Props = {
  ui: RiderUiState;
  ride: RideResponse | null;
  progress: number;
  busy: boolean;
  onCancel: () => void;
  cancelFeeCents?: number | null;
  onBookAgain: () => void;
  onRate: (stars: number) => void;
};

/** FINDING → MATCHED → ENROUTE → TRIP → DONE states. */
export function TripStatusCard({
  ui,
  ride,
  progress,
  busy,
  onCancel,
  cancelFeeCents,
  onBookAgain,
  onRate,
}: Props) {
  const { t } = useI18n();
  const fare = ride?.fare;

  if (ui === "FINDING") {
    return (
      <div className="text-center py-6">
        <div
          className="mx-auto mb-4 w-12 h-12 rounded-full border-4 border-neutral-200 border-t-brand animate-spin"
          aria-hidden
        />
        <h2 className="text-xl font-extrabold">{t("tripFinding")}</h2>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          {t("tripFindingBody")}
          {ride && (
            <>
              <br />
              Ride #{ride.id} · {ride.status}
            </>
          )}
        </p>
        <Button variant="secondary" disabled={busy} onClick={onCancel}>
          {cancelFeeCents && cancelFeeCents > 0
            ? `${t("tripCancel")} · ${formatKhr(cancelFeeCents)}`
            : t("tripCancel")}
        </Button>
      </div>
    );
  }

  if (ui === "DONE") {
    return (
      <div className="text-center py-4">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-brand-soft text-brand-dark grid place-items-center">
          <CheckIcon size={26} />
        </div>
        <h2 className="text-xl font-extrabold mb-4">{t("tripArrived")}</h2>
        <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100 text-sm mb-6">
          {fare?.distanceKm != null && (
            <div className="flex justify-between px-4 py-3">
              <span className="text-neutral-500">{t("tripDistance")}</span>
              <span className="font-semibold">{formatDistanceKm(fare.distanceKm)}</span>
            </div>
          )}
          <div className="flex justify-between px-4 py-3">
            <span className="text-neutral-500">{t("tripTotal")}</span>
            <span className="font-extrabold text-lg">
              {formatKhr(fare?.totalCents)}{" "}
              <span className="text-xs text-neutral-400">· {fare?.currency ?? "KHR"}</span>
            </span>
          </div>
          <PaymentLine payment={ride?.payment} />
        </div>
        {ride && (
          <div className="mb-4 text-left">
            <RateTripCard
              ride={ride}
              role="rider"
              busy={busy}
              onRate={onRate}
              onSkip={onBookAgain}
            />
          </div>
        )}
        <Button size="lg" onClick={onBookAgain}>
          {t("tripBookAgain")}
        </Button>
      </div>
    );
  }

  const label =
    ui === "MATCHED" ? t("tripMatched") : ui === "ENROUTE" ? t("tripEnroute") : t("tripInprogress");

  return (
    <div>
      <Chip tone="brand">{label}</Chip>
      <div className="flex items-center gap-3 mt-4 mb-3">
        <span className="w-12 h-12 rounded-full bg-neutral-900 text-white grid place-items-center font-bold">
          D
        </span>
        <span>
          <span className="block font-bold">{t("tripYourDriver")}</span>
          <span className="flex items-center gap-1 text-sm text-neutral-500">
            <StarIcon size={12} className="text-amber-500" />
            driver #{ride?.driverId ?? "—"}
          </span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden mb-5">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500"
          style={{ width: `${Math.max(12, progress)}%` }}
        />
      </div>
      {(ui === "MATCHED" || ui === "ENROUTE") && (
        <Button variant="secondary" disabled={busy} onClick={onCancel}>
          {cancelFeeCents && cancelFeeCents > 0
            ? `${t("tripCancel")} · ${formatKhr(cancelFeeCents)}`
            : t("tripCancel")}
        </Button>
      )}
    </div>
  );
}
