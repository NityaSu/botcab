import { useMemo, useState } from "react";
import type { LocationPoint, RideResponse, SavedTrip } from "../api/types";
import { formatDistanceKm, formatKhr } from "../lib/format";
import { estimateFareCents, haversineKm } from "../lib/geo";
import type { MapPickMode } from "./LiveMap";
import { CabIcon, CheckIcon, PinIcon, SearchIcon, StarIcon } from "./icons";

export type RiderUiState =
  | "IDLE"
  | "ESTIMATE"
  | "FINDING"
  | "MATCHED"
  | "ENROUTE"
  | "TRIP"
  | "DONE";

type Props = {
  ui: RiderUiState;
  riderName: string;
  pickup: LocationPoint;
  dropoff: LocationPoint | null;
  pickMode: MapPickMode;
  ride: RideResponse | null;
  busy: boolean;
  error: string | null;
  progress: number;
  /** Road distance from OSRM when available; otherwise haversine */
  routeKm: number | null;
  savedTrips: SavedTrip[];
  searchResults: LocationPoint[];
  onSearch: (query: string) => void;
  onPickDropoff: (loc: LocationPoint) => void;
  onPickSavedTrip: (trip: SavedTrip) => void;
  onSetPickMode: (mode: MapPickMode) => void;
  onBackIdle: () => void;
  onRequest: () => void;
  onCancel: () => void;
  onBookAgain: () => void;
};

export function RiderPanel({
  ui,
  riderName,
  pickup,
  dropoff,
  pickMode,
  ride,
  busy,
  error,
  progress,
  routeKm,
  savedTrips,
  searchResults,
  onSearch,
  onPickDropoff,
  onPickSavedTrip,
  onSetPickMode,
  onBackIdle,
  onRequest,
  onCancel,
  onBookAgain,
}: Props) {
  const [query, setQuery] = useState("");
  const fare = ride?.fare;

  const preview = useMemo(() => {
    if (!dropoff) return null;
    const km = routeKm ?? haversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    return { km, cents: estimateFareCents(km), fromRoute: routeKm != null };
  }, [pickup, dropoff, routeKm]);

  function handleSearchChange(value: string) {
    setQuery(value);
    onSearch(value);
  }

  return (
    <div className="bc-panel">
      {error && <div className="bc-error">{error}</div>}

      {ui === "IDLE" && (
        <div className="bc-fade">
          <div className="bc-meta" style={{ marginBottom: 4 }}>
            Good evening, {riderName}
          </div>
          <div className="bc-hero">Where to?</div>

          <button
            type="button"
            className={`bc-stop-card${pickMode === "pickup" ? " is-active" : ""}`}
            onClick={() => onSetPickMode(pickMode === "pickup" ? null : "pickup")}
          >
            <i className="bc-dot" />
            <span>
              <span className="bc-meta">Pickup</span>
              <span className="bc-row-title">{pickup.name}</span>
              <span className="bc-meta">{pickup.detail}</span>
            </span>
          </button>

          <label className="bc-search bc-search-input">
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => onSetPickMode("dropoff")}
              placeholder="Search destination"
              aria-label="Search destination"
            />
          </label>
          <div className="bc-meta bc-mb8">
            {pickMode === "pickup"
              ? "Tap the map to move pickup — or pick a saved trip"
              : pickMode === "dropoff"
                ? "Tap the map or choose a place below"
                : "Search, saved trip, or tap map for dropoff"}
          </div>

          {query.trim() ? (
            <>
              <div className="bc-meta" style={{ marginBottom: 4 }}>
                Results
              </div>
              {searchResults.length === 0 && (
                <div className="bc-meta bc-center">No places match</div>
              )}
              {searchResults.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  className="bc-row"
                  onClick={() => {
                    onPickDropoff(loc);
                    setQuery("");
                    onSearch("");
                  }}
                >
                  <PinIcon />
                  <span>
                    <span className="bc-row-title">{loc.name}</span>
                    <span className="bc-meta">{loc.detail}</span>
                  </span>
                </button>
              ))}
            </>
          ) : (
            <>
              <div className="bc-meta" style={{ marginBottom: 4 }}>
                Saved trips
              </div>
              {savedTrips.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="bc-row"
                  onClick={() => onPickSavedTrip(t)}
                >
                  <PinIcon />
                  <span>
                    <span className="bc-row-title">{t.label}</span>
                    <span className="bc-meta">{t.detail}</span>
                  </span>
                </button>
              ))}
              <div className="bc-meta" style={{ margin: "12px 0 4px" }}>
                Popular
              </div>
              {searchResults.slice(0, 5).map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  className="bc-row"
                  onClick={() => onPickDropoff(loc)}
                >
                  <PinIcon />
                  <span>
                    <span className="bc-row-title">{loc.name}</span>
                    <span className="bc-meta">{loc.detail}</span>
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {ui === "ESTIMATE" && dropoff && preview && (
        <div className="bc-fade">
          <div className="bc-title">
            {pickup.name} → {dropoff.name}
          </div>
          <div className="bc-meta bc-mb12">
            {formatDistanceKm(preview.km)}
            {preview.fromRoute ? " · road" : " · straight-line"} · est. fare
          </div>
          <div className="bc-fare-row">
            <span className="bc-fare">{formatKhr(preview.cents)}</span>
            <span className="bc-chip bc-chip-muted">pre-surge</span>
          </div>
          <div className="bc-meta bc-mb16">
            Final fare uses live demand surge when the trip completes
          </div>
          <div className="bc-product">
            <CabIcon size={22} />
            <div className="bc-grow">
              <div className="bc-product-name">BotCab Go</div>
              <div className="bc-meta">
                {dropoff.detail} · {formatDistanceKm(preview.km)}
              </div>
            </div>
            <div className="bc-right">
              <div className="bc-product-price">{formatKhr(preview.cents)}</div>
              <div className="bc-meta">est.</div>
            </div>
          </div>
          <div className="bc-actions-row">
            <button
              type="button"
              className="bc-btn bc-btn-ghost"
              disabled={busy}
              onClick={() => onSetPickMode("pickup")}
            >
              Edit pickup
            </button>
            <button
              type="button"
              className="bc-btn bc-btn-ghost"
              disabled={busy}
              onClick={() => onSetPickMode("dropoff")}
            >
              Edit dropoff
            </button>
          </div>
          <button type="button" className="bc-btn bc-btn-pri" disabled={busy} onClick={onRequest}>
            {busy ? "Requesting…" : "Request BotCab"}
          </button>
          <button type="button" className="bc-btn bc-btn-ghost" disabled={busy} onClick={onBackIdle}>
            Back
          </button>
        </div>
      )}

      {ui === "FINDING" && (
        <div className="bc-fade bc-center bc-finding">
          <div className="bc-steer" aria-hidden />
          <div className="bc-title">Finding your driver…</div>
          <div className="bc-meta bc-find-meta">
            Waiting for a driver to accept
            {ride && (
              <>
                <br />
                Ride #{ride.id} · {ride.status}
              </>
            )}
          </div>
          <button type="button" className="bc-btn bc-btn-ghost" disabled={busy} onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}

      {(ui === "MATCHED" || ui === "ENROUTE" || ui === "TRIP") && (
        <div className="bc-fade">
          <div className="bc-chip bc-chip-pos">
            {ui === "MATCHED" && "Driver matched"}
            {ui === "ENROUTE" && "Driver en route"}
            {ui === "TRIP" && "Trip in progress"}
          </div>
          <div className="bc-driver">
            <div className="bc-avatar">D</div>
            <div className="bc-grow">
              <div className="bc-product-name">Your driver</div>
              <div className="bc-stars">
                <StarIcon />
                <span>driver #{ride?.driverId ?? "—"}</span>
              </div>
            </div>
          </div>
          <div className="bc-meta" style={{ marginBottom: 8 }}>
            Status updates as your driver advances the trip
          </div>
          <div className="bc-bar" style={{ marginBottom: 16 }}>
            <i style={{ width: `${Math.max(12, progress)}%` }} />
          </div>
          {ui === "MATCHED" && (
            <button type="button" className="bc-btn bc-btn-ghost" disabled={busy} onClick={onCancel}>
              Cancel ride
            </button>
          )}
        </div>
      )}

      {ui === "DONE" && (
        <div className="bc-fade bc-center">
          <div className="bc-check">
            <CheckIcon />
          </div>
          <div className="bc-title">You have arrived</div>
          <div className="bc-receipt">
            {fare?.distanceKm != null && (
              <div className="bc-receipt-row">
                <span>Distance</span>
                <span>{formatDistanceKm(fare.distanceKm)}</span>
              </div>
            )}
            <div className="bc-receipt-total">
              <span>Total</span>
              <span>
                {formatKhr(fare?.totalCents)}{" "}
                <span className="bc-meta">· {fare?.currency ?? "KHR"}</span>
              </span>
            </div>
          </div>
          <button type="button" className="bc-btn bc-btn-pri" onClick={onBookAgain}>
            Book another ride
          </button>
        </div>
      )}
    </div>
  );
}
