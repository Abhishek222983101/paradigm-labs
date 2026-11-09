# 04 — UI and UX Design Brief

> Companion doc. System architecture §14 is the source of truth for design decisions.

## Audience and tone
Contributors are non-technical phone users; buyers and judges are technical. Tone: **calm, precise, trustworthy**. Three adjectives: *clean, fast, honest*.

## Reference products
- **Arkiv** (arkiv.network): bracketed wordmark, IBM Plex Mono for data, orange accent. Borrow: data-forward typography, orange as the "on-chain" signal. Avoid: copying their brutalist layout.
- **Linear / Vercel dashboards:** borrow density, restraint, crisp states.
- **tessera-guard / d3coy (our earlier projects):** mood reference only (grey/black, clean landing). **Do not copy code, components, images or design files** (ETHGlobal from-scratch rule).
- **Avoid:** crypto clichés (neon gradients, glowing blobs), dense jargon on contributor screens.

## Color palette
| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#fafafa` | `#09090b` | page |
| `--surface` | `#ffffff` | `#18181b` | cards |
| `--border` | `#e4e4e7` | `#27272a` | dividers |
| `--text` | `#18181b` | `#fafafa` | body |
| `--muted` | `#71717a` | `#a1a1aa` | secondary |
| `--accent` | `#FE7446` | `#FE7446` | primary action, on-chain moments |
| `--success` | `#16a34a` | `#22c55e` | accepted, settled |
| `--warning` | `#d97706` | `#f59e0b` | review, pending approval |
| `--danger` | `#dc2626` | `#ef4444` | rejected, denied |
Sponsor proof badges: monochrome sponsor mark + accent dot (no off-brand recolouring of logos).

## Typography
Geist Sans (UI), Geist Mono (keys, hashes, amounts, code). Scale: 12 / 14 (body) / 16 / 20 / 24 / 32 / 48 (landing hero). Line height 1.5 body, 1.15 headings. Tabular numbers for amounts and timers.

## Components
shadcn/ui: Button (primary accent, secondary outline, ghost), Card, Sheet (claim), Dialog (confirm withdraw), Tabs (console), Badge, Progress, Toast (sonner), Skeleton, Tooltip. Custom: `ProofBadge`, `EntityCard` (title, key, owner, expiry countdown, explorer link), `PipelineSteps` (live), `VerdictCard`, `Recorder`, `PolicyPanel`, `LiveFeed`, `ApprovalCard` (QR + countdown). Magic UI only for: number ticker (landing counters), border beam (active pipeline step).

## Layout rules
Mobile-first at 393 px; breakpoints 640 / 1024 / 1280. 4-pt spacing scale (4, 8, 12, 16, 24, 32, 48). Max content width 1120 px. One primary action per screen, in thumb reach on mobile. Safe-area insets on the recorder.

## Screen notes
- **Landing:** hero line, 7-step loop strip, live counters (open tasks, distinct humans, USDC paid), proof badges, CTA "See open tasks".
- **Task board:** cards with reward (large, mono), slots left, countdown; skeletons while loading.
- **Recorder:** full-screen camera, challenge pinned at top, big round record button, timer ring, retake/submit after.
- **Live status:** vertical step list with timing; verdict card with each step + timestamp + evidence line; links to Arkiv/Swarm.
- **Me:** wallet chip, earnings total, licence list with time left and Withdraw.
- **Console:** policy panel (caps, threshold), live feed, approvals with QR, spend log.
- **Explorer:** query picker, SDK code block, JSON result, explorer links.

## Accessibility
WCAG AA contrast in both themes · visible focus rings · keyboard reachable everything on desktop · labels on all controls · 44 px touch targets · `prefers-reduced-motion` disables animations · captions for status changes (aria-live on pipeline steps).

## Interaction states
Every control has hover (desktop), focus, active, disabled, loading (spinner + label), success, error. Async actions show progress within 100 ms. Motion ≤ 200 ms ease-out.

## Assets needed
Our own ADX mark (generated, simple bracket + cube motif), favicon + PWA icons, sponsor marks from official brand pages (used per their guidelines), OG image. No assets from prior projects.

## Tools
frontend-design skill for direction; Airship (`npx @airshiplabs/cli --target 3000`) for visual tweaks on the running app; `find-animation-opportunities` and `better-interface` skills near the end.
