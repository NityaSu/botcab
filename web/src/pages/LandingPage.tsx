import { Link } from "react-router-dom";
import { CabIcon } from "../components/icons";

export function LandingPage() {
  return (
    <div className="app-shell">
      <div className="botcab">
        <div className="bc-head">
          <div className="bc-brand">
            <CabIcon />
            Botcab
          </div>
        </div>
        <div className="bc-landing">
          <h1 className="bc-landing-title">Two apps. One platform.</h1>
          <p className="bc-meta bc-mb16">
            Riders book trips. Drivers go online and accept offers — separate logins, like real life.
          </p>
          <div className="bc-landing-actions">
            <Link className="bc-btn bc-btn-pri" to="/rider">
              Open Rider app
            </Link>
            <Link className="bc-btn bc-btn-ghost" to="/driver">
              Open Driver app
            </Link>
          </div>
          <p className="bc-meta" style={{ marginTop: 16 }}>
            Tip: open Rider and Driver in two browser tabs to demo a full trip.
          </p>
        </div>
      </div>
    </div>
  );
}
