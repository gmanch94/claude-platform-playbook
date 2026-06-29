# Operating Model Guide — Who Owns Claude

**As of 2026-06.** Pin to current surface — refresh monthly.

[`adoption-playbook.md`](adoption-playbook.md) already defines the **three functions** every Claude org needs — Build, Platform, Governance+COE — with their owns / skills / reports-to (see its *Reference team structure* section). What it doesn't answer is the question upstream of those functions: **which organizational *shape* arranges them, and how do decisions actually move?** A 200-person scale-up and a 50,000-person regulated enterprise both need the three functions, but they should not be organized the same way. This guide is that choice — the shape, and the RACI that keeps it from thrashing.

> **Read order:** this guide picks the *shape*; the playbook defines the *functions* that fill it. The role definitions (what Build vs Platform vs COE each own) live in the playbook — they are **not** re-derived here. This is the org-design layer; that's the team-structure layer.

---

## 1. The four shapes

| Shape | Who owns Claude | Fits | Failure mode |
|---|---|---|---|
| **Centralized** | One platform/AI team owns everything — builds, governs, runs every use case | Small orgs, early maturity (L0–L1), or uniform regulatory regime | **Bottleneck.** Every team queues behind one; the central team becomes the constraint and shadow AI grows around it. |
| **Federated** | Each business unit owns its own Claude stack, governance, and spend | Large orgs with strong BU autonomy and distinct regulatory contexts | **Sprawl + duplication.** Ten teams build the same PR-review skill ten ways; no shared evals; cost and risk invisible at the center. |
| **Hub-and-spoke (COE)** | Central platform + COE own shared infra, standards, and guardrails; embedded practitioners build in each team | Most orgs at L2→L3 — **the default** | **Ivory-tower COE.** The hub writes standards nobody adopts; spokes route around it. Fix: hub ships paved roads, not memos. |
| **Community of practice** | No central owner; a cross-team guild shares patterns voluntarily | A transitional state, or a complement riding alongside one of the above | **No teeth.** Good for sharing, useless for enforcement (cost gates, security review). Never the sole model for a regulated workload. |

The progression most orgs follow: **centralized** (one team proves it) → **hub-and-spoke** (COE makes it repeatable) as they hit L3 in [`maturity-model.md`](maturity-model.md). Federated is a destination for large autonomous orgs, not a starting point. Community of practice rides alongside any of them.

---

## 2. Choose your shape

The four signals that pick the shape. Score each; the dominant signal usually decides.

| Signal | Pushes toward… |
|---|---|
| **Org size** | Small → centralized; large → hub-and-spoke or federated |
| **Regulatory uniformity** | One regime → centralized/hub; many distinct regimes (geo/industry BUs) → federated |
| **BU autonomy culture** | Strong autonomy → federated; shared-services culture → centralized/hub |
| **Talent density** | Scarce AI talent → centralize it; abundant + distributed → federate or spoke it |

**Default recommendation:** hub-and-spoke with a COE. It's the only shape that gets *both* repeatability (shared evals, skills, cost gates, security review at the hub) *and* speed (teams build in their own context at the spoke). Centralized is right only while you're small or early; federated is right only when BUs are genuinely autonomous *and* you can afford duplicated platform investment. When unsure, start centralized to prove the pattern, then graduate to hub-and-spoke — don't start federated (you'll never converge the ten forks).

---

## 3. RACI — who decides what

The genuinely hard part of an operating model isn't the org chart, it's **decision rights**. The matrix below is the template; adapt the columns to your titles. **R** = does the work, **A** = accountable / final call (exactly one per row), **C** = consulted before, **I** = informed after.

| Decision | Exec sponsor | Platform team | Build team (product) | COE / Governance | Security / Risk | HR / People |
|---|---|---|---|---|---|---|
| **Model / tier selection** | I | C | **A·R** | C | I | — |
| **Eval policy + blocking gates** | I | C | R | **A** | C | — |
| **Cost gates + budget envelope** | **A** | R | C | C | I | — |
| **Security / threat review** | I | C | C | C | **A·R** | — |
| **Publishing to shared skill/MCP library** | — | **A·R** | C | C | C | — |
| **Procurement / contract / BAA** | **A** | C | I | C | R | I |
| **Incident response (runtime)** | I | **A·R** | C | C | C | — |
| **Surface enablement (which surface, who)** | C | R | C | **A** | C | C |
| **Workforce / reskilling / comms** | C | I | C | C | — | **A·R** |

Two rules that keep this from rotting:

1. **Exactly one A per row.** Two accountable owners = no accountable owner. The "AI committee" failure mode in [`adoption-playbook.md`](adoption-playbook.md) is what happens when A is shared.
2. **A is a person's role, not a body.** "The COE" is accountable means a named COE lead signs off — not a meeting. Decision queues over ~7 days are the symptom that A diffused into a committee.

---

## 4. The paved road — platform-owns vs product-owns

The boundary that makes hub-and-spoke work: the platform/COE owns the **paved road** (the safe, fast default path); product teams own what they **build on it**. Get this boundary wrong and you either bottleneck (platform owns too much) or sprawl (product owns too much).

| Platform / COE owns (the road) | Product team owns (the vehicle) |
|---|---|
| Auth, logging, cost dashboards, model routing | Their use case's prompts, skills, evals |
| Shared MCP servers (CRM, ticketing — one each, not 14) | Their workflow design + UX |
| Eval *framework* + blocking-gate policy | Their eval *cases* (domain-specific) |
| Security review process + threat-model template | Their tool scoping within the template |
| Skill/plugin registry + publishing standards | Their team-specific skills (promoted to shared via COE) |
| Incident runbook + kill switch | First-line response for their use case |
| Cost gates + budget allocation | Staying within their envelope |

The test: if every team has to *ask* the platform team to ship, the road is too narrow (bottleneck). If every team builds its own auth/logging/eval harness, there's no road (sprawl). The paved road is wide enough to self-serve, guarded enough to be safe by default.

---

## Failure modes

| # | Pattern | Symptom | Fix |
|---|---|---|---|
| 1 | **Central bottleneck** | Every team queues behind one; shadow AI grows | Graduate to hub-and-spoke; ship paved roads so teams self-serve |
| 2 | **Federated sprawl** | Same skill built N ways; no shared evals; center-blind to cost/risk | Pull shared infra back to a hub; one CRM connector, not ten |
| 3 | **Ivory-tower COE** | Hub writes standards; spokes route around them | COE ships tooling (paved roads), not memos; measure adoption of standards |
| 4 | **No-RACI thrash** | Decisions take weeks; nobody knows who says yes | Publish the §3 matrix; one A per row; A is a named role |
| 5 | **Boundary blur** | Platform owns too much (bottleneck) or too little (sprawl) | Re-draw the §4 paved-road line; self-serve but safe-by-default |

---

## Companion artifacts

- [`adoption-playbook.md`](adoption-playbook.md) — the three **functions** (Build / Platform / Governance+COE) this guide arranges; Weeks 9–13 COE stand-up.
- [`maturity-model.md`](maturity-model.md) — standing up the COE is the L2→L3 move.
- [`governance-overlay.md`](governance-overlay.md) — what Security/Risk is accountable for (§4 BAA, §9 audit, §14 safety).
- [`procurement-pack.md`](procurement-pack.md) — the procurement RACI row, in execution detail.
- [`workforce-change-guide.md`](workforce-change-guide.md) — the HR/People accountable row, in depth.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-06. RACI is a template — adapt to your titles. Verify model surface at anthropic.com.`
