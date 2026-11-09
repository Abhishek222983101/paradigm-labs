"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { cn } from "@/lib/utils"
import { DESKTOP_EXTRA, PRIMARY_NAV } from "./nav-items"

function DesktopNavInner({ path }: { path: string }) {
  return (
    <nav aria-label="Main" className="hidden md:flex items-center gap-7">
      {[...PRIMARY_NAV, ...DESKTOP_EXTRA].map((item) => {
        const active = item.match(path)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-[15px] transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function BottomNavInner({ path }: { path: string }) {
  // The recorder is full-screen: no nav over the camera.
  if (/^\/record\/.+/.test(path)) return null
  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-xl pb-safe"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {PRIMARY_NAV.map(({ href, label, icon: Icon, match }) => {
          const active = match(path)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-12 place-items-center rounded-full transition-colors",
                    active && "bg-signal-soft text-foreground",
                  )}
                >
                  <Icon className="size-[19px]" strokeWidth={active ? 2.2 : 1.8} />
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function WithPath({ render }: { render: (path: string) => React.ReactNode }) {
  return <>{render(usePathname())}</>
}

/** usePathname is request data: render a neutral nav in the static shell, highlight once it resolves. */
export function DesktopNav() {
  return (
    <Suspense fallback={<DesktopNavInner path="" />}>
      <WithPath render={(p) => <DesktopNavInner path={p} />} />
    </Suspense>
  )
}

export function BottomNav() {
  return (
    <Suspense fallback={<BottomNavInner path="" />}>
      <WithPath render={(p) => <BottomNavInner path={p} />} />
    </Suspense>
  )
}
