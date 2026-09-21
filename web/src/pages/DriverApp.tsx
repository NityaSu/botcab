import { DEMO_DRIVER_PHONE } from "../api/types";
import { AuthPanel } from "../components/AuthPanel";
import { DriverPanel } from "../components/DriverPanel";
import { LiveMap } from "../components/LiveMap";
import { ProductHeader } from "../components/ProductHeader";
import { useDriverSession } from "../hooks/useDriverSession";

export function DriverApp() {
  const s = useDriverSession();

  return (
    <div className="app-shell">
      <div className="botcab">
        <ProductHeader
          product="Driver"
          statusPill={s.statusPill}
          userName={s.driverName}
          onLogout={s.logout}
        />
        <div className="bc-layout">
          <LiveMap
            showDrop={Boolean(s.ride || s.offer)}
            carVisible={s.phase === "enroute" || s.phase === "trip" || s.phase === "done"}
            carT={s.phase === "done" ? 0.97 : s.phase === "trip" ? 0.55 : 0.2}
            redisHint={s.redisHint}
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
              onLogin={s.login}
              onRegister={s.register}
            />
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
            />
          )}
        </div>
      </div>
    </div>
  );
}
