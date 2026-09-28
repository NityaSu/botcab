import { Card } from "@/components/ui/Card";
import { GlobeIcon } from "@/components/icons";
import { useI18n } from "@/i18n";

/** `/settings` — language + about. Kept deliberately small (demo scope). */
export function SettingsPage() {
  const { t, lang, setLang } = useI18n();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight mb-6">{t("settingsTitle")}</h1>

      <Card className="p-5 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-neutral-500">
            <GlobeIcon size={20} />
          </span>
          <div className="flex-1">
            <div className="font-bold">{t("settingsLanguage")}</div>
            <div className="text-sm text-neutral-500">{t("settingsLanguageBody")}</div>
          </div>
          <div className="flex rounded-full bg-neutral-100 p-1">
            {(["en", "km"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  lang === l ? "bg-white shadow-sm" : "text-neutral-500"
                }`}
              >
                {l === "en" ? "English" : "ខ្មែរ"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="font-bold mb-1">{t("settingsAbout")}</div>
        <p className="text-sm text-neutral-500">{t("settingsAboutBody")}</p>
      </Card>
    </div>
  );
}
