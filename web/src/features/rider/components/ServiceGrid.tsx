import { useState } from "react";
import { CabIcon, ClockIcon, MotoIcon, PackageIcon, UsersIcon } from "@/components/icons";
import { Sheet } from "@/components/ui/Sheet";
import { useI18n } from "@/i18n";
import type { I18nKey } from "@/i18n";

type Service = {
  id: string;
  labelKey: I18nKey;
  icon: React.ReactNode;
  available: boolean;
};

const SERVICES: Service[] = [
  { id: "ride", labelKey: "serviceRide", icon: <CabIcon size={26} />, available: true },
  { id: "reserve", labelKey: "serviceReserve", icon: <ClockIcon size={26} />, available: false },
  { id: "delivery", labelKey: "serviceDelivery", icon: <PackageIcon size={26} />, available: false },
  { id: "moto", labelKey: "serviceMoto", icon: <MotoIcon size={26} />, available: false },
  { id: "intercity", labelKey: "serviceIntercity", icon: <CabIcon size={26} />, available: false },
  { id: "group", labelKey: "serviceGroup", icon: <UsersIcon size={26} />, available: false },
];

type Props = {
  /** Called when the working "Ride" tile is chosen (focus destination search). */
  onRideSelected: () => void;
};

/** Uber-style service grid. Only Ride is wired to the real backend today. */
export function ServiceGrid({ onRideSelected }: Props) {
  const { t } = useI18n();
  const [soonService, setSoonService] = useState<Service | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => (s.available ? onRideSelected() : setSoonService(s))}
            className="relative flex flex-col items-center gap-1.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 py-4 transition-colors cursor-pointer"
          >
            {!s.available && (
              <span className="absolute top-1.5 right-1.5 text-[10px] font-bold bg-neutral-200 text-neutral-500 rounded-full px-1.5 py-0.5">
                {t("serviceSoon")}
              </span>
            )}
            <span className={s.available ? "text-brand-dark" : "text-neutral-400"}>{s.icon}</span>
            <span className="text-xs font-semibold">{t(s.labelKey)}</span>
          </button>
        ))}
      </div>

      <Sheet
        open={soonService != null}
        onClose={() => setSoonService(null)}
        title={soonService ? t(soonService.labelKey) : undefined}
      >
        <p className="text-neutral-500 text-sm">{t("serviceSoonBody")}</p>
      </Sheet>
    </>
  );
}
