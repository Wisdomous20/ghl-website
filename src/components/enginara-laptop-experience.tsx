"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EnginaraMark } from "./enginara-mark";
import { EnginaraAssemblyIntro } from "./enginara-assembly-intro";
import { SketchLink } from "./sketch-controls";
import { WorkflowDemo, CareDemo } from "./software-demos";
import styles from "./enginara-laptop-experience.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const chapters = [
  { id: "imagine", label: "Imagine", tag: "YOUR NEXT CHAPTER STARTS HERE", title: <>You imagine.<br />We <em>make<br />it happen.</em></>, body: "Websites, software, and connected systems. Built around your business. Managed by one team.", tags: ["Design", "Development", "Automation"], screen: "An idea becomes a possibility" },
  { id: "build", label: "Build", tag: "01 / DESIGNED TO BE YOURS", title: <>Good ideas.<br /><em>Exceptional<br />experiences.</em></>, body: "From the first impression to the last interaction. We turn your vision into websites and software people love to use.", tags: ["Web experiences", "Custom software", "E-commerce"], screen: "Website concept / Form & Field" },
  { id: "automate", label: "Automate", tag: "03 / PUT IT TO WORK", title: <>The next step.<br /><em>Already in motion.</em></>, body: "Someone makes an enquiry. The right follow-up arrives. A conversation gets booked. We connect your website to the work that happens next.", tags: ["Enquiry", "Follow-up", "Booked call"], screen: "Illustrative workflow · Lead to appointment" },
  { id: "manage", label: "Manage", tag: "04 / BEYOND LAUNCH", title: <>Built to launch.<br /><em>Backed to last.</em></>, body: "Going live is a beginning. We keep an eye on the systems, take care of the updates, and work with you on what comes next.", tags: ["Monitor", "Maintain", "Improve"], screen: "Illustrative workspace · Ongoing care" },
];

const capabilities = [
  { n: "01", title: "Launch something better.", copy: "A new website, an online store, or a tool your team has been missing. Built around the people who will use it.", items: "Discovery → Design → Development → Launch", href: "#build" },
  { n: "02", title: "Join the dots.", copy: "Replace the repeated copy-and-paste between your forms, inbox, CRM and calendar with a workflow that connects them.", items: "Process mapping → Integration → Automation", href: "#automate" },
  { n: "03", title: "Keep it working.", copy: "Updates, fixes and a practical plan for what to improve next. A technical partner who already knows your setup.", items: "Maintenance → Monitoring → Improvements", href: "#manage" },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function EnginaraLaptopExperience() {
  const root = useRef<HTMLElement>(null);
  const story = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(2);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add({ motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" }, context => {
      const noMotion = Boolean(context.conditions?.reduced);
      chapters.slice(2).forEach((chapter, index) => {
        ScrollTrigger.create({
          trigger: `#${chapter.id}`, start: "top center", end: "bottom center",
          onToggle: self => { if (self.isActive) setActive(index + 2); },
        });
      });
      ScrollTrigger.create({
        trigger: story.current, start: "top 30%", end: "bottom top",
        onToggle: self => gsap.set("[data-chapter-navigation]", { autoAlpha: self.isActive ? 1 : 0, pointerEvents: self.isActive ? "auto" : "none" }),
      });
      if (!noMotion) {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach(element => {
          gsap.from(element, { y: 35, opacity: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 90%", once: true } });
        });
      }
    });
    return () => media.revert();
  }, { scope: root });

  return (
    <main className={styles.page} ref={root}>
      <a href="#build" className={styles.skip}>Skip introduction</a>
      <header className={styles.header}>
        <a className={styles.brand} href="#imagine" aria-label="Enginara home"><EnginaraMark /><span>enginara<span className={styles.brandDot}>.</span></span></a>
        <nav aria-label="Main navigation">
          <a href="#build">What we do</a>
          <a href="#approach">Our approach</a>
          <SketchLink href="#contact" compact>Start a project</SketchLink>
        </nav>
      </header>

      <EnginaraAssemblyIntro />

      <div className={styles.story} ref={story}>
        {chapters.slice(2).map((chapter, index) => <section className={`${styles.chapter} ${index % 2 ? styles.chapterRight : ""}`} id={chapter.id} key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
          <div className={styles.chapterCopy}>
            <p className={styles.eyebrow}><span />{chapter.tag}</p>
            <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
            <p className={styles.description}>{chapter.body}</p>
            <ul className={styles.chapterTags}>{chapter.tags.map(tag => <li key={tag}>{tag}</li>)}</ul><a className={styles.textLink} href="#contact">{index === 0 ? "Simplify your operations" : "Meet your technical partner"} <Arrow /></a>
          </div>
          <div className={styles.softwareDemo}>
            {index === 0 ? <WorkflowDemo /> : <CareDemo />}
            <div className={styles.demoCaption}><span>ENGINARA / {chapter.label.toUpperCase()}</span><span>Illustrative, interactive concept</span></div>
          </div>
        </section>)}

        <nav className={styles.chapterNav} data-chapter-navigation aria-label="Experience chapters">{chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} className={active === index ? styles.activeChapter : ""} aria-current={active === index ? "step" : undefined}><span>0{index + 1}</span>{chapter.label}<i /></a>)}</nav>
      </div>

      <section className={styles.capabilities} id="capabilities" aria-labelledby="capabilities-title">
        <div className={styles.sectionHeading} data-reveal><p className={styles.eyebrow}><span />ONE TEAM, ALL THE WAY THROUGH</p><h2 id="capabilities-title">From a first idea<br />to <em>everyday impact.</em></h2><p>Design, engineering and ongoing care.<br />A continuous partnership around your business.</p></div>
        <div className={styles.capabilityGrid}>{capabilities.map(capability => <a className={styles.capability} href={capability.href} key={capability.n} data-reveal>
          <span className={styles.capabilityNumber}>{capability.n}</span>
          <h3>{capability.title}</h3><div><p>{capability.copy}</p><small>{capability.items}</small></div><span className={styles.capabilityArrow} aria-hidden="true">↗</span>
        </a>)}</div>
        <p className={styles.conceptNote}>The software previews are illustrative concepts. Explore the controls to see how the pieces work together.</p>
      </section>

      <section className={styles.approach} id="approach" aria-labelledby="approach-title">
        <div data-reveal><p className={styles.eyebrow}><span />HOW WE WORK</p><h2 id="approach-title">A shared plan.<br />Clear next steps.</h2><p className={styles.approachIntro}>You stay involved from the first sketch<br />to the next release.</p><a className={styles.textLink} href="#contact">Talk through your idea <Arrow /></a></div>
        <ol className={styles.steps}>{[
          ["Understand", "We get to know your business, your people, and what could work better."],
          ["Create", "We design, build, and refine together. You see the progress, every step of the way."],
          ["Keep growing", "We launch with care, stay close, and help your systems evolve with you."],
        ].map(([title, copy], index) => <li key={title} data-reveal><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
      </section>

      <section className={styles.contact} id="contact" aria-labelledby="contact-title"><p className={styles.eyebrow} data-reveal><span />A SPACE FOR YOUR NEXT IDEA</p><h2 id="contact-title" data-reveal>What shall we<br /><em>make together?</em></h2><p data-reveal>A rough sketch is a good place to start.<br />Tell us what you have in mind.</p><a className={styles.primaryButton} href="mailto:hello@enginara.com?subject=Let%E2%80%99s%20build%20something" data-reveal>Start a project <Arrow /></a><a className={styles.email} href="mailto:hello@enginara.com">hello@enginara.com</a></section>
      <footer className={styles.footer}><div className={styles.footerWordmark} aria-hidden="true">enginara<span>.</span></div><div className={styles.footerBottom}><a className={styles.brand} href="#imagine" aria-label="Enginara home"><EnginaraMark /></a><p>You imagine. We build. We manage.</p><span>© {new Date().getFullYear()} Enginara</span><a href="#imagine">Back to top ↑</a></div></footer>
    </main>
  );
}
