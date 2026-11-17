import styles from "./software-story.module.css";

export const softwareBeats = [
  { id: "build-paths", label: "Build", at: .12 },
  { id: "automate", label: "Connect", at: .355 },
  { id: "capabilities", label: "Expand", at: .54 },
  { id: "manage", label: "Care", at: .745 },
  { id: "approach", label: "Our approach", at: .97 },
] as const;

export function SoftwareChapterNav({ current }: { current?: string }) {
  return (
    <nav className={styles.chapterLinks} aria-label="Section 02 chapters">
      {softwareBeats.map((beat, index) => (
        <a key={beat.id} href={`#${beat.id}`} aria-current={current === beat.id ? "step" : undefined}>
          <span aria-hidden="true">0{index + 1}</span>{beat.label}
        </a>
      ))}
      <a href="#packages"><span aria-hidden="true">↘</span>Packages</a>
    </nav>
  );
}
