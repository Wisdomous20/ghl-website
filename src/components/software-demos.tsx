"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { useMotionPlayback } from "./use-motion-playback";
import styles from "./software-demos.module.css";

function useDemoSequence(rootRef: RefObject<HTMLDivElement | null>, count: number, interval: number, playing = true) {
  const playback = useMotionPlayback(rootRef);
  const { setActive, running } = playback;
  const [frame, setFrame] = useState(0);
  useEffect(() => { setActive(playing); }, [playing, setActive]);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setFrame(value => (value + 1) % count), interval);
    return () => window.clearInterval(timer);
  }, [running, count, interval]);
  return { ...playback, frame, setFrame };
}

function DemoPlayback({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return <button className={styles.demoPlayback} onClick={onToggle} aria-pressed={paused}>{paused ? "▷ Play demo" : "Ⅱ Pause demo"}</button>;
}

export function WebsiteDemo({ playing = true }: { playing?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const demo = useDemoSequence(root, 2, 6500, playing);
  const [view, setView] = useState<"home" | "spaces">("home");
  const currentView = demo.paused ? view : demo.frame === 0 ? "home" : "spaces";
  const choose = (value: "home" | "spaces") => { setView(value); demo.setFrame(value === "home" ? 0 : 1); demo.setPaused(true); };
  return <div className={styles.website} ref={root}>
    <div className={styles.websiteNav}><strong>form & field</strong><div><button onClick={() => choose("home")} aria-pressed={currentView === "home"}>Home</button><button onClick={() => choose("spaces")} aria-pressed={currentView === "spaces"}>Our spaces</button></div></div>
    <div className={styles.websiteBody} data-view={currentView}>
      <div><small>{currentView === "home" ? "SPACES FOR A SLOWER LIFE" : "THE COURTYARD COLLECTION"}</small><h3 key={currentView} className={styles.demoEntrance}>{currentView === "home" ? <>Room to <br />breathe.</> : <>A little <br />closer.</>}</h3><p>{currentView === "home" ? "Thoughtful spaces. Natural materials. A little closer to what matters." : "Open courtyards, warm stone and quiet corners. Made for everyday living."}</p><button className={styles.siteButton} onClick={() => choose(currentView === "home" ? "spaces" : "home")}>{currentView === "home" ? "Explore the spaces" : "Back to the beginning"} <span aria-hidden="true">↗</span></button></div>
      <div className={styles.courtyard}><Image src="/media/form-and-field-courtyard.webp" alt="A sunlit courtyard with warm stone walls and an olive tree" fill sizes="(min-width: 950px) 30vw, 60vw" /></div>
    </div>
    <div className={styles.websiteFooter}><span>FORM & FIELD / CONCEPT</span><DemoPlayback paused={demo.paused} onToggle={() => { setView(currentView); demo.setPaused(!demo.paused); }} /></div>
  </div>;
}

const enquiries = [
  { name: "Alex Morgan", project: "New website", initials: "AM", state: "New enquiry" },
  { name: "Jamie Chen", project: "Client portal", initials: "JC", state: "Discovery booked" },
  { name: "Sam Rivera", project: "Operations workflow", initials: "SR", state: "Proposal sent" },
];

export function WorkspaceDemo({ playing = true }: { playing?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const demo = useDemoSequence(root, 3, 4500, playing);
  const [selected, setSelected] = useState(0);
  const current = demo.paused ? selected : demo.frame;
  const enquiry = enquiries[current];
  return <div className={styles.workspace} ref={root}>
    <div className={styles.appBar}><strong>Northstar<span> / workspace</span></strong><DemoPlayback paused={demo.paused} onToggle={() => { setSelected(current); demo.setPaused(!demo.paused); }} /></div>
    <div className={styles.workspaceBody}>
      <div className={styles.inbox}><small>CLIENT RELATIONSHIPS</small><h3>Conversations</h3><p>Every next step, in one place.</p>
        <div className={styles.enquiryList}>{enquiries.map((person, index) => <button key={person.name} onClick={() => { setSelected(index); demo.setFrame(index); demo.setPaused(true); }} aria-pressed={current === index}><span className={styles.avatar}>{person.initials}</span><span><strong>{person.name}</strong><small>{person.project}</small></span><span aria-hidden="true">↗</span></button>)}</div>
      </div>
      <div className={styles.contactDetail} aria-live={demo.paused ? "polite" : "off"}><small>CONTACT OVERVIEW</small><span className={styles.largeInitials}>{enquiry.initials}</span><h4 key={current} className={styles.demoEntrance}>{enquiry.name}</h4><p>{enquiry.project}</p><div><span>Stage</span><strong>{enquiry.state}</strong></div><div><span>Owner</span><strong>Your team</strong></div><div className={styles.nextStep}><small>NEXT STEP</small><p>{current === 0 ? "Introduce the team and arrange a discovery call." : current === 1 ? "Talk through the brief and agree on priorities." : "Review the proposal and confirm the first milestone."}</p></div></div>
    </div>
  </div>;
}

const workflowSteps = [
  ["Enquiry received", "Capture the request from your website."],
  ["Contact created", "Keep the details together in your CRM."],
  ["Welcome sent", "Make the first follow-up personal."],
  ["Call invited", "Give the conversation a next step."],
];

export function WorkflowDemo() {
  const root = useRef<HTMLDivElement>(null);
  const demo = useDemoSequence(root, 7, 1500);
  const step = Math.min(4, demo.frame);
  return <div className={styles.workflow} ref={root}>
    <div className={styles.appBar}><strong>Enquiry → conversation</strong><DemoPlayback paused={demo.paused} onToggle={() => demo.setPaused(!demo.paused)} /></div>
    <div className={styles.flowIntro}><small>A SIMPLE, CONNECTED PROCESS</small><h3>One enquiry.<br />The right next steps.</h3></div>
    <ol className={styles.flowSteps}>{workflowSteps.map(([title, copy], index) => <li key={title} className={index < step ? styles.completed : ""}><span className={styles.stepNumber}>{index < step ? "✓" : `0${index + 1}`}</span><div><strong>{title}</strong><p>{copy}</p></div><small>{index < step ? "Complete" : "Waiting"}</small></li>)}</ol>
    <div className={styles.flowAction}><button onClick={() => { demo.setPaused(true); demo.setFrame(step === 4 ? 0 : step + 1); }}>{step === 0 ? "Try an example enquiry" : step === 4 ? "Reset the example" : "Continue to the next step"}<span aria-hidden="true">{step === 4 ? "↺" : "→"}</span></button><span aria-live={demo.paused ? "polite" : "off"}>{step === 0 ? "Illustrative workflow. No messages are sent." : `${step} of 4 steps complete · simulation only`}</span></div>
  </div>;
}

export function CareDemo() {
  const root = useRef<HTMLDivElement>(null);
  const demo = useDemoSequence(root, 4, 2200);
  const [view, setView] = useState<"care" | "next">("care");
  const rows = view === "care" ? [["Website & content", "Review the latest changes", "Reviewed"], ["Forms & connections", "Check the enquiry journey", "Reviewed"], ["Updates & backups", "Keep the foundations current", "Scheduled"]] : [["Client onboarding", "Simplify the welcome process", "Planning"], ["Appointment reminders", "Connect calendar follow-ups", "Next up"], ["Content updates", "Make editing easier for the team", "Discovery"]];
  return <div className={styles.care} ref={root}>
    <div className={styles.appBar}><strong>Enginara<span> / your project</span></strong><DemoPlayback paused={demo.paused} onToggle={() => demo.setPaused(!demo.paused)} /></div>
    <div className={styles.careBody}><small>THE WORK CONTINUES</small><h3>A clear view of<br />what comes next.</h3><div className={styles.careTabs} role="group" aria-label="Project workspace view"><button aria-pressed={view === "care"} onClick={() => { setView("care"); demo.setPaused(true); }}>Ongoing care</button><button aria-pressed={view === "next"} onClick={() => { setView("next"); demo.setPaused(true); }}>Next improvements</button></div><div className={styles.careRows} aria-live={demo.paused ? "polite" : "off"}>{rows.map(([title, description, status], index) => <div key={title} data-checking={view === "care" && demo.frame === index && demo.running}><span><strong>{title}</strong><small>{description}</small></span><span>{view === "care" && demo.frame === index && demo.running ? "Checking…" : status}</span></div>)}</div><p className={styles.careNote}>Illustrative care cycle. Monitor, maintain, improve.</p></div>
  </div>;
}
