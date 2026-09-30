import { Navigate } from "react-router-dom";
import { LiveMap } from "@/components/map/LiveMap";
import { Card } from "@/components/ui/Card";
import { useDriverSession } from "@/hooks/useDriverSession";
import { DriverConsoleCard } from "./components/DriverConsoleCard";

/** `/driver` — same website shell as rider: map + floating console card. */
export function DriverHomePage() {
  const s = useDriverSession();

  if (!s.authReady) {
    return (
      <div className="flex-1 grid place-items-center">
        <div className="w-10 h-10 rounded-full border-4 border-neutral-200 border-t-brand animate-spin" />
      </div>
    );
  }
  if (!s.driverName) {
    return <Navigate to="/login?as=driver" replace />;
  }

  const pickup =
    s.offer != null
      ? { lat: s.offer.pickupLat, lng: s.offer.pickupLng }
      : s.ride != null
        ? { lat: s.ride.pickupLat, lng: s.ride.pickupLng }
        : null;
  const dropoff =
    s.ride != null ? { lat: s.ride.dropoffLat, lng: s.ride.dropoffLng } : null;

  return (
    <div className="relative flex-1 min-h-[calc(100dvh-4rem)] md:min-h-dvh">
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

      <Card className="absolute inset-x-0 bottom-0 rounded-b-none md:rounded-b-2xl md:inset-x-auto md:left-6 md:top-6 md:bottom-auto md:w-[420px] md:max-h-[calc(100vh-8rem)] md:overflow-y-auto p-5 sm:p-6">
        {s.error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {s.error}
          </div>
        )}
        <DriverConsoleCard
          driverName={s.driverName}
          online={s.online}
          connected={s.connected}
          phase={s.phase}
          offer={s.offer}
          secondsLeft={s.secondsLeft}
          ride={s.ride}
          busy={s.busy}
          onToggleOnline={s.toggleOnline}
          onAccept={s.acceptOffer}
          onDecline={s.declineOffer}
          onEnRoute={s.enRoute}
          onStart={s.startTrip}
          onComplete={s.completeTrip}
          onCancel={s.cancelRide}
          onRate={s.rateRide}
          onFinishDone={s.finishDone}
        />
      </Card>
    </div>
  );
}
