"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EnginaraMark } from "./enginara-mark";
import { WebsiteDemo, WorkspaceDemo } from "./software-demos";
import { useMotionPlayback } from "./use-motion-playback";
import styles from "./software-story.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const beats = [
  { id: "build-paths", label: "Build", at: .12 },
  { id: "automate", label: "Connect", at: .355 },
  { id: "capabilities", label: "Expand", at: .54 },
  { id: "manage", label: "Care", at: .745 },
  { id: "approach", label: "Our approach", at: .97 },
] as const;

const delivery = [
  { name: "Discover", title: "First, understand.", body: "Your business, people, and the work that could work better. We ask, listen, and map it together.", outcome: "A shared picture", note: "What should work better?" },
  { name: "Architect", title: "Give the idea a plan.", body: "Design the experience, choose the foundations, and draw the connections before the first line of code.", outcome: "One buildable blueprint", note: "Every connection considered." },
  { name: "Build & launch", title: "Make it real.", body: "Build, configure, connect, and test. You see the progress and help shape the details along the way.", outcome: "A working system", note: "Ready for the real world." },
  { name: "Keep growing", title: "Stay with the system.", body: "Launch with care. Then maintain, support, and improve, with a team that already knows your business.", outcome: "An ongoing partnership", note: "The next chapter starts here." },
] as const;

const capabilities = [
  ["Web experiences", "01", 21, 24], ["Custom software", "02", 48, 17],
  ["CRM & portals", "03", 76, 26], ["AI agents", "04", 85, 52],
  ["Automation", "05", 73, 80], ["Cloud & APIs", "06", 47, 88],
  ["Reporting", "07", 20, 78], ["Operations", "08", 10, 52],
] as const;

function NetworkGraphic() {
  return <div className={styles.network} data-network aria-hidden="true">
    <svg viewBox="0 0 340 1050" preserveAspectRatio="none" className={styles.mobileNetworkLines} fill="none"><path className={styles.wires} d="M170 170V930" /><g className={styles.signals}><path pathLength="1" d="M170 170V930" /></g></svg>
    <svg viewBox="0 0 1400 740" preserveAspectRatio="none" className={styles.networkLines} fill="none">
      <g className={styles.networkRules}><path d="M0 370H1400 M700 0V740" /><ellipse cx="700" cy="370" rx="440" ry="254" /><ellipse cx="700" cy="370" rx="550" ry="325" /></g>
      <g className={styles.wires}>
        <path d="M350 400H470Q510 400 510 360V240Q510 200 550 200H650" />
        <path d="M900 200H1010Q1050 200 1050 240V300H1110" />
        <path d="M1220 385V550Q1220 590 1180 590H1090" />
        <path d="M750 285V395Q750 435 790 435H875Q910 435 910 475V540" />
      </g>
      <g className={styles.signals}>
        <path pathLength="1" d="M350 400H470Q510 400 510 360V240Q510 200 550 200H650" />
        <path pathLength="1" d="M900 200H1010Q1050 200 1050 240V300H1110" />
        <path pathLength="1" d="M1220 385V550Q1220 590 1180 590H1090" />
        <path pathLength="1" d="M750 285V395Q750 435 790 435H875Q910 435 910 475V540" />
      </g>
      <g className={styles.junctions}><circle cx="450" cy="400" r="7" /><circle cx="1180" cy="590" r="7" /><circle cx="450" cy="400" r="19" /></g>
    </svg>
    <div className={`${styles.networkNode} ${styles.sourceNode}`}><span>01 / THE FIRST HELLO</span><strong>A new enquiry.</strong><p>From your website</p><div className={styles.enquirySignal}><i />Request received <b>↗</b></div></div>
    <div className={`${styles.networkNode} ${styles.crmNode}`}><span>02 / KEEP IT TOGETHER</span><strong>Your CRM.</strong><div className={styles.record}><i>AM</i><div>Alex Morgan<small>Website project</small></div><b>New</b></div><div className={styles.record}><i>JC</i><div>Jamie Chen<small>Client portal</small></div><b>Ready</b></div></div>
    <div className={`${styles.networkNode} ${styles.aiNode}`}><span>03 / THE RIGHT NEXT STEP</span><div className={styles.agentSymbol}><i /><i /><i /><i /></div><strong>A little intelligence.</strong><p>Route the request.<br />Prepare the follow-up.</p><div className={styles.aiWork}><i /><i /><i /><span>Context → action</span></div></div>
    <div className={`${styles.networkNode} ${styles.calendarNode}`}><span>04 / MOVE IT FORWARD</span><div className={styles.calendarTop}><strong>A conversation.</strong><i>↗</i></div><div className={styles.calendarDays}>{["M", "T", "W", "T", "F"].map((day, index) => <span key={index}>{day}<b>{12 + index}</b></span>)}</div><p>Discovery call <span>Invitation prepared</span></p></div>
    <div className={styles.integrationLabel}><span>↔</span> YOUR TOOLS. TALKING TO EACH OTHER.</div>
  </div>;
}

function EcosystemGraphic() {
  return <div className={styles.ecosystem} data-ecosystem aria-hidden="true">
    <svg className={styles.ecosystemLines} viewBox="0 0 1000 800" preserveAspectRatio="none" fill="none">
      <ellipse cx="490" cy="420" rx="330" ry="260" /><ellipse cx="490" cy="420" rx="395" ry="310" />
      {capabilities.map(([, , x, y], index) => <path pathLength="1" key={x + y} style={{ animationDelay: `${index * -.8}s` }} d={`M490 420 Q${x * 10} 420 ${x * 10} ${y * 8}`} />)}
      <ellipse className={styles.orbitTrace} pathLength="1" cx="490" cy="420" rx="330" ry="260" />
    </svg>
    <div className={styles.ecosystemCore}><EnginaraMark /><span>ONE TEAM</span><strong>Connected<br />by design.</strong></div>
    {capabilities.map(([label, number, x, y], index) => <div className={styles.capabilityNode} key={label} style={{ left: `${x}%`, top: `${y}%`, "--index": index } as CSSProperties}><span>{number}</span><ModuleDrawing index={index} /><strong>{label}</strong></div>)}
  </div>;
}

function ModuleDrawing({ index }: { index: number }) {
  return <svg className={styles.moduleDrawing} viewBox="0 0 120 64" fill="none">
    {index === 0 && <><path d="M11 9H109V57H11Z M11 20H109 M21 29H57V35H21Z M21 42H49 M21 48H40 M68 29H99V48H68Z" /><path className={styles.moduleAccent} d="M68 48 82 34 92 44 99 39V48Z" /></>}
    {index === 1 && <><path d="M28 12 8 31 28 50 M92 12 112 31 92 50" /><path className={styles.moduleAccent} d="M49 48 69 13 M39 58H81" /><path d="M41 21H47 M71 41H77" /></>}
    {index === 2 && <><path d="M14 7H107V57H14Z M44 7V57 M14 23H107 M14 40H107" /><circle cx="29" cy="15" r="3" /><circle cx="29" cy="32" r="3" /><circle cx="29" cy="48" r="3" /><path className={styles.moduleAccent} d="M54 15H92 M54 32H84 M54 49H95" /></>}
    {index === 3 && <><path d="M60 5V58 M33 12 87 51 M33 51 87 12 M24 32H96" /><circle cx="60" cy="32" r="19" /><circle className={styles.moduleAccent} cx="60" cy="32" r="8" /></>}
    {index === 4 && <><path d="M10 25H34V49H10Z M48 7H72V31H48Z M87 26H111V50H87Z M34 37H41V19H48 M72 19H80V38H87" /><path className={styles.moduleAccent} d="M16 37 21 42 29 32 M55 19 60 24 67 13 M94 38 99 43 106 32" /></>}
    {index === 5 && <><path d="M23 15 61 4 101 15 61 28Z M23 15V28L61 42 101 28V15 M23 33V46L61 60 101 46V33 M23 33 61 47 101 33" /><path className={styles.moduleAccent} d="M72 29 90 23 M72 48 90 42" /></>}
    {index === 6 && <><path d="M15 6V56H108 M30 45V34H43V45 M54 45V23H67V45 M79 45V11H92V45" /><path className={styles.moduleAccent} d="M24 26 46 19 67 24 95 5" /></>}
    {index === 7 && <><circle cx="60" cy="32" r="25" /><circle cx="60" cy="32" r="17" /><path className={styles.moduleAccent} d="M49 31 57 39 73 23" /><path d="M18 32H28 M92 32H102 M60 0V7 M60 57V64" /></>}
  </svg>;
}

function CareGraphic({ cycle }: { cycle: number }) {
  const actions = ["Monitoring the connections", "Keeping the foundations current", "Planning the next improvement"];
  return <div className={styles.careGraphic} data-care-graphic>
    <div className={styles.careOrbit} aria-hidden="true"><svg viewBox="0 0 650 650" fill="none"><circle cx="325" cy="325" r="260" /><circle cx="325" cy="325" r="210" /><circle cx="325" cy="325" r="160" /><path d="M325 45V85 M325 565V605 M45 325H85 M565 325H605" /><circle className={styles.careOrbitTrace} pathLength="1" cx="325" cy="325" r="260" /></svg><span className={styles.careOrbitLabel}>MONITOR</span><span className={styles.careOrbitLabel}>MAINTAIN</span><span className={styles.careOrbitLabel}>IMPROVE</span><div className={styles.careCenter}><EnginaraMark /><strong>We’re on it.</strong><span>YOUR ONGOING TECHNICAL TEAM</span></div></div>
    <div className={styles.careConsole}><header><span><i /> Ongoing care</span><small>ILLUSTRATIVE WORKSPACE</small></header><h3>The work<br />keeps moving.</h3><div className={styles.careActivity} aria-live="off"><span>0{cycle % 3 + 1}</span><p key={cycle % 3}>{actions[cycle % 3]}</p></div><svg viewBox="0 0 440 76" fill="none" aria-hidden="true"><path d="M0 58H440 M0 29H440" /><path className={styles.careGraph} pathLength="1" d="M0 54 38 54 55 39 73 45 104 30 132 30 145 40 168 22 194 29 222 14 250 24 278 18 302 25 330 8 360 17 390 8 440 8" /></svg><div className={styles.careTasks}>{["Connections & workflows", "Updates & maintenance", "Reporting & improvements"].map((label, index) => <div key={label} data-current={cycle % 3 === index}><span>{label}</span><i>{cycle % 3 === index ? "Reviewing" : "In the plan"}</i><b /></div>)}</div><footer>One accountable team. Beyond launch.</footer></div>
  </div>;
}

function ProcessDrawing({ step }: { step: number }) {
  return <div className={styles.processDrawing} data-process-drawing aria-hidden="true" data-step={step}>
    <div className={styles.sheetBack} /><div className={styles.sheetMiddle} />
    <div className={styles.sheetFront}><header><span>ENGINARA / WORKING NOTES</span><span>0{step + 1} — 04</span></header>
      <svg viewBox="0 0 600 360" fill="none">
        <g className={styles.sheetGuides}><path d="M45 30V335 M555 30V335 M20 65H580 M20 295H580" /><circle cx="300" cy="175" r="129" /></g>
        <g className={styles.discoverDrawing}><path pathLength="1" d="M153 88Q172 70 214 88L258 83 263 151 147 160Z M331 89 448 79 455 152 337 160Z M247 229 367 224 361 302 241 309Z" /><path pathLength="1" d="M204 161Q201 212 263 244 M392 158Q407 212 355 242 M270 120H322 M312 113 322 120 312 128" /><path d="M166 110 228 106 M166 126 215 122 M352 105 426 101 M352 122 414 118 M265 253 341 250 M265 271 322 268" /></g>
        <g className={styles.architectDrawing}><path pathLength="1" d="M188 51 414 52 414 309 188 308Z M188 88H414 M209 110H393V174H209Z M209 195H290V279H209Z M308 195H393V228H308Z M308 245H393V279H308Z M144 52V308 M135 52H153 M135 308H153 M435 51V309 M426 51H444 M426 309H444" /><path d="M219 135 272 135 M219 150 250 150 M319 125 383 159 M383 125 319 159" /></g>
        <g className={styles.buildDrawing}><path pathLength="1" d="M109 73H491V286H109Z M109 108H491 M131 91H136 M147 91H152 M163 91H168 M136 135H278V176H136Z M136 193H238 M136 209H260 M136 237H207V262H136Z M303 133H465V263H303Z M303 263 372 173 422 235 439 218 465 263" /><path className={styles.orangeStroke} pathLength="1" d="M246 175 279 208 352 130" /></g>
        <g className={styles.growDrawing}><path pathLength="1" d="M372 83C468 130 452 245 370 282 M230 282C143 242 143 119 232 80 M223 65 237 79 220 93 M377 266 365 285 387 294" /><path d="M222 135H382V231H222Z M240 192 273 167 295 184 341 149 367 161 M242 212H362" /><circle cx="300" cy="182" r="124" strokeDasharray="3 8" /></g>
      </svg><p>{delivery[step].note}</p><footer><span>{delivery[step].outcome}</span><i>↗</i></footer>
    </div>
  </div>;
}

export function SoftwareStory() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [route, setRoute] = useState<"custom" | "proven">("custom");
  const [cycle, setCycle] = useState(0);
  const [processStep, setProcessStep] = useState(0);
  const [processManual, setProcessManual] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const playback = useMotionPlayback(stage);

  useEffect(() => {
    if (!playback.running) return;
    const timer = window.setInterval(() => {
      setCycle(value => value + 1);
      if (active === 4 && !processManual) setProcessStep(value => (value + 1) % delivery.length);
    }, 4400);
    return () => window.clearInterval(timer);
  }, [playback.running, active, processManual]);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(min-width: 950px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)", () => {
      const element = root.current;
      if (!element) return;
      setEnhanced(true);
      element.dataset.enhanced = "true";
      const panels = Array.from(element.querySelectorAll<HTMLElement>("[data-story-panel]"));
      const browser = element.querySelector<HTMLElement>("[data-story-browser]");
      const network = element.querySelector<HTMLElement>("[data-network]");
      const ecosystem = element.querySelector<HTMLElement>("[data-ecosystem]");
      const care = element.querySelector<HTMLElement>("[data-care-graphic]");
      const process = element.querySelector<HTMLElement>("[data-process-drawing]");
      const blueprint = element.querySelector<HTMLElement>("[data-blueprint]");
      const progress = element.querySelector<HTMLElement>("[data-story-progress]");
      const paper = element.querySelector<HTMLElement>("[data-paper-wipe]");
      const timeline = gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: {
        trigger: element, start: "top top", end: "bottom bottom", scrub: .65, invalidateOnRefresh: true,
        onUpdate: self => {
          if (progress) progress.style.transform = `scaleX(${self.progress})`;
        },
      }});
      const updateInteraction = () => {
        const p = timeline.progress();
        const index = p < .21 ? 0 : p < .42 ? 1 : p < .62 ? 2 : p < .815 ? 3 : 4;
        setActive(previous => previous === index ? previous : index);
        element.dataset.beat = String(index);
        panels.forEach((panel, i) => { panel.inert = i !== index; panel.setAttribute("aria-hidden", String(i !== index)); });
        if (browser) { browser.inert = index !== 0; browser.setAttribute("aria-hidden", String(index !== 0)); }
        if (care) { care.inert = index !== 3; care.setAttribute("aria-hidden", String(index !== 3)); }
      };
      gsap.set(panels.slice(1), { autoAlpha: 0, y: 65 });
      gsap.set(network, { autoAlpha: 0, scale: 1.16, xPercent: 8 });
      gsap.set(ecosystem, { autoAlpha: 0, scale: 1.32, xPercent: 12 });
      gsap.set(care, { autoAlpha: 0, y: 130, scale: .86 });
      gsap.set(process, { autoAlpha: 0, y: 110, rotation: 8, scale: .86 });
      gsap.set(browser, { rotationY: -9, rotationX: 5, rotationZ: -3, y: 30, scale: .9 });
      timeline.to(browser, { rotationY: 0, rotationX: 0, rotationZ: 0, y: 0, scale: 1, duration: .105 }, 0)
        .to(blueprint, { y: -45, x: 25, rotation: 2, opacity: .55, duration: .14 }, 0)
        .to(panels[0], { autoAlpha: 0, y: -80, duration: .055 }, .17)
        .to(blueprint, { autoAlpha: 0, scale: .7, xPercent: -55, duration: .09 }, .16)
        .to(browser, { scale: .32, x: () => -window.innerWidth * .47, y: () => window.innerHeight * .07, rotationZ: -6, autoAlpha: 0, duration: .13 }, .175)
        .to(network, { autoAlpha: 1, xPercent: 0, scale: 1, duration: .1 }, .2)
        .to(panels[1], { autoAlpha: 1, y: 0, duration: .06 }, .215)
        .fromTo(element.querySelectorAll(`.${styles.networkNode}`), { y: 80, rotation: 4 }, { y: 0, rotation: 0, stagger: .018, duration: .08 }, .215)
        .to(network, { xPercent: -19, scale: .76, rotation: -8, autoAlpha: 0, duration: .115 }, .38)
        .to(panels[1], { autoAlpha: 0, y: -70, duration: .055 }, .385)
        .to(ecosystem, { autoAlpha: 1, xPercent: 0, scale: 1, duration: .12 }, .4)
        .to(panels[2], { autoAlpha: 1, y: 0, duration: .065 }, .425)
        .fromTo(element.querySelectorAll(`.${styles.capabilityNode}`), { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: .5, opacity: 0 }, { scale: 1, opacity: 1, stagger: .006, duration: .06 }, .425)
        .to(panels[2], { autoAlpha: 0, y: -65, duration: .055 }, .585)
        .to(ecosystem, { scale: .7, xPercent: -43, autoAlpha: 0, rotation: -12, duration: .11 }, .59)
        .to(care, { autoAlpha: 1, y: 0, scale: 1, duration: .115 }, .605)
        .to(panels[3], { autoAlpha: 1, y: 0, duration: .065 }, .625)
        .to(panels[3], { autoAlpha: 0, y: -65, duration: .05 }, .78)
        .to(care, { scale: .72, rotation: -8, y: -50, autoAlpha: 0, duration: .09 }, .775)
        .fromTo(paper, { clipPath: "circle(0% at 37% 57%)" }, { clipPath: "circle(110% at 37% 57%)", duration: .11 }, .785)
        .to(panels[4], { autoAlpha: 1, y: 0, duration: .075 }, .815)
        .to(process, { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: .115 }, .815)
        .to({}, { duration: .07 }, .93);
      timeline.eventCallback("onUpdate", updateInteraction);
      updateInteraction();
      ScrollTrigger.refresh();
      return () => {
        delete element.dataset.enhanced; delete element.dataset.beat;
        setEnhanced(false);
        [...panels, browser, care].forEach(panel => { if (panel) { panel.inert = false; panel.removeAttribute("aria-hidden"); } });
      };
    });
    media.add("(max-width: 949px), (max-height: 639px), (prefers-reduced-motion: reduce)", () => {
      const element = root.current;
      if (!element) return;
      const scenes = Array.from(element.querySelectorAll<HTMLElement>("[data-software-scene]"));
      const activate = (index: number) => {
        setActive(index);
        element.dataset.beat = String(index);
      };
      scenes.forEach((scene, index) => {
        ScrollTrigger.create({ trigger: scene, start: "top 60%", end: "bottom 60%", onEnter: () => activate(index), onEnterBack: () => activate(index) });
      });
      // Switching a live demo changes the document height on a phone.
      let refreshFrame = 0;
      const resize = new ResizeObserver(() => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      if (stage.current) resize.observe(stage.current);
      return () => { resize.disconnect(); cancelAnimationFrame(refreshFrame); delete element.dataset.beat; };
    });
    media.add("(max-width: 949px) and (prefers-reduced-motion: no-preference)", () => {
      const element = root.current;
      if (!element) return;
      const entrance = (target: Element | null, from: gsap.TweenVars, start = "top 92%", end = "top 48%") => {
        if (!target) return;
        // GSAP caches desktop percentage centering after converting CSS translate.
        // Mobile graphics belong to document flow, so their origin must be explicit.
        gsap.set(target, { xPercent: 0, yPercent: 0, x: 0, y: 0, rotation: 0, scale: 1 });
        gsap.from(target, { ...from, ease: "none", scrollTrigger: { trigger: target, start, end, scrub: .5, invalidateOnRefresh: true } });
      };
      entrance(element.querySelector("[data-story-browser]"), { y: 55, rotation: -3, scale: .92 });
      element.querySelectorAll(`.${styles.networkNode}`).forEach((node, index) => entrance(node, { x: index % 2 ? 26 : -26, y: 35, rotation: index % 2 ? 3 : -3 }));
      entrance(element.querySelector(`.${styles.ecosystemCore}`), { scale: .75, rotation: -12 });
      element.querySelectorAll(`.${styles.capabilityNode}`).forEach((node, index) => entrance(node, { x: index % 2 ? 20 : -20, y: 25, scale: .9 }));
      entrance(element.querySelector(`.${styles.careOrbit}`), { rotation: -35, scale: .85 }, "top bottom", "center 55%");
      entrance(element.querySelector(`.${styles.careConsole}`), { y: 50, rotation: -3 });
      entrance(element.querySelector("[data-process-drawing]"), { y: 45, rotation: -5, scale: .93 });
    });
    return () => media.revert();
  }, { scope: root });

  return <div className={styles.story} ref={root} id="build" tabIndex={-1} role="region" aria-label="Explore what we build" data-process-manual={processManual}>
    {beats.map(beat => <div key={beat.id} className={styles.anchor} id={enhanced ? beat.id : undefined} style={{ top: `calc(${beat.at * 100}% - ${beat.at * 100}svh)` }} aria-hidden="true" />)}
    <div className={styles.stage} ref={stage}>
      <div className={styles.paperWipe} data-paper-wipe aria-hidden="true" />
      <header className={styles.stageHeader}><a href="#imagine" aria-label="Enginara home"><EnginaraMark /><span>ENGINARA</span></a><span>FROM IDEA TO EVERYDAY.</span><button className={`${styles.motionToggle} ${styles.mobilePause}`} aria-pressed={playback.paused} onClick={() => { playback.setPaused(!playback.paused); if (playback.paused) setProcessManual(false); }}>{playback.paused ? "▷ Play motion" : "Ⅱ Pause motion"}</button><a href="#contact">Start a project <span>↗</span></a></header>

      <div className={styles.scene} data-software-scene="0">
      <section className={`${styles.panel} ${styles.buildPanel}`} data-story-panel id={!enhanced ? "build-paths" : undefined} aria-labelledby="build-title">
        <p className={styles.eyebrow}>01 / GIVE THE IDEA A LIFE</p>
        <h2 id="build-title">Your idea.<br /><em>Made real.</em></h2>
        <p className={styles.body}>A website, a tool, a better way to work. <br />Let’s build the thing your business needs.</p>
        <div className={styles.routes} role="group" aria-label="Choose your starting point"><button onClick={() => setRoute("custom")} aria-pressed={route === "custom"}><span>01</span><strong>From scratch</strong><small>Imagine it. We engineer it.</small><i>↗</i></button><button onClick={() => setRoute("proven")} aria-pressed={route === "proven"}><span>02</span><strong>From a foundation</strong><small>A proven system, made yours.</small><i>↗</i></button></div>
        <span className={styles.buildAnnotation}>DESIGN → DEVELOP → LAUNCH</span>
      </section>

      <div className={styles.blueprint} data-blueprint aria-hidden="true"><div><span>01 / THE STRUCTURE</span><svg viewBox="0 0 700 400" fill="none"><path d="M1 1H699V399H1Z M1 41H699 M20 61H315V161H20Z M20 190H300 M20 210H280 M20 230H240 M355 61H679V365H355Z M355 61 679 365 M679 61 355 365 M20 305H158V351H20Z" /></svg></div><div><span>02 / THE LOGIC</span><code><i>const</i> idea = your.vision;<br /><i>const</i> experience = build(&#123;<br />&nbsp; design: <b>considered</b>,<br />&nbsp; connections: <b>everything</b>,<br />&nbsp; madeFor: <b>you</b><br />&#125;);<span className={styles.codeCaret}>▎</span></code></div></div>
      <div className={styles.browser} data-story-browser><div className={styles.browserBar}><span><i /><i /><i /></span><span>{route === "custom" ? "formandfield.example" : "northstar.example / workspace"}</span><span>CONCEPT ↗</span></div><div className={styles.browserBody}>{route === "custom" ? <WebsiteDemo playing={playback.running && (!enhanced || active === 0)} /> : <WorkspaceDemo playing={playback.running && (!enhanced || active === 0)} />}</div><div className={styles.browserEdge} aria-hidden="true"><span>03 / THE EXPERIENCE</span><i /></div></div>

      </div>
      <div className={styles.scene} data-software-scene="1">
      <section className={`${styles.panel} ${styles.connectPanel}`} data-story-panel id={!enhanced ? "automate" : undefined} aria-labelledby="automate-title"><p className={styles.eyebrow}>02 / MAKE THE CONNECTIONS</p><h2 id="automate-title">Good on its own.<br /><em>Better together.</em></h2><p className={styles.body}>An enquiry becomes a conversation. <br />Your website, CRM, AI and workflows <br />keep the next step moving.</p><span className={styles.sceneNote}><i /> FOLLOW AN EXAMPLE ENQUIRY THROUGH THE SYSTEM</span></section>
      <NetworkGraphic />

      </div>
      <div className={styles.scene} data-software-scene="2">
      <section className={`${styles.panel} ${styles.expandPanel}`} data-story-panel id={!enhanced ? "capabilities" : undefined} aria-labelledby="capabilities-title"><p className={styles.eyebrow}>03 / SEE THE BIGGER PICTURE</p><h2 id="capabilities-title">One partner.<br /><em>A world of<br />possibility.</em></h2><p className={styles.body}>Software, automation, AI and operations. <br />Connected by the same team, around <br />the way your business actually works.</p><ul className={styles.capabilityList}><li>Websites, apps & custom software</li><li>CRM, AI agents & integrations</li><li>Cloud, reporting & operations</li></ul><a className={styles.textLink} href="#contact">Find your starting point <span>↗</span></a></section>
      <EcosystemGraphic />

      </div>
      <div className={styles.scene} data-software-scene="3">
      <section className={`${styles.panel} ${styles.carePanel}`} data-story-panel id={!enhanced ? "manage" : undefined} aria-labelledby="manage-title"><p className={styles.eyebrow}>04 / STAY WITH WHAT YOU BUILD</p><h2 id="manage-title">Built to launch.<br /><em>Backed to last.</em></h2><p className={styles.body}>Technology should give you time back. <br />We monitor, maintain, and improve it. <br />You keep moving your business forward.</p></section>
      <CareGraphic cycle={cycle} />

      </div>
      <div className={styles.scene} data-software-scene="4">
      <section className={`${styles.panel} ${styles.processPanel}`} data-story-panel id={!enhanced ? "approach" : undefined} aria-labelledby="approach-title"><p className={styles.eyebrow}>05 / HOW WE GET THERE. TOGETHER.</p><h2 id="approach-title">A shared plan.<br /><em>Then, progress.</em></h2><div className={styles.processTabs} role="group" aria-label="Explore our delivery process">{delivery.map((step, index) => <button key={step.name} onClick={() => { setProcessStep(index); setProcessManual(true); }} aria-pressed={processStep === index}><span>0{index + 1}</span>{step.name}<i /></button>)}</div><div className={styles.processCopy} aria-live={processManual ? "polite" : "off"}><h3>{delivery[processStep].title}</h3><p>{delivery[processStep].body}</p></div><a className={styles.textLink} href="#contact">Let’s start with a conversation <span>↗</span></a></section>
      <ProcessDrawing step={processStep} />

      </div>
      <footer className={styles.stageFooter}><nav aria-label="The working system">{beats.map((beat, index) => <a key={beat.id} href={`#${beat.id}`} aria-current={enhanced && active === index ? "step" : undefined}><span>0{index + 1}</span>{beat.label}</a>)}</nav><button className={styles.motionToggle} aria-pressed={playback.paused} onClick={() => { playback.setPaused(!playback.paused); if (playback.paused) setProcessManual(false); }}>{playback.paused ? "▷ Play motion" : "Ⅱ Pause motion"}</button><div className={styles.progress}><i data-story-progress /></div></footer>
    </div>
  </div>;
}
