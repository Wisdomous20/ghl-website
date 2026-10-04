"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { EnginaraMark } from "./enginara-mark";
import { SketchLink } from "./sketch-controls";
import styles from "./enginara-laptop-experience.module.css";

export function SiteHeader({ pricing = false }: { pricing?: boolean }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const home = pricing ? "/" : "";

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (menu.current?.open && !menu.current.contains(event.target as Node)) menu.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return <header className={styles.header}>
    <Link className={styles.brand} href={`${home}#imagine`} aria-label="Enginara home"><EnginaraMark /><span>Enginara<span className={styles.brandDot}>.</span></span></Link>
    <nav className={styles.desktopNav} aria-label="Main navigation">
      <Link href={`${home}#build`}>What we do</Link>
      <Link href={`${home}#approach`}>Our approach</Link>
      <Link href="/pricing" aria-current={pricing ? "page" : undefined}>Pricing</Link>
      <SketchLink href="#contact" compact>Start a project</SketchLink>
    </nav>
    <details className={styles.mobileMenu} ref={menu}>
      <summary>Menu <span aria-hidden="true">+</span></summary>
      <nav aria-label="Mobile navigation" onClick={event => {
        if ((event.target as HTMLElement).closest("a") && menu.current) menu.current.open = false;
      }}>
        <Link href={`${home}#imagine`}>The idea <span>01</span></Link>
        <Link href={`${home}#build`}>What we do <span>02</span></Link>
        <Link href={`${home}#approach`}>Our approach <span>03</span></Link>
        <Link href="/pricing" aria-current={pricing ? "page" : undefined}>Pricing <span>04</span></Link>
        <a href="#contact">Start a project <span aria-hidden="true">↗</span></a>
      </nav>
    </details>
  </header>;
}
