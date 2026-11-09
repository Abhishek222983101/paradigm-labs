"use client"

// Client pieces of the landing (ported from the team's TESSERA landing, mentor OK): the pixel field behind the hero,
// the isometric machine, the "How it works" bento and the halftone footer. All follow the light/dark toggle.
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Mark } from "@/components/brand/mark"
import HalftoneWordmarkFooter from "./halftone-wordmark-footer"
import InkOrbitFeatures from "./ink-orbit-features"
import IsoMachine from "./iso-machine"
import { PixelCanvas } from "./pixel-perfect-hero"

function useDark() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return { dark: !mounted || resolvedTheme !== "light", mounted, resolvedTheme }
}

export function HeroBackground() {
  const { mounted, resolvedTheme } = useDark()
  const [colors, setColors] = useState<string[]>([])
  useEffect(() => {
    if (!mounted) return
    const d = document.createElement("div")
    document.body.appendChild(d)
    d.className = "text-muted-foreground"
    const m = getComputedStyle(d).color
    d.className = "text-signal"
    const p = getComputedStyle(d).color
    document.body.removeChild(d)
    setColors([m, m, m, m, m, m, p])
  }, [mounted, resolvedTheme])
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
      {colors.length > 0 ? <PixelCanvas key={resolvedTheme} colors={colors} gap={7} speed={25} /> : null}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,transparent_0%,var(--background)_75%)]" />
    </div>
  )
}

export function HeroMachine() {
  const { dark, resolvedTheme } = useDark()
  return <IsoMachine key={resolvedTheme} theme={dark ? "dark" : "light"} />
}

export function HowItWorks() {
  const { dark } = useDark()
  return (
    <InkOrbitFeatures
      theme={dark ? "dark" : "light"}
      brand="Paradigm"
      tag="How it works"
      title="Every clip is *checked by AI,*\npaid by an agent"
      team={["Filming in Mumbai", "Filming in Pune", "Filming in Delhi", "Filming in Goa", "Copied clip"]}
      reportLabel="CLIP #"
      collaboration={{
        title: "One verifier",
        description: "Gemini watches each clip. Code decides, and a copy is caught.",
      }}
      reports={{
        title: "A licence per clip",
        description: "Accepted clips are paid in USDC and the licence is yours on Arkiv.",
      }}
      integrations={{
        title: "Built on four networks",
        description: "Arkiv records, Swarm storage, Hedera payments, World ID humans.",
        tools: ["Arkiv", "Swarm", "Hedera", "World ID"],
      }}
      insights={{
        title: "Real payments",
        description: "Our four testnet payouts. Above 5 USDC, a human approved with World ID.",
        values: [3, 3, 6, 6],
        forecastFrom: 2,
      }}
    />
  )
}

export function SiteFooter() {
  const { dark } = useDark()
  const [ff, setFf] = useState("Helvetica, Arial, sans-serif")
  useEffect(() => setFf(getComputedStyle(document.body).fontFamily), [])
  return (
    <HalftoneWordmarkFooter
      key={dark ? "d" : "l"}
      wordmark="paradigm"
      fontFamily={ff}
      monoFamily={ff}
      height="640px"
      crop={0}
      palette={
        dark
          ? { background: "#0a0a0b", ink: "#e9e9ec", warm: "#FE7446" }
          : { background: "#f6f0e3", ink: "#FE7446", warm: "#c2410c" }
      }
      label="Team Paradigm"
      meta="Built at ETHGlobal Mumbai 2026. Robot teams' agents buy verified clips from real people."
      columns={[
        {
          title: "Use it",
          links: [
            { label: "Open tasks", href: "/tasks" },
            { label: "Record", href: "/record" },
            { label: "My earnings", href: "/me" },
            { label: "Watch the demo", href: "/demo" },
          ],
        },
        {
          title: "Agents",
          links: [
            { label: "Live system", href: "/live" },
            { label: "Buyer console", href: "/console" },
            { label: "Records on Arkiv", href: "/explorer" },
            { label: "Proofs", href: "/proofs" },
          ],
        },
        {
          title: "Built on",
          links: [
            { label: "Arkiv + Swarm" },
            { label: "Hedera x402" },
            { label: "World ID" },
            { label: "Gemini" },
          ],
        },
      ]}
      status={
        <span className="inline-flex items-center gap-2">
          <Mark className="size-4" />
          <span className="inline-block size-2 rounded-full bg-success" />
          Live on testnets
        </span>
      }
    />
  )
}
