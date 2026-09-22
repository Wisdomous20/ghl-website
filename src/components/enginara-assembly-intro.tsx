"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LaptopScene } from "./enginara-laptop-scene";
import { OpeningFilm } from "./opening-film";
import { PencilArrow, PencilUnderline, SketchLink } from "./sketch-controls";
import { AssemblyInspector } from "./assembly-inspector";
import type { AssemblyPartId } from "./assembly-parts";
import { BuildChapter, type BuildChapterHandle } from "./build-chapter";
import { ASSEMBLY_STORY, ASSEMBLY_PORTION, phase, storyOpacity } from "./assembly-story";
import styles from "./enginara-assembly-intro.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function EnginaraAssemblyIntro() {
  const root = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLElement>(null);
  const introCopy = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLDivElement>(null);
  const progressLine = useRef<HTMLSpanElement>(null);
  const sketchNotes = useRef<HTMLDivElement>(null);
  const openingDrawing = useRef<HTMLDivElement>(null);
  const buildChapter = useRef<BuildChapterHandle>(null);
  const narrative = useRef<HTMLDivElement>(null);
  const annotations = useRef<HTMLDivElement>(null);
  const controller = useRef<LaptopScene | null>(null);
  const progress = useRef({ value: 0 });
  const ink = useRef({ value: 0 });
  const restoredAnchor = useRef(false);
  const focusAfterSkip = useRef(false);
  const exploreButton = useRef<HTMLButtonElement>(null);
  const inspection = useRef<{ id: AssemblyPartId | null; amount: number; angle: number }>({ id: null, amount: 0, angle: 0 });
  const inspectionAngle = useRef(0);
  const inspectionProgress = useRef(0);
  const selectedRef = useRef<AssemblyPartId | null>(null);
  const [selected, setSelected] = useState<AssemblyPartId | null>(null);
  const [displayed, setDisplayed] = useState<AssemblyPartId | null>(null);
  const [hovered, setHovered] = useState<AssemblyPartId | null>(null);
  const [available, setAvailable] = useState<AssemblyPartId[]>([]);
  const [enhanced, setEnhanced] = useState(false);
  const [step, setStep] = useState(0);
  const selectPart = useCallback((id: AssemblyPartId) => {
    inspectionProgress.current = Math.min(1, progress.current.value / ASSEMBLY_PORTION);
    inspectionAngle.current = 0;
    inspection.current.angle = 0;
    selectedRef.current = id;
    setDisplayed(id); setSelected(id); setHovered(null);
  }, []);
  const rotatePart = useCallback((delta: number | null) => {
    inspectionAngle.current = delta === null ? 0 : inspectionAngle.current + delta;
    gsap.to(inspection.current, { angle: inspectionAngle.current, duration: .3, ease: "power2.out", overwrite: "auto",
      onUpdate: () => controller.current?.inspect(inspection.current.id, inspection.current.amount, inspection.current.angle) });
  }, []);
  const closePart = useCallback((restoreFocus = true) => {
    selectedRef.current = null;
    setSelected(null);
    if (restoreFocus) requestAnimationFrame(() => exploreButton.current?.focus({ preventScroll: true }));
  }, []);

  useGSAP(() => {
    if (!enhanced) return;
    gsap.killTweensOf(inspection.current);
    const p = progress.current.value / ASSEMBLY_PORTION;
    if (status.current) status.current.inert = p < .185 || p > .89 || Boolean(selected);
    if (selected) inspection.current.id = selected;
    const tween = gsap.to(inspection.current, {
      amount: selected ? 1 : 0, duration: selected ? .65 : .38, ease: "power3.out",
      onUpdate: () => controller.current?.inspect(inspection.current.id, inspection.current.amount, inspection.current.angle),
      onComplete: () => {
        if (!selected && !selectedRef.current) {
          inspection.current.id = null;
          controller.current?.inspect(null, 0);
          controller.current?.update(Math.min(1, progress.current.value / ASSEMBLY_PORTION), false, ink.current.value);
        }
      },
    });
    return () => { tween.kill(); };
  }, { dependencies: [selected, enhanced], scope: root });

  useEffect(() => {
    if (!selected) return;
    const html = document.documentElement;
    const overflow = html.style.overflow, gutter = html.style.scrollbarGutter;
    html.style.scrollbarGutter = "stable";
    html.style.overflow = "hidden";
    const wheel = (event: WheelEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-inspection-details]")) return;
      if (event.ctrlKey) return;
      event.preventDefault();
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      rotatePart(gsap.utils.clamp(-240, 240, (event.deltaY || event.deltaX) * scale) * .004);
    };
    const escape = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(event.key) && event.target instanceof Element && event.target.closest("[data-inspection-details]")) return;
      if (event.key === "Escape") { event.preventDefault(); closePart(); }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault(); rotatePart(["ArrowLeft", "ArrowUp"].includes(event.key) ? -.25 : .25);
      }
    };
    window.addEventListener("wheel", wheel, { passive: false });
    document.addEventListener("keydown", escape);
    return () => { html.style.overflow = overflow; html.style.scrollbarGutter = gutter; window.removeEventListener("wheel", wheel); document.removeEventListener("keydown", escape); };
  }, [selected, closePart, rotatePart]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 320px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)");
    let disposed = false;
    let generation = 0;
    const clear = () => {
      controller.current?.dispose(); controller.current = null;
      gsap.killTweensOf(inspection.current);
      selectedRef.current = null; inspection.current = { id: null, amount: 0, angle: 0 };
      setSelected(null); setAvailable([]); setHovered(null);
      setEnhanced(false);
    };
    const initialise = async () => {
      const request = ++generation;
      clear();
      if (!media.matches) return;
      try {
        const { createLaptopScene } = await import("./enginara-laptop-scene");
        if (disposed || request !== generation || !host.current || !surface.current) return;
        controller.current = createLaptopScene(host.current, { surface: surface.current, annotations: annotations.current, onSelect: selectPart, onHover: setHovered, onAvailable: setAvailable });
        controller.current.update(Math.min(1, progress.current.value / ASSEMBLY_PORTION), false, ink.current.value);
        setEnhanced(true);
      } catch {
        if (!disposed && request === generation) clear();
      }
    };
    const onContextLost = (event: Event) => { event.preventDefault(); generation++; clear(); };
    const canvasHost = host.current;
    canvasHost?.addEventListener("webglcontextlost", onContextLost, true);
    media.addEventListener("change", initialise);
    void initialise();
    return () => {
      disposed = true; generation++;
      media.removeEventListener("change", initialise);
      canvasHost?.removeEventListener("webglcontextlost", onContextLost, true);
      gsap.killTweensOf(inspection.current);
      controller.current?.dispose(); controller.current = null;
    };
  }, [selectPart]);

  useGSAP(() => {
    if (!enhanced) return;
    const storyCards = Array.from(narrative.current?.querySelectorAll<HTMLElement>("article") ?? []);
    const paint = () => {
      const raw = gsap.utils.clamp(0, 1, progress.current.value);
      const p = Math.min(1, raw / ASSEMBLY_PORTION);
      controller.current?.update(selectedRef.current ? inspectionProgress.current : p, false, ink.current.value);
      buildChapter.current?.update(gsap.utils.clamp(0, 1, (raw - ASSEMBLY_PORTION) / (1 - ASSEMBLY_PORTION)), p > .88);
      if (raw >= .97 && focusAfterSkip.current) {
        document.getElementById("build")?.focus({ preventScroll: true });
        focusAfterSkip.current = false;
      }
      if (sketchNotes.current) {
        sketchNotes.current.style.opacity = String(1 - phase(p, .04, .11));
        sketchNotes.current.style.visibility = p >= .11 ? "hidden" : "visible";
      }
      const drawingTurn = phase(p, .035, .13);
      if (openingDrawing.current) {
        openingDrawing.current.style.opacity = String(1 - phase(p, .065, .125));
        openingDrawing.current.style.transform = `translate3d(0,${drawingTurn * 18}px,0) scale(${1 - drawingTurn * .12})`;
        openingDrawing.current.style.visibility = p >= .13 ? "hidden" : "visible";
      }
      if (host.current) host.current.style.opacity = String(phase(p, .075, .135));
      const copyOpacity = 1 - phase(p, .04, .125);
      if (introCopy.current) {
        introCopy.current.style.opacity = String(copyOpacity);
        introCopy.current.style.transform = `translate3d(0,${-18 * (1 - copyOpacity)}px,0)`;
        introCopy.current.inert = copyOpacity < 0.01;
        introCopy.current.setAttribute("aria-hidden", String(copyOpacity < 0.01));
      }
      if (status.current) {
        status.current.style.opacity = String(phase(p, .185, .215) * (1 - phase(p, .86, .89)));
        status.current.inert = p < .185 || p > .89 || Boolean(selectedRef.current);
      }
      if (progressLine.current) progressLine.current.style.transform = `scaleX(${gsap.utils.clamp(0, 1, (p - .18) / .7)})`;
      storyCards.forEach((card, index) => {
        const beat = ASSEMBLY_STORY[index];
        const alpha = storyOpacity(p, beat.start, beat.end);
        card.style.opacity = String(alpha);
        card.style.transform = `translate3d(0,${22 * (1 - phase(p, beat.start, beat.start + .025)) - 14 * phase(p, beat.end - .025, beat.end)}px,0)`;
        card.inert = alpha < .5;
        card.setAttribute("aria-hidden", String(alpha < .5));
      });
      const upcoming = ASSEMBLY_STORY.findIndex(beat => p < beat.end);
      const next = upcoming < 0 ? ASSEMBLY_STORY.length - 1 : upcoming;
      setStep(previous => previous === next ? previous : next);
    };
    const tween = gsap.fromTo(progress.current, { value: 0 }, {
      value: 1, ease: "none",
      scrollTrigger: {
        trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.45,
        onRefresh: self => { progress.current.value = self.progress; paint(); },
      },
      onUpdate: paint,
    });
    paint();
    const drawing = gsap.to(ink.current, { value: 1, duration: 1.6, ease: "power1.out", onUpdate: paint });
    ScrollTrigger.refresh();
    let anchorFrame = 0;
    if (!restoredAnchor.current) {
      restoredAnchor.current = true;
      const anchor = window.location.hash.slice(1);
      if (anchor) {
        anchorFrame = requestAnimationFrame(() => {
          document.getElementById(anchor)?.scrollIntoView({ behavior: "instant", block: "start" });
          ScrollTrigger.update();
        });
      }
    }
    return () => {
      cancelAnimationFrame(anchorFrame);
      drawing.kill();
      tween.scrollTrigger?.kill(); tween.kill();
      introCopy.current?.removeAttribute("style");
      introCopy.current?.removeAttribute("aria-hidden");
      if (introCopy.current) introCopy.current.inert = false;
      status.current?.removeAttribute("style");
      if (status.current) status.current.inert = false;
      sketchNotes.current?.removeAttribute("style");
      openingDrawing.current?.removeAttribute("style");
      buildChapter.current?.reset();
      storyCards.forEach(card => { card.removeAttribute("style"); card.removeAttribute("aria-hidden"); card.inert = false; });
      host.current?.removeAttribute("style");
    };
  }, { dependencies: [enhanced], scope: root, revertOnUpdate: true });

  return <div className={`${styles.journey} ${enhanced ? styles.enhanced : ""}`} ref={root} id="imagine" data-inspecting={Boolean(selected)}>
    <div className={styles.buildAnchor} id={enhanced ? "services" : undefined} aria-hidden="true" />
    {ASSEMBLY_STORY.map(beat => <div key={beat.id} id={beat.id} className={styles.storyAnchor} style={{ top: `calc(${(beat.start + .04) * ASSEMBLY_PORTION * 100}% - ${(beat.start + .04) * ASSEMBLY_PORTION * 100}svh)` }} aria-hidden="true" />)}
    <div className={styles.sticky}>
      <div className={styles.canvas} ref={host} aria-hidden="true" />
      <div className={styles.openingDrawing} ref={openingDrawing}><OpeningFilm /></div>
      <div className={styles.sketchNotes} ref={sketchNotes} aria-hidden="true">
        <svg className={styles.drawingGuides} viewBox="0 0 1600 900" preserveAspectRatio="none"><path d="M83 210 83.8 247 M67 231 99 230 M1513 541 1512 581 M1496 561 1529 562" /><path d="M85 215 85 239 M1508 550 1509 575" opacity=".35" /></svg>
        <div className={styles.sheetFooter}>
          <svg className={styles.sheetRule} viewBox="0 0 1300 10" preserveAspectRatio="none"><path d="M1 5 Q286 2 642 5 T1298 4 M12 8 Q433 5 862 7 T1280 6" /></svg>
          <span className={styles.chapterTrail}><span className={styles.currentChapter}>Imagine</span><span>→</span><span>Build</span><span>→</span><span>Manage</span></span>
          <span>SCROLL TO TURN THE PAGE ↓</span>
        </div>
      </div>
      <div className={styles.hero} ref={introCopy}>
        <p className={styles.eyebrow}><span />01 / IMAGINE</p>
        <div className={styles.heroFooter}>
          <div><h1>First, <span className={styles.markedIdea}>an idea.<PencilUnderline /></span><br /><em>Then, we build.</em></h1><a className={styles.scrollCue} href={enhanced ? "#foundation" : "#build"}><PencilArrow down /> Follow the making of an idea</a></div>
          <div><p className={styles.description}>Bring the idea, even if it’s still a rough sketch. We’ll turn it into a website, software, or a system that works for you.</p><SketchLink href="#contact">Start a project</SketchLink></div>
        </div>
      </div>

      <div className={styles.narrative} ref={narrative} inert={Boolean(selected)} aria-hidden={selected ? true : undefined}>
        {ASSEMBLY_STORY.map((beat, index) => <article key={beat.id} aria-labelledby={`${beat.id}-title`}>
          <p className={styles.eyebrow}><span />0{index + 1} / {beat.label.toUpperCase()}</p>
          <h2 id={`${beat.id}-title`}>{beat.title[0]}<br /><em>{beat.title[1]}</em></h2>
          <p className={styles.narrativeBody}>{beat.copy}</p>
          <p className={styles.narrativeDetail}>{beat.detail}</p>
        </article>)}
      </div>

      <div className={styles.annotations} ref={annotations} aria-hidden="true">{[
        ["structure", "01", "Machined foundation", "Architecture & structure"],
        ["core", "02", "Compute module", "Application logic"],
        ["power", "03", "Connected modules", "Systems working together"],
        ["interface", "04", "Tactile interface", "Every interaction considered"],
        ["display", "05", "The finished experience", "Your vision, brought to life"],
      ].map(([id, n, label, detail]) => <div key={id} className={styles.partLabel} data-part={id}><svg><polyline /><circle r="2.5" /></svg><div data-part-copy><span>{n} / {label}</span><small>{detail}</small></div></div>)}</div>

      <div className={styles.status} ref={status}>
        <div className={styles.progressTrack} aria-hidden="true"><span ref={progressLine} /></div>
        <nav className={styles.sequence} aria-label="The making of Enginara">{ASSEMBLY_STORY.map((beat, index) => <a href={`#${beat.id}`} key={beat.id} aria-current={step === index ? "step" : undefined}><span>0{index + 1}</span>{beat.label}</a>)}</nav>
        <a href="#build" onClick={() => { focusAfterSkip.current = true; }}>Skip to the work <span aria-hidden="true">↘</span></a>
      </div>

      {enhanced && <AssemblyInspector selected={selected} displayed={displayed} hovered={hovered} available={available} exploreButton={exploreButton} onSelect={selectPart} onClose={() => closePart()} onRotate={rotatePart} onBackdrop={(x, y) => { if (!controller.current?.hitInspection(x, y)) closePart(); }} />}

      <section className={styles.liveBuild} id={!enhanced ? "services" : undefined} ref={surface} aria-labelledby="services-title" tabIndex={-1}>
        <BuildChapter ref={buildChapter} />
      </section>
    </div>
  </div>;
}
