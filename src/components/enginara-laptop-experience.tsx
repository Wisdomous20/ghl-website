"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EnginaraMark } from "./enginara-mark";
import { EnginaraAssemblyIntro } from "./enginara-assembly-intro";
import { SketchLink } from "./sketch-controls";
import { SoftwareStory } from "./software-story";
import styles from "./enginara-laptop-experience.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function EnginaraLaptopExperience() {
  const root = useRef<HTMLElement>(null);
  const mobileMenu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (mobileMenu.current?.open && !mobileMenu.current.contains(event.target as Node)) mobileMenu.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenu.current?.open) {
        mobileMenu.current.open = false;
        mobileMenu.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, []);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add({ motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" }, context => {
      const noMotion = Boolean(context.conditions?.reduced);
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
        <a className={styles.brand} href="#imagine" aria-label="Enginara home"><EnginaraMark /><span>Enginara<span className={styles.brandDot}>.</span></span></a>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <a href="#build">What we do</a>
          <a href="#approach">Our approach</a>
          <SketchLink href="#contact" compact>Start a project</SketchLink>
        </nav>
        <details className={styles.mobileMenu} ref={mobileMenu}>
          <summary>Menu <span aria-hidden="true">+</span></summary>
          <nav aria-label="Mobile navigation" onClick={event => { if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open"); }}>
            <a href="#imagine">The idea <span>01</span></a><a href="#build">What we do <span>02</span></a><a href="#approach">Our approach <span>03</span></a><a href="#contact">Start a project <span>↗</span></a>
          </nav>
        </details>
      </header>

      <EnginaraAssemblyIntro />

      <SoftwareStory />

      <section className={styles.contact} id="contact" aria-labelledby="contact-title"><p className={styles.eyebrow} data-reveal><span />A SPACE FOR YOUR NEXT IDEA</p><h2 id="contact-title" data-reveal>What shall we<br /><em>make together?</em></h2><p data-reveal>A rough sketch is a good place to start.<br />Tell us what you have in mind.</p><a className={styles.primaryButton} href="mailto:hello@enginara.com?subject=Let%E2%80%99s%20build%20something" data-reveal>Start a project <Arrow /></a><a className={styles.email} href="mailto:hello@enginara.com">hello@enginara.com</a></section>
      <footer className={styles.footer}><div className={styles.footerWordmark} aria-hidden="true">enginara<span>.</span></div><div className={styles.footerBottom}><a className={styles.brand} href="#imagine" aria-label="Enginara home"><EnginaraMark /></a><p>You imagine. We build. We manage.</p><span>© {new Date().getFullYear()} Enginara</span><a href="#imagine">Back to top ↑</a></div></footer>
    </main>
  );
}
