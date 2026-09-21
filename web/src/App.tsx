import { AppHeader } from "./components/AppHeader";
import { AuthPanel } from "./components/AuthPanel";
import { DriverPanel } from "./components/DriverPanel";
import { LiveMap } from "./components/LiveMap";
import { RiderPanel } from "./components/RiderPanel";
import { useBotCabSession } from "./hooks/useBotCabSession";
import "./styles/botcab.css";

export default function App() {
  const s = useBotCabSession();
  const needsLogin = s.mode === "rider" && s.authReady && !s.riderName;

  return (
    <div className="app-shell">
      <div className="botcab">
        <AppHeader
          mode={s.mode}
          statusPill={s.statusPill}
          riderName={s.riderName}
          onModeChange={s.setTab}
          onLogout={s.logout}
        />

        <div className="bc-layout">
          <LiveMap
            showDrop={s.showDrop}
            carVisible={s.carVisible}
            carT={s.carT}
            redisHint={s.redisHint}
          />

          {needsLogin ? (
            <AuthPanel
              busy={s.busy}
              error={s.error}
              onLogin={s.login}
              onRegister={s.register}
            />
          ) : s.mode === "rider" && s.riderName ? (
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
              onEnRoute={s.enRoute}
              onStart={s.startTrip}
              onComplete={s.completeTrip}
              onCancel={s.cancelRide}
              onBookAgain={s.bookAgain}
            />
          ) : s.mode === "driver" ? (
            <DriverPanel
              online={s.online}
              connected={s.connected}
              phase={s.driverPhase}
              offer={s.offer}
              secondsLeft={s.secondsLeft}
              ride={s.ride}
              busy={s.busy}
              error={s.error}
              onToggleOnline={s.toggleOnline}
              onAccept={s.acceptOffer}
              onDecline={s.declineOffer}
            />
          ) : (
            <div className="bc-panel">
              <div className="bc-meta bc-center">Loading…</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
