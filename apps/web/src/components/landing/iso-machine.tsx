"use client"
import { useEffect, useRef, useState } from "react"
import {
  Box,
  type Box3,
  Cursor,
  curve,
  Flight,
  Glow,
  Plate,
  Press,
  Ripple,
  Signal,
  useDemoTap,
} from "react-isokit"
import { Callout } from "react-isokit/drafting"
import "react-isokit/styles.css"
import "react-isokit/themes.css"

/* Paradigm as an isometric machine (react-isokit; ported from the team's TESSERA hero, mentor OK).
   A phone holds a fresh clip and a copied clip; both go to the verifier. The real clip is stored on Swarm, its verdict
   goes to Arkiv and the agent pays it on Hedera; the copy is stopped by the duplicate check. Auto-plays, or press FILM. */
const BASE: Box3 = { x: 0, y: 0, z: 0, w: 212, d: 146, h: 8 }
const AGENT: Box3 = { x: 8, y: 34, z: 8, w: 56, d: 52, h: 40 }
const TRAY: Box3 = { x: 18, y: 44, z: 48, w: 34, d: 24, h: 3 }
const DOC_OK: Box3 = { x: 21, y: 46, z: 51, w: 12, d: 9, h: 2.4 }
const DOC_BAD: Box3 = { x: 36, y: 55, z: 51, w: 12, d: 9, h: 2.4 }
const GW: Box3 = { x: 88, y: 44, z: 8, w: 38, d: 38, h: 54 }
const KEY: Box3 = { x: 10, y: 104, z: 8, w: 64, d: 24, h: 6 }
const EPX = 156
const EPS = [
  { id: "swarm", label: "SWARM", y: 6, ok: true, out: "stored" },
  { id: "arkiv", label: "ARKIV", y: 50, ok: true, out: "record" },
  { id: "hedera", label: "HEDERA", y: 94, ok: true, out: "6 USDC" },
] as const
const EP = { w: 44, d: 30, h: 22 }
const CABLE_Z = 9.4
const cableIn = curve(
  [AGENT.x + AGENT.w, 60, 16],
  [76, 60, CABLE_Z],
  [82, 63, CABLE_Z],
  [GW.x, 63, CABLE_Z],
  28,
)
const cableOut = (y: number) =>
  curve([GW.x + GW.w, 63, 16], [138, 63, CABLE_Z], [146, y + 15, CABLE_Z], [EPX, y + 15, CABLE_Z], 28)
const OK = "#3fb27f",
  BAD = "#f0545a"

function Doc({ b, bad }: { b: Box3; bad?: boolean }) {
  return (
    <Box
      {...b}
      r={1.2}
      top={
        <>
          <path className="ik-detail" d={`M1.6 1.6L${b.w / 2} ${b.d * 0.62}L${b.w - 1.6} 1.6`} />
          {bad && <path d={`M2 ${b.d - 2.2}H${b.w - 2}`} stroke={BAD} strokeWidth={1.6} />}
        </>
      }
    />
  )
}

export default function IsoMachine({
  autoplay = true,
  theme = "dark",
}: {
  autoplay?: boolean
  theme?: "dark" | "light"
}) {
  const [n, setN] = useState(0)
  const [stage, setStage] = useState(0) // 0 idle · 1 flying · 2 checking · 3 verdict
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])
  const send = () => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
    setN((v) => v + 1)
    setStage(1)
    timers.current.push(
      window.setTimeout(() => setStage(2), 950),
      window.setTimeout(() => setStage(3), 1650),
    )
  }
  // keep the machine alive: replay the scene every few seconds while the tab is visible
  const sendRef = useRef(send)
  useEffect(() => {
    sendRef.current = send
  })
  useEffect(() => {
    if (!autoplay) return
    const id = window.setInterval(() => {
      if (!document.hidden) sendRef.current()
    }, 6800)
    return () => window.clearInterval(id)
  }, [autoplay])
  const {
    ref: demoAnchor,
    phase,
    dismiss,
    plate,
  } = useDemoTap(
    () => {
      if (autoplay && n === 0) send()
    },
    { delay: 1600 },
  )
  const press = () => {
    dismiss()
    send()
  }
  const verdict = stage === 3
  const readout =
    stage === 0
      ? "task 6 USDC · phone ready"
      : stage === 1
        ? "clip uploading"
        : stage === 2
          ? "Gemini watching · code decides"
          : "clip paid 6 USDC · copy rejected"

  return (
    <Plate
      {...plate}
      theme={theme}
      credit={false}
      className="hero-iso"
      hint={n === 0 ? "Press film" : "Film again"}
      readout={readout}
      aspect={1.3}
      pad={0.02}
      fit={[BASE, AGENT, GW, [EPX + 44, 120, 30]]}
      label="An isometric machine: a phone sends a fresh clip and a copied clip to the Paradigm verifier. The fresh clip is stored on Swarm, recorded on Arkiv and paid on Hedera; the copy is rejected. Press film to replay."
    >
      <g ref={demoAnchor}>
        <Box {...BASE} r={10} />
        {/* the agent */}
        <Box
          {...AGENT}
          r={6}
          top={
            <>
              <text className="ik-label" x={8} y={44}>
                PHONE
              </text>
              <circle className="ik-fill" cx={AGENT.w - 8} cy={8} r={1.3} />
            </>
          }
          front={
            <>
              <rect className="ik-screen" x={6} y={6} width={44} height={22} rx={3} />
              <text className="ik-screen-text ik-dim" x={10} y={14.5} fontSize={5}>
                say mango · 3
              </text>
              <text className="ik-screen-text" x={10} y={23.5} fontSize={6.2}>
                clip 0:24
              </text>
              {[0, 1, 2, 3, 4].map((k) => (
                <path key={k} className="ik-detail" d={`M${8 + k * 3.2} 32v6`} />
              ))}
            </>
          }
        />
        <Box
          {...TRAY}
          r={2}
          top={<rect className="ik-well" x={2.5} y={2.5} width={TRAY.w - 5} height={TRAY.d - 5} rx={1.5} />}
        />
        {stage === 0 && (
          <>
            <Doc b={DOC_OK} />
            <Doc b={DOC_BAD} bad />
          </>
        )}
        {/* cables */}
        {stage >= 1 && <Signal key={`in-${n}`} points={cableIn} delay={0} duration={900} />}
        {/* gateway */}
        <Box
          {...GW}
          r={6}
          top={
            <>
              <rect className="ik-well" x={5} y={5} width={GW.w - 10} height={GW.d - 10} rx={3} />
              <path
                d="M9 14V10.5A1.5 1.5 0 0 1 10.5 9H14M24 9h3.5A1.5 1.5 0 0 1 29 10.5V14M29 24v3.5a1.5 1.5 0 0 1-1.5 1.5H24M14 29h-3.5A1.5 1.5 0 0 1 9 27.5V24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                opacity={0.9}
              />
              <circle cx={19} cy={19} r={3.6} fill="#FE7446" />
              <text className="ik-label" x={5} y={GW.d - 0.5} fontSize={4.6}>
                VERIFIER
              </text>
            </>
          }
          front={
            <>
              <rect className="ik-screen" x={4} y={6} width={GW.w - 8} height={20} rx={3} />
              <g key={`g-${n}-${stage}`} className="ik-enter">
                <text className="ik-screen-text ik-dim" x={8} y={14} fontSize={5}>
                  {stage === 2 ? "watching" : stage === 3 ? "verdict" : "standing by"}
                </text>
                <text className="ik-screen-text" x={8} y={22} fontSize={6.4} fill={verdict ? OK : undefined}>
                  {stage === 3 ? "accepted" : stage === 2 ? "Gemini…" : "ready"}
                </text>
              </g>
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <path key={k} className="ik-detail" d={`M${5 + k * 4} 32v14`} />
              ))}
            </>
          }
          side={
            <>
              <Glow on={stage > 0} className="lamp-glow">
                <circle cx={18} cy={9} r={2.4} fill={stage === 3 ? OK : stage > 0 ? "#f5b83d" : "#8a8a93"} />
              </Glow>
              {[0, 1, 2].map((k) => (
                <path key={k} className="ik-detail" d={`M6 ${18 + k * 5}h24`} />
              ))}
            </>
          }
        />
        {/* endpoints */}
        {EPS.map((e) => {
          const lit = stage === 3
          const reached = lit
          const stopped = false
          return (
            <g key={e.id}>
              {lit && <Signal key={`out-${e.id}-${n}`} points={cableOut(e.y)} delay={0} duration={700} />}
              <Box
                x={EPX}
                y={e.y}
                z={8}
                {...EP}
                r={4}
                top={
                  <>
                    <rect className="ik-well" x={22} y={5} width={19} height={14} rx={1.5} />
                    <text className="ik-label" x={5} y={25.5}>
                      {e.label}
                    </text>
                  </>
                }
                front={
                  <>
                    <path className="ik-detail" d="M5 7v9M8.2 7v9M11.4 7v9M14.6 7v9" />
                    <rect className="ik-screen" x={22} y={5} width={18} height={12} rx={2} />
                    <text
                      className="ik-screen-text"
                      x={25}
                      y={13.4}
                      fontSize={e.out.length > 6 ? 4.4 : 5.4}
                      fill={reached ? OK : stopped ? BAD : undefined}
                    >
                      {reached ? e.out : "idle"}
                    </text>
                  </>
                }
                side={
                  <Glow on={reached || stopped} className="lamp-glow">
                    <circle cx={11} cy={8.5} r={2.2} fill={reached ? OK : stopped ? OK : "#8a8a93"} />
                  </Glow>
                }
              />
            </g>
          )
        })}
        {stage === 0 && n === 0 && phase !== "aim" && phase !== "press" ? <Ripple {...KEY} r={6} /> : null}
        <Press label="Film a clip" material="plastic" onPress={press}>
          <g>
            <Box
              {...KEY}
              r={6}
              top={
                <text className="ik-label" x={8} y={14.4}>
                  {n === 0 ? "FILM A CLIP" : "FILM AGAIN"}
                </text>
              }
            />
          </g>
        </Press>
        {stage >= 1 && (
          <g key={`fl-${n}`}>
            <Flight
              from={[DOC_OK.x, DOC_OK.y, DOC_OK.z]}
              to={[GW.x + 12, GW.y + 14, GW.z + GW.h + 2]}
              delay={0}
              duration={700}
              lift={30}
            >
              <Doc b={DOC_OK} />
            </Flight>
            <Flight
              from={[DOC_BAD.x, DOC_BAD.y, DOC_BAD.z]}
              to={[GW.x + 12, GW.y + 20, GW.z + GW.h + 2]}
              delay={220}
              duration={700}
              lift={34}
            >
              <Doc b={DOC_BAD} bad />
            </Flight>
          </g>
        )}
        {verdict ? (
          <Callout at={[GW.x + GW.w, GW.y + GW.d, GW.z + GW.h - 20]} dx={34} dy={46} label="copy rejected" />
        ) : null}
        <Cursor at={[KEY.x + KEY.w / 2, KEY.y + KEY.d / 2, KEY.z + KEY.h]} phase={phase} />
      </g>
    </Plate>
  )
}
