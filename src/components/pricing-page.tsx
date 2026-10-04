"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiteHeader } from "./site-header";
import { EnginaraMark } from "./enginara-mark";
import { PencilArrow, PencilUnderline, SketchLink } from "./sketch-controls";
import { inquiryHref, pricingOptions } from "./pricing-options";
import site from "./enginara-laptop-experience.module.css";
import styles from "./pricing-page.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const questions = [
  { question: "Which starting point fits my business?", answer: "Start with a Systems Blueprint if the next step isn’t clear. A Proven System fits work that existing tools can support. A Custom Build fits requirements those tools can’t meet. We’ll recommend the simpler path when it does the job." },
  { question: "Can you work with the tools we already use?", answer: "We map your existing tools and handoffs before recommending changes. The Blueprint identifies what to retain, what to connect and where configuration or custom development is needed." },
  { question: "What happens after launch?", answer: "We monitor connections, keep the system current, support your team and plan improvements as your needs change. We’ll discuss ongoing care alongside the build so you can understand both parts of the work." },
  { question: "Is Managed Operations the same as system care?", answer: "No. System care maintains and improves the technology. Managed Operations is a separate service with trained team members carrying out a defined set of monthly services, such as marketing, administrative support and reporting." },
];

function PlanningSheets() {
  return <div className={styles.planningSheets} aria-hidden="true">
    <div className={styles.planSheet} data-plan-sheet><span>Understand the work</span><svg viewBox="0 0 300 155" fill="none"><path d="M35 25H115V65H35Z M184 23H263V65H184Z M104 109H186V145H104Z M76 65V91H144V109 M224 65V91H144 M119 44H181 M173 38L182 44 174 51" /><path d="M47 39H87 M47 50H98 M196 38H250 M196 51H230 M118 122H175 M118 133H159" /></svg><small>Tools · people · handoffs</small></div>
    <div className={styles.planSheet} data-plan-sheet><span>Build the connections</span><svg viewBox="0 0 300 155" fill="none"><path d="M42 29H261V140H42Z M42 53H261 M57 42H61 M69 42H73 M81 42H85 M57 70H134V123H57Z M153 72H241 M153 90H218 M153 108H229" /><path className={styles.drawingAccent} d="M83 97 94 108 118 81" /></svg><small>Configure · build · connect</small></div>
    <div className={styles.planSheet} data-plan-sheet><span>Keep moving forward</span><svg viewBox="0 0 300 155" fill="none"><path d="M53 126H254 M68 120V87H96V120 M123 120V66H151V120 M181 120V39H209V120" /><path className={styles.drawingAccent} d="M61 63 117 45 154 54 222 19 M208 17 225 18 223 35" /></svg><small>Monitor · support · improve</small></div>
  </div>;
}

export function PricingPage() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const sheets = gsap.utils.toArray<HTMLElement>("[data-plan-sheet]", root.current);
      gsap.from(sheets, {
        y: index => 18 + index * 18, rotation: index => (index - 1) * 8,
        stagger: .08, duration: .8, ease: "power3.out",
      });
      gsap.to(sheets, {
        y: index => -index * 16, rotation: index => (1 - index) * 3, stagger: .04,
        scrollTrigger: { trigger: root.current?.querySelector("[data-pricing-hero]"), start: "top top", end: "bottom top", scrub: .6 },
      });
      gsap.from("[data-care-word]", {
        opacity: .25, stagger: .12, ease: "none",
        scrollTrigger: { trigger: "[data-care-heading]", start: "top 85%", end: "top 55%", scrub: .4 },
      });
    });
    return () => media.revert();
  }, { scope: root });

  return <main className={`${site.page} ${styles.page}`} ref={root} id="top">
    <a className={site.skip} href="#options">Skip to pricing</a>
    <SiteHeader pricing />

    <section className={styles.hero} data-pricing-hero aria-labelledby="pricing-title">
      <p className={styles.kicker}>Pricing & build paths</p>
      <h1 id="pricing-title">A clear plan.<br /><span>The right investment.<PencilUnderline /></span></h1>
      <p className={styles.heroLead}>Start with what your business needs.<br className={styles.desktopBreak} /> Build the right system, with one team accountable.</p>
      <div className={styles.heroActions}><SketchLink href="#options">Find your starting point</SketchLink><a className={styles.textLink} href="#contact">Talk it through <PencilArrow /></a></div>
      <div className={styles.heroFoot}><p>A Blueprint to understand.<br />A build to bring it together.<br /><strong>A partner beyond launch.</strong></p><PlanningSheets /></div>
    </section>

    <section className={styles.options} id="options" aria-labelledby="options-title">
      <div className={styles.sectionHeading}><div><p className={styles.kicker}>From the first question to the working system</p><h2 id="options-title">Choose where<br /><span>we begin.</span></h2></div><p>Each business starts somewhere different. Find the scope that fits yours, then let’s work through the details.</p></div>
      <div className={styles.offerList}>
        {pricingOptions.map((option, index) => <article className={styles.offer} id={option.id} key={option.id} aria-labelledby={`${option.id}-title`}>
          <div className={styles.offerName}><span className={styles.offerIndex} aria-hidden="true">0{index + 1}</span><p className={styles.kicker}>{option.intent}</p><h3 id={`${option.id}-title`}>{option.name}</h3><p className={styles.fit}>{option.fit}</p></div>
          <div className={styles.offerDetails}><h4>{option.title}</h4><p>{option.description}</p><ul>{option.scope.map(item => <li key={item}>{item}</li>)}</ul></div>
          <div className={styles.offerPrice}><dl className={styles.priceBreakdown}>{option.prices.map(price => <div key={price.label}><dt className={styles.priceLabel}>{price.label}</dt><dd className={styles.price}><span>From </span>{price.amount}<small>{price.suffix}</small></dd></div>)}</dl><p className={styles.priceNote}>{option.priceNote}</p><a className={styles.textLink} href={inquiryHref(option.subject)}>{option.action}<PencilArrow /></a></div>
        </article>)}
      </div>
      <p className={styles.scopeNote}>These are starting prices. Third-party software, hosting, migrations, custom additions and Managed Operations are scoped separately where they apply.</p>
      <p className={styles.scopeNote}>Not sure which path fits? <a href={inquiryHref("Help choosing a starting point")}>Tell us where the work gets stuck <span aria-hidden="true">↗</span></a></p>
    </section>

    <section className={styles.care} aria-labelledby="pricing-care-title">
      <div className={styles.careIntro}><p className={styles.kicker}>Beyond the build</p><h2 id="pricing-care-title" data-care-heading>{["Built to launch.", "Backed to last."].map(line => <span key={line}>{line.split(" ").map((word, index) => <span key={index} data-care-word>{word} </span>)}</span>)}</h2><p>Technology should give you time back. We stay with the system as your business changes.</p><a className={styles.textLink} href={inquiryHref("Ongoing system care inquiry")}>Discuss ongoing care <PencilArrow /></a></div>
      <div className={styles.careDetails}><div className={styles.careLine}><span aria-hidden="true">↗</span><div><h3>Keep the system working.</h3><p>Monitor connections, keep everything current and support the people using it.</p></div></div><div className={styles.careLine}><span aria-hidden="true">↗</span><div><h3>Improve it with a plan.</h3><p>Make considered improvements as your workflows, team and goals evolve.</p></div></div><div className={styles.operations}><p className={styles.kicker}>A separate service</p><h3>Need people to run the work, too?</h3><p>Managed Operations provides trained team members for a defined set of monthly services, such as marketing, administrative support and reporting.</p><a className={styles.textLink} href={inquiryHref("Managed Operations inquiry")}>Talk about Managed Operations <PencilArrow /></a></div></div>
    </section>

    <section className={styles.faq} aria-labelledby="pricing-faq-title"><div><p className={styles.kicker}>Before we get started</p><h2 id="pricing-faq-title">A few good<br /><span>questions.</span></h2></div><div className={styles.questions}>{questions.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>

    <section className={`${site.contact} ${styles.contact}`} id="contact" aria-labelledby="pricing-contact-title"><p className={site.eyebrow}><span />LET’S FIND YOUR STARTING POINT</p><h2 id="pricing-contact-title">What should we<br /><em>build together?</em></h2><p className={site.contactCopy}>Tell us what you already use and where the work gets stuck. We’ll help you find the right next step.</p><div className={site.contactActions}><a className={site.primaryButton} href={inquiryHref("Blueprint call request")}>Book a call <PencilArrow /></a><a className={site.secondaryButton} href={inquiryHref("Project details")}>Send us the details <PencilArrow /></a></div><a className={site.email} href="mailto:info@enginara.tech">info@enginara.tech</a></section>
    <footer className={site.footer}><div className={site.footerWordmark} aria-hidden="true">enginara<span>.</span></div><div className={site.footerBottom}><Link className={site.brand} href="/" aria-label="Enginara home"><EnginaraMark /></Link><p>You imagine. We build. We manage.</p><Link href="/">Back to the story <span aria-hidden="true">↗</span></Link><span>© {new Date().getFullYear()} Enginara</span><a href="#top">Back to top ↑</a></div></footer>
  </main>;
}
