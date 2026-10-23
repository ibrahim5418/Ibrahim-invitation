import { useState } from "react";
import { art } from "../config";

/* Hairline — diamond — hairline. `filled` gives the solid gold diamond used in the hero. */
export function DiamondRule({ filled = false, width = 176, className = "" }) {
  return (
    <div className={`diamond-rule ${className}`} style={{ width }} aria-hidden="true">
      <span />
      <svg width="12" height="12" viewBox="-6 -6 12 12">
        <path d="M0 -5 L5 0 L0 5 L-5 0 Z" fill={filled ? "var(--gold)" : "none"} stroke="var(--gold)" strokeWidth="1" />
      </svg>
      <span />
    </div>
  );
}

/* The photographic floral garland that sits on every section boundary. */
export function Garland({ className = "" }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className={`garland ${className}`} aria-hidden="true">
      {missing ? (
        <div className="garland-fallback">
          <span /> <i /> <span />
        </div>
      ) : (
        <img src={art.garland} alt="" onError={() => setMissing(true)} />
      )}
    </div>
  );
}

export function Kicker({ children }) {
  return <p className="kicker">{children}</p>;
}
