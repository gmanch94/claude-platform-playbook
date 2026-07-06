# Claude Subscription Selection Guide

**As of 2026-07.** Pinned to the current Claude.ai plan + API surface. Refresh monthly with [`../docs/feature-inventory.md`](../docs/feature-inventory.md). Prices are list, USD, exclude tax, and are "subject to change at Anthropic's discretion" — verify at [anthropic.com/pricing](https://www.anthropic.com/pricing) before committing budget.

> **The decision before you provision anyone.** "Which Claude subscription do we buy?" hides two surfaces — *which seat plan* (Free / Pro / Max / Team / Enterprise) and *do we also need API credits* — and three independent axes inside them: **compliance, team size, and build-vs-use**. Run them as one "pick a tier" list and you mis-route: a regulated 50-person org lands on Team and discovers at audit it carries no BAA. This guide runs the decision as three gates that stack, so the compliance answer is never overridden by headcount.

---

## Two billing surfaces (the mental model)

Claude bills on two independent surfaces. Buying one never unlocks the other.

| Surface | What it is | Who pays | Billed how |
|---|---|---|---|
| **Claude.ai seat plans** | The product — chat, Projects, Claude Code, Cowork, the web/desktop/mobile apps | Per user (seat) | Flat per-seat/month (Free/Pro/Max individual; Team/Enterprise org) |
| **Anthropic API** | Per-token inference for *your* apps, agents, pipelines | Per token | Usage-based (Opus/Sonnet/Haiku rates — see [`cost-calculator.html`](cost-calculator.html)) |

**The trap:** a Pro or Max subscription does **not** include API quota. An engineering team building on Claude usually needs **both** — seats for interactive work (Claude Code, chat) *and* API credits for production inference. Budget two lines, not one. [H, anthropic.com/pricing]

---

## The decision: three independent gates

These are **not** a "first match wins" list — they are orthogonal axes. Answer all three; the answers stack into your final bill. Run compliance first so headcount can never override it.

**Gate 0 — Compliance (ask first, before headcount).**
Do you need a **BAA** (HIPAA/PHI), **SCIM** provisioning, **audit logs**, **ZDR** (on the API + Claude Code surfaces, not the product chat UI), or **custom data-retention controls**? → **Enterprise**, regardless of team size — these exist on no other seat plan. A solo consultant handling client PHI lands here too (or uses the first-party API under a BAA — Pro/Max can't carry one). If none apply, continue to Gate 1. [H — see [`governance-overlay.md`](governance-overlay.md)]

**Gate 1 — Seats by team size (who gets the product).**

| Team size | Plan | Notes |
|---|---|---|
| **1** | Free → Pro → Max | **Free** ($0) for light use *without* Claude Code; **Pro** ($17 annual / $20 monthly) once you want Claude Code, Projects, Research, more models; **Max** (from $100/mo, 5× or 20× Pro usage) for headroom + peak priority. None unlock API quota. [H] |
| **2–4** | Individual Pro/Max seats, one per person | Below the Team floor (5). Each person gets Claude Code, but you get **no SSO, no central admin, and no no-train-by-default** — the consumer policy surface applies. Move to Team at 5. |
| **5–150** | **Team** — $20 standard / $100 premium per seat/mo annual ($25 / $125 monthly) | SSO, central billing, enterprise search, **no model training by default**. Premium seat = 5× standard usage; put heavy users there, mix-and-match the rest. [H] |
| **151+** | **Enterprise** (custom) | The 150/151 seam is exact — 150-and-under is Team, 151+ is Enterprise. No gap, no overlap. |

**Gate 2 — Build (ask regardless of Gates 0–1).**
Are you building a product, agent, or pipeline *on* Claude — not just using the app? → add **API credits** on top of whatever seat plan Gates 0–1 selected. Seats never include API quota; it is a separate invoice and the surface the rest of this repo's cost tooling models. Most engineering teams answer "yes" here. [H]

---

## Plan comparison

| Plan | Price (list, USD) | Seats | Claude Code | Usage | SSO / SCIM | No-train default | BAA | API quota |
|---|---|---|---|---|---|---|---|---|
| **Free** | $0 | 1 | ✗ | Baseline | ✗ / ✗ | ✗ (consumer surface) | ✗ | ✗ |
| **Pro** | $17 annual / $20 mo | 1 | ✓ | More than Free | ✗ / ✗ | ✗ (consumer) | ✗ | ✗ |
| **Max** | from $100/mo | 1 | ✓ | 5× or 20× Pro | ✗ / ✗ | ✗ (consumer) | ✗ | ✗ |
| **Team** | $20 std · $100 premium /seat/mo (annual) | 5–150 | ✓ | More than Pro (premium = 5× std) | ✓ / ✗ | ✓ | ✗ | ✗ |
| **Enterprise** | Custom | Org-wide | ✓ | Custom | ✓ / ✓ | ✓ | ✓ | ✗ (API is separate) |
| **API** | Per token | n/a | via SDK/CLI + key | Usage-based | Workspace controls | ✓ (commercial) | ✓ (first-party API) | ✓ — *this is the quota* |

Seat prices [H] anthropic.com/pricing, as-of 2026-06; monthly figures run higher than annual. "From" / "5×–20×" are the plan's own published bands, not derived. SSO is Team-and-up; SCIM + audit logs are Enterprise-tier [H]. The two BAA cells (Enterprise and API) are the *same* eligibility surface viewed two ways — first-party API + Enterprise — not a second BAA; Team is excluded (see governance note). Verify all before committing.

---

## Persona → plan

| You are… | Buy | Why | Failure mode if wrong |
|---|---|---|---|
| Individual kicking the tires | Free | Full chat surface at $0 | Expecting Claude Code — Free doesn't include it; move to Pro |
| Solo dev / professional | Pro | Claude Code + Projects + more models, $17–20 | Buying Max first — you rarely saturate Pro on day 1; upgrade when you actually hit limits |
| Power user hitting limits | Max 5× or 20× | Headroom + priority at peak | Buying Max expecting API quota — it has none; you need API credits |
| Startup of 2–4 | Individual Pro/Max seats, one per person | Below Team's 5-seat floor; each still gets Claude Code | Expecting SSO / central admin / no-train-default — those start at Team (5+); the consumer policy surface applies until then |
| Team of 5–150 | Team (mix std/premium seats) | SSO, central billing, no-train default, seat tiers to fit usage | Putting heavy users on standard seats — premium is 5× usage; the mismatch throttles them |
| Regulated — any size, incl. solo | Enterprise (or first-party API under a BAA) | SCIM, audit, custom retention, BAA, ZDR-eligible paths — gated on compliance, not headcount | Routing on size first — a 50-person hospital matches "Team" on headcount but Team carries no BAA; compliance must decide before size |
| >150 users | Enterprise | Above Team's 150 ceiling; volume pricing + central admin | Trying to stretch Team past 150 — it caps there; 151+ is Enterprise |
| Building a product/agent on Claude | API credits (+ seats for the builders) | Per-token inference is the only surface your app can call | Assuming the team's seats cover production calls — they don't; meter the API separately |

---

## The "you need both" pattern (the common real shape)

An engineering team adopting Claude Code typically runs **two** budgets:

- **Seats** (Team or Enterprise) — so engineers get Claude Code, chat, and Projects in the product, with SSO + admin.
- **API credits** — so the agents and services they *build* can call Opus/Sonnet/Haiku in production.

These are separate invoices. The [`cost-calculator.html`](cost-calculator.html) models only the API line — add the seat line from its seat-cost block on top. Sizing both is the difference between a budget that holds and a surprise in month two.

---

## Common mis-buys (each is a real budget or compliance miss)

- **"Pro/Max includes API credits."** It doesn't. Consumer subscriptions and API billing are separate surfaces; Max buys app-usage headroom, not API quota. Buy API credits explicitly. → mis-budget. [H — [`claude-misconceptions.md`](claude-misconceptions.md)]
- **Provisioning Free for engineers.** Free has no Claude Code. A dev team on Free can't run the CLI — they need Pro+ seats or API keys. → blocked rollout.
- **Team plan for a regulated workload.** Team carries no BAA. PHI/HIPAA work needs Enterprise (or the first-party API under a BAA). → compliance gap. [see [`governance-overlay.md`](governance-overlay.md)]
- **Over-buying Max when the workload is programmatic.** If the value is an app or agent, the surface is the API, not a premium seat. A Max seat won't serve production traffic; metered API will. → mis-architecture + mis-budget.
- **Under-tiering Team seats.** Standard ≠ premium (5× usage). Heavy users on standard seats hit limits; premium-where-it-counts beats blanket-standard. → throttled users.

---

## Governance note

Consumer plans (**Free / Pro / Max**) are a **separate policy surface** from the commercial API and Team/Enterprise: do not extend commercial no-train assumptions to them, including when a consumer account uses Claude Code. No-train-by-default applies to Team, Enterprise, and the commercial API — not consumer tiers. A **BAA** covers the first-party API and **Enterprise** only; it excludes Free/Pro/Max/Team. See [`governance-overlay.md`](governance-overlay.md) (no-train + BAA sections) for the full surface. [H]

---

## How this connects to the rest

- Upstream of [`cost-calculator.html`](cost-calculator.html) — pick the plan(s) here, size the API line there.
- Pairs with [`model-selection-guide.md`](model-selection-guide.md) — *which plan* (this) and *which model tier* (that) are the two buy-time decisions.
- Compliance depth in [`governance-overlay.md`](governance-overlay.md); the "Pro covers the API" myth in [`claude-misconceptions.md`](claude-misconceptions.md).
- Plan status + pricing source-of-truth: [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify plan pricing at anthropic.com/pricing.`
