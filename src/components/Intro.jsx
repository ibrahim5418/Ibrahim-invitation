import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { art } from "../config";

/*
 * Tap-to-open screen and the cinematic reveal that follows, timed to the
 * reference video:
 *   0.0s  tap: "tap to open" fades out, a golden light blooms (≈1.2s)
 *   1.1s  dissolve to satin curtains that sweep aside
 *   2.4s  dissolve to the wall of floral arches, slow pan across
 *   5.4s  dissolve to the stage, settling into the hero's background
 *   6.1s  the overlay lifts and the hero text fades in
 * If /art/intro.mp4 exists, that film plays instead of the animated stills.
 */
const T = { curtains: 1.1, wall: 2.4, stage: 5.4, done: 6.1 };
const FILM_TIMEOUT_MS = 14000;
const EASE = [0.45, 0, 0.25, 1];

function useImage(src) {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setOk(true);
    img.onerror = () => setOk(false);
    img.src = src;
  }, [src]);
  return ok;
}

export default function Intro({ onTap, onDone }) {
  const [phase, setPhase] = useState("tap"); // tap → playing → done
  const [hasFilm, setHasFilm] = useState(false);
  const [wallShift, setWallShift] = useState(0);
  const filmRef = useRef(null);
  const wallRef = useRef(null);
  const tapOk = useImage(art.tapScene);

  // a probe <video> can't be trusted here: iOS loads nothing before a tap
  useEffect(() => {
    fetch(art.introFilm, { method: "HEAD" })
      .then(r => setHasFilm(r.ok && (r.headers.get("content-type") || "").startsWith("video")))
      .catch(() => setHasFilm(false));
  }, []);

  const finished = useRef(false);
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setPhase("done");
    onDone();
  };

  const start = () => {
    // a second tap while the intro plays skips straight to the invitation
    if (phase === "playing") return finish();
    if (phase !== "tap") return;
    setPhase("playing");
    onTap();
    if (hasFilm) {
      filmRef.current.play().catch(finish);
      // never leave a guest stuck if the film stalls on a slow connection
      setTimeout(finish, FILM_TIMEOUT_MS);
    } else {
      setTimeout(finish, T.done * 1000);
    }
  };

  // how far the arch wall must travel so its right edge ends at the screen's edge
  const measureWall = () => {
    const img = wallRef.current;
    if (img) setWallShift(Math.max(0, img.offsetWidth - img.parentElement.offsetWidth));
  };

  const playing = phase === "playing";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="intro"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={start}
          onKeyDown={e => (e.key === "Enter" || e.key === " ") && start()}
          role="button"
          tabIndex={0}
          aria-label="Tap to open the invitation"
        >
          {/* tap scene */}
          {tapOk ? (
            <img className="intro-tapscene-img" src={art.tapScene} alt="" />
          ) : (
            <div className="intro-layer intro-tapscene is-fallback" />
          )}

          <motion.div
            className="tap-ui"
            animate={{ opacity: playing ? 0 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="tap-ring" />
            <Flourish />
            <p className="tap-text">tap to open</p>
            <Flourish under />
          </motion.div>

          {/* golden bloom (the film carries its own) */}
          {!hasFilm && (
            <motion.div
              className="intro-glow"
              initial={{ opacity: 0, scale: 0.08 }}
              animate={playing ? { opacity: [0, 1, 1, 0], scale: [0.08, 1.4, 2.6, 3.2] } : {}}
              transition={{ duration: 1.9, times: [0, 0.45, 0.7, 1], ease: "easeOut" }}
            />
          )}

          {hasFilm && (
            <video
              ref={filmRef}
              className="intro-film"
              src={art.introFilm}
              muted
              playsInline
              preload="auto"
              style={{ opacity: playing ? 1 : 0 }}
              onEnded={finish}
              onError={finish}
            />
          )}

          {playing && !hasFilm && (
            <>
              <motion.div
                className="intro-layer"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ delay: T.curtains, duration: T.wall - T.curtains + 0.5, times: [0, 0.35, 0.75, 1] }}
              >
                <motion.div
                  className="intro-still intro-curtains"
                  style={{ backgroundImage: `url(${art.curtains})` }}
                  initial={{ x: "0%", scale: 1.2 }}
                  animate={{ x: "-34%", scale: 1.05 }}
                  transition={{ delay: T.curtains, duration: 1.7, ease: EASE }}
                />
              </motion.div>

              <motion.div
                className="intro-layer intro-wall-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ delay: T.wall, duration: T.stage - T.wall + 0.6, times: [0, 0.14, 0.86, 1] }}
              >
                <motion.img
                  ref={wallRef}
                  className="intro-wall"
                  src={art.archWall}
                  alt=""
                  onLoad={measureWall}
                  initial={{ x: 0 }}
                  animate={{ x: -wallShift }}
                  transition={{ delay: T.wall, duration: T.stage - T.wall + 0.4, ease: EASE }}
                />
              </motion.div>

              <motion.div
                className="intro-layer intro-stage"
                style={{ backgroundImage: `url(${art.stage})` }}
                initial={{ opacity: 0, scale: 1.14 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  opacity: { delay: T.stage, duration: 0.6 },
                  scale: { delay: T.stage, duration: 1.1, ease: EASE },
                }}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Flourish({ under = false }) {
  return under ? (
    <svg className="flourish flourish-under" viewBox="0 0 220 12" aria-hidden="true">
      <path d="M2 6 H92 M128 6 H218" stroke="currentColor" strokeWidth="0.8" />
      <path d="M96 6 c4 -6 10 -6 14 0 c4 6 10 6 14 0 M110 6 c-3 -4 -3 -4 0 -5 c3 1 3 1 0 5" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="94" cy="6" r="1.4" fill="currentColor" />
      <circle cx="126" cy="6" r="1.4" fill="currentColor" />
    </svg>
  ) : (
    <svg className="flourish" viewBox="0 0 60 16" aria-hidden="true">
      <path d="M30 2 v12 M30 6 c-6 -5 -14 -1 -10 4 c2 2 5 1 5 -1 M30 6 c6 -5 14 -1 10 4 c-2 2 -5 1 -5 -1 M14 14 H46" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}
