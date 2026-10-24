import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { art, wedding } from "../config";
import Reveal from "./Reveal";
import { DiamondRule, Garland, Kicker } from "./Ornaments";

const BRUSH = 30;
const CLEAR_AT = 0.45;

/* Blush foil with a soft sheen and fine gold glitter, like the reference card. */
function paintFoil(canvas) {
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  ctx.globalCompositeOperation = "source-over";
  const g = ctx.createRadialGradient(w * 0.42, h * 0.38, 0, w / 2, h / 2, w * 0.7);
  g.addColorStop(0, "#F3DCD6");
  g.addColorStop(0.55, "#E6C0B8");
  g.addColorStop(1, "#D7A9A1");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const sheen = ctx.createLinearGradient(0, 0, w, h);
  sheen.addColorStop(0.3, "rgba(255,255,255,0)");
  sheen.addColorStop(0.48, "rgba(255,255,255,0.28)");
  sheen.addColorStop(0.62, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  const s = w / canvas.clientWidth;
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = Math.random() < 0.6 ? `rgba(201,160,94,${0.35 + Math.random() * 0.5})` : `rgba(255,255,255,${0.4 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, (0.5 + Math.random() * 1.1) * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

/*
 * Traces the frame's empty white window (flood fill from its centre) and
 * returns its bounding box plus a mask of its exact shape, so the foil fills
 * the window edge to edge without covering the drapes or the chandelier.
 */
async function traceWindow(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const W = 344, H = Math.round((W * img.naturalHeight) / img.naturalWidth);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, W, H);
  const px = ctx.getImageData(0, 0, W, H).data;
  const isWhite = i => px[i * 4] > 232 && px[i * 4 + 1] > 228 && px[i * 4 + 2] > 222;

  let inside = new Uint8Array(W * H);
  const stack = [Math.round(H * 0.62) * W + (W >> 1)];
  while (stack.length) {
    const i = stack.pop();
    if (inside[i] || !isWhite(i)) continue;
    inside[i] = 1;
    const x = i % W;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (i >= W) stack.push(i - W);
    if (i < W * (H - 1)) stack.push(i + W);
  }
  // grow 2px so the foil tucks just under the window's soft edge
  for (let pass = 0; pass < 2; pass++) {
    const grown = inside.slice();
    for (let i = 0; i < inside.length; i++) {
      if (inside[i]) continue;
      const x = i % W;
      if ((x > 0 && inside[i - 1]) || (x < W - 1 && inside[i + 1]) || inside[i - W] || inside[i + W]) grown[i] = 1;
    }
    inside = grown;
  }

  let l = W, r = 0, t = H, b = 0;
  for (let i = 0; i < inside.length; i++) {
    if (!inside[i]) continue;
    const x = i % W, y = (i / W) | 0;
    if (x < l) l = x;
    if (x > r) r = x;
    if (y < t) t = y;
    if (y > b) b = y;
  }
  const m = document.createElement("canvas");
  m.width = r - l + 1;
  m.height = b - t + 1;
  const mctx = m.getContext("2d");
  const out = mctx.createImageData(m.width, m.height);
  for (let y = t; y <= b; y++)
    for (let x = l; x <= r; x++)
      if (inside[y * W + x]) out.data[((y - t) * m.width + (x - l)) * 4 + 3] = 255;
  mctx.putImageData(out, 0, 0);

  const pct = (v, total) => `${((v / total) * 100).toFixed(2)}%`;
  return {
    left: pct(l, W),
    right: pct(W - 1 - r, W),
    top: pct(t, H),
    bottom: pct(H - 1 - b, H),
    mask: `url(${m.toDataURL()})`,
  };
}

export default function ScratchDate() {
  const { reveal } = wedding;
  const windowRef = useRef(null);
  const canvasRef = useRef(null);
  const last = useRef(null);
  const moves = useRef(0);
  const started = useRef(false);
  const [frameOk, setFrameOk] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [burstAt, setBurstAt] = useState(null);
  const [fit, setFit] = useState(null);

  useEffect(() => {
    traceWindow(art.scratchFrame).then(setFit).catch(() => {});
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = windowRef.current;
    const size = () => {
      if (started.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = box.clientWidth * dpr;
      canvas.height = box.clientHeight * dpr;
      paintFoil(canvas);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const scratch = e => {
    started.current = true;
    const canvas = canvasRef.current;
    const r = canvas.getBoundingClientRect();
    const s = canvas.width / r.width;
    const p = { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "#000"; // erasing uses the stroke's alpha, so it must be opaque
    ctx.lineWidth = BRUSH * s;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo((last.current ?? p).x, (last.current ?? p).y);
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
    last.current = p;
    if (++moves.current % 6 === 0) check();
  };

  const check = () => {
    if (revealed) return;
    const c = canvasRef.current;
    const { data } = c.getContext("2d").getImageData(0, 0, c.width, c.height);
    let clear = 0, n = 0;
    for (let i = 3; i < data.length; i += 4 * 20) {
      n++;
      if (data[i] < 40) clear++;
    }
    if (clear / n > CLEAR_AT) {
      const r = windowRef.current.getBoundingClientRect();
      setBurstAt({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      setRevealed(true);
    }
  };

  return (
    <section className="sec sec-beige scratch-sec">
      <Garland className="garland-top" />
      <Reveal>
        <Kicker>A date to hold close</Kicker>
        <AnimatePresence mode="wait">
          <motion.h2
            key={revealed ? "after" : "before"}
            className="script heading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            {revealed ? "Our forever begins" : "Scratch to Reveal"}
          </motion.h2>
        </AnimatePresence>
        <DiamondRule />
      </Reveal>

      <Reveal>
        <div className={`scratch-frame ${frameOk ? "" : "is-fallback"}`}>
          <div
            className="scratch-window"
            ref={windowRef}
            style={
              fit && frameOk
                ? {
                    left: fit.left, right: fit.right, top: fit.top, bottom: fit.bottom,
                    borderRadius: 0,
                    WebkitMaskImage: fit.mask, maskImage: fit.mask,
                    WebkitMaskSize: "100% 100%", maskSize: "100% 100%",
                  }
                : undefined
            }
          >
            <div className="scratch-date">
              <p className="scratch-invited">You’re invited!</p>
              <p className="scratch-day">{reveal.date}</p>
              <p className="scratch-time">{reveal.dayTime}</p>
            </div>
            <canvas
              ref={canvasRef}
              className={`scratch-foil ${revealed ? "is-cleared" : ""}`}
              onPointerDown={e => {
                e.currentTarget.setPointerCapture(e.pointerId);
                last.current = null;
                scratch(e);
              }}
              onPointerMove={e => e.buttons && scratch(e)}
              onPointerUp={() => {
                last.current = null;
                check();
              }}
              aria-label="Scratch to reveal the date"
            />
          </div>
          {frameOk && <img className="scratch-frame-art" src={art.scratchFrame} alt="" onError={() => setFrameOk(false)} />}
        </div>
      </Reveal>
      {burstAt && <PetalRain origin={burstAt} />}
    </section>
  );
}

const PETAL_COLORS = ["#D9999B", "#E8B6B0", "#C98486", "#F0CFC8", "#C9A25E", "#DDBB7C"];

/* Petals burst up from the card, then tumble down the whole screen. */
function PetalRain({ origin }) {
  const petals = useRef(
    [...Array(34)].map((_, i) => {
      const spread = (Math.random() - 0.5) * 340;
      const up = 140 + Math.random() * 260;
      const vh = window.innerHeight;
      return {
        size: 7 + Math.random() * 9,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
        x: [0, spread * 0.6, spread, spread + (Math.random() - 0.5) * 120],
        y: [0, -up, -up * 0.4, vh - origin.y + 60],
        rotate: [0, 120, 260, 420 + Math.random() * 300],
        duration: 3.4 + Math.random() * 1.8,
        delay: Math.random() * 0.25,
      };
    })
  ).current;

  return createPortal(
    <div className="petal-rain" style={{ left: origin.x, top: origin.y }} aria-hidden="true">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="petal"
          style={{ width: p.size, height: p.size * 1.35, background: p.color }}
          initial={{ opacity: 0 }}
          animate={{ x: p.x, y: p.y, rotate: p.rotate, opacity: [0, 1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, times: [0, 0.22, 0.55, 1], ease: "easeOut" }}
        />
      ))}
    </div>,
    document.body
  );
}
