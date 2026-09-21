import { Link } from "react-router-dom";
import { CabIcon } from "./icons";

type Props = {
  product: "Rider" | "Driver";
  statusPill: string;
  userName: string | null;
  onLogout: () => void;
};

export function ProductHeader({ product, statusPill, userName, onLogout }: Props) {
  return (
    <div className="bc-head">
      <Link to="/" className="bc-brand" style={{ textDecoration: "none" }}>
        <CabIcon />
        Botcab
      </Link>
      <div className="bc-chip bc-chip-muted">{product}</div>
      <div className="bc-spacer" />
      <div className="bc-chip bc-chip-muted">{statusPill}</div>
      {userName && (
        <button type="button" className="bc-chip bc-chip-muted bc-chip-btn" onClick={onLogout}>
          Log out · {userName}
        </button>
      )}
    </div>
  );
}
