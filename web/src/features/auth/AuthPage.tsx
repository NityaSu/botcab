import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { driverAuthApi, persistAuth, riderAuthApi } from "@/api/auth";
import { ApiRequestError } from "@/api/client";
import { DEMO_DRIVER_PHONE, DEMO_PASSWORD, DEMO_RIDER_PHONE } from "@/constants/demo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useI18n } from "@/i18n";
import type { TokenRole } from "@/api/client";

/** `/login?as=rider|driver&mode=login|register` — real JWT auth against the API. */
export function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const role: TokenRole = params.get("as") === "driver" ? "driver" : "rider";
  const mode = params.get("mode") === "register" ? "register" : "login";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(role === "driver" ? DEMO_DRIVER_PHONE : DEMO_RIDER_PHONE);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setMode = (next: "login" | "register") => {
    setParams({ as: role, mode: next }, { replace: true });
    setError(null);
    setFieldErrors({});
  };

  const setRole = (next: TokenRole) => {
    setParams({ as: next, mode }, { replace: true });
    setPhone(next === "driver" ? DEMO_DRIVER_PHONE : DEMO_RIDER_PHONE);
    setError(null);
    setFieldErrors({});
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const api = role === "driver" ? driverAuthApi : riderAuthApi;
      const res =
        mode === "login"
          ? await api.login({ phone: phone.trim(), password })
          : await api.register({ fullName: fullName.trim(), phone: phone.trim(), password });
      persistAuth(role, res);
      navigate(role === "driver" ? "/driver" : "/rider");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFieldErrors(err.fields);
        setError(Object.keys(err.fields).length > 0 ? null : err.message);
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex-1 grid place-items-center px-4 py-10 bg-neutral-50">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="flex rounded-full bg-neutral-100 p-1 mb-6">
          {(["rider", "driver"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors cursor-pointer ${
                role === r ? "bg-white shadow-sm" : "text-neutral-500"
              }`}
            >
              {r === "rider" ? t("authAsRider") : t("authAsDriver")}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight mb-1">
          {mode === "login" ? t("authLoginTitle") : t("authRegisterTitle")}
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Demo: {role === "driver" ? DEMO_DRIVER_PHONE : DEMO_RIDER_PHONE} / {DEMO_PASSWORD}
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <Input
              label={t("authFullName")}
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={fieldErrors.fullName}
              required
            />
          )}
          <Input
            label={t("authPhone")}
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={fieldErrors.phone}
            required
          />
          <Input
            label={t("authPassword")}
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            hint={mode === "register" && !fieldErrors.password ? t("authPasswordHint") : undefined}
            required
            minLength={mode === "register" ? 8 : 1}
          />
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? "…" : mode === "login" ? t("authSubmit") : t("authSubmitRegister")}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-4 w-full text-center text-sm font-semibold text-neutral-500 hover:text-ink cursor-pointer"
        >
          {mode === "login" ? t("authNeedAccount") : t("authHaveAccount")}
        </button>
      </Card>
    </div>
  );
}
