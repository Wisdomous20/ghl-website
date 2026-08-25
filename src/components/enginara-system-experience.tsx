"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { EnginaraMark } from "./enginara-mark";
import type { EnginaraWorld, SceneMetric } from "./enginara-world";
import styles from "./enginara-system-experience.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

type FlowStep = {
  human?: boolean;
  label: string;
};

type ActivePath = "custom" | "proven";

const flows: Record<string, FlowStep[]> = {
  leads: [
    { label: "Lead capture" },
    { label: "AI qualification" },
    { label: "CRM" },
    { label: "Automated follow-up" },
    { label: "Appointment booking" },
    { human: true, label: "Human handoff" },
  ],
  sales: [
    { label: "CRM pipeline" },
    { label: "Deal stages" },
    { label: "Task automation" },
    { label: "Proposal generation" },
    { label: "E-signature" },
    { label: "Revenue dashboard" },
  ],
  service: [
    { label: "Intake" },
    { label: "AI assistant" },
    { label: "Ticket routing" },
    { label: "Knowledge base" },
    { human: true, label: "Human support" },
    { label: "CSAT reporting" },
  ],
  operations: [
    { label: "Process mapping" },
    { label: "Workflow automation" },
    { label: "Task assignment" },
    { label: "SOP portal" },
    { human: true, label: "Operations team" },
    { label: "KPI dashboard" },
  ],
  reporting: [
    { label: "Data sources" },
    { label: "Integration layer" },
    { label: "Data warehouse" },
    { label: "KPI engine" },
    { label: "Live dashboard" },
    { human: true, label: "Weekly review" },
  ],
  administration: [
    { label: "Document intake" },
    { label: "Data-entry automation" },
    { label: "Approvals" },
    { label: "Billing and invoicing" },
    { label: "Records" },
    { human: true, label: "Admin support" },
  ],
  other: [
    { label: "Your idea" },
    { human: true, label: "Discovery call" },
    { label: "Architecture" },
    { label: "Build and integrate" },
    { label: "Launch" },
    { human: true, label: "Managed support" },
  ],
};

const flowChoices = [
  ["leads", "Leads"],
  ["sales", "Sales"],
  ["service", "Customer service"],
  ["operations", "Operations"],
  ["reporting", "Reporting"],
  ["administration", "Administration"],
  ["other", "Something else"],
] as const;

const processStages = [
  {
    body: "The business, workflow, bottlenecks, users, and goals are mapped before anything is built.",
    label: "Discover",
    number: "01",
    title: "Understand the system you already are",
  },
  {
    body: "Technology, workflow, automation, data, and integrations are drawn as one blueprint.",
    label: "Architect",
    number: "02",
    title: "Design before code",
  },
  {
    body: "Develop, configure, integrate, test, and launch—on a custom build or proven foundation.",
    label: "Build & deploy",
    number: "03",
    title: "Modules connect. Data starts to flow.",
  },
  {
    body: "Train, optimize, maintain, and, when you want it, help operate the system day to day.",
    label: "Operate & improve",
    number: "04",
    title: "Live—and looked after",
  },
] as const;

const capabilityNames = [
  "Custom software",
  "Web and mobile apps",
  "AI agents",
  "Workflow automation",
  "CRM",
  "Integrations",
  "Cloud infrastructure",
  "Operations",
  "Marketing automation",
  "Finance and administration",
  "Customer support",
  "Reporting and analytics",
];

export function EnginaraSystemExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const filmStartedRef = useRef(false);
  const labelHostRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<EnginaraWorld | null>(null);
  const motionPausedRef = useRef(false);
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<ActivePath | null>(null);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [motionResolved, setMotionResolved] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [filmReady, setFilmReady] = useState(false);
  const [worldFailed, setWorldFailed] = useState(false);
  const [worldReady, setWorldReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const desktop = window.matchMedia("(min-width: 60rem) and (min-height: 38rem)");
    const connection = (navigator as NavigatorWithConnection).connection;
    const update = () => {
      setMotionEnabled(
        desktop.matches && !reducedMotion.matches && !connection?.saveData,
      );
      setMotionResolved(true);
    };
    update();
    reducedMotion.addEventListener("change", update);
    desktop.addEventListener("change", update);
    return () => {
      reducedMotion.removeEventListener("change", update);
      desktop.removeEventListener("change", update);
    };
  }, []);

  const measureScenes = useCallback(() => {
    const root = rootRef.current;
    if (!root) return [];
    const viewport = window.innerHeight;
    return Array.from(root.querySelectorAll<HTMLElement>("[data-scene]")).map(
      (section): SceneMetric => ({
        height: section.offsetHeight,
        top: section.getBoundingClientRect().top + window.scrollY,
        viewport,
      }),
    );
  }, []);

  useEffect(() => {
    if (!motionEnabled || worldFailed) return;
    const canvas = canvasRef.current;
    const labelHost = labelHostRef.current;
    const tooltip = tooltipRef.current;
    if (!canvas || !labelHost || !tooltip) return;

    let cancelled = false;
    let world: EnginaraWorld | null = null;

    const handlePointer = (event: PointerEvent) => {
      world?.setPointer(
        (event.clientX / window.innerWidth - 0.5) * 2,
        (event.clientY / window.innerHeight - 0.5) * 2,
        event.clientX,
        event.clientY,
      );
    };
    const handleResize = () => {
      world?.resize();
      world?.setMetrics(measureScenes());
      world?.setScroll(window.scrollY);
    };

    void import("./enginara-world")
      .then(({ createEnginaraWorld }) => {
        if (cancelled) return;
        world = createEnginaraWorld({
          canvas,
          labelHost,
          onFailure: () => setWorldFailed(true),
          onReady: () => setWorldReady(true),
          tooltip,
        });
        worldRef.current = world;
        world.setMetrics(measureScenes());
        world.setScroll(window.scrollY);
        world.setPaused(motionPausedRef.current);
        window.addEventListener("pointermove", handlePointer, { passive: true });
        window.addEventListener("resize", handleResize, { passive: true });
      })
      .catch(() => setWorldFailed(true));

    return () => {
      cancelled = true;
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("resize", handleResize);
      world?.destroy();
      if (worldRef.current === world) worldRef.current = null;
      setWorldReady(false);
    };
  }, [measureScenes, motionEnabled, worldFailed]);

  useEffect(() => {
    motionPausedRef.current = motionPaused;
    worldRef.current?.setPaused(motionPaused);
    const film = filmRef.current;
    if (!film) return;
    if (!motionEnabled || motionPaused || !filmStartedRef.current) {
      film.pause();
      return;
    }
    void film.play().catch(() => {
      // The poster remains visible when autoplay is blocked by the browser.
    });
  }, [filmReady, motionEnabled, motionPaused]);

  useGSAP(
    () => {
      if (!motionEnabled) return;
      const root = rootRef.current;
      if (!root) return;

      const hero = root.querySelector<HTMLElement>("#hero");
      const heroBrand = root.querySelector<HTMLElement>("[data-hero-mark]");
      const heroLogoStage = root.querySelector<HTMLElement>("[data-hero-logo]");
      const heroLogo = heroLogoStage?.querySelector<SVGSVGElement>("svg");
      const heroWord = root.querySelector<HTMLElement>("[data-hero-word]");
      const heroSub = root.querySelector<HTMLElement>("[data-hero-sub]");
      const heroLines = gsap.utils.toArray<HTMLElement>("[data-hero-line]");
      const logoPulses = gsap.utils.toArray<HTMLElement>("[data-logo-pulse]");
      const heroSystemCue = root.querySelector<HTMLElement>(
        "[data-hero-system-cue]",
      );
      const scrollCue = root.querySelector<HTMLElement>("[data-scroll-cue]");
      const headerBrand = root.querySelector<HTMLElement>("[data-header-brand]");
      const headerActions = root.querySelector<HTMLElement>(
        "[data-header-actions]",
      );
      const brandFilm = root.querySelector<HTMLVideoElement>("[data-brand-film]");
      const split = root.querySelector<HTMLElement>("#split");
      const problem = root.querySelector<HTMLElement>("#problem");
      const final = root.querySelector<HTMLElement>("#final");

      const logoRects = heroLogo
        ? Array.from(heroLogo.querySelectorAll<SVGRectElement>("rect"))
        : [];
      const structuralRails = [logoRects[0], logoRects[2], logoRects[3]].filter(
        (rail): rail is SVGRectElement => Boolean(rail),
      );
      const signalTerminal = logoRects[1];

      gsap.set([heroWord, heroSub, ...heroLines, scrollCue, heroSystemCue], {
        autoAlpha: 0,
      });
      gsap.set(heroWord, { y: 14 });
      gsap.set(heroLines, { y: 14 });
      gsap.set(heroSystemCue, { y: 14 });
      gsap.set(headerBrand, { autoAlpha: 0 });
      gsap.set(headerActions, { autoAlpha: 0, y: -10 });
      gsap.set(brandFilm, { opacity: 0, scale: 1.01 });
      gsap.set(logoPulses, {
        autoAlpha: 0,
        scaleX: 0,
        transformOrigin: "left center",
      });
      if (structuralRails.length) {
        gsap.set(structuralRails, {
          scaleX: 0,
          transformOrigin: "left center",
        });
      }
      if (signalTerminal) {
        gsap.set(signalTerminal, {
          autoAlpha: 0,
          scale: 0.82,
          transformOrigin: "center",
          xPercent: 165,
        });
      }

      const intro = gsap.timeline({ delay: 0.12 });
      if (structuralRails.length) {
        intro.to(
          structuralRails,
          {
            duration: 0.72,
            ease: "power4.out",
            scaleX: 1,
            stagger: 0.1,
          },
          0.18,
        );
      }
      if (signalTerminal) {
        intro.to(
          signalTerminal,
          {
            autoAlpha: 1,
            duration: 0.62,
            ease: "power4.inOut",
            scale: 1,
            xPercent: 0,
          },
          0.7,
        );
      }
      intro
        .to(
          logoPulses,
          {
            autoAlpha: 0.92,
            duration: 0.48,
            ease: "power4.out",
            scaleX: 1,
            stagger: 0.07,
          },
          1.08,
        )
        .to(
          logoPulses,
          { autoAlpha: 0, duration: 0.28, stagger: 0.04 },
          1.34,
        )
        .to(
          heroWord,
          { autoAlpha: 1, duration: 0.62, ease: "power4.out", y: 0 },
          1.16,
        )
        .to(
          heroSub,
          { autoAlpha: 1, duration: 0.48, ease: "power3.out" },
          1.38,
        )
        .to(
          heroLines,
          {
            autoAlpha: 1,
            duration: 0.52,
            ease: "power4.out",
            stagger: 0.12,
            y: 0,
          },
          1.5,
        )
        .to(
          scrollCue,
          { autoAlpha: 1, duration: 0.48, ease: "power3.out" },
          1.98,
        );

      if (hero && heroBrand && headerBrand) {
        const settleIntro = () => {
          if (intro.progress() < 1) intro.progress(1).kill();
        };
        const startFilm = () => {
          if (!brandFilm) return;
          if (!filmStartedRef.current) {
            if (brandFilm.readyState > 0) brandFilm.currentTime = 0;
            filmStartedRef.current = true;
          }
          if (!motionPausedRef.current) {
            void brandFilm.play().catch(() => {
              // The poster remains available if muted playback is blocked.
            });
          }
        };
        const resetFilm = () => {
          if (!brandFilm) return;
          brandFilm.pause();
          if (brandFilm.readyState > 0) brandFilm.currentTime = 0;
          filmStartedRef.current = false;
        };
        const handoff = gsap.timeline({
          scrollTrigger: {
            end: "52% top",
            invalidateOnRefresh: true,
            onEnter: () => {
              settleIntro();
              startFilm();
            },
            onLeaveBack: resetFilm,
            scrub: 0.18,
            start: "10% top",
            trigger: hero,
          },
        });
        handoff
          .fromTo(
            [heroWord, heroSub, ...heroLines, scrollCue],
            { autoAlpha: 1, y: 0 },
            {
              autoAlpha: 0,
              duration: 0.42,
              ease: "none",
              immediateRender: false,
              stagger: 0.018,
              y: -16,
            },
            0,
          )
          .to(
            heroLogoStage,
            {
              autoAlpha: 0,
              duration: 0.62,
              ease: "none",
              scale: 0.62,
              transformOrigin: "center",
              y: "27vh",
            },
            0.08,
          )
          .to(
            [headerBrand, headerActions],
            { autoAlpha: 1, duration: 0.28, ease: "none", y: 0 },
            0.66,
          )
          .to(
            heroSystemCue,
            { autoAlpha: 1, duration: 0.38, ease: "none", y: 0 },
            0.42,
          )
          .to(
            heroSystemCue,
            { autoAlpha: 0, duration: 0.18, ease: "none", y: -6 },
            0.86,
          );
        if (brandFilm) {
          handoff.to(
            brandFilm,
            { duration: 0.62, ease: "none", opacity: 0.15, scale: 1.035 },
            0.42,
          );
        }
        if (window.scrollY > hero.offsetTop + hero.offsetHeight * 0.1) {
          settleIntro();
          startFilm();
        }
      }

      if (brandFilm && split) {
        gsap.to(brandFilm, {
          ease: "none",
          opacity: 0.08,
          scale: 1.06,
          scrollTrigger: {
            end: "top 15%",
            scrub: 0.18,
            start: "top bottom",
            trigger: split,
          },
        });
      }

      root
        .querySelectorAll<HTMLElement>("[data-scene]:not(#hero):not(#process)")
        .forEach((scene) => {
          const elements = Array.from(
            scene.querySelectorAll<HTMLElement>("[data-reveal]"),
          );
          if (!elements.length) return;
          gsap.fromTo(
            elements,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              ease: "none",
              stagger: 0.08,
              scrollTrigger: {
                end: "top 48%",
                scrub: 0.18,
                start: "top 88%",
                trigger: scene,
              },
              y: 0,
            },
          );
          if (scene.id !== "final") {
            gsap.to(elements, {
              autoAlpha: 0,
              ease: "none",
              stagger: 0.025,
              scrollTrigger: {
                end: "bottom 70%",
                scrub: 0.18,
                start: "bottom bottom",
                trigger: scene,
              },
              y: -16,
            });
          }
        });

      if (problem) {
        ScrollTrigger.create({
          end: "bottom top",
          onEnter: () => {
            root.dataset.headerTone = "light";
          },
          onEnterBack: () => {
            root.dataset.headerTone = "light";
          },
          onLeave: () => {
            root.dataset.headerTone = "signal";
          },
          onLeaveBack: () => {
            root.dataset.headerTone = "dark";
          },
          start: "top 76px",
          trigger: problem,
        });
      }

      if (final) {
        ScrollTrigger.create({
          end: "bottom top",
          onEnter: () => {
            root.dataset.headerTone = "signal";
          },
          onEnterBack: () => {
            root.dataset.headerTone = "signal";
          },
          onLeaveBack: () => {
            root.dataset.headerTone = "light";
          },
          start: "top top",
          trigger: final,
        });
      }

      const process = root.querySelector<HTMLElement>("#process");
      const stages = Array.from(
        root.querySelectorAll<HTMLElement>("[data-process-stage]"),
      );
      if (process) {
        const stageRail = process.querySelector<HTMLElement>("[data-stage-rail]");
        ScrollTrigger.create({
          end: "bottom bottom",
          onUpdate: (self) => {
            const active = Math.min(3, Math.floor(self.progress * 4.0001));
            stages.forEach((stage, index) => {
              stage.dataset.active = index === active ? "true" : "false";
              stage.dataset.complete = index < active ? "true" : "false";
            });
          },
          start: "top bottom",
          trigger: process,
        });
        if (stageRail) {
          gsap.to(stageRail, {
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: {
              end: "bottom 70%",
              scrub: 0.18,
              start: "bottom bottom",
              trigger: process,
            },
            y: -16,
          });
        }
      }

      const updateWorld = () => {
        worldRef.current?.setScroll(window.scrollY);
        const documentTravel = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          1,
        );
        root.style.setProperty(
          "--journey-progress",
          String(Math.min(1, Math.max(0, window.scrollY / documentTravel))),
        );
      };
      ScrollTrigger.create({
        end: "bottom bottom",
        onRefresh: () => {
          worldRef.current?.setMetrics(measureScenes());
          updateWorld();
        },
        onUpdate: updateWorld,
        start: "top top",
        trigger: root,
      });
      ScrollTrigger.refresh();
      updateWorld();
    },
    {
      dependencies: [measureScenes, motionEnabled],
      revertOnUpdate: true,
      scope: rootRef,
    },
  );

  const scrollToScene = (id: string, focus = false) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({
      behavior: motionEnabled && !motionPaused ? "smooth" : "auto",
      block: "start",
    });
    if (focus) window.requestAnimationFrame(() => target.focus());
  };

  const handleSkip = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToScene("problem", true);
  };

  const currentFlow = activeFlow ? flows[activeFlow] : null;

  return (
    <div
      className={styles.experience}
      data-motion={
        motionResolved ? (motionEnabled ? "enabled" : "static") : "pending"
      }
      data-film={filmReady ? "ready" : "poster"}
      data-header-tone="dark"
      data-world={worldReady && !worldFailed ? "ready" : "fallback"}
      id="top"
      ref={rootRef}
    >
      <a className={styles.skipLink} href="#problem" onClick={handleSkip}>
        Skip immersive story
      </a>

      <div aria-hidden="true" className={styles.visualLayer}>
        <div className={styles.fallbackVisual} />
        <video
          className={styles.brandFilm}
          data-brand-film
          loop
          muted
          onCanPlay={() => setFilmReady(true)}
          playsInline
          poster="/media/enginara-identity-film-poster.webp"
          preload="metadata"
          ref={filmRef}
        >
          {motionEnabled ? (
            <source src="/media/enginara-identity-film-2k.mp4" type="video/mp4" />
          ) : null}
        </video>
        <canvas className={styles.canvas} ref={canvasRef} tabIndex={-1} />
        <div className={styles.labels} ref={labelHostRef} />
        <div className={styles.vignette} />
        <div className={styles.grain} />
      </div>

      <div
        aria-hidden="true"
        className={styles.tooltip}
        ref={tooltipRef}
      >
        <span className={styles.tooltipName} data-tooltip-name />
        <span className={styles.tooltipDescription} data-tooltip-description />
      </div>

      <header className={styles.header}>
        <a
          aria-label="Enginara home"
          className={styles.brand}
          data-header-brand
          href="#top"
        >
          <EnginaraMark className={styles.brandMark} />
          <span className={styles.brandWord}>Enginara</span>
        </a>
        <div className={styles.headerActions} data-header-actions>
          {motionEnabled ? (
            <button
              aria-label={
                motionPaused ? "Resume background motion" : "Pause background motion"
              }
              aria-pressed={motionPaused}
              className={styles.motionControl}
              onClick={() => setMotionPaused((current) => !current)}
              type="button"
            >
              <span aria-hidden="true" className={styles.motionGlyph}>
                {motionPaused ? "▶" : "Ⅱ"}
              </span>
              {motionPaused ? "Resume background" : "Pause background"}
            </button>
          ) : null}
          <a
            className={styles.headerCta}
            href="mailto:hello@enginara.com?subject=New%20Enginara%20project"
          >
            Start a project
          </a>
        </div>
      </header>

      <div aria-hidden="true" className={styles.progressTrack}>
        <span />
      </div>

      <main className={styles.story}>
        <section className={`${styles.scene} ${styles.hero}`} data-scene id="hero">
          <div className={styles.hold}>
            <div className={styles.heroContent}>
              <div className={styles.heroBrand} data-hero-mark>
                <div className={styles.heroLogoStage} data-hero-logo>
                  <EnginaraMark className={styles.heroLogo} />
                  <span
                    aria-hidden="true"
                    className={`${styles.logoPulse} ${styles.logoPulseTop}`}
                    data-logo-pulse
                  />
                  <span
                    aria-hidden="true"
                    className={`${styles.logoPulse} ${styles.logoPulseMiddle}`}
                    data-logo-pulse
                  />
                  <span
                    aria-hidden="true"
                    className={`${styles.logoPulse} ${styles.logoPulseBottom}`}
                    data-logo-pulse
                  />
                </div>
                <p className={styles.heroMark} data-hero-word>
                  Enginara
                </p>
              </div>
              <p className={styles.heroSub} data-hero-sub>
                Software · Automation · AI systems · Managed operations
              </p>
              <h1 className={styles.heroLines}>
                <span data-hero-line>
                  You <em>imagine.</em>
                </span>
                <span data-hero-line>
                  We <em>build.</em>
                </span>
                <span data-hero-line>
                  We <em>manage.</em>
                </span>
              </h1>
              <p className={styles.scrollCue} data-scroll-cue>
                Scroll to enter the system
              </p>
              <p className={styles.heroSystemCue} data-hero-system-cue>
                <span aria-hidden="true" />
                One signal becomes a connected operating system.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.scene} data-scene id="split">
          <div className={`${styles.hold} ${styles.centeredHold}`}>
            <div className={styles.centeredCopy}>
              <p className={styles.eyebrow} data-reveal>
                Two ways in
              </p>
              <h2 className={styles.wideTitle} data-reveal>
                Every business system starts one of two ways.
              </h2>
              <p className={styles.lede} data-reveal>
                Build exactly what you imagine—or begin with a foundation we
                have already proven, then make it yours.
              </p>
              <div className={styles.splitPoles} data-reveal>
                <span>
                  <strong>Custom build</strong>
                  <small>From zero</small>
                </span>
                <span>
                  <strong>Proven systems</strong>
                  <small>From a foundation</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.scene} data-scene id="custom">
          <div className={`${styles.hold} ${styles.rightHold}`}>
            <div className={styles.copyBlock}>
              <p className={styles.eyebrow} data-reveal>
                Custom build
              </p>
              <h2 data-reveal>You imagine it. We engineer it.</h2>
              <p className={styles.lede} data-reveal>
                Bring an idea, a bottleneck, a workflow that should not be
                manual, or software that does not exist yet. We design and
                build it from scratch—applications, CRMs, AI agents, portals,
                APIs, dashboards, integrations, and the infrastructure below.
              </p>
              <p className={styles.closingLine} data-reveal>
                Start with an idea. Build exactly what the business needs.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.scene} data-scene id="proven">
          <div className={`${styles.hold} ${styles.leftHold}`}>
            <div className={styles.copyBlock}>
              <p className={styles.eyebrow} data-reveal>
                Proven Enginara systems
              </p>
              <h2 data-reveal>Start with something proven. Make it yours.</h2>
              <p className={styles.lede} data-reveal>
                You do not always need to start from zero. Our prebuilt CRM,
                lead management, sales pipeline, follow-up, booking, reporting,
                and support modules configure around your business and launch
                in weeks, not months.
              </p>
              <p className={styles.closingLine} data-reveal>
                A proven foundation, shaped to the way you already work.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.scene} data-scene id="paths">
          <div className={`${styles.hold} ${styles.centeredHold}`}>
            <div className={styles.pathContent}>
              <p className={styles.eyebrow} data-reveal>
                Choose your path
              </p>
              <h2 className={styles.wideTitle} data-reveal>
                Which way should your system begin?
              </h2>
              <div className={styles.paths} data-reveal>
                <button
                  className={styles.pathCard}
                  aria-pressed={activePath === "custom"}
                  data-selected={activePath === "custom" ? "true" : "false"}
                  onClick={() => {
                    setActivePath("custom");
                    worldRef.current?.setPathBias(-1);
                  }}
                  onPointerEnter={() => worldRef.current?.setPathBias(-1)}
                  onPointerLeave={() =>
                    worldRef.current?.setPathBias(
                      activePath === "custom"
                        ? -1
                        : activePath === "proven"
                          ? 1
                          : 0,
                    )
                  }
                  type="button"
                >
                  <span className={styles.pathNumber}>Path 01</span>
                  <strong>Build from scratch</strong>
                  <span>
                    A dedicated build for a problem no template solves—mapped,
                    architected, developed, and deployed around your operation.
                  </span>
                  <i>{activePath === "custom" ? "Selected" : "Select custom build →"}</i>
                </button>
                <button
                  className={`${styles.pathCard} ${styles.provenPath}`}
                  aria-pressed={activePath === "proven"}
                  data-selected={activePath === "proven" ? "true" : "false"}
                  onClick={() => {
                    setActivePath("proven");
                    worldRef.current?.setPathBias(1);
                  }}
                  onPointerEnter={() => worldRef.current?.setPathBias(1)}
                  onPointerLeave={() =>
                    worldRef.current?.setPathBias(
                      activePath === "custom"
                        ? -1
                        : activePath === "proven"
                          ? 1
                          : 0,
                    )
                  }
                  type="button"
                >
                  <span className={styles.pathNumber}>Path 02</span>
                  <strong>Start with a proven system</strong>
                  <span>
                    Launch on architecture that already works. We configure the
                    modules, connect your data, and switch it on.
                  </span>
                  <i>
                    {activePath === "proven"
                      ? "Selected"
                      : "Select proven foundation →"}
                  </i>
                </button>
              </div>
              <button
                className={styles.pathContinue}
                data-reveal
                disabled={!activePath}
                onClick={() => scrollToScene("capabilities")}
                type="button"
              >
                {activePath
                  ? `Continue with ${activePath === "custom" ? "a custom build" : "a proven foundation"}`
                  : "Select a starting point"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>

        <section className={styles.scene} data-scene id="capabilities">
          <div className={`${styles.hold} ${styles.bottomHold}`}>
            <div className={styles.copyBlock}>
              <p className={styles.eyebrow} data-reveal>
                The ecosystem
              </p>
              <h2 data-reveal>One partner. A lot of capability.</h2>
              <p className={styles.lede} data-reveal>
                Software, automation, AI, and operations are not separate
                vendors here. They are nodes in one connected system—designed,
                built, and run by the same team.
              </p>
              <p className={styles.pointerHint} data-reveal>
                Move your cursor through the operating system
              </p>
              <div className={styles.capabilityRails} data-reveal>
                <span>Software</span>
                <span>Automation</span>
                <span>AI systems</span>
                <span>Managed operations</span>
              </div>
              <ul className={styles.srOnly}>
                {capabilityNames.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.scene} data-scene id="support">
          <div className={`${styles.hold} ${styles.leftHold}`}>
            <div className={styles.copyBlock}>
              <p className={`${styles.eyebrow} ${styles.brass}`} data-reveal>
                Enginara managed support
              </p>
              <h2 data-reveal>Technology should not create another job for you.</h2>
              <p className={styles.lede} data-reveal>
                Once the system is live, a human operations layer keeps it
                running—monitoring, optimizing, and working inside it every day
                so you do not have to.
              </p>
              <div className={styles.supportList} data-reveal>
                {[
                  "Monitoring",
                  "Optimization",
                  "CRM management",
                  "Reporting",
                  "Troubleshooting",
                  "Data management",
                  "User support",
                  "Operations",
                ].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <p className={styles.supportClose} data-reveal>
                Software when technology is the answer. <em>People when it is not.</em>
              </p>
            </div>
          </div>
        </section>

        <section
          className={`${styles.scene} ${styles.process}`}
          data-scene
          id="process"
        >
          <div className={`${styles.hold} ${styles.leftHold}`}>
            <div className={styles.stageRail} data-stage-rail>
              {processStages.map((stage, index) => (
                <article
                  data-active={index === 0 ? "true" : "false"}
                  data-complete="false"
                  data-process-stage
                  key={stage.number}
                >
                  <p>
                    {stage.number} · {stage.label}
                  </p>
                  <h3>{stage.title}</h3>
                  <span>{stage.body}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`${styles.scene} ${styles.problem}`}
          data-scene
          data-tone="workbench"
          id="problem"
          tabIndex={-1}
        >
          <div className={`${styles.hold} ${styles.centeredHold}`}>
            <div className={styles.problemContent}>
              <p className={styles.eyebrow} data-reveal>
                Start here
              </p>
              <h2 className={styles.wideTitle} data-reveal>
                What should work better?
              </h2>
              <div className={styles.chips} data-reveal>
                {flowChoices.map(([value, label]) => (
                  <button
                    aria-pressed={activeFlow === value}
                    className={styles.chip}
                    data-selected={activeFlow === value ? "true" : "false"}
                    key={value}
                    onClick={() => setActiveFlow(value)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div
                aria-live="polite"
                className={styles.flowRegion}
                key={activeFlow ?? "empty"}
              >
                {currentFlow ? (
                  <div className={styles.flow}>
                    {currentFlow.map((step, index) => (
                      <span className={styles.flowPair} key={`${activeFlow}-${step.label}`}>
                        {index > 0 ? (
                          <motion.i
                            animate={{ opacity: 1, scaleX: 1 }}
                            aria-hidden="true"
                            className={styles.flowLink}
                            initial={
                              motionEnabled ? { opacity: 0, scaleX: 0 } : false
                            }
                            transition={{
                              delay: motionEnabled ? index * 0.1 : 0,
                              duration: motionEnabled ? 0.34 : 0,
                            }}
                          />
                        ) : null}
                        <motion.span
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className={styles.flowNode}
                          data-human={step.human ? "true" : "false"}
                          initial={
                            motionEnabled
                              ? { opacity: 0, scale: 0.86, y: 8 }
                              : false
                          }
                          transition={{
                            delay: motionEnabled ? index * 0.1 : 0,
                            duration: motionEnabled ? 0.44 : 0,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          {step.label}
                        </motion.span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.flowPrompt}>
                    Choose an area to assemble a working system.
                  </p>
                )}
              </div>

              {currentFlow ? (
                <motion.a
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.flowCta}
                  href="mailto:hello@enginara.com?subject=Build%20an%20Enginara%20system"
                  initial={motionEnabled ? { opacity: 0, y: 12 } : false}
                  transition={{
                    delay: motionEnabled ? currentFlow.length * 0.1 : 0,
                    duration: motionEnabled ? 0.5 : 0,
                  }}
                >
                  Build this for my business
                </motion.a>
              ) : null}
            </div>
          </div>
        </section>

        <section
          className={`${styles.scene} ${styles.final}`}
          data-scene
          data-tone="signal"
          id="final"
        >
          <div className={`${styles.hold} ${styles.centeredHold}`}>
            <div className={styles.finalContent}>
              <p className={styles.eyebrow} data-reveal>
                One system
              </p>
              <h2 className={styles.finalTitle} data-reveal>
                Your business already knows what it needs to become.
              </h2>
              <p className={styles.finalThen} data-reveal>
                We build the system <em>that gets it there.</em>
              </p>
              <div className={styles.finalActions} data-reveal>
                <a
                  className={styles.primaryButton}
                  href="mailto:hello@enginara.com?subject=New%20Enginara%20project"
                >
                  Start a project
                </a>
                <button
                  className={styles.secondaryButton}
                  onClick={() => scrollToScene("paths")}
                  type="button"
                >
                  Explore Enginara systems
                </button>
              </div>
              <div className={styles.finalSignature} data-reveal>
                <EnginaraMark className={styles.finalLogo} />
                <p className={styles.finalMark}>
                  Enginara · You imagine · We build · We manage
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Enginara</span>
        <span>Imagine → Architect → Build → Connect → Automate → Operate → Improve</span>
      </footer>
    </div>
  );
}
