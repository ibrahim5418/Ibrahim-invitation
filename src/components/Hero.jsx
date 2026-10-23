import { motion } from "framer-motion";
import { useState } from "react";
import { art, wedding } from "../config";
import { DiamondRule } from "./Ornaments";

/*
 * The stage artwork with the invitation text set in its central arched panel.
 * .hero-stage is sized exactly like the intro film so the film's last frame
 * hands over to this image without a jump; text is placed in the image's own
 * units (cqw of .hero-stage), so it stays inside the panel at any size.
 */
export default function Hero({ ready }) {
  const { groom, bride } = wedding;
  const [missing, setMissing] = useState(false);
  return (
    <section className={`hero ${missing ? "is-fallback" : ""}`}>
      <div className="hero-stage">
        {!missing && <img className="hero-art" src={art.stage} alt="" onError={() => setMissing(true)} />}
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: ready ? 0.35 : 0 }}
        >
          <p className="bismillah" lang="ar" dir="rtl" aria-label="Bismillah ir-Rahman ir-Rahim">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <DiamondRule filled width="24cqw" />
          <p className="caps hero-caps">
            We request the honour of your
            <br />
            presence at the Nikkah of
          </p>
          <h1 className="script hero-name">{groom.name}</h1>
          <p className="caps hero-of">Son of</p>
          <p className="hero-parents">{groom.parents}</p>
          <p className="hero-amp">&amp;</p>
          <h1 className="script hero-name">{bride.name}</h1>
          <p className="caps hero-of">Daughter of</p>
          <p className="hero-parents">{bride.parents}</p>
          <p className="caps hero-caps hero-forever">
            As they begin their forever in
            <br />
            faith and love.
          </p>
          <p className="caps hero-scroll">Scroll</p>
          <span className="hero-scroll-line" />
        </motion.div>
      </div>
    </section>
  );
}
