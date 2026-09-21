import type { Mode } from "../api/types";
import { CabIcon } from "./icons";

type Props = {
  mode: Mode;
  statusPill: string;
  riderName: string | null;
  onModeChange: (mode: Mode) => void;
  onLogout: () => void;
};

export function AppHeader({ mode, statusPill, riderName, onModeChange, onLogout }: Props) {
  return (
    <div className="bc-head">
      <div className="bc-brand">
        <CabIcon />
        Botcab
      </div>
      <div className="bc-spacer" />
      <div className="bc-chip bc-chip-muted">{statusPill}</div>
      {riderName && mode === "rider" && (
        <button type="button" className="bc-chip bc-chip-muted bc-chip-btn" onClick={onLogout}>
          Log out
        </button>
      )}
      <div className="bc-tabs">
        <button
          type="button"
          className={`bc-tab${mode === "rider" ? " is-on" : ""}`}
          onClick={() => onModeChange("rider")}
        >
          Rider
        </button>
        <button
          type="button"
          className={`bc-tab${mode === "driver" ? " is-on" : ""}`}
          onClick={() => onModeChange("driver")}
        >
          Driver
        </button>
      </div>
    </div>
  );
}
