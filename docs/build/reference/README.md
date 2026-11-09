# Build reference set

**Main reference: [`../SYSTEM-ARCHITECTURE.md`](../SYSTEM-ARCHITECTURE.md).** It wins every conflict. These companion docs follow the "documents before vibe coding" structure so humans and the coding agent can find any decision fast.

| # | Doc | Answers |
|---|---|---|
| 01 | [PRD](01-PRD.md) | What we build, for whom, features, user stories, acceptance criteria |
| 02 | [TRD](02-TRD.md) | Platforms, stack, services, auth, external APIs, decisions and tradeoffs |
| 03 | [App flow](03-APP-FLOW.md) | Every screen, journeys, alternate paths, navigation, empty states |
| 04 | [UI/UX brief](04-UI-UX-BRIEF.md) | Tone, palette, type, components, layout, accessibility |
| 05 | [Backend schema](05-BACKEND-SCHEMA.md) | Entities, ownership, authorization, validation, retention |
| 06 | [Implementation plan](06-IMPLEMENTATION-PLAN.md) | Milestones, task table with done-criteria and dependencies |
| 07 | [Code style](07-CODE-STYLE.md) | Conventions, structure, commits, verified commands |
| 08 | [Security](08-SECURITY.md) | Where sensitive data may live, rules the code must follow |
| 09 | [Testing](09-TESTING.md) | Test layers, acceptance tests, reporting |

Also in `docs/build/`: `OVERVIEW.md` (plain-language), `FLOWS.md` (per-step states), `PAYMENTS.md`, `DEMO-SCRIPT.md`, `BUILD-PLAN.md` (live checklist), `diagrams/`.

When a decision changes: update `SYSTEM-ARCHITECTURE.md` first, then the affected companion docs, then `03-DECISIONS-AND-OPEN-QUESTIONS.md`.
