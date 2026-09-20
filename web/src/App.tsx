import { AppHeader } from "./components/AppHeader";
import { DriverPanel } from "./components/DriverPanel";
import { LiveMap } from "./components/LiveMap";
import { RiderPanel } from "./components/RiderPanel";
import { useBotCabSession } from "./hooks/useBotCabSession";
import "./styles/botcab.css";

export default function App() {
  const s = useBotCabSession();

  return (
    <div className="app-shell">
      <div className="botcab">
        <AppHeader mode={s.mode} statusPill={s.statusPill} onModeChange={s.setTab} />

        <div className="bc-layout">
          <LiveMap
            showDrop={s.showDrop}
            carVisible={s.carVisible}
            carT={s.carT}
            redisHint={s.redisHint}
          />

          {s.mode === "rider" ? (
            <RiderPanel
              ui={s.ui}
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
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
