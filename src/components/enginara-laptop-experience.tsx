"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EnginaraMark } from "./enginara-mark";
import { EnginaraAssemblyIntro } from "./enginara-assembly-intro";
import { SoftwareStory } from "./software-story";
import { ServicesOverview } from "./services-overview";
import { PackageComparison } from "./package-comparison";
import { RevenueCalculator, ServiceExamples } from "./service-examples";
import { OfferHero } from "./offer-hero";
import offers from "./services-overview.module.css";
import { SiteHeader } from "./site-header";
import styles from "./enginara-laptop-experience.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function EnginaraLaptopExperience() {
  const root = useRef<HTMLElement>(null);

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
    <main className={styles.page} ref={root} id="top">
      <a href="#build" className={styles.skip}>Skip introduction</a>
      <SiteHeader />
      <EnginaraAssemblyIntro />

      <section id="build" tabIndex={-1} className={`${offers.darkGroup} ${offers.buildChapter}`} aria-labelledby="offer-title">
        <OfferHero />
        <ServicesOverview />
        <SoftwareStory />
        <PackageComparison customBuildHref="#build-paths" startingPricesHref="/pricing#options" />
        <RevenueCalculator />
      </section>
      <ServiceExamples />

      <section className={styles.contact} id="contact" aria-labelledby="contact-title"><p className={styles.eyebrow} data-reveal><span />A SPACE FOR YOUR NEXT IDEA</p><h2 id="contact-title" data-reveal>What should we<br /><em>build together?</em></h2><p className={styles.contactCopy} data-reveal>Tell us where the work gets stuck and what you already use. We’ll give you an honest recommendation on where to start, and whether a Proven System or a Custom Build fits best.</p><div className={styles.contactActions} data-reveal><a className={styles.primaryButton} href="mailto:info@enginara.tech?subject=Blueprint%20call%20request">Book a call <Arrow /></a><a className={styles.secondaryButton} href="mailto:info@enginara.tech?subject=Project%20details">Send us the details <Arrow /></a></div><a className={styles.email} href="mailto:info@enginara.tech">info@enginara.tech</a></section>
      <footer className={styles.footer}><div className={styles.footerWordmark} aria-hidden="true">enginara<span>.</span></div><div className={styles.footerBottom}><a className={styles.brand} href="#top" aria-label="Enginara home"><EnginaraMark /></a><p>You imagine. We build. We manage.</p><span>© {new Date().getFullYear()} Enginara</span><a href="#top">Back to top ↑</a></div></footer>
    </main>
  );
}
