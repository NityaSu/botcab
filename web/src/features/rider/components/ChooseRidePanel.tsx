import { useMemo, useState } from "react";
import type { LocationPoint } from "@/constants/locations";
import { CabIcon, CheckIcon, MotoIcon, TagIcon, UsersIcon, WalletIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import type { MapPickMode } from "@/components/map/LiveMap";
import { formatDistanceKm, formatKhr } from "@/lib/format";
import { estimateFareCents, haversineKm } from "@/lib/geo";
import { useI18n } from "@/i18n";

/** Demo promo: 10% off the client-side estimate. Final fare is always server-side. */
const PROMOS: Record<string, number> = { BOTCAB10: 0.1 };

type Product = {
  id: string;
  nameKey: "rideGo" | "rideMoto" | "rideXl";
  icon: React.ReactNode;
  blurb: string;
  available: boolean;
  /** Price multiplier vs BotCab Go estimate */
  multiplier: number;
};

const PRODUCTS: Product[] = [
  {
    id: "go",
    nameKey: "rideGo",
    icon: <CabIcon size={26} />,
    blurb: "Affordable everyday rides",
    available: true,
    multiplier: 1,
  },
  {
    id: "moto",
    nameKey: "rideMoto",
    icon: <MotoIcon size={26} />,
    blurb: "Beat the traffic",
    available: false,
    multiplier: 0.6,
  },
  {
    id: "xl",
    nameKey: "rideXl",
    icon: <UsersIcon size={26} />,
    blurb: "Up to 6 seats",
    available: false,
    multiplier: 1.5,
  },
];

type Props = {
  pickup: LocationPoint;
  dropoff: LocationPoint;
  routeKm: number | null;
  busy: boolean;
  onRequest: () => void;
  onBack: () => void;
  onSetPickMode: (mode: MapPickMode) => void;
};

/** Right panel — "Choose a ride" product list, cash payment, promo, Request. */
export function ChooseRidePanel({
  pickup,
  dropoff,
  routeKm,
  busy,
  onRequest,
  onBack,
  onSetPickMode,
}: Props) {
  const { t } = useI18n();
  const [promoInput, setPromoInput] = useState("");
  const [applied, setApplied] = useState<{ code: string; pct: number } | null>(null);
  const [promoError, setPromoError] = useState(false);

  const preview = useMemo(() => {
    const km = routeKm ?? haversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const cents = estimateFareCents(km);
    const discounted = applied ? Math.round(cents * (1 - applied.pct)) : cents;
    return { km, cents, discounted };
  }, [pickup, dropoff, routeKm, applied]);

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    const pct = PROMOS[code];
    if (pct) {
      setApplied({ code, pct });
      setPromoError(false);
    } else {
      setApplied(null);
      setPromoError(true);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold tracking-tight">{t("rideChoose")}</h2>
      <p className="text-sm text-neutral-500 mt-0.5 mb-4">
        {pickup.name} → {dropoff.name} · {formatDistanceKm(preview.km)}
      </p>

      {/* Product list */}
      <div className="space-y-2 mb-4">
        {PRODUCTS.map((p) => {
          const price = Math.round(preview.discounted * p.multiplier);
          const inner = (
            <>
              <span
                className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 ${
                  p.available ? "bg-brand-soft text-brand-dark" : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {p.icon}
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-bold">{t(p.nameKey)}</span>
                  {p.available ? (
                    <span className="text-[10px] font-bold bg-brand-soft text-brand-dark rounded-full px-1.5 py-0.5">
                      {t("rideRecommended")}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-neutral-200 text-neutral-500 rounded-full px-1.5 py-0.5">
                      {t("serviceSoon")}
                    </span>
                  )}
                </span>
                <span className="block text-xs text-neutral-500">{p.blurb}</span>
              </span>
              <span className="font-bold shrink-0">{formatKhr(price)}</span>
            </>
          );
          return p.available ? (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border-2 border-brand px-4 py-3"
            >
              {inner}
            </div>
          ) : (
            <div
              key={p.id}
              aria-disabled
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3 opacity-60"
            >
              {inner}
            </div>
          );
        })}
      </div>

      {/* Payment — cash only (matches backend) */}
      <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3 mb-3">
        <WalletIcon size={20} className="text-neutral-500 shrink-0" />
        <span className="flex-1">
          <span className="block text-xs text-neutral-500">{t("estimatePayment")}</span>
          <span className="block font-semibold">{t("estimateCash")}</span>
        </span>
        <span className="text-brand">
          <CheckIcon size={18} />
        </span>
      </div>

      {/* Promo code */}
      <div className="rounded-2xl border border-neutral-200 px-4 py-3 mb-4">
        <div className="flex items-center gap-2">
          <TagIcon size={18} className="text-neutral-500 shrink-0" />
          <input
            value={promoInput}
            onChange={(e) => {
              setPromoInput(e.target.value);
              setPromoError(false);
            }}
            placeholder={t("estimatePromo")}
            aria-label={t("estimatePromo")}
            className="flex-1 bg-transparent outline-none text-sm font-medium uppercase placeholder:normal-case placeholder:text-neutral-400"
          />
          <Button size="sm" variant="secondary" onClick={applyPromo} disabled={!promoInput.trim()}>
            {t("estimatePromoApply")}
          </Button>
        </div>
        {applied && (
          <p className="text-xs font-semibold text-brand-dark mt-2">
            {applied.code} −{Math.round(applied.pct * 100)}% · {t("estimatePromoApplied")}
          </p>
        )}
        {promoError && (
          <p className="text-xs font-semibold text-red-600 mt-2">{t("estimatePromoInvalid")}</p>
        )}
      </div>

      <p className="text-xs text-neutral-400 mb-4">{t("estimateSurgeNote")}</p>

      <Button size="lg" disabled={busy} onClick={onRequest}>
        {busy ? t("estimateRequesting") : t("estimateRequest")}
      </Button>
      <div className="flex gap-2 mt-2">
        <Button variant="ghost" className="flex-1" disabled={busy} onClick={() => onSetPickMode("pickup")}>
          {t("estimateEditPickup")}
        </Button>
        <Button variant="ghost" className="flex-1" disabled={busy} onClick={() => onSetPickMode("dropoff")}>
          {t("estimateEditDropoff")}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onBack}>
          ←
        </Button>
      </div>
    </div>
  );
}
