# 08 — Fast-track kit: what we may legally reuse, per module

> **Checked:** 5 Nov 2026 (morning IST) against the GitHub API (`license.spdx_id`, `pushed_at`, `archived`), the npm registry (`npm view`), and the official docs (via Exa). Nothing was cloned or run.
> **ETHGlobal rule:** "Any prior project-specific code, designs, or assets are not allowed unless they're from public libraries or starter kits." So we only take three kinds of thing: (a) npm libraries, (b) official sponsor or vendor starters and examples, (c) permissively licensed OSS (MIT, Apache-2.0, BSD, ISC). We keep the licence notice and credit the source in `AI_USAGE.md` / `THIRD-PARTY-NOTICES.md`.
> **"Last push"** is the repo's `pushed_at`. **UNVERIFIED** means I did not confirm it against a primary source.
> **New since doc 02 (3 Nov):** `@x402/*` went from **2.29.0 to 2.30.0** (4 Nov), and the Vercel AI SDK is now **v7** (`ai` 7.0.163). Agent Kit's AI SDK adapter requires `ai ^7.0.37`, and `@x402/next` requires **Next ≥16.4.1**. Gemini's recommended API is now the **Interactions API** (`ai.interactions.create`), and `generateContent` is "legacy, fully supported".

---

## 1. Arkiv (SDK 1.0.1, Rabdi)

There is **no official create-app or template for SDK 1.0.** Both scaffolders on npm are older (see the Do NOT use list). Build from the SDK samples and the Mumbai workshop app.

| Name | URL | Licence | Last push | Compatible? | What to take | Risk |
|---|---|---|---|---|---|---|
| **SDK samples** in `arkiv-sdk-js` | github.com/Arkiv-Network/arkiv-sdk-js/tree/main/sample (`write_example.ts`, `read_example.ts`, `events_example.ts`) | MIT | 2 Nov 2026 (samples changed 29 Oct: "replace tiramisu with rabdi", "page with limit and offset, watch events from the head only") | Yes: `defineSchema`, `rabdi({accessKey})`, typed constructors, `@arkiv-network/sdk/query` | The `createPublicClient`/`createWalletClient` setup, the schema with `.indexed()`/`bytes()`, create, query, watch. This is the canonical shape for our `lib/arkiv.ts`. | Low. The samples are short scripts, not an app. |
| **Arkiv ETHGlobal Mumbai workshop app** (Arkiv DevRel, SantiagoDevRel) | github.com/SantiagoDevRel/mumbai-ethglobal | MIT (has LICENSE + THIRD-PARTY-NOTICES) | 4 Nov 2026 | Yes. Next 16.4.3, React 19.3.1, Tailwind 4.3.3, `@arkiv-network/sdk` **1.0.0** (bump to 1.0.1), viem 2.57.11 | The pattern for a server-side writer: `lib/server/writer.ts`, `shared/arkiv/clients-1.0.ts`, `shared/arkiv/sdk-1.0.ts` (access key kept server-side, keyed URL never sent to the browser, an RPC read allowlist proxied through `/api/[...path]`). Also `lib/data/useLiveData.ts` / `visible-poll.ts` for a live board that polls. | Medium. It's a big workshop app with a lot of deck and globe code. Copy **only** small helpers, with MIT attribution. It's owned by a personal account, but it is the official workshop starter from today. |
| **Arkiv skills** (agent guidance) | github.com/Arkiv-Network/skills · `npx skills add Arkiv-Network/skills --skill arkiv` | **No LICENSE file.** The README says each skill's frontmatter declares MIT. | 3 Nov 2026 | Yes. Targets SDK `>=1.0.0 <2`, checked with 1.0.1 and Rabdi 7794095 | Load it as **AI context only**: `arkiv-first-write`, `arkiv-data-modeling`, `arkiv-query`, `arkiv-write-safety`, `arkiv-security-trust`. Use `arkiv-feedback` to draft `/arkiv/friction.md`. Its `scripts/seed-rabdi.mjs` is a good model for our re-seed script. | Low as context. Don't copy script code into the repo until the licence is confirmed. Key gas rule from the skills: gas ≥ max(1,000,000 + 400,000×(N−1), 2×estimate), with an explicit nonce and gasPrice. |
| **Arkiv plugin for Claude Code** (`arkiv@arkiv`, v0.5.4) | github.com/Arkiv-Network/ai-plugin (renamed from `claude-plugin` on 27 Oct; the old name redirects) · `claude plugin marketplace add Arkiv-Network/ai-plugin && claude plugin install arkiv@arkiv` | No LICENSE file | 3 Nov 2026 | Yes. SDK `>=1.0.0 <2`, Rabdi. **Bundles the ETHGlobal Mumbai MCP profile `https://mcp.arkiv.network/mumbai`** (no key needed) until 10 Nov | Install it in the build repo on night 1. It gives skills, a hosted MCP with event rules, and a SessionStart hook that checks our installed SDK version. | Low. It's tooling, not shipped code. It needs Node ≥20 on PATH. |
| Helper libs by Arkiv DevRel (npm) | `arkiv-chunking` 1.1.6 · `arkiv-encryption` 1.1.3 · `arkiv-images` 1.0.6 · `arkiv-graph` 1.1.2 · `postgres-to-entity` 1.0.4 · `arkiv-sync` 1.0.2 | MIT | 3–4 Nov 2026 | All peer on `@arkiv-network/sdk ^1.0.0` | **Optional.** `arkiv-graph` (React force-graph of entities) could give a cheap "reach" visual of task→claim→verification→receipt links. We probably don't need the others: no media goes on Arkiv. | Low to medium. They're days old and single-maintainer. |

---

## 2. Hedera x402 (v2 `@x402/*` 2.30.0)

**Key finding: none of the official x402-foundation examples use Hedera.** Every one is EVM or SVM. The pattern is identical, though: swap `ExactEvmScheme` for `ExactHederaScheme` from `@x402/hedera/exact/{server,client}` and register it under `"hedera:*"`. Also, `@x402/paywall` renders only EVM, Solana and Algorand pages, so **a browser hitting a Hedera route gets the static 402 page.** That's fine, because our payer is an agent.

| Name | URL | Licence | Last push | Compatible? | What to take | Risk |
|---|---|---|---|---|---|---|
| **x402 fullstack Next.js example** | github.com/x402-foundation/x402/tree/main/examples/typescript/fullstack/next (`proxy.ts`, `app/api/weather/route.ts`) | Apache-2.0 | 5 Nov 2026 | `@x402/next` 2.30 needs Next ≥16.4.1. Example is EVM+SVM | **`withX402(handler, routes, server)`** for per-route gating, which settles only if the handler returns <400. That's exactly what a paid `/api/tasks/feed` or `/api/verification/:id` needs. Replace the scheme with `new ExactHederaScheme()`, set `network: "hedera:testnet"`, `price: "$0.01"` (resolves to USDC 0.0.429274), and `payTo: "0.0.x"`. | Low. It's the official example. |
| **`@x402/hedera` README** (client/server/facilitator snippets + token-association snippet) | github.com/x402-foundation/x402/blob/main/typescript/packages/mechanisms/hedera/README.md | Apache-2.0 | package bumped 4 Nov 2026 | Yes, 2.30.0 | `createClientHederaSigner(accountId, PrivateKey, {network:"hedera:testnet"})` + `new x402Client().register("hedera:*", new ExactHederaScheme(signer))`; the server `register("hedera:*", …)`; the `TokenAssociateTransaction` script (import SDK primitives **from `@x402/hedera`** so there's only one `@hiero-ledger/sdk` instance). | Low |
| **x402 fetch client + MCP server/client examples** | `examples/typescript/clients/fetch`, `servers/mcp` (`createPaymentWrapper`), `clients/mcp` | Apache-2.0 | 5 Nov 2026 | EVM examples; `@x402/mcp` 2.30 peers on `@modelcontextprotocol/sdk ^1.32.0` | `wrapFetchWithPayment(fetch, client)` for the buyer agent. `createPaymentWrapper` if we expose a paid MCP tool. | Low |
| **Blocky402 "Agentic Commerce" workshop** (WAD 2026) | github.com/blockydevs/wad2026-x402-workshop | Apache-2.0 (LICENSE + NOTICE) | 10 Jul 2026 | Hedera-native; pins `@x402/*` **2.16.0** and Agent Kit `^4.0.0` + langchain adapter `^1.0.0` (now 2.1.0) | **`agent-kit/src/spend-cap-policy.ts`**: a working `AbstractPolicy` budget cap (blocks in `shouldBlockPostParamsNormalization`, records in `shouldBlockPostCoreAction`). It's the missing "budget policy" from doc 02. Also `signer/x402-sign.ts`, a delegated signer that keeps the key out of the agent process, and `shop/src/x402.config.ts` (Hono server with Hedera). | Medium. It's 4 months old and on older pins, so port the patterns to 2.30 / Agent Kit 4.2. Blocky402 is a listed facilitator, so this is sponsor-ecosystem code. |
| `hedera-dev/x402-inference-pay-per-request-poc` | github.com/hedera-dev/x402-inference-pay-per-request-poc | **NONE (no licence)** | 15 Jul 2026 | `@x402/*` ^2.18, Agent Kit ^4.0.0, `hedera-agent-kit-ai-sdk` ^1.0.0 (now 2.x), `ai` ^6 | **Read only.** It shows the official shape (agent `x402-client.ts`, service `x402.ts`, `scripts/associate-token.ts`). **Do not copy code**: no licence. | High if copied. |
| Facilitators | `https://x402.org/facilitator`, `https://testnet.facilitator.launa.dev`, `https://api.testnet.blocky402.com` | (service) | live on 3 Nov (doc 02) | `hedera:testnet` | `new HTTPFacilitatorClient({ url })`. Keep a second one as fallback in env. | Low. Re-check `GET /supported` on night 1. |

---

## 3. Hedera Agent Kit v4 (4.2.0)

| Name | URL | Licence | Last push | Compatible? | What to take | Risk |
|---|---|---|---|---|---|---|
| **Agent Kit AI SDK examples** | github.com/hashgraph/hedera-agent-kit-js/tree/main/examples/ai-sdk | Apache-2.0 | 4 Nov 2026 | Yes: `ai ^7.0.37`, `@hiero-ledger/sdk 2.90.1`, kit from workspace (4.2) | `policy-enforcement-agent.ts` (`HederaAIToolkit` + `context.hooks: [policy]` + `wrapLanguageModel(… middleware)`), **`audit-trail-agent.ts` (`HcsAuditTrailHook(['transfer_…_tool'], topicId)`, which gives the HCS spend log for extra points)**, `custom-signing-agent.ts`, `hedera-network-mcp-agent.ts`. | Low |
| **`docs/HOOKS_AND_POLICIES.md`** | same repo `/docs` | Apache-2.0 | 4 Nov 2026 | v4 | The policy lifecycle: implement only `shouldBlock…` methods and never override `preToolExecutionHook`. Policies and hooks go in the same `context.hooks` array. Also `MIGRATION-v4.md`: **v4 requires explicitly passing plugins**, and an empty array no longer loads all tools. | Low |
| **Agent Kit Next.js example** | `examples/nextjs` | Apache-2.0 | 4 Nov 2026 | Next **15.5.28**, LangChain adapter, `@hashgraph/hedera-wallet-connect` 2.1.3 | **RETURN_BYTES / human-in-the-loop** mode, where the agent builds the tx and a wallet signs it. That's our "human approval above threshold" path: `src/hooks/useAutoSign.ts` and the wallet-connect wiring. | Medium. It's Next 15 + LangChain while we're on Next 16 + AI SDK, so lift only the HITL pieces. |
| **hedera-skills** (Claude Code plugin) | github.com/hedera-dev/hedera-skills | Apache-2.0 | 3 Sep 2026 | v4 (`agent-kit-v4-migration`, `agent-kit-policy`, `agent-kit-hook` skills) | AI context. `agent-kit-policy` covers "block transfers over X"; the HCS/HTS skills and `hiero-cli/references/x402.md` too. It's likely the subject of today's 15:30 Hedera × Claude Code workshop (UNVERIFIED). | Low. Note: policies fire only on tools that extend `BaseTool`. |
| Hedera Network MCP (hosted) | `HederaMCPServer` enum in `@hashgraph/hedera-agent-kit-ai-sdk`; doc `docs/HEDERAMCPS.md` | (service) | — | Testnet; **needs a wallet sign-in (`mcpAuth`)** | Optional extra-points item ("use of Agent Kit or the Hedera MCP"). We already use Agent Kit, so skip it. | Medium: auth flow plus extra moving parts. |

---

## 4. World ID / IDKit 4.6.0

| Name | URL | Licence | Last push | Compatible? | What to take | Risk |
|---|---|---|---|---|---|---|
| **Official IDKit Next.js example** | github.com/worldcoin/idkit/tree/main/js/examples/nextjs (live: idkit-js-example.vercel.app) | MIT | repo 28 Oct 2026; example 20 Oct 2026 ("create sessions with uniqueness proofs") | Yes: links the 4.x workspace packages. It uses Next ^15.5 + React 18; IDKit peers `react >=18`, so React 19 works | **`app/api/rp-signature/route.ts`** (`signRequest` from `@worldcoin/idkit/signing`, `RP_SIGNING_KEY` env), **`app/api/verify-proof/route.ts`** (forward the `IDKitResult` unmodified to `POST {DEV_PORTAL}/api/v4/verify/{rp_id}`), `app/page.tsx` widget usage. | **Security fix needed when porting.** The example's verify route takes `rp_id` and **`devPortalBaseUrl` from the client body** (SSRF / verification bypass). Hard-code both server-side, check `success && environment`, then insert into a `UNIQUE(action, nullifier)` table. |
| World docs agent skill + Simulator MCP + Portal MCP | docs.world.org/world-id/SKILL · `https://simulator.worldcoin.org/api/mcp` (`complete_test_request`) · `https://developer.world.org/api/mcp` | (docs/services) | — | v4 | AI context. The Simulator MCP lets Claude complete a staging proof during tests. | Low |
| World AgentKit (`@worldcoin/agentkit` 0.2.1) | docs.world.org/agents/agent-kit/integrate | MIT (repo `worldcoin/agentkit` **archived/deprecated**) | npm 31 Aug 2026 | **EVM only**: AgentBook registration on World Chain, `eip155` signer, x402 on Base/World Chain | Nothing for the build. Read it only if we pursue the "Agent Pass" track, and note that it doesn't speak Hedera. | High: wrong chain, deprecated repo. |

---

## 5. In-browser video capture (mobile web) + upload

**Recommendation:** use native `getUserMedia` + `MediaRecorder` in a ~60-line custom hook. It needs no dependency and works with iOS Safari (records `video/mp4`) and Android Chrome (`video/webm`; probe with `MediaRecorder.isTypeSupported`). Gemini accepts both webm and mp4. Upload with a presigned PUT, or with Convex `generateUploadUrl` if we pick Convex.

| Name | URL | Licence | Last push / publish | Compatible? | What to take | Risk |
|---|---|---|---|---|---|---|
| **Uppy Webcam + AWS S3** (`@uppy/webcam` 6.0.3, `@uppy/aws-s3` 6.3.1, `@uppy/react` 6.1.1) | github.com/transloadit/uppy | MIT | 4 Nov 2026 | React 18/19 | The fallback if the custom hook fights iOS. It handles video recording via MediaRecorder, a `mobileNativeCamera` fallback (opens the phone camera app), max recording length and mime preference, and presigned or multipart S3 upload. | Low to medium. A heavier bundle and Uppy's own UI; restyle needed. |
| `react-webcam` 7.2.0 | github.com/mozmorris/react-webcam | MIT | repo Mar 2026; npm Oct 2023 | React ≥16.2 | Only the `<Webcam>` preview + `videoConstraints={{facingMode:"environment"}}`. | Medium: the npm release is stale. |
| `@wmik/use-media-recorder` 1.6.5-beta.0 | github.com/wmik/use-media-recorder | MIT | Apr 2026 | React hooks | Read for reference (a hook API to mimic). | Medium: beta. |
| **AWS SDK v3 presigner** (`@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` 3.1162.0) | github.com/aws/aws-sdk-js-v3 | Apache-2.0 | 5 Nov 2026 | Works with **Cloudflare R2** / MinIO via `endpoint` + `forcePathStyle` | `getSignedUrl(s3, new PutObjectCommand({Bucket, Key, ContentType}), {expiresIn: 300})`, then the browser PUTs the Blob. Set bucket CORS for PUT from our origin. | Low |
| Convex file storage / `@convex-dev/r2` 0.10.4 | docs.convex.dev/file-storage · github.com/convex/r2 | Apache-2.0 (r2 component) | 4 Nov 2026 | `convex` 1.49.0 | If Convex: `ctx.storage.generateUploadUrl()`, then the browser POSTs the blob and stores the `storageId`. Zero S3 setup. | Low. 1 GB free storage tier (UNVERIFIED current quota). |
| `fix-webm-duration` 1.0.6 | github.com/yusitnikov/fix-webm-duration | MIT | npm Jul 2024 | — | Only if a Chrome webm reports `duration=Infinity` and breaks our duration check. | Low |

---

## 6. Perceptual hashing / duplicate detection, frames, transcription

**Recommendation:** run server-side with ffmpeg at 1 fps (or N evenly spaced frames). Take each frame through `sharp` → 9×8 greyscale → our own **dHash** (64-bit, about 15 lines). Add a SHA-256 of the file for exact duplicates. Compare by Hamming distance against stored hashes, using a sliding alignment across frame sequences. For liveness, have Gemini transcribe the spoken words in the same verification call, then check the random words server-side, with fuzzy matching.

| Name | URL | Licence | Last push / publish | Compatible? | What to take | Risk |
|---|---|---|---|---|---|---|
| **sharp** 0.35.5 | github.com/lovell/sharp | Apache-2.0 | 29 Oct 2026 | Node 22 | `sharp(buf).greyscale().resize(9,8,{fit:'fill'}).raw()`, the basis for dHash/pHash. | Low. Native binary: fine on Vercel and Node. |
| **ffmpeg-static** 5.3.0 (or the system `ffmpeg` on a VM) | npmjs.com/package/ffmpeg-static | **GPL-3.0-or-later** (the binary) | Nov 2025 | Node; spawn with `child_process.execFile` | `ffmpeg -i in -vf fps=1,scale=256:-1 -f image2pipe -vcodec png -`, then hash each frame. Also `ffprobe` for duration. | **Licence:** running it as a separate process doesn't relicense our code, and we never commit the binary, but list it in THIRD-PARTY-NOTICES. On Vercel the bundle is about 70 MB; a long-running Node box is simpler. |
| `imghash` 1.1.5 | github.com/pwlmc/imghash | MIT | 31 Oct 2026 | Node | A drop-in perceptual hash (blockhash-based) if we don't want to hand-roll dHash. | Low to medium: small project, 200★. |
| `sharp-phash` 2.2.0 | github.com/btd/sharp-phash | MIT | Oct 2024 | sharp peer | A DCT pHash on sharp, if dHash is too brittle. | Medium: stale. |
| Python fallback: `imagehash` (BSD-2-Clause, pushed 12 Oct 2026) | github.com/JohannesBuchner/imagehash | BSD-2-Clause | 12 Oct 2026 | Python | Reference implementations of pHash/dHash/wHash, to check our JS dHash against. | Low. We are TS-only, so reference only. |
| `ffmpeg.wasm` (`@ffmpeg/ffmpeg` 0.12.15) | github.com/ffmpegwasm/ffmpeg.wasm | MIT wrapper; `@ffmpeg/core` **GPL-2.0+** | repo Sep 2026; npm Apr 2025 | Browser | Avoid on mobile: a ~30 MB core, slow on phones. Server-side ffmpeg is better. | High on mobile. |
| Transcription (optional second opinion) | `@deepgram/sdk` 5.18.0 (MIT) · `assemblyai` 4.42.0 (MIT) · `openai` 7.51.0 (Apache-2.0) | as listed | Oct–Nov 2026 | Node | Only if Gemini's own transcript proves unreliable for the random-word check. Current model IDs are UNVERIFIED. | Low. One more API key. |

---

## 7. Multimodal video verification (Gemini)

| Name | URL | Licence | Last push | Compatible? | What to take | Risk |
|---|---|---|---|---|---|---|
| **Gemini video understanding guide** (Interactions API) | ai.google.dev/gemini-api/docs/video-understanding | (docs) | live 5 Nov 2026 | `@google/genai` 2.32.0; model shown: **`gemini-3.8-flash`** | Inline base64 for clips <20 MB request (`{type:"video", data, mime_type}`). Files API for anything larger (poll until `ACTIVE`). `processing: {type:"static", fps: 2}` to sample our ~10–20 s clips more densely than the 1 fps default. Ask for `MM:SS` timestamps. Supported formats include **webm, mp4, mov, 3gpp**. Static mode also processes audio (1 Kbps), so the spoken words are available. | Low. Note the docs also offer an "agentic" video mode, which is **slower on short clips**: use static. |
| **Gemini structured output** | ai.google.dev/gemini-api/docs/structured-output | (docs) | live | Interactions API | `response_format: { type:'text', mime_type:'application/json', schema: <JSON Schema> }`, then validate with zod (`z.fromJSONSchema` or our own zod schema). Our verdict schema: `{checks:[{id, pass, evidence_ts, note}], spoken_words:[…], confidence, verdict}`. | Low |
| **`googleapis/js-genai` sdk-samples** | github.com/googleapis/js-genai/tree/main/sdk-samples (`generate_content_with_file_upload.ts`, `generate_content_with_response_schema*.ts`, `interactions_structured_output_json.ts`) | Apache-2.0 | 5 Nov 2026 | `@google/genai` 2.32 | Copy-ready upload + schema snippets. | Low |
| **Vercel AI SDK Gemini examples** | github.com/vercel/ai/tree/main/examples/ai-functions/src/generate-text/google (`interactions-video-response-format.ts`, `video-metadata.ts`, `interactions-agentic-video.ts`) | Apache-2.0 | 5 Nov 2026 | `ai` 7 + `@ai-sdk/google` 4.0.112 (`google.interactions('gemini-3.8-flash')`) | Use this if the verifier lives inside the AI SDK agent: a file part `{type:'file', mediaType:'video', data}` + `Output.object` / response format. | Low |
| **Gemini cookbook** | github.com/google-gemini/cookbook (`quickstarts/Video_understanding.ipynb`, `quickstarts/JSON_mode.ipynb`, `examples/Analyze_a_Video_Classification.ipynb`) | Apache-2.0 | 4 Nov 2026 | Python notebooks | Prompt patterns for classification + timestamps. | Low: Python. |
| **gemini-skills** (agent skills) | github.com/google-gemini/gemini-skills (`gemini-api-dev`, Interactions migration refs) | Apache-2.0 | 3 Nov 2026 | Current | AI context, so Claude writes Interactions API code, not stale `generateContent` code. | Low |

---

## 8. UI kits (polished dashboard fast)

| Name | URL | Licence | Last push | Compatible? | What to take | Risk |
|---|---|---|---|---|---|---|
| **shadcn/ui + blocks** (CLI `shadcn` 4.23.0) | github.com/shadcn-ui/ui · ui.shadcn.com/blocks | MIT | 5 Nov 2026 | Next 16, React 19, Tailwind 4 | `npx shadcn@latest init`, then `add sidebar-07 dashboard-01 chart card table badge dialog sonner`. The charts are Recharts 3. The buyer console, task board and receipts table come from blocks. | Low |
| **Magic UI** | github.com/magicuidesign/magicui | MIT | 5 Nov 2026 | shadcn registry, Tailwind 4 | 2–3 hero touches only: `number-ticker` (USDC spent), `animated-beam` (agent → Arkiv → Hedera flow diagram), `border-beam`, `shimmer-button`. | Low. Don't overdo it. |
| **Motion Primitives** | github.com/ibelick/motion-primitives | MIT | 28 Sep 2026 | `motion` 14.9.1 | `animated-number`, `text-effect`, `transition-panel` for the verification report reveal. | Low |
| **Kiranism/next-shadcn-dashboard-starter** | github.com/Kiranism/next-shadcn-dashboard-starter | MIT | 3 Nov 2026 | Next 16.4.2, React 19.3, Tailwind 4.3, TanStack Table 9, Recharts 3.10 | **Optional full starter**, used only as a starter kit (generic, public). The layout shell, data-table with nuqs filters, KPI cards. | Medium: brings Clerk auth (we'd rip it out). Starting from `create-next-app` + shadcn blocks is cleaner. |
| coss ui (ex-Origin UI) | github.com/cosscom/ui | MIT | 4 Nov 2026 | shadcn-style | Extra form inputs and timeline components, if needed. | Low |

---

## 9. Agent framework glue

| Name | URL | Licence | Last push | Compatible? | What to take | Risk |
|---|---|---|---|---|---|---|
| **Vercel AI SDK v7** (`ai` 7.0.163) `examples/next-agent` | github.com/vercel/ai/tree/main/examples/next-agent | Apache-2.0 | 5 Nov 2026 | Next ^16.4.1 | `new ToolLoopAgent({ model, instructions, tools })` + `InferAgentUIMessage`, the buyer agent loop. Tools: `searchArkivTasks`, `postTask`, `payX402(url)` (wraps `wrapFetchWithPayment`), `approvePayout` (Agent Kit tool behind policies). | Low. **v7 is new.** Match Agent Kit's `ai ^7.0.37` peer. |
| AI SDK MCP examples | github.com/vercel/ai/tree/main/examples/mcp (`http`, `mcp-with-auth`) + `@ai-sdk/mcp` 2.0.91 | Apache-2.0 | 5 Nov 2026 | `ai` 7 | An MCP client in the independent agent, to discover our MCP tools. | Low |
| **MCP TypeScript SDK v1** (`@modelcontextprotocol/sdk` 1.32.2) | github.com/modelcontextprotocol/typescript-sdk | MIT → Apache-2.0 transition (both permissive) | 31 Oct 2026 | **Use v1.32.2.** `@x402/mcp` and `@hashgraph/hedera-agent-kit-mcp` both pin `@modelcontextprotocol/sdk` 1.32.x | `McpServer` + Streamable HTTP transport for a standalone "ADX MCP" (tools: `list_open_tasks`, `get_verification` [x402-paid], `get_receipt`). | Medium. MCP SDK v2 split packages (`@modelcontextprotocol/server` 2.4.0) are **incompatible with `@x402/mcp`**. |
| **x402 MCP server example** (`@x402/mcp` 2.30.0) | `examples/typescript/servers/mcp/{simple,advanced,existing-server}.ts` | Apache-2.0 | 5 Nov 2026 | SDK 1.32 | `createPaymentWrapper(resourceServer, …)` around a tool handler, the paid MCP tool. Swap EVM for `ExactHederaScheme`. | Low to medium. It uses Express + SSE; run it as a separate small Node service, not inside Next. |
| `vercel-labs/mcp-for-next.js` / `mcp-handler` | github.com/vercel-labs/mcp-for-next.js (MIT) | MIT (template); `mcp-handler` npm Apache-2.0 | 23 Oct 2026 | mcp-handler **2.x peers `@modelcontextprotocol/server` ^2**; 1.1.0 pins sdk 1.26.0 exactly | Use it only for a **free** MCP endpoint inside Next with no x402. | Conflicts with `@x402/mcp` (see Do NOT use). |

---

## 10. Other accelerators

| Name | URL | Licence | Last push | Compatible? | What to take | Risk |
|---|---|---|---|---|---|---|
| **Convex** (`convex` 1.49.0) | docs.convex.dev/quickstart/nextjs | npm client Apache-2.0 (the backend repo is FSL-1.1, irrelevant for the cloud) | npm 30 Oct 2026 | Next 16 / React 19 | Realtime claim/review queues, file storage, scheduled jobs (deadline expiry → Arkiv patch), `"use node"` actions for ffmpeg/Gemini calls. Use `create-next-app` + `npm i convex` + `npx convex dev`. | Low to medium. **The official `convex/template-nextjs-shadcn` is stale** (Next 15.1, Tailwind 3, no licence), so don't scaffold from it. Unique constraints are not native: enforce `nullifier` uniqueness with an index + check inside one mutation (mutations are serializable). |
| **Postgres alternative**: `drizzle-orm` 0.45.4 + `@neondatabase/serverless` 1.2.0 | orm.drizzle.team | Apache-2.0 / MIT | current | Next 16 | Real `UNIQUE(action, nullifier)` constraint, which is a cleaner story for the World judges. | Low |
| **Auth**: none needed beyond World ID | — | — | — | — | World ID proof → server session cookie (`iron-session` or a signed JWT). Buyer side: admin passcode for the demo. `better-auth` 1.7.17 (MIT) only if a real login is needed. | Avoid scope creep. |
| `qrcode.react` 4.2.0 | npm | ISC | — | React 19 | QR to open the capture page on a phone during the demo. | Low |
| HashScan / mirror node links | `https://hashscan.io/testnet/transaction/<id>` | — | — | — | Receipt UI deep links (required in the Hedera video). | — |

---

## Day-0 install list (verified on npm, 5 Nov 2026)

Pin exact versions. Add `"overrides": { "@hiero-ledger/sdk": "2.90.1" }` so there is exactly **one** Hiero SDK; duplicates throw `t.startsWith is not a function`.

```bash
# scaffold
npx create-next-app@16.4.5 adx --ts --tailwind --app --eslint   # gives next 16.4.5, react 19.3.1, tailwind 4.3.4
npx shadcn@4.23.0 init && npx shadcn@4.23.0 add sidebar-07 dashboard-01 chart card table badge dialog sonner

# Arkiv
npm i @arkiv-network/sdk@1.0.1 viem@2.57.16

# Hedera x402 + Agent Kit
npm i @x402/core@2.30.0 @x402/hedera@2.30.0 @x402/fetch@2.30.0 @x402/next@2.30.0 @x402/paywall@2.30.0 \
      @hashgraph/hedera-agent-kit@4.2.0 @hashgraph/hedera-agent-kit-ai-sdk@2.1.0 @hiero-ledger/sdk@2.90.1

# Agent + verifier
npm i ai@7.0.163 @ai-sdk/google@4.0.112 @google/genai@2.32.0 zod@4.6.7

# World ID
npm i @worldcoin/idkit@4.6.0        # includes /signing (signRequest); @worldcoin/idkit-server@1.2.0 only if signing outside Next

# Media / dedup
npm i sharp@0.35.5 ffmpeg-static@5.3.0          # GPL binary, spawned as a separate process
npm i @aws-sdk/client-s3@3.1162.0 @aws-sdk/s3-request-presigner@3.1162.0   # skip if using Convex storage

# Data (pick ONE)
npm i convex@1.49.0
# or: npm i drizzle-orm@0.45.4 @neondatabase/serverless@1.2.0 && npm i -D drizzle-kit@0.31.11

# UI extras
npm i motion@14.9.1 qrcode.react@4.2.0            # sonner/recharts arrive via shadcn

# Optional separate MCP service (paid tools)
npm i @modelcontextprotocol/sdk@1.32.2 @x402/mcp@2.30.0 express@5

# Tooling (not shipped)
claude plugin marketplace add Arkiv-Network/ai-plugin && claude plugin install arkiv@arkiv
npx skills add Arkiv-Network/skills --skill arkiv
# optional: hedera-dev/hedera-skills plugin, google-gemini/gemini-skills (gemini-api-dev)
```

Node **22.10+** (the Arkiv docs require it). TypeScript: whatever create-next-app installs (npm `latest` is 7.0.2). The Arkiv SDK peer is `>=5`.

---

## Do NOT use

| Item | Why |
|---|---|
| `x402`, `x402-fetch`, `x402-express`, `x402-next`, `x402-hono`, `x402-axios` (1.2.x) | Legacy v1: no Hedera code. |
| `hedera-dev/x402-hedera` and the `hedera-testnet` network string | v1 fork (last push Dec 2025). v2 uses `hedera:testnet`. |
| Copying code from `hedera-dev/x402-inference-pay-per-request-poc` | **No licence.** Read for shape only. Also on old pins (`ai` 6, kit-ai-sdk 1.x). |
| `matevszm/x402-hedera-example` | No licence. |
| `hedera-agent-kit` (npm 3.8.2) | Deprecated, replaced by `@hashgraph/hedera-agent-kit` v4. |
| `create-hedera-agent` (npm 0.1.6, Oct 2025) | Predates v4. The repo's 0.1.8 isn't the published one. UNVERIFIED that it scaffolds v4. |
| `@hashgraph/sdk` next to `@hiero-ledger/sdk` / a second Hiero copy | Duplicate SDK instances break x402 + Agent Kit. |
| `@arkiv-network/create-app` 0.5.0 | Depends on SDK `^0.5.3` (pre-1.0). |
| `create-arkiv-app` 1.1.0 (third party, DruxAMB/TIN, 29 Sep) | Before the 30 Oct breaking SDK. |
| `arkiv-sdk` (Python), `golem-base-sdk`, any Kaolin/Mendoza/Braga/Tiramisu tutorial, any code with `payload`, `annotations`, `btl`, `expiresIn`, `ne/not`, cursors | Pre-1.0 or retired networks. |
| `@worldcoin/idkit-standalone`, `worldcoin/idkit-js` (archived), `IDKitWidget`, `verifyCloudProof`, `/api/v2/verify`, `ISuccessResult` | IDKit v2/v3 legacy. |
| `world-id-cloud-template`, `world-id-nextauth-template`, `minikit-*-template`, `world-id-starter*` | All archived, pre-4.0. |
| `@worldcoin/agentkit` / `worldcoin/agentkit` | Repo deprecated. EVM/World Chain only, not Hedera. |
| Verbatim copy of the IDKit example `verify-proof` route | Trusts the client-supplied `devPortalBaseUrl` / `rp_id`. Harden it. |
| `@google/generative-ai` (0.24.1, repo archived) | Old Gemini SDK. Use `@google/genai` 2.x. |
| `fluent-ffmpeg` | npm-deprecated, repo archived (May 2025). Spawn ffmpeg directly. |
| `ffmpeg.wasm` on phones | ~30 MB GPL core, too slow for mobile capture. |
| `RecordRTC` (last push May 2024), `react-media-recorder` (no React-19 testing claimed) | Stale. Native MediaRecorder is enough. |
| `akamhy/videohash` | Python, last push Jul 2024. Wrong language for us. |
| `@tremor/react` 3.18.7 | Peer `react ^18`, Tailwind v3, last publish Jan 2025. Use shadcn charts. (Tremor Raw copy-paste components are Apache-2.0, but last push Oct 2025 and Tailwind-4 fit UNVERIFIED.) |
| **Aceternity UI** | Proprietary "free to use" licence, not OSI-permissive. Outside our MIT/Apache/BSD/ISC rule. Use Magic UI or Motion Primitives instead. |
| `convex/template-nextjs-shadcn` / `-convexauth-shadcn` | No licence file, Next 15.1 + Tailwind 3, stale. |
| `mcp-handler` 2.x or 1.x together with `@x402/mcp` | 2.x needs MCP SDK v2 split packages; 1.1.0 pins sdk 1.26.0. Both clash with `@x402/mcp` (sdk ^1.32). `@vercel/mcp-adapter` is the old name. |
| `@better-auth/cli` | npm-deprecated. |
| **Skarl** (`stephenhungg/skarl`) and our local `skarl-study/` clone | No licence, and it's another hackathon's project. Prior art only. |

## Still UNVERIFIED (check on night 1)
- Whether `withX402` from `@x402/next` 2.30 runs cleanly with `ExactHederaScheme` in a Next 16 route handler. No official Hedera + Next example exists. Do a smoke test in the first hour.
- The exact Gemini model ID to use (`gemini-3.8-flash` is what the docs show today), plus quota and rate limits on our key.
- Convex free-tier storage and bandwidth quotas for ~50 short clips.
- Whether Tremor Raw works with Tailwind 4 (irrelevant if we stick to shadcn).
- The licence of the Arkiv `skills` / `ai-plugin` repos: neither has a LICENSE file. The README says MIT per skill. We use them as tooling and context only.
