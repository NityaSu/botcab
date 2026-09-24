import { FormEvent, useState } from "react";
import { DEMO_PASSWORD } from "../api/types";

type Props = {
  title: string;
  demoHint: string;
  defaultPhone?: string;
  busy: boolean;
  error: string | null;
  fieldErrors?: Record<string, string>;
  onLogin: (phone: string, password: string) => void;
  onRegister: (fullName: string, phone: string, password: string) => void;
};

export function AuthPanel({
  title,
  demoHint,
  defaultPhone = "",
  busy,
  error,
  fieldErrors = {},
  onLogin,
  onRegister,
}: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const [password, setPassword] = useState(DEMO_PASSWORD);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (mode === "login") onLogin(phone.trim(), password);
    else onRegister(fullName.trim(), phone.trim(), password);
  }

  return (
    <div className="bc-panel">
      <div className="bc-fade">
        <div className="bc-title">{mode === "login" ? title : `Create account`}</div>
        <div className="bc-meta bc-mb16">{demoHint}</div>
        {error && <div className="bc-error">{error}</div>}
        <form onSubmit={submit}>
          {mode === "register" && (
            <label className="bc-field">
              <span className="bc-meta">Full name</span>
              <input
                className="bc-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              {fieldErrors.fullName && (
                <span className="bc-field-error">{fieldErrors.fullName}</span>
              )}
            </label>
          )}
          <label className="bc-field">
            <span className="bc-meta">Phone</span>
            <input
              className="bc-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            {fieldErrors.phone && <span className="bc-field-error">{fieldErrors.phone}</span>}
          </label>
          <label className="bc-field">
            <span className="bc-meta">Password</span>
            <input
              className="bc-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 8 : 1}
            />
            {fieldErrors.password && (
              <span className="bc-field-error">{fieldErrors.password}</span>
            )}
            {mode === "register" && !fieldErrors.password && (
              <span className="bc-meta">At least 8 characters, with a letter and a digit</span>
            )}
          </label>
          <button type="submit" className="bc-btn bc-btn-pri" disabled={busy}>
            {busy ? "…" : mode === "login" ? "Log in" : "Register"}
          </button>
        </form>
        <button
          type="button"
          className="bc-btn bc-btn-ghost"
          disabled={busy}
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Need an account? Register" : "Have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
