import { DEMO_RIDER_PHONE } from "../api/types";
import { AuthPanel } from "../components/AuthPanel";
import { LiveMap } from "../components/LiveMap";
import { ProductHeader } from "../components/ProductHeader";
import { RiderPanel } from "../components/RiderPanel";
import { useRiderSession } from "../hooks/useRiderSession";

export function RiderApp() {
  const s = useRiderSession();

  return (
    <div className="app-shell">
      <div className="botcab">
        <ProductHeader
          product="Rider"
          statusPill={s.statusPill}
          userName={s.riderName}
          onLogout={s.logout}
        />
        <div className="bc-layout">
          <LiveMap
            showDrop={s.showDrop}
            carVisible={s.carVisible}
            carT={s.carT}
            redisHint={s.redisHint}
          />
          {!s.authReady ? (
            <div className="bc-panel">
              <div className="bc-meta bc-center">Loading…</div>
            </div>
          ) : !s.riderName ? (
            <AuthPanel
              title="Rider login"
              demoHint={s.demoHint}
              defaultPhone={DEMO_RIDER_PHONE}
              busy={s.busy}
              error={s.error}
              fieldErrors={s.fieldErrors}
              onLogin={s.login}
              onRegister={s.register}
            />
          ) : (
            <RiderPanel
              ui={s.ui}
              riderName={s.riderName}
              place={s.place}
              ride={s.ride}
              busy={s.busy}
              error={s.error}
              progress={s.progress}
              places={s.places}
              onPickPlace={s.pickPlace}
              onBackIdle={s.backIdle}
              onRequest={s.requestRide}
              onCancel={s.cancelRide}
              onBookAgain={s.bookAgain}
            />
          )}
        </div>
      </div>
    </div>
  );
}
