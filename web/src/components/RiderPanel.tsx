import type { Place, RideResponse } from "../api/types";
import { formatDistanceKm, formatKhr } from "../lib/format";
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
  place: Place | null;
  ride: RideResponse | null;
  busy: boolean;
  error: string | null;
  progress: number;
  onPickPlace: (place: Place) => void;
  onBackIdle: () => void;
  onRequest: () => void;
  onEnRoute: () => void;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onBookAgain: () => void;
  places: Place[];
};

export function RiderPanel({
  ui,
  riderName,
  place,
  ride,
  busy,
  error,
  progress,
  onPickPlace,
  onBackIdle,
  onRequest,
  onEnRoute,
  onStart,
  onComplete,
  onCancel,
  onBookAgain,
  places,
}: Props) {
  const fare = ride?.fare;
  const estimateMid = 9600;
  const surge = fare?.surgeMultiplier ?? 1.4;

  return (
    <div className="bc-panel">
      {error && <div className="bc-error">{error}</div>}

      {ui === "IDLE" && (
        <div className="bc-fade">
          <div className="bc-meta" style={{ marginBottom: 4 }}>
            Good evening, {riderName}
          </div>
          <div className="bc-hero">Where to?</div>
          <div className="bc-search">
            <SearchIcon />
            <span>Search destination</span>
          </div>
          <div className="bc-meta" style={{ marginBottom: 4 }}>
            Saved places
          </div>
          {places.map((p) => (
            <button key={p.name} type="button" className="bc-row" onClick={() => onPickPlace(p)}>
              <PinIcon />
              <span>
                <span className="bc-row-title">{p.name}</span>
                <span className="bc-meta">{p.detail}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {ui === "ESTIMATE" && place && (
        <div className="bc-fade">
          <div className="bc-title">
            {place.name} → Wat Phnom
          </div>
          <div className="bc-meta bc-mb12">{place.distanceLabel}</div>
          <div className="bc-fare-row">
            <span className="bc-fare">៛8,600 – ៛10,200</span>
            <span className="bc-chip bc-chip-warn">Surge ×{surge.toFixed(1)}</span>
          </div>
          <div className="bc-meta bc-mb16">
            High demand right now — drivers nearby via Redis GEO
          </div>
          <div className="bc-product">
            <CabIcon size={22} />
            <div className="bc-grow">
              <div className="bc-product-name">BotCab Go</div>
              <div className="bc-meta">4 seats · arrives in ~3 min</div>
            </div>
            <div className="bc-right">
              <div className="bc-product-price">{formatKhr(estimateMid)}</div>
              <div className="bc-meta">est.</div>
            </div>
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
            GEOSEARCH radius expanding: 300 m → 500 m
            <br />→ 1 km
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

      {ui === "MATCHED" && (
        <div className="bc-fade">
          <div className="bc-chip bc-chip-pos">Driver matched</div>
          <div className="bc-driver">
            <div className="bc-avatar">D</div>
            <div className="bc-grow">
              <div className="bc-product-name">Dara P.</div>
              <div className="bc-stars">
                <StarIcon />
                <span>4.9 · driver #{ride?.driverId ?? "—"}</span>
              </div>
            </div>
            <div className="bc-right">
              <div className="bc-plate">2A-1234</div>
              <div className="bc-meta" style={{ marginTop: 4 }}>
                Toyota Corolla · White
              </div>
            </div>
          </div>
          <div className="bc-meta" style={{ marginBottom: 8 }}>
            Arriving in about 3 min
          </div>
          <div className="bc-bar" style={{ marginBottom: 16 }}>
            <i style={{ width: `${Math.max(12, progress)}%` }} />
          </div>
          <button type="button" className="bc-btn bc-btn-pri" disabled={busy} onClick={onEnRoute}>
            Driver is on the way
          </button>
          <button type="button" className="bc-btn bc-btn-ghost" disabled={busy} onClick={onCancel}>
            Cancel · free within 2 min
          </button>
        </div>
      )}

      {ui === "ENROUTE" && (
        <div className="bc-fade">
          <div className="bc-title">Dara is heading to you</div>
          <div className="bc-meta" style={{ marginBottom: 8 }}>
            Pickup: {place?.detail ?? "BKK1"} · en route
          </div>
          <div className="bc-bar" style={{ marginBottom: 16 }}>
            <i style={{ width: `${progress}%` }} />
          </div>
          <div className="bc-legend">
            <span>
              <i className="bc-dot" />
              You
            </span>
            <span>
              <i className="bc-pin" />
              Wat Phnom
            </span>
          </div>
          <button type="button" className="bc-btn bc-btn-pri" disabled={busy} onClick={onStart}>
            Dara arrived · start trip
          </button>
        </div>
      )}

      {ui === "TRIP" && (
        <div className="bc-fade">
          <div className="bc-title">Heading to Wat Phnom</div>
          <div className="bc-meta" style={{ marginBottom: 8 }}>
            Ride #{ride?.id} · {ride?.status}
          </div>
          <div className="bc-bar" style={{ marginBottom: 16 }}>
            <i style={{ width: `${progress}%` }} />
          </div>
          <div className="bc-eta-line">
            ETA <span>~12 min</span> · fare locked on complete
          </div>
          <button type="button" className="bc-btn bc-btn-pri" disabled={busy} onClick={onComplete}>
            Complete trip
          </button>
        </div>
      )}

      {ui === "DONE" && (
        <div className="bc-fade bc-center">
          <div className="bc-check">
            <CheckIcon />
          </div>
          <div className="bc-title">You have arrived</div>
          <div className="bc-meta" style={{ marginBottom: 16 }}>
            Rate Dara · ★★★★★
          </div>
          <div className="bc-receipt">
            {fare?.distanceKm != null && (
              <div className="bc-receipt-row">
                <span>Distance</span>
                <span>{formatDistanceKm(fare.distanceKm)}</span>
              </div>
            )}
            {fare?.surgeMultiplier != null && fare.surgeMultiplier !== 1 && (
              <div className="bc-receipt-row">
                <span>Surge</span>
                <span>×{fare.surgeMultiplier.toFixed(2)}</span>
              </div>
            )}
            {fare?.demandRatio != null && (
              <div className="bc-receipt-row">
                <span>Demand ratio</span>
                <span>{fare.demandRatio.toFixed(2)}</span>
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
