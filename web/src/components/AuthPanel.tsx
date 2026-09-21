import { FormEvent, useState } from "react";

type Props = {
  busy: boolean;
  error: string | null;
  onLogin: (phone: string, password: string) => void;
  onRegister: (fullName: string, phone: string, password: string) => void;
};

export function AuthPanel({ busy, error, onLogin, onRegister }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+855000000101");
  const [password, setPassword] = useState("demo");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (mode === "login") onLogin(phone.trim(), password);
    else onRegister(fullName.trim(), phone.trim(), password);
  }

  return (
    <div className="bc-panel">
      <div className="bc-fade">
        <div className="bc-title">{mode === "login" ? "Rider login" : "Create rider account"}</div>
        <div className="bc-meta bc-mb16">
          Same pattern as AutoWallet — phone + password, JWT for booking.
          <br />
          Demo: +855000000101 / demo
        </div>
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
                autoComplete="name"
              />
            </label>
          )}
          <label className="bc-field">
            <span className="bc-meta">Phone</span>
            <input
              className="bc-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </label>
          <label className="bc-field">
            <span className="bc-meta">Password</span>
            <input
              className="bc-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
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
