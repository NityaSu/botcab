import type { OfferMessage, RideResponse } from "../api/types";
import { formatDistanceKm, formatKhr, shortPlace } from "../lib/format";
import { CabIcon } from "./icons";

type DriverPhase =
  | "idle"
  | "waiting"
  | "request"
  | "accepted"
  | "enroute"
  | "trip"
  | "done"
  | "expired"
  | "declined";

type Props = {
  driverName: string;
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
  onEnRoute: () => void;
  onStart: () => void;
  onComplete: () => void;
};

export function DriverPanel({
  driverName,
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
  onEnRoute,
  onStart,
  onComplete,
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
              {driverName}
              {connected ? " · WS live" : " · WS…"}
            </div>
          </div>
          <label className="bc-switch-label">
            <span>{online ? "Online" : "Offline"}</span>
            <input
              type="checkbox"
              className="bc-switch"
              checked={online}
              disabled={busy || phase === "accepted" || phase === "enroute" || phase === "trip"}
              onChange={(e) => onToggleOnline(e.target.checked)}
            />
          </label>
        </div>

        {!online && phase !== "accepted" && phase !== "enroute" && phase !== "trip" && phase !== "done" && (
          <div className="bc-center bc-off">
            <CabIcon size={28} />
            <div>Go online to receive ride requests</div>
          </div>
        )}

        {phase === "request" && offer && (
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
              <button type="button" className="bc-btn bc-btn-pri" disabled={busy} onClick={onAccept}>
                Accept
              </button>
              <button type="button" className="bc-btn bc-btn-ghost" disabled={busy} onClick={onDecline}>
                Decline
              </button>
            </div>
          </div>
        )}

        {phase === "accepted" && (
          <div className="bc-fade">
            <div className="bc-product-name">Trip accepted</div>
            <div className="bc-meta bc-mb16">
              Ride #{ride?.id} · head to pickup
              {offer ? ` · ${formatDistanceKm(offer.distanceKm)}` : ""}
            </div>
            <button type="button" className="bc-btn bc-btn-pri" disabled={busy} onClick={onEnRoute}>
              I&apos;m on the way
            </button>
          </div>
        )}

        {phase === "enroute" && (
          <div className="bc-fade">
            <div className="bc-title">En route to rider</div>
            <div className="bc-meta bc-mb16">Ride #{ride?.id}</div>
            <button type="button" className="bc-btn bc-btn-pri" disabled={busy} onClick={onStart}>
              Arrived · start trip
            </button>
          </div>
        )}

        {phase === "trip" && (
          <div className="bc-fade">
            <div className="bc-title">Trip in progress</div>
            <div className="bc-meta bc-mb16">Ride #{ride?.id}</div>
            <button type="button" className="bc-btn bc-btn-pri" disabled={busy} onClick={onComplete}>
              Complete trip
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className="bc-fade bc-center">
            <div className="bc-product-name">Trip completed</div>
            {ride?.fare && (
              <div className="bc-meta">Fare {formatKhr(ride.fare.totalCents)}</div>
            )}
          </div>
        )}

        {online && phase === "declined" && (
          <div className="bc-meta bc-center">Declined — waiting for next request</div>
        )}
        {online && phase === "expired" && (
          <div className="bc-meta bc-center">Request expired — reassigned</div>
        )}
        {online && (phase === "idle" || phase === "waiting") && (
          <div className="bc-meta bc-center">Waiting for requests…</div>
        )}
      </div>
    </div>
  );
}

export type { DriverPhase };
