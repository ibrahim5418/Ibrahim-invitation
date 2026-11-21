import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const BARS = 5;
// which frequency bins drive each bar: bass in the middle, highs at the edges, so it reads as a wave
const BIN_FOR_BAR = [10, 4, 1, 6, 14];
const FADE_IN_S = 2.5;

/*
 * The round gold control pinned top-right. While the song plays, its bars rise and fall
 * with the music itself and soft rings ripple outward from the button.
 * The parent calls ref.start() from inside the tap-to-open tap, so mobile browsers allow sound.
 */
const MusicButton = forwardRef(function MusicButton({ src }, ref) {
  const audioRef = useRef(null);
  const btnRef = useRef(null);
  const barRefs = useRef([]);
  const graph = useRef(null); // { ctx, analyser, gain, data }
  const wasPlaying = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [reactive, setReactive] = useState(false);

  // route the song through an analyser so the bars can follow it; falls back to CSS bars
  const ensureGraph = () => {
    if (graph.current !== null) return graph.current;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.78;
      const gain = ctx.createGain();
      source.connect(analyser).connect(gain).connect(ctx.destination);
      graph.current = { ctx, analyser, gain, data: new Uint8Array(analyser.frequencyBinCount) };
      setReactive(true);
    } catch {
      graph.current = false;
    }
    return graph.current;
  };

  const play = (fade = false) => {
    const a = audioRef.current;
    const g = ensureGraph();
    if (g) {
      g.ctx.resume();
      if (fade) {
        const t = g.ctx.currentTime;
        g.gain.gain.cancelScheduledValues(t);
        g.gain.gain.setValueAtTime(0.0001, t);
        g.gain.gain.exponentialRampToValueAtTime(1, t + FADE_IN_S);
      }
    }
    return a.play().catch(() => {});
  };

  useImperativeHandle(ref, () => ({ start: () => play(true) }));

  useEffect(() => {
    const a = audioRef.current;
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    a.addEventListener("play", on);
    a.addEventListener("pause", off);
    // stop the song while the guest is in another app or tab, and pick it back up on return
    const onVisibility = () => {
      if (document.hidden) {
        wasPlaying.current = !a.paused;
        a.pause();
      } else if (wasPlaying.current) {
        play();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      a.removeEventListener("play", on);
      a.removeEventListener("pause", off);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // drive the bars and the halo from the live spectrum
  useEffect(() => {
    if (!playing || !reactive) return;
    const { analyser, data } = graph.current;
    let raf;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < BARS; i++) {
        const v = data[BIN_FOR_BAR[i]] / 255;
        sum += v;
        const el = barRefs.current[i];
        if (el) el.style.transform = `scaleY(${0.18 + v * 0.82})`;
      }
      btnRef.current?.style.setProperty("--level", (sum / BARS).toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      barRefs.current.forEach(el => el && (el.style.transform = ""));
      btnRef.current?.style.setProperty("--level", "0");
    };
  }, [playing, reactive]);

  const toggle = () => (audioRef.current.paused ? play() : audioRef.current.pause());

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        ref={btnRef}
        className={`music ${playing ? "is-playing" : ""} ${reactive ? "is-reactive" : ""}`}
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        aria-pressed={playing}
      >
        <i className="music-wave" aria-hidden="true" />
        <i className="music-wave" aria-hidden="true" />
        <i className="music-wave" aria-hidden="true" />
        <span className="music-bars" aria-hidden="true">
          {Array.from({ length: BARS }, (_, i) => (
            <span key={i} ref={el => (barRefs.current[i] = el)} />
          ))}
        </span>
      </button>
    </>
  );
});

export default MusicButton;
