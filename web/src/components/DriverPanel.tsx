import type { OfferMessage, RideResponse } from "../api/types";
import { formatDistanceKm, formatKhr, shortPlace } from "../lib/format";
import { CabIcon } from "./icons";

type DriverPhase = "idle" | "waiting" | "request" | "accepted" | "expired" | "declined";

type Props = {
  online: boolean;
  connected: boolean;
  phase: DriverPhase;
  offer: OfferMessage | null;
  secondsLeft: number | null;
  ride: RideResponse | null;
  busy: boolean;
  error: string | null;
  onToggleOnline: (next: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
};

export function DriverPanel({
  online,
  connected,
  phase,
  offer,
  secondsLeft,
  ride,
  busy,
  error,
  onToggleOnline,
  onAccept,
  onDecline,
}: Props) {
  const offerPct =
    offer && secondsLeft != null ? Math.max(0, Math.min(100, (secondsLeft / 15) * 100)) : 0;

  return (
    <div className="bc-panel">
      {error && <div className="bc-error">{error}</div>}
      <div className="bc-fade">
        <div className="bc-driver-head">
          <div>
            <div className="bc-title">Driver console</div>
            <div className="bc-meta">
              Dara P. · 2A-1234
              {connected ? " · WS live" : " · WS…"}
            </div>
          </div>
          <label className="bc-switch-label">
            <span>{online ? "Online" : "Offline"}</span>
            <input
              type="checkbox"
              className="bc-switch"
              checked={online}
              disabled={busy}
              onChange={(e) => onToggleOnline(e.target.checked)}
            />
          </label>
        </div>

        {!online && (
          <div className="bc-center bc-off">
            <CabIcon size={28} />
            <div>Go online to receive ride requests</div>
          </div>
        )}

        {online && phase === "accepted" && (
          <div className="bc-center">
            <div className="bc-product-name">Trip accepted</div>
            <div className="bc-meta">
              Navigate to pickup
              {offer
                ? ` · ${shortPlace(offer.pickupLat, offer.pickupLng)} · ${formatDistanceKm(offer.distanceKm)}`
                : ""}
            </div>
            {ride && (
              <div className="bc-meta" style={{ marginTop: 8 }}>
                Ride #{ride.id} · {ride.status}
              </div>
            )}
          </div>
        )}

        {online && phase === "declined" && (
          <div className="bc-meta bc-center">Declined — waiting for next request</div>
        )}

        {online && phase === "expired" && (
          <div className="bc-meta bc-center">Request expired — reassigned to next driver</div>
        )}

        {online && phase === "request" && offer && (
          <div className="bc-request">
            <div className="bc-request-top">
              <span className="bc-product-name">New request</span>
              <div className="bc-right">
                <div className="bc-product-price" style={{ fontSize: 16, fontWeight: 700 }}>
                  Ride #{offer.rideId}
                </div>
                <div className="bc-meta">{formatDistanceKm(offer.distanceKm)}</div>
              </div>
            </div>
            <div className="bc-stop">
              <i className="bc-dot" />
              Pickup · {shortPlace(offer.pickupLat, offer.pickupLng)}
            </div>
            <div className="bc-stop bc-stop-b">
              <i className="bc-pin" />
              Accept within {secondsLeft ?? "—"}s
            </div>
            <div className="bc-bar" style={{ marginBottom: 12 }}>
              <i className="is-warn" style={{ width: `${offerPct}%` }} />
            </div>
            <div className="bc-actions">
              <button
                type="button"
                className="bc-btn bc-btn-pri"
                disabled={busy}
                onClick={onAccept}
              >
                Accept
              </button>
              <button
                type="button"
                className="bc-btn bc-btn-ghost"
                disabled={busy}
                onClick={onDecline}
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {online && (phase === "idle" || phase === "waiting") && (
          <div className="bc-meta bc-center">
            Waiting for requests…
            <br />
            <span style={{ color: "var(--bc-q)" }}>
              Ping GEO · listen /topic/drivers/…
            </span>
          </div>
        )}

        {ride?.fare && phase === "accepted" && (
          <div className="bc-meta bc-center" style={{ marginTop: 12 }}>
            Last fare {formatKhr(ride.fare.totalCents)}
          </div>
        )}
      </div>
    </div>
  );
}

export type { DriverPhase };
