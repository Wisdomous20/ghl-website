"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { EnginaraMark } from "./enginara-mark";
import styles from "./cinematic-home.module.css";

const FILM_DURATION = 15;

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    addEventListener?: (type: "change", callback: () => void) => void;
    removeEventListener?: (type: "change", callback: () => void) => void;
  };
};

function subscribeToMotionPreference(callback: () => void) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const shortViewport = window.matchMedia("(max-height: 34rem)");
  const connection = (navigator as NavigatorWithConnection).connection;
  reducedMotion.addEventListener("change", callback);
  shortViewport.addEventListener("change", callback);
  connection?.addEventListener?.("change", callback);
  return () => {
    reducedMotion.removeEventListener("change", callback);
    shortViewport.removeEventListener("change", callback);
    connection?.removeEventListener?.("change", callback);
  };
}

function getMotionPreference() {
  const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shortViewport = window.matchMedia("(max-height: 34rem)").matches;
  return !reducedMotion && !shortViewport && !saveData;
}

function getServerMotionPreference() {
  return false;
}

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function mapProgress(value: number, start: number, end: number) {
  return clamp((value - start) / (end - start));
}

const chapters = ["Imagine", "Build", "Automate", "Manage"];
const MotionImage = motion.create(Image);
type FilmSeekState = {
  inFlight: boolean;
  pending: number | null;
};

export function CinematicHome() {
  const journeyRef = useRef<HTMLElement>(null);
  const filmARef = useRef<HTMLVideoElement>(null);
  const filmBRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const latestProgressRef = useRef(0);
  const previousProgressRef = useRef(0);
  const lastDirectionRef = useRef<1 | -1>(1);
  const durationARef = useRef(FILM_DURATION);
  const durationBRef = useRef(FILM_DURATION);
  const seekARef = useRef<FilmSeekState>({ inFlight: false, pending: null });
  const seekBRef = useRef<FilmSeekState>({ inFlight: false, pending: null });
  const canUseVideo = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
  const [activeChapter, setActiveChapter] = useState(0);
  const [filmBRequested, setFilmBRequested] = useState(false);

  const enhanced = canUseVideo;

  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ["start start", "end end"],
  });

  const decorativeProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 32,
    mass: 0.18,
    restDelta: 0.001,
  });
  const cameraProgress = useSpring(scrollYProgress, {
    stiffness: 155,
    damping: 34,
    mass: 0.26,
    restDelta: 0.0005,
  });
  const sceneProgress = useSpring(scrollYProgress, {
    stiffness: 185,
    damping: 38,
    mass: 0.28,
    restDelta: 0.0005,
  });

  const cameraScale = useTransform(
    cameraProgress,
    [0, 0.23, 0.5, 0.73, 0.91, 1],
    [1.08, 1, 1.055, 1.025, 1, 1],
  );
  const cameraX = useTransform(
    cameraProgress,
    [0, 0.28, 0.52, 0.76, 1],
    ["0%", "-1.2%", "1%", "-0.5%", "0%"],
  );
  const filmAOpacity = useTransform(
    sceneProgress,
    [0, 0.475, 0.515, 1],
    [1, 1, 0, 0],
  );
  const filmBOpacity = useTransform(
    sceneProgress,
    [0, 0.475, 0.515, 1],
    [0, 0, 1, 1],
  );
  const startPosterOpacity = useTransform(
    sceneProgress,
    [0, 0.06, 0.4, 0.49, 1],
    [1, 1, 0, 0, 0],
  );
  const corePosterOpacity = useTransform(
    sceneProgress,
    [0, 0.06, 0.4, 0.84, 0.93, 1],
    [0, 0, 1, 1, 0, 0],
  );
  const endPosterOpacity = useTransform(
    sceneProgress,
    [0, 0.84, 0.93, 1],
    [0, 0, 1, 1],
  );
  const gradeOpacity = useTransform(
    sceneProgress,
    [0, 0.05, 0.19, 0.3, 0.47, 0.58, 0.74, 0.83, 0.92],
    [0.34, 0.28, 0.08, 0.18, 0.08, 0.14, 0.03, 0.13, 0.02],
  );

  const introOpacity = useTransform(
    sceneProgress,
    [0, 0.025, 0.14, 0.19],
    [1, 1, 1, 0],
  );
  const introY = useTransform(sceneProgress, [0, 0.14, 0.19], [0, 0, -12]);

  const buildMatteScale = useTransform(
    sceneProgress,
    [0.225, 0.285, 0.47, 0.535],
    [0, 1, 1, 0],
  );
  const buildCopyOpacity = useTransform(
    sceneProgress,
    [0.25, 0.3, 0.46, 0.515],
    [0, 1, 1, 0],
  );
  const buildCopyY = useTransform(
    sceneProgress,
    [0.25, 0.3, 0.46, 0.515],
    [16, 0, 0, -14],
  );

  const automateBandX = useTransform(
    sceneProgress,
    [0.49, 0.555, 0.7, 0.77],
    ["105%", "0%", "0%", "-105%"],
  );
  const automateCopyOpacity = useTransform(
    sceneProgress,
    [0.525, 0.57, 0.69, 0.745],
    [0, 1, 1, 0],
  );
  const automateCopyY = useTransform(
    sceneProgress,
    [0.525, 0.57, 0.69, 0.745],
    [16, 0, 0, -14],
  );

  const manageMatteScale = useTransform(
    sceneProgress,
    [0.71, 0.775, 0.875, 0.925],
    [0, 1, 1, 0],
  );
  const manageCopyOpacity = useTransform(
    sceneProgress,
    [0.745, 0.79, 0.87, 0.915],
    [0, 1, 1, 0],
  );
  const manageCopyY = useTransform(
    sceneProgress,
    [0.745, 0.79, 0.87, 0.915],
    [16, 0, 0, -12],
  );

  const resolveY = useTransform(
    sceneProgress,
    [0.91, 0.958, 1],
    ["101%", "0%", "0%"],
  );
  const resolveCopyOpacity = useTransform(
    sceneProgress,
    [0.947, 0.975, 1],
    [0, 1, 1],
  );
  const resolveCopyY = useTransform(
    sceneProgress,
    [0.947, 0.975, 1],
    [18, 0, 0],
  );
  const resolveMarkX = useTransform(
    sceneProgress,
    [0.94, 0.985, 1],
    ["-16%", "0%", "0%"],
  );

  const headerColor = useTransform(
    sceneProgress,
    [0, 0.91, 0.96, 1],
    ["#f7f4ed", "#f7f4ed", "#171717", "#171717"],
  );
  const headerCtaBackground = useTransform(
    sceneProgress,
    [0, 0.91, 0.96, 1],
    ["#ee681f", "#ee681f", "#171717", "#171717"],
  );
  const headerCtaColor = useTransform(
    sceneProgress,
    [0, 0.91, 0.96, 1],
    ["#171717", "#171717", "#f7f4ed", "#f7f4ed"],
  );

  const seekFilm = useCallback(
    (
      video: HTMLVideoElement | null,
      target: number,
      seekState: FilmSeekState,
    ) => {
      seekState.pending = target;

      if (!video || video.readyState < 1 || seekState.inFlight) {
        return;
      }

      const nextTarget = seekState.pending;
      seekState.pending = null;

      if (
        nextTarget === null ||
        Math.abs(video.currentTime - nextTarget) <= 1 / 48
      ) {
        return;
      }

      seekState.inFlight = true;
      if ("fastSeek" in video && typeof video.fastSeek === "function") {
        video.fastSeek(nextTarget);
      } else {
        video.currentTime = nextTarget;
      }
    },
    [],
  );

  const settleFilmSeek = useCallback(
    (chapter: "a" | "b") => {
      const video = chapter === "a" ? filmARef.current : filmBRef.current;
      const seekState = chapter === "a" ? seekARef.current : seekBRef.current;
      seekState.inFlight = false;

      if (seekState.pending !== null) {
        seekFilm(video, seekState.pending, seekState);
      }
    },
    [seekFilm],
  );

  const syncFilms = useCallback((progress: number) => {
    latestProgressRef.current = progress;

    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const filmA = filmARef.current;
      const filmB = filmBRef.current;
      const latestProgress = latestProgressRef.current;
      const targetA =
        mapProgress(latestProgress, 0, 0.49) *
        Math.max(durationARef.current - 0.04, 0);
      const targetB =
        mapProgress(latestProgress, 0.49, 0.915) *
        Math.max(durationBRef.current - 0.04, 0);

      seekFilm(filmA, targetA, seekARef.current);
      seekFilm(filmB, targetB, seekBRef.current);
    });
  }, [seekFilm]);

  const driveFilms = useCallback(
    (progress: number) => {
      const movingForward = progress >= previousProgressRef.current;
      lastDirectionRef.current = movingForward ? 1 : -1;
      previousProgressRef.current = progress;
      latestProgressRef.current = progress;

      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current);
      }

      const filmA = filmARef.current;
      const filmB = filmBRef.current;

      if (movingForward && progress < 0.915) {
        const activeFilm = progress < 0.49 ? filmA : filmB;
        const inactiveFilm = progress < 0.49 ? filmB : filmA;
        const duration = progress < 0.49
          ? durationARef.current
          : durationBRef.current;
        const target = progress < 0.49
          ? mapProgress(progress, 0, 0.49) * Math.max(duration - 0.04, 0)
          : mapProgress(progress, 0.49, 0.915) * Math.max(duration - 0.04, 0);

        inactiveFilm?.pause();

        if (activeFilm && activeFilm.readyState >= 2) {
          const distance = Math.max(target - activeFilm.currentTime, 0);
          if (distance > 1 / 48) {
            activeFilm.playbackRate = Math.min(
              Math.max(distance / 0.2, 0.45),
              4.5,
            );
            void activeFilm.play().catch(() => {
              syncFilms(progress);
            });
          } else {
            activeFilm.pause();
          }
        }
      } else {
        filmA?.pause();
        filmB?.pause();
        syncFilms(progress);
      }

      pauseTimerRef.current = window.setTimeout(() => {
        pauseTimerRef.current = null;
        const latestProgress = latestProgressRef.current;
        filmARef.current?.pause();
        filmBRef.current?.pause();

        if (lastDirectionRef.current < 0 || latestProgress >= 0.915) {
          syncFilms(latestProgress);
        }
      }, 180);
    },
    [syncFilms],
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextChapter = latest < 0.25 ? 0 : latest < 0.52 ? 1 : latest < 0.74 ? 2 : 3;
    setActiveChapter((current) => (current === nextChapter ? current : nextChapter));

    if (enhanced) {
      if (latest >= 0.28) {
        setFilmBRequested(true);
      }
    }
  });

  useEffect(() => {
    if (!enhanced) {
      return;
    }

    const driveFromViewport = () => {
      const journey = journeyRef.current;
      if (!journey) {
        return;
      }

      const journeyTop = window.scrollY + journey.getBoundingClientRect().top;
      const journeyTravel = Math.max(
        journey.offsetHeight - window.innerHeight,
        1,
      );
      const progress = clamp((window.scrollY - journeyTop) / journeyTravel);
      driveFilms(progress);
    };

    window.addEventListener("scroll", driveFromViewport, { passive: true });
    return () => window.removeEventListener("scroll", driveFromViewport);
  }, [driveFilms, enhanced]);

  useEffect(() => {
    if (!enhanced) {
      return;
    }

    let resyncFrame: number | null = null;
    const resyncFromViewport = () => {
      if (resyncFrame !== null) {
        cancelAnimationFrame(resyncFrame);
      }

      resyncFrame = requestAnimationFrame(() => {
        const journey = journeyRef.current;
        const journeyTop = journey
          ? window.scrollY + journey.getBoundingClientRect().top
          : 0;
        const journeyTravel = journey
          ? Math.max(journey.offsetHeight - window.innerHeight, 1)
          : 1;
        const currentProgress = journey
          ? clamp((window.scrollY - journeyTop) / journeyTravel)
          : scrollYProgress.get();

        scrollYProgress.set(currentProgress);
        previousProgressRef.current = currentProgress;
        if (currentProgress >= 0.28) {
          setFilmBRequested(true);
        }
        syncFilms(currentProgress);
      });
    };
    const resyncWhenVisible = () => {
      if (document.visibilityState === "visible") {
        resyncFromViewport();
      }
    };

    filmARef.current?.load();
    resyncFromViewport();
    window.addEventListener("load", resyncFromViewport);
    window.addEventListener("pageshow", resyncFromViewport);
    window.addEventListener("resize", resyncFromViewport);
    document.addEventListener("visibilitychange", resyncWhenVisible);

    return () => {
      if (resyncFrame !== null) {
        cancelAnimationFrame(resyncFrame);
      }
      window.removeEventListener("load", resyncFromViewport);
      window.removeEventListener("pageshow", resyncFromViewport);
      window.removeEventListener("resize", resyncFromViewport);
      document.removeEventListener("visibilitychange", resyncWhenVisible);
    };
  }, [enhanced, scrollYProgress, syncFilms]);

  useEffect(() => {
    if (enhanced && filmBRequested) {
      filmBRef.current?.load();
    }
  }, [enhanced, filmBRequested]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  const handleMetadata = (chapter: "a" | "b", video: HTMLVideoElement) => {
    video.pause();
    const duration = Number.isFinite(video.duration) ? video.duration : FILM_DURATION;
    const seekState = chapter === "a" ? seekARef.current : seekBRef.current;
    seekState.inFlight = false;
    seekState.pending = null;

    if (chapter === "a") {
      durationARef.current = duration;
    } else {
      durationBRef.current = duration;
    }

    const journey = journeyRef.current;
    const journeyTop = journey
      ? window.scrollY + journey.getBoundingClientRect().top
      : 0;
    const journeyTravel = journey
      ? Math.max(journey.offsetHeight - window.innerHeight, 1)
      : 1;
    const viewportProgress = journey
      ? clamp((window.scrollY - journeyTop) / journeyTravel)
      : scrollYProgress.get();

    previousProgressRef.current = viewportProgress;
    syncFilms(viewportProgress);
  };

  return (
    <main className={styles.home} id="top">
      <a className={styles.skipLink} href="#after-story">Skip cinematic story</a>

      <motion.header
        className={styles.header}
        data-enhanced={enhanced ? "true" : undefined}
        style={{ color: headerColor }}
      >
        <a aria-label="Enginara home" className={styles.logo} href="#top">
          <EnginaraMark className={styles.logoMark} />
          <span>enginara</span>
        </a>
        <p className={styles.headerPrompt}>Software / automation / ownership</p>
        <div className={styles.headerActions}>
          <a className={styles.skipStory} href="#after-story">Skip story</a>
          <motion.a
            className={styles.headerCta}
            href="mailto:hello@enginara.com?subject=New%20Enginara%20project"
            style={{ backgroundColor: headerCtaBackground, color: headerCtaColor }}
          >
            Start a project <span aria-hidden="true">↗</span>
          </motion.a>
        </div>
      </motion.header>

      <section
        aria-label="You imagine. We build. We automate. We manage."
        className={styles.journey}
        data-enhanced={enhanced ? "true" : undefined}
        ref={journeyRef}
      >
        <div className={styles.storyTranscript}>
          <h1>You imagine.</h1>
          <p>Start with what should work better.</p>
          <h2>We build.</h2>
          <p>Structure, logic, and interfaces shaped around your operation.</p>
          <h2>We automate.</h2>
          <p>One action triggers the next. Work moves without chasing.</p>
          <h2>We manage.</h2>
          <p>Built is only the beginning. We keep the system useful.</p>
          <p>You imagine. We build. We manage. What should work better?</p>
        </div>

        <div aria-hidden="true" className={styles.stickyStage}>
          <motion.div
            aria-hidden="true"
            className={styles.camera}
            style={{ scale: cameraScale, x: cameraX }}
          >
            <MotionImage
              alt=""
              className={styles.poster}
              fill
              preload
              sizes="100vw"
              src="/media/enginara-foundry-start.webp"
              style={{ opacity: startPosterOpacity }}
            />
            <MotionImage
              alt=""
              className={`${styles.poster} ${styles.corePoster}`}
              fill
              sizes="100vw"
              src="/media/enginara-foundry-core.webp"
              style={{ opacity: corePosterOpacity }}
            />
            <MotionImage
              alt=""
              className={`${styles.poster} ${styles.endPoster}`}
              fill
              sizes="100vw"
              src="/media/enginara-foundry-end.webp"
              style={{ opacity: endPosterOpacity }}
            />
            <motion.video
              className={styles.film}
              muted
              onLoadedMetadata={(event) => handleMetadata("a", event.currentTarget)}
              onSeeked={() => settleFilmSeek("a")}
              playsInline
              poster="/media/enginara-foundry-start.webp"
              preload="auto"
              ref={filmARef}
              style={{ opacity: filmAOpacity }}
              tabIndex={-1}
            >
              {enhanced ? (
                <>
                  <source
                    media="(max-width: 47.99rem)"
                    src="/media/enginara-cinematic-a-720.mp4?v=2"
                    type="video/mp4"
                  />
                  <source src="/media/enginara-cinematic-a.mp4?v=2" type="video/mp4" />
                </>
              ) : null}
            </motion.video>
            <motion.video
              className={styles.film}
              muted
              onLoadedMetadata={(event) => handleMetadata("b", event.currentTarget)}
              onSeeked={() => settleFilmSeek("b")}
              playsInline
              poster="/media/enginara-foundry-core.webp"
              preload="metadata"
              ref={filmBRef}
              style={{ opacity: filmBOpacity }}
              tabIndex={-1}
            >
              {enhanced && filmBRequested ? (
                <>
                  <source
                    media="(max-width: 47.99rem)"
                    src="/media/enginara-cinematic-b-720.mp4?v=2"
                    type="video/mp4"
                  />
                  <source src="/media/enginara-cinematic-b.mp4?v=2" type="video/mp4" />
                </>
              ) : null}
            </motion.video>
          </motion.div>

          <motion.div
            aria-hidden="true"
            className={styles.colorGrade}
            style={{ opacity: gradeOpacity }}
          />

          <motion.article
            aria-hidden={activeChapter !== 0}
            className={`${styles.scene} ${styles.introScene}`}
            style={{ opacity: introOpacity, y: introY }}
          >
            <p className={styles.eyebrow}><span>01</span> Imagine</p>
            <h1>You imagine.</h1>
            <p>Start with what should work better.</p>
            <span className={styles.scrollCue}>Scroll to set it in motion</span>
          </motion.article>

          <motion.div
            aria-hidden="true"
            className={styles.buildMatte}
            style={{ scaleX: buildMatteScale }}
          />
          <motion.article
            aria-hidden={activeChapter !== 1}
            className={`${styles.scene} ${styles.buildScene}`}
            style={{ opacity: buildCopyOpacity, y: buildCopyY }}
          >
            <p className={styles.eyebrow}><span>02</span> Software development</p>
            <h2>We build.</h2>
            <p>Structure, logic, and interfaces shaped around your operation.</p>
          </motion.article>

          <motion.div
            aria-hidden="true"
            className={styles.automateBand}
            style={{ x: automateBandX }}
          />
          <motion.article
            aria-hidden={activeChapter !== 2}
            className={`${styles.scene} ${styles.automateScene}`}
            style={{ opacity: automateCopyOpacity, x: automateBandX, y: automateCopyY }}
          >
            <p className={styles.eyebrow}><span>03</span> Workflow automation</p>
            <h2>We automate.</h2>
            <p>One action triggers the next. Work moves without chasing.</p>
          </motion.article>

          <motion.div
            aria-hidden="true"
            className={styles.manageMatte}
            style={{ scaleX: manageMatteScale }}
          />
          <motion.article
            aria-hidden={activeChapter !== 3}
            className={`${styles.scene} ${styles.manageScene}`}
            style={{ opacity: manageCopyOpacity, y: manageCopyY }}
          >
            <p className={styles.eyebrow}><span>04</span> Managed operation</p>
            <h2>We manage.</h2>
            <p>Built is only the beginning. We keep the system useful.</p>
          </motion.article>

          <motion.section className={styles.resolve} style={{ y: resolveY }}>
            <motion.div aria-hidden="true" className={styles.resolveMarkWrap} style={{ x: resolveMarkX }}>
              <EnginaraMark className={styles.resolveMark} />
            </motion.div>
            <motion.div
              className={styles.resolveCopy}
              style={{ opacity: resolveCopyOpacity, y: resolveCopyY }}
            >
              <p className={styles.eyebrow}>One continuous partner</p>
              <h2 id="resolve-title">
                You imagine.<br />
                We build.<br />
                We manage.
              </h2>
              <p>What should work better?</p>
              <a
                className={styles.resolveCta}
                href="mailto:hello@enginara.com?subject=New%20Enginara%20project"
                tabIndex={-1}
              >
                Start a project <span aria-hidden="true">↗</span>
              </a>
            </motion.div>
          </motion.section>

          <div aria-hidden="true" className={styles.progressRail}>
            <div className={styles.chapterLabels}>
              {chapters.map((chapter, index) => (
                <span data-active={activeChapter === index || undefined} key={chapter}>
                  {chapter}
                </span>
              ))}
            </div>
            <div className={styles.progressTrack}>
              <motion.i style={{ scaleX: decorativeProgress }} />
            </div>
          </div>
        </div>

        <div className={styles.staticStory}>
          <StaticBeat
            image="/media/enginara-foundry-start.webp"
            index="01"
            label="Imagine"
            primary
            title="You imagine."
            text="Start with what should work better."
          />
          <StaticBeat
            image="/media/enginara-foundry-core.webp"
            index="02"
            label="Software development"
            title="We build."
            text="Structure, logic, and interfaces shaped around your operation."
          />
          <StaticBeat
            image="/media/enginara-foundry-core.webp"
            index="03"
            label="Workflow automation"
            title="We automate."
            text="One action triggers the next. Work moves without chasing."
          />
          <StaticBeat
            image="/media/enginara-foundry-end.webp"
            index="04"
            label="Managed operation"
            title="We manage."
            text="Built is only the beginning. We keep the system useful."
          />
          <section className={styles.staticResolve}>
            <EnginaraMark className={styles.staticResolveMark} />
            <h2>You imagine. We build. We manage.</h2>
            <p>What should work better?</p>
            <a href="mailto:hello@enginara.com?subject=New%20Enginara%20project">
              Start a project <span aria-hidden="true">↗</span>
            </a>
          </section>
        </div>

      </section>

      <footer className={styles.footer} id="after-story" tabIndex={-1}>
        <span>
          <EnginaraMark className={styles.footerMark} />
          enginara
        </span>
        <p>
          Software development / workflow automation / technical ownership<br />
          <a href="mailto:hello@enginara.com">hello@enginara.com</a>
        </p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}

function StaticBeat({
  image,
  index,
  label,
  primary = false,
  title,
  text,
}: {
  image: string;
  index: string;
  label: string;
  primary?: boolean;
  title: string;
  text: string;
}) {
  return (
    <article className={styles.staticBeat}>
      <div className={styles.staticImage}>
        <Image
          alt=""
          fill
          sizes="(max-width: 47.99rem) 100vw, 60vw"
          src={image}
        />
      </div>
      <div className={styles.staticCopy}>
        <p className={styles.eyebrow}><span>{index}</span> {label}</p>
        {primary ? <h1>{title}</h1> : <h2>{title}</h2>}
        <p>{text}</p>
      </div>
    </article>
  );
}
