import { useState } from "react";
import type { TokenRole } from "@/api/client";
import type { RideResponse } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { useI18n } from "@/i18n";

type Props = {
  ride: RideResponse;
  role: TokenRole;
  busy?: boolean;
  onRate: (stars: number) => void;
  onSkip?: () => void;
};

function mine(ride: RideResponse, role: TokenRole): number | null {
  if (!ride.ratings) return null;
  return role === "rider" ? ride.ratings.riderStars : ride.ratings.driverStars;
}

/** Prompt to rate the other party after a completed trip. */
export function RateTripCard({ ride, role, busy, onRate, onSkip }: Props) {
  const { t } = useI18n();
  const existing = mine(ride, role);
  const [picked, setPicked] = useState(existing ?? 0);

  if (existing != null) {
    return (
      <div className="rounded-2xl border border-neutral-200 px-4 py-3 text-center">
        <p className="text-sm font-semibold mb-2">{t("ratingThanks")}</p>
        <StarRating value={existing} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 px-4 py-4 text-center">
      <p className="text-sm font-semibold mb-3">
        {role === "rider" ? t("ratingRateDriver") : t("ratingRateRider")}
      </p>
      <StarRating value={picked} onChange={setPicked} disabled={busy} />
      <Button
        size="lg"
        className="mt-4"
        disabled={busy || picked < 1}
        onClick={() => onRate(picked)}
      >
        {busy ? t("ratingSubmitting") : t("ratingSubmit")}
      </Button>
      {onSkip && (
        <Button variant="ghost" size="lg" className="mt-1" disabled={busy} onClick={onSkip}>
          {t("ratingSkip")}
        </Button>
      )}
    </div>
  );
}
