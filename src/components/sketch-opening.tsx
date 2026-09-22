import type { CSSProperties } from "react";
import styles from "./sketch-opening.module.css";

const strokes = [
  { d: "M104 117 L645 109 L655 450 L109 460 Z", delay: 0, duration: 1.1 },
  { d: "M107 164 L646 157 M132 139 L202 138 M498 134 L525 134 M546 133 L574 132 M596 132 L621 131", delay: .7, duration: .7 },
  { d: "M141 211 L353 208 M141 235 L320 232 M141 272 L312 270 M141 284 L324 282 M141 296 L288 294", delay: 1.1, duration: .9 },
  { d: "M400 193 L619 191 L623 403 L403 407 Z M402 195 L623 403 M619 191 L403 407", delay: 1.4, duration: 1.1 },
  { d: "M143 332 L267 330 L269 363 L144 365 Z M161 349 L227 348 M239 344 L244 348 L239 353", delay: 2, duration: .6, accent: true },
  { d: "M143 418 L254 416 M280 415 L366 414 M142 432 L214 431", delay: 2.25, duration: .6 },
  { d: "M339 211 Q349 168 315 109 Q293 61 249 63 M249 63 L258 74 M249 63 L266 62", delay: 2.6, duration: .7, accent: true },
  { d: "M663 280 L702 280 L704 325 M699 318 L704 327 L709 318 M689 362 L718 362 L718 388 L689 388 Z", delay: 2.8, duration: .65, accent: true },
  { d: "M101 493 L654 484 M101 487 L101 499 M654 478 L654 490", delay: 3, duration: .65 },
];

/** A native drawing sequence that can hand off to the scroll-controlled 3D sketch. */
export function SketchOpening() {
  return <div className={styles.drawing} aria-hidden="true">
    <svg viewBox="0 0 800 570" fill="none">
      <g className={styles.guides}><path d="M88 95V474 M668 88V465 M82 179L686 171 M86 473L677 462" /><path d="M92 101H108 M100 93V109 M645 473H661 M653 465V481" /></g>
      {strokes.map((stroke, index) => <path key={index} d={stroke.d} pathLength="1" className={`${styles.stroke} ${stroke.accent ? styles.accent : ""}`} style={{ "--delay": `${stroke.delay}s`, "--duration": `${stroke.duration}s` } as CSSProperties} />)}
      <g className={styles.notes}><text x="145" y="62" transform="rotate(-3 145 62)">a place for the idea</text><text x="431" y="430" transform="rotate(-1 431 430)">something worth making</text><text x="322" y="521">FIRST THOUGHTS / 01</text></g>
      <g className={styles.pencil} transform="translate(700 422) rotate(28)"><path d="M0 0H10V79L5 94 0 79Z M0 12H10 M0 79H10 M5 15V78" /><path className={styles.accent} d="M1 1H9V12H1Z" /></g>
    </svg>
  </div>;
}
