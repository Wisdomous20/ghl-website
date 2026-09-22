"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { phase } from "./assembly-story";
import styles from "./opening-film.module.css";

const FINISHED_HOLD_MS = 5000;
const PAPER_RESET_MS = 550;

/** The drawing returns softly to paper between loops; scrolling never waits for it. */
export function OpeningFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const colorId = useId().replace(/:/g, "");
  const userPaused = useRef(false);
  const togglePlayback = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const player = video.current;
    if (!player || failed) return;
    let disposed = false;
    let animation = 0;
    let running = false;
    let stage: "drawing" | "hold" | "reset" = "drawing";
    let elapsed = 0;
    let lastTick: number | null = null;
    let lastOpacity = -1;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const paint = (opacity: number) => {
      if (opacity === lastOpacity) return;
      frame.current?.style.setProperty("--drawing-opacity", String(opacity));
      lastOpacity = opacity;
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(animation);
      lastTick = null;
      player.pause();
      setPlaying(false);
    };
    const play = () => {
      void player.play().catch((error: unknown) => {
        if (!disposed && error instanceof DOMException && error.name === "NotAllowedError") {
          userPaused.current = true;
          stop();
        }
      });
    };
    const tick = (now: number) => {
      if (disposed || !running) return;
      const delta = lastTick === null ? 0 : now - lastTick;
      lastTick = now;
      if (stage === "drawing") paint(phase(player.currentTime, .06, .48));
      else {
        elapsed += delta;
        if (stage === "hold" && elapsed >= FINISHED_HOLD_MS) {
          stage = "reset";
          elapsed = 0;
        }
        if (stage === "reset") {
          paint(1 - phase(elapsed, 0, PAPER_RESET_MS));
          if (elapsed >= PAPER_RESET_MS) {
            stage = "drawing";
            elapsed = 0;
            player.currentTime = 0;
            play();
          }
        }
      }
      animation = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (motion.matches || document.hidden || window.scrollY > window.innerHeight * .65 || userPaused.current) {
        stop();
        return;
      }
      if (running) return;
      running = true;
      lastTick = null;
      setPlaying(true);
      if (!player.getAttribute("src")) player.src = "/media/enginara-word-drawing.mp4";
      if (stage === "drawing") play();
      animation = requestAnimationFrame(tick);
    };
    const hold = () => {
      stage = "hold";
      elapsed = 0;
      lastTick = null;
      paint(1);
    };
    const reveal = () => frame.current?.setAttribute("data-started", "true");
    togglePlayback.current = () => { userPaused.current = !userPaused.current; sync(); };
    player.addEventListener("ended", hold);
    player.addEventListener("playing", reveal);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      disposed = true;
      cancelAnimationFrame(animation);
      togglePlayback.current = () => {};
      player.removeEventListener("ended", hold);
      player.removeEventListener("playing", reveal);
      player.pause();
      window.removeEventListener("scroll", sync);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [failed]);

  return <div className={styles.film}>
    <svg width="0" height="0" aria-hidden="true" className={styles.colorFilters}><defs>
      <filter id={`${colorId}-film`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 .043 0 1 0 0 .082 0 0 1 0 .125 0 0 0 1 0" /></filter>
      <filter id={`${colorId}-still`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 .016 0 1 0 0 .047 0 0 1 0 .086 0 0 0 1 0" /></filter>
    </defs></svg>
    <div className={styles.frame} ref={frame} data-failed={failed} aria-hidden="true">
      <Image className={styles.still} src="/media/enginara-word-sketch.webp" alt="" fill sizes="100vw" preload style={{ filter: `url(#${colorId}-still)` }} />
      {!failed && <video ref={video} muted playsInline preload="none" poster="/media/enginara-word-drawing-first.webp" style={{ filter: `url(#${colorId}-film)` }}
        onError={() => setFailed(true)} />}
    </div>
    {!failed && <button className={styles.control} onClick={() => togglePlayback.current()} aria-label={playing ? "Pause the Enginara drawing loop" : "Play the Enginara drawing loop"}><svg viewBox="0 0 20 22" width="18" height="20" aria-hidden="true"><path d={playing ? "M6 3 5.7 19 M13.5 3.2 13.2 19" : "M4 3 16 11 4.4 19 4 3"} /></svg>{playing ? "Pause drawing" : "Play drawing"}</button>}
  </div>;
}
