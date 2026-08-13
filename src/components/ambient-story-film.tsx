"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./enginara-landing.module.css";

export function AmbientStoryFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;

    if (!container || !video) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }

        setShouldLoad(true);
      },
      { rootMargin: "35% 0px", threshold: 0.05 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!shouldLoad || !video) {
      return;
    }

    video.load();
    void video.play().catch(() => setIsPlaying(false));
  }, [shouldLoad]);

  if (hasFailed) {
    return null;
  }

  const togglePlayback = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
    setIsPlaying(false);
  };

  return (
    <div className={styles.ambientFilm} ref={containerRef}>
      <video
        aria-hidden="true"
        loop
        muted
        onError={() => setHasFailed(true)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        playsInline
        preload="none"
        ref={videoRef}
      >
        {shouldLoad ? (
          <source src="/media/enginara-story-master-720.mp4?v=2" type="video/mp4" />
        ) : null}
      </video>
      <button
        aria-label={isPlaying ? "Pause story motion" : "Play story motion"}
        className={styles.motionControl}
        onClick={togglePlayback}
        type="button"
      >
        <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
        {isPlaying ? "Pause motion" : "Play motion"}
      </button>
    </div>
  );
}
