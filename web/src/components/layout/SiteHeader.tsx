import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import {
  CabIcon,
  ChevronRightIcon,
  GlobeIcon,
  HistoryIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "../icons";
import type { SessionUser } from "@/features/auth/useSessionUser";

type Props = {
  user: SessionUser | null;
  loading: boolean;
  onLogout: () => void;
};

export function SiteHeader({ user, loading, onLogout }: Props) {
  const { lang, setLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
      isActive ? "bg-neutral-100 text-ink" : "text-neutral-500 hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
          <span className="text-brand">
            <CabIcon size={26} />
          </span>
          BotCab
        </Link>

        <nav className="hidden sm:flex items-center gap-1 ml-6">
          <NavLink to="/rider" className={navLinkClass}>
            {t("navRide")}
          </NavLink>
          <NavLink to="/driver" className={navLinkClass}>
            {t("navDrive")}
          </NavLink>
        </nav>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "km" : "en")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
          aria-label="Switch language"
        >
          <GlobeIcon size={16} />
          {lang === "en" ? "EN" : "KH"}
        </button>

        {loading ? (
          <span className="w-20 h-9 rounded-full bg-neutral-100 animate-pulse" />
        ) : user ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-neutral-200 hover:bg-neutral-50 cursor-pointer"
            >
              <span className="w-8 h-8 rounded-full bg-brand text-white grid place-items-center text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:block text-sm font-semibold max-w-28 truncate">
                {user.name}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-neutral-200 shadow-lg py-2">
                <div className="px-4 py-2 border-b border-neutral-100 mb-1">
                  <div className="font-bold truncate">{user.name}</div>
                  <div className="text-sm text-neutral-500 truncate">{user.phone}</div>
                </div>
                <MenuItem
                  icon={<HistoryIcon size={18} />}
                  label={t("profileMyTrips")}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/trips");
                  }}
                />
                <MenuItem
                  icon={<UserIcon size={18} />}
                  label={t("profileTitle")}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                />
                <MenuItem
                  icon={<SettingsIcon size={18} />}
                  label={t("profileSettings")}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/settings");
                  }}
                />
                <div className="border-t border-neutral-100 mt-1 pt-1">
                  <MenuItem
                    icon={<LogOutIcon size={18} />}
                    label={t("profileLogout")}
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-neutral-100"
            >
              {t("navLogin")}
            </Link>
            <Link
              to="/login?mode=register"
              className="px-4 py-2 rounded-full text-sm font-semibold bg-ink text-white hover:bg-neutral-800"
            >
              {t("navSignup")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 cursor-pointer"
    >
      <span className="text-neutral-500">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <ChevronRightIcon size={14} className="text-neutral-300" />
    </button>
  );
}
