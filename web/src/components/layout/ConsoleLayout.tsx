import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSessionUser } from "@/features/auth/useSessionUser";
import { useI18n, type I18nKey } from "@/i18n";
import {
  CabIcon,
  ClockIcon,
  GlobeIcon,
  HistoryIcon,
  PackageIcon,
  SettingsIcon,
  SteeringIcon,
  WalletIcon,
} from "../icons";
import { Sheet } from "../ui/Sheet";
import { BottomNav } from "./BottomNav";

type SideItem = {
  id: string;
  labelKey: I18nKey;
  icon: React.ReactNode;
  to?: string;
  active?: boolean;
  soon?: boolean;
};

/**
 * Shell for the /rider and /driver consoles: left nav panel with the BotCab
 * logo (desktop), content in the middle, mobile bottom nav. No top header —
 * the sidebar owns branding here, like the Uber booking site.
 */
export function ConsoleLayout() {
  const { t, lang, setLang } = useI18n();
  const { current, loading } = useSessionUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [soonLabel, setSoonLabel] = useState<I18nKey | null>(null);

  const isDriver = location.pathname.startsWith("/driver");

  const items: SideItem[] = isDriver
    ? [
        { id: "drive", labelKey: "navDrive", icon: <SteeringIcon size={22} />, active: true },
        { id: "trips", labelKey: "navTrips", icon: <HistoryIcon size={22} />, to: "/trips" },
        { id: "earnings", labelKey: "earningsTitle", icon: <WalletIcon size={22} />, to: "/earnings" },
      ]
    : [
        { id: "ride", labelKey: "serviceRide", icon: <CabIcon size={22} />, active: true },
        {
          id: "delivery",
          labelKey: "serviceDelivery",
          icon: <PackageIcon size={22} />,
          soon: true,
        },
        {
          id: "later",
          labelKey: "rideRideLater",
          icon: <ClockIcon size={22} />,
          soon: true,
        },
      ];

  return (
    <div className="min-h-dvh flex bg-white">
      {/* Left panel — desktop only */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-neutral-200 min-h-dvh sticky top-0">
        <Link
          to="/"
          className="flex items-center gap-2 font-extrabold text-lg tracking-tight px-5 h-16 border-b border-neutral-100"
        >
          <span className="text-brand">
            <CabIcon size={26} />
          </span>
          BotCab
        </Link>

        <nav className="flex-1 py-3 px-3 space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.soon) setSoonLabel(item.labelKey);
                else if (item.to) navigate(item.to);
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                item.active
                  ? "bg-brand-soft text-brand-dark"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{t(item.labelKey)}</span>
              {item.soon && (
                <span className="text-[10px] font-bold bg-neutral-100 text-neutral-400 rounded-full px-1.5 py-0.5">
                  {t("serviceSoon")}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-neutral-100 p-3 space-y-1">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
          >
            <SettingsIcon size={22} />
            {t("profileSettings")}
          </button>
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "km" : "en")}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
          >
            <GlobeIcon size={20} />
            {lang === "en" ? "English" : "ខ្មែរ"}
          </button>
          {!loading && (
            <button
              type="button"
              onClick={() => navigate(current ? "/profile" : "/login")}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-neutral-100 cursor-pointer"
            >
              {current ? (
                <>
                  <span className="w-8 h-8 rounded-full bg-brand text-white grid place-items-center text-sm font-bold shrink-0">
                    {current.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold truncate">{current.name}</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-brand">{t("navLogin")}</span>
              )}
            </button>
          )}
        </div>
      </aside>

      {/* Middle + right — the page itself */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Outlet />
      </div>

      <BottomNav />

      <Sheet
        open={soonLabel != null}
        onClose={() => setSoonLabel(null)}
        title={soonLabel ? t(soonLabel) : undefined}
      >
        <p className="text-neutral-500 text-sm">{t("serviceSoonBody")}</p>
      </Sheet>
    </div>
  );
}
