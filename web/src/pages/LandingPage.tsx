import { Link } from "react-router-dom";
import { CabIcon, ChevronRightIcon, SteeringIcon } from "@/components/icons";
import { useI18n } from "@/i18n";
import { useSessionUser } from "@/features/auth/useSessionUser";

/** `/` — centered role chooser, middle of the screen on web and mobile. */
export function LandingPage() {
  const { t } = useI18n();
  const { rider, driver } = useSessionUser();

  return (
    <div className="flex-1 grid place-items-center px-4 py-10 bg-neutral-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand text-white mb-4">
            <CabIcon size={34} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t("landingTitle")}</h1>
          <p className="text-neutral-500 mt-2">{t("landingSubtitle")}</p>
        </div>

        <div className="space-y-3">
          <RoleCard
            to="/rider"
            icon={<CabIcon size={26} />}
            title={t("landingRideTitle")}
            body={t("landingRideBody")}
            cta={t("landingCta")}
            badge={rider ? rider.name : null}
          />
          <RoleCard
            to="/driver"
            icon={<SteeringIcon size={26} />}
            title={t("landingDriveTitle")}
            body={t("landingDriveBody")}
            cta={t("landingCta")}
            badge={driver ? driver.name : null}
          />
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">{t("landingDemoTip")}</p>
      </div>
    </div>
  );
}

function RoleCard({
  to,
  icon,
  title,
  body,
  cta,
  badge,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  badge: string | null;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 bg-white rounded-2xl border border-neutral-200 p-5 hover:border-ink hover:shadow-md transition-all group"
    >
      <span className="w-14 h-14 rounded-2xl bg-brand-soft text-brand-dark grid place-items-center shrink-0">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-lg font-bold">{title}</span>
          {badge && (
            <span className="text-xs font-semibold bg-neutral-100 rounded-full px-2 py-0.5 truncate max-w-32">
              {badge}
            </span>
          )}
        </span>
        <span className="block text-sm text-neutral-500">{body}</span>
        <span className="block text-sm font-semibold text-brand mt-1">{cta} →</span>
      </span>
      <ChevronRightIcon className="text-neutral-300 group-hover:text-ink transition-colors" />
    </Link>
  );
}
