"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ASSEMBLY_PARTS, type AssemblyPartId } from "./assembly-parts";
import styles from "./assembly-inspector.module.css";

type Props = {
  selected: AssemblyPartId | null;
  displayed: AssemblyPartId | null;
  hovered: AssemblyPartId | null;
  available: AssemblyPartId[];
  exploreButton: RefObject<HTMLButtonElement | null>;
  onSelect: (id: AssemblyPartId) => void;
  onClose: () => void;
  onRotate: (delta: number | null) => void;
  onBackdrop: (x: number, y: number) => void;
};

export function AssemblyInspector({ selected, displayed, hovered, available, exploreButton, onSelect, onClose, onRotate, onBackdrop }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const inspector = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; start: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const part = ASSEMBLY_PARTS.find(item => item.id === displayed);
  const hoveredLabel = ASSEMBLY_PARTS.find(item => item.id === hovered)?.label;

  useEffect(() => {
    if (!selected) return;
    const details = inspector.current?.querySelector<HTMLElement>("[data-inspection-details]");
    if (details) details.scrollTop = 0;
    title.current?.focus({ preventScroll: true });
  }, [selected]);
  useEffect(() => {
    if (!selected) return;
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const buttons = inspector.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!buttons?.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (!inspector.current?.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === title.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [selected]);
  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node)) setMenuOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); exploreButton.current?.focus({ preventScroll: true }); } };
    const scroll = () => setMenuOpen(false);
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); window.removeEventListener("scroll", scroll); };
  }, [menuOpen, exploreButton]);

  return <>
    <div className={styles.explorer} hidden={!available.length || Boolean(selected)} ref={menu}>
      <p className={styles.hint}>{hoveredLabel ? `${hoveredLabel} · Select to inspect` : "Explore a part up close."}</p>
      <button ref={exploreButton} className={styles.exploreButton} aria-expanded={menuOpen} aria-controls="assembly-parts" onClick={() => setMenuOpen(!menuOpen)}><span aria-hidden="true">{menuOpen ? "−" : "+"}</span>Explore components</button>
      {menuOpen && <div className={styles.partMenu} id="assembly-parts"><p>THE PARTS, UP CLOSE</p><div>{ASSEMBLY_PARTS.filter(item => available.includes(item.id)).map(item => <button key={item.id} onClick={() => { setMenuOpen(false); onSelect(item.id); }}>{item.label}<span aria-hidden="true">↗</span></button>)}</div></div>}
    </div>
    <div className={styles.inspector} ref={inspector} role="dialog" aria-modal={selected ? true : undefined} aria-labelledby="component-title" data-open={Boolean(selected)} aria-hidden={!selected} inert={!selected}
      onPointerDown={event => { if (event.target !== event.currentTarget) return; event.preventDefault(); suppressClick.current = false; drag.current = { id: event.pointerId, x: event.clientX, start: event.clientX, moved: false }; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={event => { const pointer = drag.current; if (!pointer || pointer.id !== event.pointerId) return; if (Math.abs(event.clientX - pointer.start) > 6) pointer.moved = true; if (pointer.moved) { onRotate((event.clientX - pointer.x) * .012); suppressClick.current = true; } pointer.x = event.clientX; }}
      onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
      onPointerCancel={() => { drag.current = null; suppressClick.current = true; }}
      onClick={event => { if (suppressClick.current) { suppressClick.current = false; return; } if (event.target === event.currentTarget) onBackdrop(event.clientX, event.clientY); }}>
      <button className={styles.back} onClick={onClose}><span aria-hidden="true">←</span>Back to assembly <kbd>Esc</kbd></button>
      {part && <section className={styles.details} aria-labelledby="component-title" data-inspection-details>
        <p className={styles.eyebrow}>A CLOSER LOOK / {part.service}</p>
        <h2 id="component-title" ref={title} tabIndex={-1}>{part.label}</h2>
        <h3>{part.title}</h3>
        <p className={styles.copy}>{part.copy}</p>
        <ul>{part.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
      </section>}
      <div className={styles.rotationControls}><p><span className={styles.pointerHint}>Scroll to rotate · Click outside to return</span><span className={styles.touchHint}>Drag to rotate · Tap outside to return</span></p><div><button onClick={() => onRotate(-Math.PI / 6)} aria-label="Rotate part left">↶</button><button onClick={() => onRotate(null)}>Front view</button><button onClick={() => onRotate(Math.PI / 6)} aria-label="Rotate part right">↷</button></div></div>
    </div>
  </>;
}
