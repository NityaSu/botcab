import { useState } from "react";
import { DEMO_RIDER_PHONE } from "../api/types";
import { AuthPanel } from "../components/AuthPanel";
import { LiveMap } from "../components/LiveMap";
import { ProductHeader } from "../components/ProductHeader";
import { RideHistoryPanel } from "../components/RideHistoryPanel";
import { RiderPanel } from "../components/RiderPanel";
import { useRideHistory } from "../hooks/useRideHistory";
import { useRiderSession } from "../hooks/useRiderSession";

export function RiderApp() {
  const s = useRiderSession();
  const [showHistory, setShowHistory] = useState(false);
  const history = useRideHistory("rider", Boolean(s.riderName) && showHistory);
  const mapInteractive =
    Boolean(s.riderName) && !showHistory && (s.ui === "IDLE" || s.ui === "ESTIMATE");

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
          product="Rider"
          statusPill={showHistory ? "HISTORY" : s.statusPill}
          userName={s.riderName}
          onLogout={s.logout}
        />
        <div className="bc-layout">
          <LiveMap
            showDrop={s.showDrop}
            carVisible={s.carVisible}
            carT={s.carT}
            driverPosition={s.driverPosition}
            redisHint={s.redisHint}
            pickMode={mapInteractive ? s.pickMode : null}
            pickup={s.pickup}
            dropoff={s.dropoff}
            onMapPick={mapInteractive ? s.onMapPick : undefined}
            onRouteDistanceKm={s.setRouteKm}
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
            <RiderPanel
              ui={s.ui}
              riderName={s.riderName}
              pickup={s.pickup}
              dropoff={s.dropoff}
              pickMode={s.pickMode}
              ride={s.ride}
              busy={s.busy}
              error={s.error}
              progress={s.progress}
              routeKm={s.routeKm}
              savedTrips={s.savedTrips}
              searchResults={s.searchResults}
              onSearch={s.onSearch}
              onPickDropoff={s.pickDropoff}
              onPickSavedTrip={s.pickSavedTrip}
              onSetPickMode={s.setPickMode}
              onBackIdle={s.backIdle}
              onRequest={s.requestRide}
              onCancel={s.cancelRide}
              onBookAgain={s.bookAgain}
              onOpenHistory={openHistory}
            />
          )}
        </div>
      </div>
    </div>
  );
}
