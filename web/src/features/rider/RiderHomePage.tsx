import { Navigate } from "react-router-dom";
import { LiveMap } from "@/components/map/LiveMap";
import { Card } from "@/components/ui/Card";
import { useRiderSession } from "@/hooks/useRiderSession";
import { ChooseRidePanel } from "./components/ChooseRidePanel";
import { IdlePanel } from "./components/IdlePanel";
import { MapSearchCard } from "./components/MapSearchCard";
import { TripStatusCard } from "./components/TripStatusCard";

/**
 * `/rider` — Uber web layout: left nav sidebar (from ConsoleLayout), map with
 * floating search in the middle, booking panel on the right. On mobile the
 * right panel docks to the bottom like the app.
 */
export function RiderHomePage() {
  const s = useRiderSession();

  if (!s.authReady) {
    return (
      <div className="flex-1 grid place-items-center">
        <div className="w-10 h-10 rounded-full border-4 border-neutral-200 border-t-brand animate-spin" />
      </div>
    );
  }
  if (!s.riderName) {
    return <Navigate to="/login?as=rider" replace />;
  }

  const mapInteractive = s.ui === "IDLE" || s.ui === "ESTIMATE";
  const inTrip =
    s.ui === "FINDING" || s.ui === "MATCHED" || s.ui === "ENROUTE" || s.ui === "TRIP" || s.ui === "DONE";

  return (
    <div className="relative flex-1 min-h-[calc(100dvh-4rem)] md:min-h-dvh">
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

      {!inTrip && (
        <MapSearchCard
          pickup={s.pickup}
          dropoff={s.dropoff}
          pickMode={s.pickMode}
          searchResults={s.searchResults}
          onSearch={s.onSearch}
          onPickDropoff={s.pickDropoff}
          onSetPickMode={s.setPickMode}
        />
      )}

      <Card className="absolute inset-x-0 bottom-0 rounded-b-none p-5 sm:p-6 max-h-[70dvh] overflow-y-auto md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:w-[420px] md:max-h-none md:rounded-none md:border-0 md:border-l md:border-neutral-200">
        {s.error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {s.error}
          </div>
        )}

        {s.ui === "IDLE" && (
          <IdlePanel
            savedTrips={s.savedTrips}
            popular={s.searchResults.slice(0, 5)}
            onPickSavedTrip={s.pickSavedTrip}
            onPickDropoff={s.pickDropoff}
          />
        )}

        {s.ui === "ESTIMATE" && s.dropoff && (
          <ChooseRidePanel
            pickup={s.pickup}
            dropoff={s.dropoff}
            routeKm={s.routeKm}
            busy={s.busy}
            onRequest={s.requestRide}
            onBack={s.backIdle}
            onSetPickMode={s.setPickMode}
          />
        )}

        {inTrip && (
          <TripStatusCard
            ui={s.ui}
            ride={s.ride}
            progress={s.progress}
            busy={s.busy}
            onCancel={s.cancelRide}
            cancelFeeCents={s.cancelFeeCents}
            onBookAgain={s.bookAgain}
            onRate={s.rateRide}
          />
        )}
      </Card>
    </div>
  );
}
