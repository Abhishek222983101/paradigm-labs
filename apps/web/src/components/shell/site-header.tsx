import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Wordmark } from "@/components/brand/mark"
import { DesktopNav } from "./nav"
import { ThemeToggle } from "./theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 pt-safe backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-4 px-5">
        <Link href="/" aria-label="Paradigm home" className="-ml-1 rounded-md px-1">
          <Wordmark />
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-2">
          <Link
            href="/explorer"
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground md:hidden"
          >
            <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
            ON ARKIV
          </Link>
          <ThemeToggle />
          <Link
            href="/tasks"
            className="hidden h-9 items-center gap-1.5 rounded-[8px] bg-primary px-3.5 text-[14px] font-medium whitespace-nowrap text-primary-foreground transition-colors hover:bg-primary/85 md:inline-flex"
          >
            Find a task
            <ArrowRight className="size-[15px]" />
          </Link>
        </div>
      </div>
    </header>
  )
}
