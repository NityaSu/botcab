import { NavLink } from "react-router-dom";
import { GridIcon, HistoryIcon, HomeIcon, UserIcon } from "../icons";
import { useI18n } from "@/i18n";
/** Mobile bottom navigation — hidden on md+ screens. */
export function BottomNav() {
  const { t } = useI18n();

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 py-1 text-[11px] font-semibold ${
      isActive ? "text-ink" : "text-neutral-400"
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 h-16 items-center">
        <NavLink to="/" className={itemClass} end>
          <HomeIcon size={22} />
          {t("navHome")}
        </NavLink>
        <NavLink to="/rider" className={itemClass}>
          <GridIcon size={22} />
          {t("navServices")}
        </NavLink>
        <NavLink to="/trips" className={itemClass}>
          <HistoryIcon size={22} />
          {t("navActivity")}
        </NavLink>
        <NavLink to="/profile" className={itemClass}>
          <UserIcon size={22} />
          {t("navAccount")}
        </NavLink>
      </div>
    </nav>
  );
}
