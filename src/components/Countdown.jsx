import { useEffect, useState } from "react";
import { wedding } from "../config";
import Reveal from "./Reveal";
import { DiamondRule, Garland, Kicker } from "./Ornaments";

const target = new Date(wedding.countdownTo).getTime();

function remaining() {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    done: ms === 0,
    units: [
      ["Days", Math.floor(s / 86400)],
      ["Hours", Math.floor(s / 3600) % 24],
      ["Minutes", Math.floor(s / 60) % 60],
      ["Seconds", s % 60],
    ],
  };
}

/* "Counting down to our Nikkah": live days, hours, minutes and seconds to the Nikkah. */
export default function Countdown() {
  const [left, setLeft] = useState(remaining);

  useEffect(() => {
    if (left.done) return;
    // tick on the second boundary so all four numbers change together
    const id = setTimeout(() => setLeft(remaining()), 1000 - (Date.now() % 1000) + 5);
    return () => clearTimeout(id);
  }, [left]);

  return (
    <section className="sec sec-ivory countdown">
      <Garland className="garland-top" />
      <Reveal>
        <Kicker>Insha’Allah</Kicker>
        <h2 className="script heading countdown-heading">
          Counting down
          <br />
          to our <span className="countdown-accent">Nikkah</span>
        </h2>
        <DiamondRule />
      </Reveal>
      <Reveal delay={0.12}>
        {left.done ? (
          <p className="script countdown-done">The blessed day is here, Alhamdulillah</p>
        ) : (
          <div className="countdown-grid" role="timer" aria-label="Time until the Nikkah">
            {left.units.map(([label, value]) => (
              <div className="countdown-cell" key={label}>
                <span className="countdown-num">
                  {/* the key makes each new value mount fresh and play the roll-in */}
                  <span key={value}>{String(value).padStart(2, "0")}</span>
                </span>
                <span className="countdown-label">{label}</span>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
