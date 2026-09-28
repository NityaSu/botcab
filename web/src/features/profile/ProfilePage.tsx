import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ChevronRightIcon,
  GlobeIcon,
  HistoryIcon,
  LogOutIcon,
  SettingsIcon,
  TagIcon,
  WalletIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/i18n";
import { useSessionUser } from "../auth/useSessionUser";

/** `/profile` — account surface: identity, trips, payment, promos, settings, language. */
export function ProfilePage() {
  const { t, lang, setLang } = useI18n();
  const { current, loading, logout } = useSessionUser();
  const navigate = useNavigate();

  if (!loading && !current) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight mb-6">{t("profileTitle")}</h1>

      {current && (
        <Card className="p-5 flex items-center gap-4 mb-6">
          <span className="w-14 h-14 rounded-full bg-brand text-white grid place-items-center text-xl font-bold shrink-0">
            {current.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="font-bold text-lg truncate">{current.name}</div>
            <div className="text-sm text-neutral-500 truncate">{current.phone}</div>
            <div className="text-xs font-semibold text-brand-dark mt-0.5 uppercase tracking-wide">
              {current.role === "driver" ? t("authAsDriver") : t("authAsRider")}
            </div>
          </div>
        </Card>
      )}

      <Card className="divide-y divide-neutral-100 mb-6">
        <ProfileRow
          icon={<HistoryIcon size={20} />}
          label={t("profileMyTrips")}
          onClick={() => navigate("/trips")}
        />
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="text-neutral-500">
            <WalletIcon size={20} />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">{t("profilePayment")}</span>
            <span className="block text-sm text-neutral-500">{t("profilePaymentCash")}</span>
          </span>
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="text-neutral-500">
            <TagIcon size={20} />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">{t("profilePromos")}</span>
            <span className="block text-sm text-neutral-500">{t("profilePromosBody")}</span>
          </span>
        </div>
        <ProfileRow
          icon={<SettingsIcon size={20} />}
          label={t("profileSettings")}
          onClick={() => navigate("/settings")}
        />
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="text-neutral-500">
            <GlobeIcon size={20} />
          </span>
          <span className="flex-1 font-semibold">{t("profileLanguage")}</span>
          <div className="flex rounded-full bg-neutral-100 p-1">
            {(["en", "km"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  lang === l ? "bg-white shadow-sm" : "text-neutral-500"
                }`}
              >
                {l === "en" ? "EN" : "ខ្មែរ"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {current && (
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            logout(current.role);
            navigate("/");
          }}
        >
          <LogOutIcon size={18} />
          {t("profileLogout")}
        </Button>
      )}

      {!current && !loading && (
        <Link to="/login">
          <Button size="lg">{t("profileLoginCta")}</Button>
        </Link>
      )}
    </div>
  );
}

function ProfileRow({
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
      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-neutral-50 cursor-pointer"
    >
      <span className="text-neutral-500">{icon}</span>
      <span className="flex-1 font-semibold">{label}</span>
      <ChevronRightIcon size={16} className="text-neutral-300" />
    </button>
  );
}
