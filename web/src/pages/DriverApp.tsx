import { useState } from "react";
import { DEMO_DRIVER_PHONE } from "../api/types";
import { AuthPanel } from "../components/AuthPanel";
import { DriverPanel } from "../components/DriverPanel";
import { LiveMap } from "../components/LiveMap";
import { ProductHeader } from "../components/ProductHeader";
import { RideHistoryPanel } from "../components/RideHistoryPanel";
import { useDriverSession } from "../hooks/useDriverSession";
import { useRideHistory } from "../hooks/useRideHistory";

export function DriverApp() {
  const s = useDriverSession();
  const [showHistory, setShowHistory] = useState(false);
  const history = useRideHistory("driver", Boolean(s.driverName) && showHistory);

  const pickup =
    s.offer != null
      ? { lat: s.offer.pickupLat, lng: s.offer.pickupLng }
      : s.ride != null
        ? { lat: s.ride.pickupLat, lng: s.ride.pickupLng }
        : null;
  const dropoff =
    s.ride != null ? { lat: s.ride.dropoffLat, lng: s.ride.dropoffLng } : null;

  const openHistory = () => {
    history.reset();
    setShowHistory(true);
  };

  const closeHistory = () => {
    history.reset();
    setShowHistory(false);
  };

  return (
    <div className="app-shell">
      <div className="botcab">
        <ProductHeader
          product="Driver"
          statusPill={showHistory ? "HISTORY" : s.statusPill}
          userName={s.driverName}
          onLogout={s.logout}
        />
        <div className="bc-layout">
          <LiveMap
            showDrop={Boolean(dropoff)}
            carVisible={Boolean(s.livePosition)}
            driverPosition={s.livePosition}
            redisHint={
              s.livePosition
                ? s.redisHint
                : pickup
                  ? "OSRM route · waiting for live GPS"
                  : s.redisHint
            }
            pickup={pickup}
            dropoff={dropoff}
          />
          {!s.authReady ? (
            <div className="bc-panel">
              <div className="bc-meta bc-center">Loading…</div>
            </div>
          ) : !s.driverName ? (
            <AuthPanel
              title="Driver login"
              demoHint={s.demoHint}
              defaultPhone={DEMO_DRIVER_PHONE}
              busy={s.busy}
              error={s.error}
              fieldErrors={s.fieldErrors}
              onLogin={s.login}
              onRegister={s.register}
            />
          ) : showHistory ? (
            <div className="bc-panel">
              <RideHistoryPanel
                items={history.items}
                selected={history.selected}
                busy={history.busy}
                error={history.error}
                onSelect={history.select}
                onClearSelect={history.clearSelect}
                onBack={closeHistory}
                onRefresh={history.load}
              />
            </div>
          ) : (
            <DriverPanel
              driverName={s.driverName}
              online={s.online}
              connected={s.connected}
              phase={s.phase}
              offer={s.offer}
              secondsLeft={s.secondsLeft}
              ride={s.ride}
              busy={s.busy}
              error={s.error}
              onToggleOnline={s.toggleOnline}
              onAccept={s.acceptOffer}
              onDecline={s.declineOffer}
              onEnRoute={s.enRoute}
              onStart={s.startTrip}
              onComplete={s.completeTrip}
              onOpenHistory={openHistory}
            />
          )}
        </div>
      </div>
    </div>
  );
}
