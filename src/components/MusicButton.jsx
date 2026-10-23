import { forwardRef, useEffect, useState } from "react";

/* The round cocoa control pinned top-right, with equalizer bars that move while music plays. */
const MusicButton = forwardRef(function MusicButton({ src }, audioRef) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    a.addEventListener("play", on);
    a.addEventListener("pause", off);
    return () => {
      a.removeEventListener("play", on);
      a.removeEventListener("pause", off);
    };
  }, [audioRef]);

  const toggle = () => {
    const a = audioRef.current;
    a.paused ? a.play().catch(() => {}) : a.pause();
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button className={`music ${playing ? "is-playing" : ""}`} onClick={toggle} aria-label={playing ? "Pause music" : "Play music"}>
        <span /><span /><span />
      </button>
    </>
  );
});

export default MusicButton;
