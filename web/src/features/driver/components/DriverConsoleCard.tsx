import type { OfferMessage, RideResponse } from "@/api/types";
import { PaymentLine } from "@/components/PaymentLine";
import { RateTripCard } from "@/components/RateTripCard";
import { CabIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Toggle } from "@/components/ui/Toggle";
import { formatDistanceKm, formatKhr, shortPlace } from "@/lib/format";
import { useI18n } from "@/i18n";
import type { DriverPhase } from "../types";

type Props = {
  driverName: string;
  online: boolean;
  connected: boolean;
  phase: DriverPhase;
  offer: OfferMessage | null;
  secondsLeft: number | null;
  ride: RideResponse | null;
  busy: boolean;
  onToggleOnline: (next: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
  onEnRoute: () => void;
  onStart: () => void;
  onComplete: () => void;
  onRate: (stars: number) => void;
  onFinishDone: () => void;
};

/** Driver console — online toggle, incoming offer, trip state machine actions. */
export function DriverConsoleCard({
  driverName,
  online,
  connected,
  phase,
  offer,
  secondsLeft,
  ride,
  busy,
  onToggleOnline,
  onAccept,
  onDecline,
  onEnRoute,
  onStart,
  onComplete,
  onRate,
  onFinishDone,
}: Props) {
  const { t } = useI18n();
  const offerPct =
    offer && secondsLeft != null ? Math.max(0, Math.min(100, (secondsLeft / 15) * 100)) : 0;
  const inTrip = phase === "accepted" || phase === "enroute" || phase === "trip";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight truncate">{t("driverConsole")}</h1>
          <p className="text-sm text-neutral-500 truncate">
            {driverName} · {connected ? "WS live" : "WS…"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Chip tone={online ? "brand" : "neutral"}>
            {online ? t("driverOnline") : t("driverOffline")}
          </Chip>
          <Toggle
            checked={online}
            disabled={busy || inTrip}
            onChange={onToggleOnline}
            label={online ? t("driverOnline") : t("driverOffline")}
          />
        </div>
      </div>

      {!online && !inTrip && phase !== "done" && (
        <div className="text-center py-10 text-neutral-400">
          <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-neutral-100 grid place-items-center">
            <CabIcon size={28} />
          </div>
          <p className="text-sm font-medium">{t("driverGoOnline")}</p>
        </div>
      )}

      {phase === "request" && offer && (
        <div className="rounded-2xl border-2 border-brand p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold">{t("driverNewRequest")}</span>
            <span className="text-right">
              <span className="block font-bold">Ride #{offer.rideId}</span>
              <span className="block text-xs text-neutral-500">
                {formatDistanceKm(offer.distanceKm)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
            Pickup · {shortPlace(offer.pickupLat, offer.pickupLng)}
          </div>
          <p className="text-sm text-neutral-500 mb-2">
            {t("driverAcceptWithin")} {secondsLeft ?? "—"}s
          </p>
          <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden mb-4">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${offerPct}%` }}
            />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" disabled={busy} onClick={onAccept}>
              {t("driverAccept")}
            </Button>
            <Button variant="secondary" className="flex-1" disabled={busy} onClick={onDecline}>
              {t("driverDecline")}
            </Button>
          </div>
        </div>
      )}

      {phase === "accepted" && (
        <div>
          <p className="font-bold mb-1">{t("driverTripAccepted")}</p>
          <p className="text-sm text-neutral-500 mb-4">
            Ride #{ride?.id}
            {offer ? ` · ${formatDistanceKm(offer.distanceKm)}` : ""}
          </p>
          <Button size="lg" disabled={busy} onClick={onEnRoute}>
            {t("driverOnTheWay")}
          </Button>
        </div>
      )}

      {phase === "enroute" && (
        <div>
          <p className="font-bold mb-1">{t("driverEnroute")}</p>
          <p className="text-sm text-neutral-500 mb-4">Ride #{ride?.id}</p>
          <Button size="lg" disabled={busy} onClick={onStart}>
            {t("driverArrivedStart")}
          </Button>
        </div>
      )}

      {phase === "trip" && (
        <div>
          <p className="font-bold mb-1">{t("driverInprogress")}</p>
          <p className="text-sm text-neutral-500 mb-4">Ride #{ride?.id}</p>
          <Button size="lg" disabled={busy} onClick={onComplete}>
            {t("driverCompleteTrip")}
          </Button>
        </div>
      )}

      {phase === "done" && (
        <div className="text-center py-4">
          <p className="font-bold">{t("driverDone")}</p>
          {ride?.fare && (
            <p className="text-sm text-neutral-500 mt-1 mb-2">{formatKhr(ride.fare.totalCents)}</p>
          )}
          {ride?.payment && (
            <div className="rounded-2xl border border-neutral-200 mb-3">
              <PaymentLine payment={ride.payment} />
            </div>
          )}
          {ride && (
            <div className="text-left mb-3">
              <RateTripCard
                ride={ride}
                role="driver"
                busy={busy}
                onRate={onRate}
                onSkip={onFinishDone}
              />
            </div>
          )}
          <Button variant="secondary" size="lg" onClick={onFinishDone}>
            {t("driverWaiting")}
          </Button>
        </div>
      )}

      {online && phase === "declined" && (
        <p className="text-sm text-neutral-500 text-center py-4">{t("driverDeclined")}</p>
      )}
      {online && phase === "expired" && (
        <p className="text-sm text-neutral-500 text-center py-4">{t("driverExpired")}</p>
      )}
      {online && (phase === "idle" || phase === "waiting") && (
        <div className="text-center py-10">
          <div
            className="mx-auto mb-3 w-10 h-10 rounded-full border-4 border-neutral-200 border-t-brand animate-spin"
            aria-hidden
          />
          <p className="text-sm text-neutral-500">{t("driverWaiting")}</p>
        </div>
      )}
    </div>
  );
}
