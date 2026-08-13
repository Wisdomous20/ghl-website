type EnginaraMarkProps = {
  className?: string;
  title?: string;
};

export function EnginaraMark({ className, title }: EnginaraMarkProps) {
  const labelled = Boolean(title);

  return (
    <svg
      aria-hidden={labelled ? undefined : true}
      aria-label={title}
      className={className}
      focusable="false"
      role={labelled ? "img" : undefined}
      viewBox="0 0 58 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="currentColor" height="10" rx="3" width="36" x="0" y="0" />
      <rect
        fill="var(--signal-orange)"
        height="10"
        rx="3"
        width="10"
        x="42"
        y="0"
      />
      <rect fill="currentColor" height="10" rx="3" width="40" x="0" y="19" />
      <rect fill="currentColor" height="10" rx="3" width="26" x="0" y="38" />
    </svg>
  );
}
