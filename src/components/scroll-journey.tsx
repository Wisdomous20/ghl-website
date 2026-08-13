"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import styles from "./enginara-landing.module.css";

const FILM_DURATION = 15;

export function ScrollJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [activePanel, setActivePanel] = useState<"imagine" | "build" | "manage">(
    "imagine",
  );
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [duration, setDuration] = useState(FILM_DURATION);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 96,
    damping: 30,
    mass: 0.2,
    restDelta: 0.001,
  });

  const trackX = useTransform(
    progress,
    [0, 0.1, 0.27, 0.3, 0.68, 0.85, 1],
    prefersReducedMotion
      ? ["0%", "0%", "0%", "0%", "0%", "0%", "0%"]
      : ["0%", "0%", "-33.333%", "-33.333%", "-33.333%", "-66.666%", "-66.666%"],
  );
  const filmProgress = useTransform(progress, [0.3, 0.68], [0, 1]);
  const filmLabel = useTransform(
    filmProgress,
    [0, 0.28, 0.72, 1],
    ["Imagine", "Assemble", "Operate", "Operate"],
  );
  const filmScale = useTransform(
    progress,
    [0.24, 0.31, 0.67, 0.76],
    prefersReducedMotion ? [1, 1, 1, 1] : [0.9, 1, 1.035, 0.98],
  );
  const startImageScale = useTransform(
    progress,
    [0, 0.28],
    prefersReducedMotion ? [1, 1] : [1, 1.08],
  );
  const endImageScale = useTransform(
    progress,
    [0.68, 1],
    prefersReducedMotion ? [1, 1] : [1.08, 1],
  );

  useMotionValueEvent(filmProgress, "change", (latest) => {
    if (prefersReducedMotion || videoFailed || !videoRef.current) {
      return;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 1) {
        return;
      }

      const targetTime = Math.min(
        Math.max(latest, 0) * duration,
        Math.max(duration - 0.04, 0),
      );

      if (Math.abs(video.currentTime - targetTime) > 0.03) {
        video.currentTime = targetTime;
      }
    });
  });

  useMotionValueEvent(progress, "change", (latest) => {
    const nextPanel = latest < 0.24 ? "imagine" : latest < 0.85 ? "build" : "manage";
    setActivePanel((currentPanel) =>
      currentPanel === nextPanel ? currentPanel : nextPanel,
    );
  });

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section
      aria-label="From imagination to operation"
      className={styles.journey}
      data-reduced-motion={prefersReducedMotion || undefined}
      id="story"
      ref={sectionRef}
    >
      <div className={styles.journeySticky}>
        <motion.div className={styles.journeyTrack} style={{ x: trackX }}>
          <article className={`${styles.journeyPanel} ${styles.imaginePanel}`}>
            <div className={styles.imagineCopy}>
              <p className={styles.chapterLabel}><span>01</span> You imagine</p>
              <h1>
                Begin with the
                <span>what if.</span>
              </h1>
              <p className={styles.chapterIntro}>
                A better workflow. A new service. A system your team has needed for
                years. Bring us the opportunity before it has all the answers.
              </p>
              <div className={styles.imaginePrompt}>
                <span aria-hidden="true" />
                Scroll into the idea
              </div>
            </div>

            <div className={styles.imagineVisual}>
              <motion.div className={styles.journeyImage} style={{ scale: startImageScale }}>
                <Image
                  alt="A hand draws an orange line toward an unfinished miniature workshop"
                  fill
                  preload
                  sizes="(max-width: 768px) 100vw, 68vw"
                  src="/media/enginara-story-start.webp"
                />
              </motion.div>
              <p className={styles.frameNote}>The first line / Enginara story film</p>
            </div>
          </article>

          <article className={`${styles.journeyPanel} ${styles.buildPanel}`}>
            <div className={styles.buildCopy}>
              <p className={styles.chapterLabel}><span>02</span> We build</p>
              <h2>Enter the work.</h2>
              <p className={styles.chapterIntro}>
                We turn intent into a useful operating system: the software, connections,
                and decisions that make the work move.
              </p>
              <ul className={styles.buildDisciplines}>
                <li><span>01</span> Product and platform</li>
                <li><span>02</span> Workflow automation</li>
                <li><span>03</span> Connected operations</li>
              </ul>
            </div>

            <motion.div className={styles.buildCinema} style={{ scale: filmScale }}>
              <Image
                alt=""
                className={styles.filmPoster}
                fill
                sizes="(max-width: 768px) 100vw, 68vw"
                src="/media/enginara-story-start.webp"
              />
              <video
                aria-hidden="true"
                className={styles.storyVideo}
                data-failed={videoFailed}
                data-ready={videoReady}
                muted
                onCanPlay={() => {
                  setVideoFailed(false);
                  setVideoReady(true);
                }}
                onError={() => setVideoFailed(true)}
                onLoadedMetadata={(event) => {
                  setVideoFailed(false);
                  setVideoReady(true);
                  event.currentTarget.pause();
                  const mediaDuration = event.currentTarget.duration;
                  const nextDuration = Number.isFinite(mediaDuration)
                    ? mediaDuration
                    : FILM_DURATION;
                  setDuration(nextDuration);
                  event.currentTarget.currentTime = Math.min(
                    Math.max(filmProgress.get(), 0) * nextDuration,
                    Math.max(nextDuration - 0.04, 0),
                  );
                }}
                playsInline
                poster="/media/enginara-story-start.webp"
                preload="auto"
                ref={videoRef}
                tabIndex={-1}
              >
                <source
                  media="(max-width: 47.99rem)"
                  src="/media/enginara-story-master-720.mp4?v=2"
                  type="video/mp4"
                />
                <source src="/media/enginara-story-master.mp4?v=2" type="video/mp4" />
              </video>
              <div aria-hidden="true" className={styles.cinemaFrame} />
              <div className={styles.cinemaMeta}>
                <motion.span>{filmLabel}</motion.span>
                <span>Scroll controls time</span>
              </div>
            </motion.div>
          </article>

          <article className={`${styles.journeyPanel} ${styles.managePanel}`}>
            <div className={styles.manageVisual}>
              <motion.div className={styles.journeyImage} style={{ scale: endImageScale }}>
                <Image
                  alt="A complete miniature business world operating around one continuous orange route"
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  src="/media/enginara-story-end.webp"
                />
              </motion.div>
              <div className={styles.liveTag}><i /> System in motion</div>
            </div>

            <div className={styles.manageCopy}>
              <p className={styles.chapterLabel}><span>03</span> We manage</p>
              <h2>Built is only the beginning.</h2>
              <p className={styles.chapterIntro}>
                We stay with the system after launch: supporting the people who use it,
                watching how it performs, and improving what comes next.
              </p>
              <a
                className={styles.chapterLink}
                href="#services"
                tabIndex={activePanel === "manage" ? 0 : -1}
              >
                See the three disciplines <span aria-hidden="true">↘</span>
              </a>
            </div>
          </article>
        </motion.div>

        <div aria-hidden="true" className={styles.journeyRail}>
          <div className={styles.railLabels}>
            <span>Imagine</span>
            <span>Build</span>
            <span>Manage</span>
          </div>
          <div className={styles.railTrack}>
            <motion.i style={{ scaleX: progress }} />
          </div>
        </div>
      </div>
    </section>
  );
}
