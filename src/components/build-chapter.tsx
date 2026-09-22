"use client";

import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { EnginaraMark } from "./enginara-mark";
import { WebsiteDemo, WorkspaceDemo } from "./software-demos";
import { ServiceSystem } from "./service-system";
import { phase } from "./assembly-story";
import { useMotionPlayback } from "./use-motion-playback";
import styles from "./build-chapter.module.css";

export type BuildChapterHandle = { update: (progress: number, visible?: boolean) => void; reset: () => void };

export function BuildChapter({ ref }: { ref: Ref<BuildChapterHandle> }) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const identity = useRef<HTMLDivElement>(null);
  const services = useRef<HTMLDivElement>(null);
  const buildLink = useRef<HTMLAnchorElement>(null);
  const [route, setRoute] = useState<"custom" | "proven">("custom");
  const [previewActive, setPreviewActive] = useState(false);
  const playback = useMotionPlayback(root);
  const { setActive } = playback;
  useImperativeHandle(ref, () => ({
    update(progress, visible = true) {
      setActive(visible);
      const reveal = phase(progress, .84, .94);
      setPreviewActive(previous => previous === (reveal > .95) ? previous : reveal > .95);
      const departure = phase(progress, .15, .28);
      const serviceReveal = phase(progress, .2, .28) * (1 - phase(progress, .78, .85));
      root.current?.setAttribute("data-animated", "true");
      buildLink.current?.setAttribute("href", "#build");
      root.current?.style.setProperty("--reveal", String(reveal));
      root.current?.style.setProperty("--logo-opacity", String(1 - departure));
      root.current?.style.setProperty("--logo-scale", String(1 - .35 * departure));
      root.current?.style.setProperty("--logo-y", `${-90 * departure}px`);
      root.current?.style.setProperty("--service-reveal", String(serviceReveal));
      root.current?.style.setProperty("--software", progress >= .25 ? "1" : "0");
      root.current?.style.setProperty("--automation", progress >= .425 ? "1" : "0");
      root.current?.style.setProperty("--care", progress >= .645 ? "1" : "0");
      if (identity.current) { identity.current.inert = departure > .8; identity.current.setAttribute("aria-hidden", String(departure > .8)); }
      if (services.current) {
        services.current.inert = serviceReveal < .8;
        services.current.setAttribute("aria-hidden", String(serviceReveal < .8));
        const active = progress < .405 ? 0 : progress < .625 ? 1 : 2;
        services.current.setAttribute("data-active", String(active));
        services.current.querySelectorAll<HTMLElement>("[data-service-copy]").forEach((card, i) => {
          const start = [.2, .405, .625][i];
          const end = [.405, .625, .825][i];
          const enter = phase(progress, start, start + .04);
          const leave = phase(progress, end - .04, end);
          card.style.opacity = String(enter * (1 - leave));
          card.style.transform = `translateY(${20 * (1 - enter) - 12 * leave}px)`;
          card.setAttribute("aria-hidden", String(active !== i));
        });
      }
      if (content.current) { content.current.inert = reveal < .95; content.current.setAttribute("aria-hidden", String(reveal < .95)); }
    },
    reset() {
      root.current?.removeAttribute("style"); root.current?.removeAttribute("data-animated");
      setActive(true);
      setPreviewActive(true);
      buildLink.current?.setAttribute("href", "#build-paths");
      services.current?.removeAttribute("data-active");
      [content.current, identity.current, services.current].forEach(element => { if (element) { element.inert = false; element.removeAttribute("aria-hidden"); } });
      services.current?.querySelectorAll<HTMLElement>("[data-service-copy]").forEach(card => { card.removeAttribute("style"); card.removeAttribute("aria-hidden"); });
    },
  }), [setActive]);

  return <div className={styles.chapter} ref={root}>
    <div className={styles.logoMoment} ref={identity}>
      <p className={styles.identityEyebrow}>02 / THE IDEA BECOMES A SYSTEM</p>
      <div className={styles.identityWord}><EnginaraMark /><strong aria-label="Enginara">{"Enginara".split("").map((letter, index) => <span aria-hidden="true" key={index} style={{ animationDelay: `${index * .06}s` }}>{letter}</span>)}<span className={styles.identityDot} aria-hidden="true">.</span></strong></div>
      <p className={styles.identityServices}>Software · Automation · AI systems · Managed operations</p>
      <div className={styles.promise}>
        {[["You", "imagine.", "An idea worth making."], ["We", "build.", "The right tools, connected."], ["We", "manage.", "One team, beyond launch."]].map(([prefix, verb, detail], index) => <div key={verb}><span className={styles.promiseNumber}>0{index + 1}</span><h2>{prefix}{" "}<em>{verb}</em></h2><p>{detail}</p><i aria-hidden="true" /></div>)}
      </div>
      <small>ONE IDEA. ONE ACCOUNTABLE SYSTEM. <span aria-hidden="true">↓</span></small>
    </div>
    <div className={styles.services} ref={services}>
      <header className={styles.serviceHeader}><span>02 / BUILD</span><span>ONE TEAM. FROM IDEA TO EVERYDAY.</span><a ref={buildLink} href="#build-paths">Explore build paths <span aria-hidden="true">↘</span></a></header>
      <div className={styles.serviceCopy}>
        <article data-service-copy><p>01 / IMAGINE IT. ENGINEER IT.</p><h2>Your business.<br /><em>Your way of working.</em></h2><p>Custom software shaped around your idea, or a proven system made yours. Websites, applications and CRMs that fit the way your business works.</p><small>CUSTOM SOFTWARE / WEB APPS / CRM</small></article>
        <article data-service-copy><p>02 / MAKE IT WORK TOGETHER</p><h2>Less passing work.<br /><em>More moving forward.</em></h2><p>Connect your tools, automate the handoffs, and put AI where it helps. An enquiry becomes a conversation, without another thing to remember.</p><small>AUTOMATION / INTEGRATIONS / AI SYSTEMS</small></article>
        <article data-service-copy><p>03 / ONE PARTNER, BEYOND LAUNCH</p><h2>Technology should<br /><em>give you time back.</em></h2><p>Monitoring, maintenance and user support, with the improvements that keep your business moving. One team accountable for the whole system.</p><small>OPERATIONS / CLOUD / SUPPORT / ANALYTICS</small></article>
      </div>
      <ServiceSystem />
      <footer className={styles.serviceFooter}><span>IMAGINATION, MEET IMPLEMENTATION.</span><div aria-hidden="true"><i /><i /><i /></div><span>SCROLL TO EXPLORE THE SYSTEM ↓</span></footer>
    </div>
    <div className={styles.content} id="build-paths" ref={content}>
      <header className={styles.header}><a href="#imagine" aria-label="Enginara home"><EnginaraMark /><span>ENGINARA</span></a><span>02 / BUILD</span><a href="#contact">Start a project <span aria-hidden="true">↗</span></a></header>
      <div className={styles.heading}><div><p>TWO WAYS IN. ONE TEAM WITH YOU.</p><h2 id="build-title">Your idea.<br /><em>A working reality.</em></h2></div><p>Build exactly what you imagine, or start<br />with a proven foundation and make it yours.<br />Either way, we make the pieces work together.</p></div>
      <div className={styles.work}>
        <div className={styles.routes} role="group" aria-label="Explore ways to build"><button aria-pressed={route === "custom"} onClick={() => setRoute("custom")}><span>01 / FROM A BLANK PAGE</span><strong>Custom build <i aria-hidden="true">↗</i></strong><p>A website, application or workflow, designed around the way your business works.</p></button><button aria-pressed={route === "proven"} onClick={() => setRoute("proven")}><span>02 / FROM A PROVEN FOUNDATION</span><strong>Proven systems <i aria-hidden="true">↗</i></strong><p>Start with a tested system. Shape the connections, experience and details around you.</p></button><small>SELECT A PATH TO EXPLORE THE PREVIEW →</small></div>
        <div className={styles.preview}><div className={styles.previewBar}><span><i />{route === "custom" ? "formandfield.example" : "northstar.example / workspace"}</span><span>INTERACTIVE CONCEPT</span></div><div className={styles.previewBody}>{route === "custom" ? <WebsiteDemo playing={playback.running && previewActive} /> : <WorkspaceDemo playing={playback.running && previewActive} />}</div></div>
      </div>
      <footer className={styles.footer}><span>IMAGINED. ENGINEERED. CONNECTED.</span><a href="#automate">Then, put it to work <span aria-hidden="true">↓</span></a></footer>
    </div>
    <button className={styles.motionToggle} onClick={() => playback.setPaused(!playback.paused)} aria-pressed={playback.paused}><span aria-hidden="true">{playback.paused ? "▷" : "Ⅱ"}</span>{playback.paused ? "Play motion" : "Pause motion"}</button>
  </div>;
}
