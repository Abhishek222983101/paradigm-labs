// Paradigm mark: a camera viewfinder (four corners) around one live orange point.
// Reads as "film it" and "one verified human" at 16 px, and works on dark and light.
export function Mark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <rect x="1" y="1" width="30" height="30" rx="9" fill="currentColor" />
      <g stroke="var(--background)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12.5V10a2 2 0 0 1 2-2h2.5" />
        <path d="M19.5 8H22a2 2 0 0 1 2 2v2.5" />
        <path d="M24 19.5V22a2 2 0 0 1-2 2h-2.5" />
        <path d="M12.5 24H10a2 2 0 0 1-2-2v-2.5" />
      </g>
      <circle cx="16" cy="16" r="3.6" fill="var(--signal)" />
    </svg>
  )
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 text-[16px] font-semibold tracking-[-0.02em]">
      <Mark className="size-[24px]" />
      Paradigm
    </span>
  )
}
