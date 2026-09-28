import type { LocationPoint, SavedTrip } from "@/constants/locations";
import { PinIcon } from "@/components/icons";
import { useI18n } from "@/i18n";
import { ServiceGrid } from "./ServiceGrid";

type Props = {
  savedTrips: SavedTrip[];
  popular: LocationPoint[];
  onPickSavedTrip: (trip: SavedTrip) => void;
  onPickDropoff: (loc: LocationPoint) => void;
};

/** Right panel IDLE state — prompt, services, saved places, popular. */
export function IdlePanel({ savedTrips, popular, onPickSavedTrip, onPickDropoff }: Props) {
  const { t } = useI18n();

  return (
    <div>
      <h2 className="text-xl font-extrabold tracking-tight mb-1">{t("homeWhereto")}</h2>
      <p className="text-sm text-neutral-500 mb-5">{t("rideEnterDest")}</p>

      <div className="mb-5">
        <ServiceGrid onRideSelected={() => undefined} />
      </div>

      <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1">
        {t("homeSaved")}
      </p>
      <div className="divide-y divide-neutral-100 mb-5">
        {savedTrips.map((trip) => (
          <button
            key={trip.id}
            type="button"
            onClick={() => onPickSavedTrip(trip)}
            className="w-full flex items-center gap-3 py-3 text-left hover:bg-neutral-50 rounded-xl px-2 cursor-pointer"
          >
            <PinIcon size={18} className="text-neutral-400 shrink-0" />
            <span className="min-w-0">
              <span className="block font-semibold truncate">{trip.label}</span>
              <span className="block text-xs text-neutral-500 truncate">{trip.detail}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1">
        {t("homePopular")}
      </p>
      <div className="divide-y divide-neutral-100">
        {popular.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => onPickDropoff(loc)}
            className="w-full flex items-center gap-3 py-3 text-left hover:bg-neutral-50 rounded-xl px-2 cursor-pointer"
          >
            <PinIcon size={18} className="text-neutral-400 shrink-0" />
            <span className="min-w-0">
              <span className="block font-semibold truncate">{loc.name}</span>
              <span className="block text-xs text-neutral-500 truncate">{loc.detail}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
