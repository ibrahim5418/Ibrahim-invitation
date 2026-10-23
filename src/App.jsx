import { MotionConfig } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { wedding } from "./config";
import Intro from "./components/Intro";
import Hero from "./components/Hero";
import ScratchDate from "./components/ScratchDate";
import { Blessed, Closing, Festivities, Hearts, Venue } from "./components/Sections";
import MusicButton from "./components/MusicButton";

export default function App() {
  const [ready, setReady] = useState(false);
  const audioRef = useRef(null);

  // the page stays still until the intro has finished
  useEffect(() => {
    document.documentElement.classList.toggle("is-locked", !ready);
    if (!ready) window.scrollTo(0, 0);
  }, [ready]);

  const handleTap = () => {
    // audio must start inside the tap itself, or mobile browsers block it
    if (wedding.music) audioRef.current?.play().catch(() => {});
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="page">
        <Hero ready={ready} />
        <Blessed />
        <ScratchDate />
        <Festivities />
        <Hearts />
        <Venue />
        <Closing />
      </main>
      {wedding.music && <MusicButton ref={audioRef} src={wedding.music} />}
      <Intro onTap={handleTap} onDone={() => setReady(true)} />
    </MotionConfig>
  );
}
