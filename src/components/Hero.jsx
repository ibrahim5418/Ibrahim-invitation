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
          <img className="bismillah" src={art.bismillah} alt="Bismillah ir-Rahman ir-Rahim" />
          <DiamondRule filled width="24cqw" />
          <p className="caps hero-caps">
            With the blessings and mercy
            <br />
            of Allah, I cordially invite you
            <br />
            to be a part of my Nikkah
            <br />
            and the blessed occasions
          </p>
          <h1 className="script hero-name">{groom.name}</h1>
          <p className="hero-qualification">{groom.qualification}</p>
          <p className="hero-parents">S/o {groom.parents}</p>
          <p className="hero-amp">&amp;</p>
          <h1 className="script hero-name">{bride.name}</h1>
          <p className="hero-qualification">{bride.qualification}</p>
          <p className="hero-parents">D/o {bride.parents}</p>
          <p className="caps hero-caps hero-closing">
            Together in faith, united in love,
            <br />
            blessed for a lifetime
          </p>
          <p className="caps hero-scroll">Scroll</p>
          <span className="hero-scroll-line" />
        </motion.div>
      </div>
    </section>
  );
}
