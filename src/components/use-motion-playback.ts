"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** One playback gate for visibility, user control, and the system motion preference. */
export function useMotionPlayback(elementRef: RefObject<HTMLElement | null>) {
  const [paused, setPaused] = useState(false);
  const [running, setRunning] = useState(false);
  const active = useRef(true);
  const played = useRef(false);
  const observe = useRef<() => void>(() => {});
  const sync = useRef<() => void>(() => {});
  const setActive = useCallback((value: boolean) => {
    const changed = value !== active.current;
    active.current = value;
    if (changed && value) observe.current();
    sync.current();
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      const play = visible && active.current && !paused && !document.hidden && !preference.matches;
      if (play) played.current = true;
      element.style.setProperty("--motion-state", play ? "running" : "paused");
      element.dataset.motion = play ? "running" : played.current ? "paused" : "ready";
      setRunning(previous => previous === play ? previous : play);
    };
    sync.current = update;
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }, { threshold: .1 });
    observe.current = () => { observer.unobserve(element); observer.observe(element); };
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    preference.addEventListener("change", update);
    update();
    return () => { observer.disconnect(); sync.current = () => {}; observe.current = () => {}; document.removeEventListener("visibilitychange", update); preference.removeEventListener("change", update); };
  }, [elementRef, paused]);

  return { paused, running, setPaused, setActive };
}
