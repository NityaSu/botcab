import { useState } from "react";
import type { LocationPoint } from "@/constants/locations";
import { PinIcon, SearchIcon } from "@/components/icons";
import type { MapPickMode } from "@/components/map/LiveMap";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/i18n";

type Props = {
  pickup: LocationPoint;
  dropoff: LocationPoint | null;
  pickMode: MapPickMode;
  searchResults: LocationPoint[];
  onSearch: (query: string) => void;
  onPickDropoff: (loc: LocationPoint) => void;
  onSetPickMode: (mode: MapPickMode) => void;
};

/** Search box floating over the map — pickup row + "Where to?" + results. */
export function MapSearchCard({
  pickup,
  dropoff,
  pickMode,
  searchResults,
  onSearch,
  onPickDropoff,
  onSetPickMode,
}: Props) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  function handleSearch(value: string) {
    setQuery(value);
    onSearch(value);
  }

  function pick(loc: LocationPoint) {
    onPickDropoff(loc);
    setQuery("");
    onSearch("");
  }

  return (
    <Card className="absolute top-4 left-4 right-4 md:right-auto md:w-96 p-3 shadow-lg z-10">
      <button
        type="button"
        onClick={() => onSetPickMode(pickMode === "pickup" ? null : "pickup")}
        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
          pickMode === "pickup" ? "bg-brand-soft" : "hover:bg-neutral-50"
        }`}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
        <span className="min-w-0">
          <span className="block text-[11px] uppercase tracking-wide text-neutral-400 font-bold">
            {t("homePickup")}
          </span>
          <span className="block text-sm font-semibold truncate">{pickup.name}</span>
        </span>
      </button>

      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors ${
          pickMode === "dropoff" ? "bg-neutral-100" : ""
        }`}
      >
        <SearchIcon size={16} className="text-neutral-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => onSetPickMode("dropoff")}
          placeholder={dropoff ? dropoff.name : t("homeWhereto")}
          aria-label={t("homeSearchDest")}
          className="w-full bg-transparent outline-none text-sm font-semibold placeholder:text-neutral-400 placeholder:font-medium"
        />
      </div>

      {query.trim() !== "" && (
        <div className="mt-1 border-t border-neutral-100 max-h-64 overflow-y-auto">
          {searchResults.length === 0 && (
            <p className="text-sm text-neutral-400 px-3 py-3">—</p>
          )}
          {searchResults.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => pick(loc)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-neutral-50 rounded-xl cursor-pointer"
            >
              <PinIcon size={16} className="text-neutral-400 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold truncate">{loc.name}</span>
                <span className="block text-xs text-neutral-500 truncate">{loc.detail}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {pickMode && (
        <p className="text-[11px] text-neutral-400 px-3 pt-1.5">
          {pickMode === "pickup" ? t("homeTapPickup") : t("homeTapDropoff")}
        </p>
      )}
    </Card>
  );
}
