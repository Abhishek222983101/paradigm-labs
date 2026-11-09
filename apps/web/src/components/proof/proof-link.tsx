import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Kind = "arkiv" | "hedera" | "swarm" | "world"

const LABEL: Record<Kind, string> = {
  arkiv: "On Arkiv",
  hedera: "Settled on Hedera",
  swarm: "Stored on Swarm",
  world: "Verified human",
}

/** Small clickable proof chip. Every on-chain thing in the UI links to its explorer (§14). */
export function ProofLink({
  kind,
  href,
  label,
  className,
}: {
  kind: Kind
  href?: string
  label?: string
  className?: string
}) {
  const body = (
    <>
      <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
      {label ?? LABEL[kind]}
      {href ? <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" /> : null}
    </>
  )
  const cls = cn(
    "inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12.5px] font-medium text-foreground",
    href && "transition-colors hover:border-foreground/30 hover:text-foreground",
    className,
  )
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {body}
      <span className="sr-only">(opens explorer in a new tab)</span>
    </a>
  ) : (
    <span className={cls}>{body}</span>
  )
}
