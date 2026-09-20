import type { Mode } from "../api/types";
import { CabIcon } from "./icons";

type Props = {
  mode: Mode;
  statusPill: string;
  onModeChange: (mode: Mode) => void;
};

export function AppHeader({ mode, statusPill, onModeChange }: Props) {
  return (
    <div className="bc-head">
      <div className="bc-brand">
        <CabIcon />
        Botcab
      </div>
      <div className="bc-spacer" />
      <div className="bc-chip bc-chip-muted">{statusPill}</div>
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
