import type { RideResponse } from "../api/types";
import { formatKhr, formatWhen, shortPlace } from "../lib/format";
import { CheckIcon } from "./icons";

type Props = {
  items: RideResponse[];
  selected: RideResponse | null;
  busy: boolean;
  error: string | null;
  onSelect: (ride: RideResponse) => void;
  onClearSelect: () => void;
  onRefresh: () => void;
  onBack?: () => void;
};

export function RideHistoryPanel({
  items,
  selected,
  busy,
  error,
  onSelect,
  onClearSelect,
  onRefresh,
  onBack,
}: Props) {
  if (selected) {
    const fare = selected.fare;
    return (
      <div className="bc-fade">
        {error && <div className="bc-error">{error}</div>}
        <button type="button" className="bc-btn bc-btn-ghost bc-mb12" onClick={onClearSelect}>
          ← History
        </button>
        <div className="bc-chip bc-chip-muted">Receipt · Ride #{selected.id}</div>
        <div className="bc-title" style={{ marginTop: 8 }}>
          {selected.status === "COMPLETED" ? "Trip completed" : "Trip cancelled"}
        </div>
        <div className="bc-meta bc-mb12">{formatWhen(selected.endedAt ?? selected.requestedAt)}</div>
        <div className="bc-receipt">
          <div className="bc-receipt-row">
            <span>Pickup</span>
            <span>{shortPlace(selected.pickupLat, selected.pickupLng)}</span>
          </div>
          <div className="bc-receipt-row">
            <span>Dropoff</span>
            <span>{shortPlace(selected.dropoffLat, selected.dropoffLng)}</span>
          </div>
          <div className="bc-receipt-row">
            <span>Status</span>
            <span>{selected.status}</span>
          </div>
          {selected.driverId != null && (
            <div className="bc-receipt-row">
              <span>Driver</span>
              <span>#{selected.driverId}</span>
            </div>
          )}
          {fare?.distanceKm != null && (
            <div className="bc-receipt-row">
              <span>Distance</span>
              <span>{fare.distanceKm.toFixed(1)} km</span>
            </div>
          )}
          <div className="bc-receipt-total">
            <span>Total</span>
            <span>
              {selected.status === "COMPLETED" ? formatKhr(fare?.totalCents) : "—"}{" "}
              <span className="bc-meta">· {fare?.currency ?? "KHR"}</span>
            </span>
          </div>
        </div>
        {selected.status === "COMPLETED" && (
          <div className="bc-center" style={{ marginTop: 12 }}>
            <div className="bc-check">
              <CheckIcon />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bc-fade">
      {error && <div className="bc-error">{error}</div>}
      <div className="bc-driver-head">
        <div>
          <div className="bc-title">Ride history</div>
          <div className="bc-meta">Completed & cancelled trips</div>
        </div>
        <button type="button" className="bc-btn bc-btn-ghost" disabled={busy} onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {busy && items.length === 0 && (
        <div className="bc-meta bc-center" style={{ padding: "24px 0" }}>
          Loading…
        </div>
      )}

      {!busy && items.length === 0 && (
        <div className="bc-center bc-off">
          <div className="bc-meta">No past rides yet. Complete a trip to see a receipt here.</div>
        </div>
      )}

      <div className="bc-history-list">
        {items.map((ride) => (
          <button
            key={ride.id}
            type="button"
            className="bc-row bc-history-row"
            onClick={() => onSelect(ride)}
          >
            <span>
              <span className="bc-row-title">
                Ride #{ride.id} · {ride.status === "COMPLETED" ? "Completed" : "Cancelled"}
              </span>
              <span className="bc-meta">
                {formatWhen(ride.endedAt ?? ride.requestedAt)} ·{" "}
                {shortPlace(ride.pickupLat, ride.pickupLng)} →{" "}
                {shortPlace(ride.dropoffLat, ride.dropoffLng)}
              </span>
            </span>
            <span className="bc-right">
              <span className="bc-product-price">
                {ride.status === "COMPLETED" ? formatKhr(ride.fare?.totalCents) : "—"}
              </span>
            </span>
          </button>
        ))}
      </div>

      {onBack && (
        <button type="button" className="bc-btn bc-btn-ghost" style={{ marginTop: 12 }} onClick={onBack}>
          Back
        </button>
      )}
    </div>
  );
}
