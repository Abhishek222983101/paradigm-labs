import {
  Activity,
  BadgeCheck,
  Compass,
  LayoutGrid,
  type LucideIcon,
  ScanSearch,
  Video,
  Wallet,
} from "lucide-react"

export type NavItem = { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean }

/** Mobile bottom nav (app flow §Navigation): Tasks · Record · Me · Console. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/tasks", label: "Tasks", icon: LayoutGrid, match: (p) => p.startsWith("/tasks") },
  {
    href: "/record",
    label: "Record",
    icon: Video,
    match: (p) => p.startsWith("/record") || p.startsWith("/submissions"),
  },
  { href: "/me", label: "Me", icon: Wallet, match: (p) => p.startsWith("/me") },
  {
    href: "/console",
    label: "Console",
    icon: Compass,
    match: (p) => p.startsWith("/console") || p.startsWith("/approve"),
  },
]

/** Desktop adds the judge-facing pages. */
export const DESKTOP_EXTRA: NavItem[] = [
  { href: "/live", label: "Live", icon: Activity, match: (p) => p.startsWith("/live") },
  { href: "/explorer", label: "Explorer", icon: ScanSearch, match: (p) => p.startsWith("/explorer") },
  { href: "/proofs", label: "Proofs", icon: BadgeCheck, match: (p) => p.startsWith("/proofs") },
]
