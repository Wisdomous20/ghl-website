"use client";

import { useId, type ReactNode } from "react";
import styles from "./sketch-controls.module.css";

export function PencilArrow({ down = false }: { down?: boolean }) {
  return <svg className={styles.arrow} viewBox="0 0 26 26" width="26" height="26" fill="none" aria-hidden="true">
    <path d={down ? "M13 3 12.6 22 M6 15.5 12.6 22 20 14.6" : "M5 21 20.5 5.3 M9.8 4.9 21 4.5 20.7 15.5"} />
    <path opacity=".3" d={down ? "M14.1 5 13.8 20 M7.3 16.2 13.4 22.5" : "M6.5 21.3 20.5 7 M11 3.5 22 4.1 21.8 14"} />
  </svg>;
}

export function PencilUnderline() {
  return <svg className={styles.underline} viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 Q67 5 143 8 T297 5" /><path d="M13 14 Q103 9 184 11 T289 9" opacity=".4" /></svg>;
}

/** Shared pencil treatment for calls to action on the drawing surface. */
export function SketchLink({ href, children, compact = false }: { href: string; children: ReactNode; compact?: boolean }) {
  const pattern = useId().replace(/:/g, "");
  return <a className={`${styles.link} ${compact ? styles.compact : ""}`} href={href}>
    <svg className={styles.frame} viewBox="0 0 220 60" preserveAspectRatio="none" aria-hidden="true">
      <defs><pattern id={pattern} width="7" height="7" patternUnits="userSpaceOnUse"><path d="M-2 7 7-2 M4 9 9 4" stroke="currentColor" strokeWidth=".7" /></pattern></defs>
      <path className={styles.wash} d="M4 4 217 2 215 56 3 58Z" />
      <path className={styles.hatch} d="M4 4 217 2 215 56 3 58Z" fill={`url(#${pattern})`} />
      <path className={styles.edge} d="M2 5 Q104 2 217 3 L215 57 Q105 55 3 58 L2 5 M6 1 218 2 219 54 M1 11 3 59 206 58" />
    </svg>
    <span>{children}</span><PencilArrow />
  </a>;
}
