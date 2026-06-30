# Claude Platform Playbook — Scope & File List

**Repo name:** `claude-platform-playbook`
**Tagline:** Executive-grade decision tools for AI transformation on the Claude platform.
**Audience:** CIOs/CDOs/CTOs/CHROs sizing Claude adoption + architects defending the choice to leadership.
**License:** CC-BY-4.0
**Posture:** Vendor-explicit, but decision-oriented (not Anthropic marketing recap). Pin to Claude 4.6/4.7 era; date-stamp everything.

---

## Repo structure

```
claude-platform-playbook/
├── LICENSE                          (CC-BY-4.0)
├── README.md                        (audience table + artifact map + as-of date)
└── artifacts/
    ├── executive-briefing.html      (10-slide deck)
    ├── cost-calculator.html         (interactive $/month estimator)
    ├── feature-decision-matrix.html (when to use which Claude feature)
    ├── adoption-playbook.md         (90-day rollout plan)
    ├── governance-overlay.md        (BAA, data residency, no-train, audit, retention)
    ├── build-vs-buy-worksheet.html  (use case → Claude vs DIY vs other vendor)
    └── reference-architectures.html (6 canonical patterns w/ diagrams)
```

7 artifacts. ~2 sessions to ship cleanly.

---

## Artifact specs

### 1. `executive-briefing.html` — 10-slide deck

Mirror `ai-architect-showcase/artifacts/executive-briefing.html` pattern (full-screen, arrow-key nav, print-to-PDF).

| # | Slide | Core message |
|---|-------|--------------|
| 1 | Title | "AI transformation on the Claude platform" + as-of date |
| 2 | The platform shift | Foundation models = new primitive. Build on platform, don't rebuild. |
| 3 | Claude in 60 seconds | 3 model tiers (Haiku/Sonnet/Opus) + 6 capabilities (caching, thinking, tool use, computer use, files, batch) |
| 4 | When Claude wins | Long context, careful reasoning, agentic workflows, code-heavy tasks, regulated industries (no-train) |
| 5 | Cost economics | Prompt caching (90% cached input discount) + batch (50% off) + model mix → 60-80% cost reduction vs naive use |
| 6 | Time-to-value levers | Skills + MCP + Files API + Agent SDK = weeks not quarters |
| 7 | Governance fit | No-train, data residency options, BAA paths, prompt versioning, audit trail |
| 8 | 90-day rollout | Weeks 1-4 pilot → 5-8 guardrails → 9-13 scale |
| 9 | Risks + mitigations | Vendor concentration, model deprecation, prompt drift, cost surprises |
| 10 | Decision frame + companion artifact links |

### 2. `cost-calculator.html` — interactive $/month estimator

Inputs (sliders + dropdowns):
- Monthly request volume
- Avg input tokens / output tokens per request
- Model mix (% Haiku / % Sonnet / % Opus)
- Cache hit rate (0-100%)
- Batch eligible % (0-100%)

Output:
- Monthly $ estimate
- Cost-per-request breakdown
- Savings vs naive (no caching, no batch, all Opus) baseline
- Side-by-side: Claude vs OpenAI vs DIY (rough estimates)

CDN: Chart.js for breakdown bar chart. Pricing table inline, dated.

### 3. `feature-decision-matrix.html` — when to use which feature

Grid: rows = use case patterns (chat copilot, RAG, agentic workflow, batch processing, computer-use automation, custom domain assistant). Columns = Claude features (prompt caching, extended thinking, tool use, computer use, Files API, Skills, MCP, Agent SDK, batch API, citations).

Each cell: ✓ / ✗ / conditional with 1-line rationale on hover.

Goal: architect can say "for X pattern, use Y features" in seconds.

### 4. `adoption-playbook.md` — 90-day rollout plan

Sections:
1. Week 0 — pre-flight (executive sponsor, BAA, pilot use case selection, success metrics)
2. Weeks 1-4 — pilot (1 use case, 1 team, governance shadow)
3. Weeks 5-8 — guardrails (eval suite, cost controls, prompt versioning, red team)
4. Weeks 9-13 — scale (2nd/3rd use case, internal docs, training, COE)
5. Common failure modes (8 patterns)
6. Reference team structure (build vs platform vs governance)

### 5. `governance-overlay.md` — risk + compliance

Sections:
1. Data flow taxonomy (what leaves your network, what doesn't)
2. No-train guarantee (Anthropic terms; cite + date)
3. BAA paths (HIPAA workloads)
4. EU AI Act mapping (high-risk classifications, Claude features that help/hurt)
5. NIST AI RMF mapping (Govern/Map/Measure/Manage)
6. Audit trail patterns (logging requests, prompts, responses, model version)
7. Prompt versioning + rollback
8. Retention + deletion patterns
9. Vendor concentration risk + mitigation (multi-model abstraction layer)

### 6. `build-vs-buy-worksheet.html` — interactive decision tool

Add use case → score on 6 axes (regulated data, latency, customization depth, scale, internal expertise, strategic moat) → recommendation: Claude direct / Claude via Bedrock or Vertex / OpenAI / open-source self-hosted / packaged SaaS.

Output: ranked recommendations + rationale + estimated TCO band.

### 7. `reference-architectures.html` — 6 canonical patterns

Each w/ hand-drawn SVG block diagram:
1. **RAG copilot** — Files API + caching + Sonnet
2. **Agentic workflow** — Agent SDK + tool use + Sonnet/Opus mix
3. **Batch enrichment** — Batch API + Haiku
4. **Domain expert assistant** — Skills + MCP + Sonnet
5. **Code automation** — Claude Code + computer use + Opus
6. **Embedded copilot** — Sonnet (Haiku triage) + cached app context + MCP to host app + memory tool *(added 2026-05; closes a gap where feature-decision-matrix named the pattern but ref-arch had no diagram)*

Each diagram: 1-paragraph description, cost band, governance notes, when-to-use / when-not.

---

## Sourcing rules

- All technical claims cite Anthropic docs (`docs.claude.com` / `docs.anthropic.com`) by URL + as-of date
- Pricing claims dated and link to pricing page
- Model versions pinned (Opus 4.8 / Sonnet 4.6 / Haiku 4.5 etc.) — never "latest"
- No reproducing Anthropic marketing copy verbatim — paraphrase + cite
- Footer pattern: `© gmanch94 · CC-BY-4.0 · As of YYYY-MM. Verify pricing/models at anthropic.com.`
- Cross-link to `ai-architect-showcase` (vendor-neutral strategy) and `ai-enablement-ws` (operational reference)

---

## Risks + mitigations

| Risk | Mitigation |
|------|-----------|
| Pricing changes | Date-stamp every $; calculator inputs editable |
| Model deprecation | Pin to model family (Sonnet 4.x), not specific point release |
| Reads as Anthropic ad | Lead with decision frame, not features. Compare to OpenAI/DIY in calculator + build-vs-buy |
| Vendor lock-in framing | Governance overlay explicitly addresses concentration risk + multi-model abstraction |
| Stale within 6 months | Monthly refresh discipline (scheduled remote agent, first Monday); "as-of" badge on every artifact |

---

## Build order

1. `README.md` + `LICENSE` (skeleton)
2. `executive-briefing.html` (anchors the rest)
3. `cost-calculator.html` (most-shared artifact, drives credibility)
4. `feature-decision-matrix.html`
5. `adoption-playbook.md`
6. `governance-overlay.md`
7. `build-vs-buy-worksheet.html`
8. `reference-architectures.html`
9. Cross-link pass + grep sweep + GH Pages enable

Session 1: items 1-4 (skeleton + 3 anchors). Session 2: items 5-9 (depth + ship).

---

## Open questions before build

1. Repo public from day 1, or private until v0.9?
2. Include OpenAI/Gemini comparisons in cost-calculator (more useful) or Claude-only (less risky positioning)?
3. Reference architectures — SVG hand-drawn or Mermaid generated?
4. Worth adding a `claude-code-adoption-guide.md` for engineering-team-specific rollout (separate from exec adoption playbook)?

---

## Post-v1 additions (justified extensions)

### `claude-code-starter-skills.md` (added 2026-05)

**Why it earns its place.** The Claude Code adoption guide names "5 engineers, 5 plugins, 0 reuse" as one of the eight common adoption mistakes. A pack of decision-framed Skill templates lowers the activation energy for *team* plugins (vs. per-engineer plugins) and gives engineering leads a concrete day-1 productivity floor to point at when justifying rollout. Without it, the adoption guide describes the failure mode but offers no scaffolding to prevent it.

**Why it's not in the original 8.** The original scope assumed Skills would be team-specific enough that templating them was unhelpful. Empirically, 6 of the 8 patterns in the pack (PR review, test generation, migration guard, bug triage, release notes, refactor scout) are shaped almost identically across teams — the *contents* differ but the *structure* (when-to-use / failure-mode / owner / prompt body) is portable. Treating the structure as the artifact and the prompt body as a placeholder is what makes this a reusable decision tool rather than a tutorial.

**Posture.** Decision-frame first (when each Skill earns its keep, what its failure mode is, who owns it), prompt body last. Not a tutorial. Pinned to current model surface like the rest of the artifacts.

### `eval-starter-pack.md` (added 2026-05)

**Why it earns its place.** The adoption playbook names *eval debt* as the #2 failure mode in Claude scaling: "prompts evolved faster than the evalset; quality regressed unnoticed." The Claude Code adoption guide says "without eval, a Skill change that breaks 30% of cases ships unnoticed and erodes trust in the tooling." Both name the failure mode but offer no scaffolding. This pack ships the scaffolding: 8 eval categories (regression, format compliance, tool-call accuracy, grounding, adversarial, cost-per-task, latency, refusal calibration) each framed by what it catches / failure-mode-of-the-eval-itself / owner — plus a blocking-vs-advisory matrix to prevent eval-bypass culture.

**Why it's not in the original 8.** Same reason as starter-skills: original scope assumed evals would be too repo-specific to template. Empirically the *categories* and the *ownership pattern* are portable across teams; only the specific tasks differ. Treating the structure as the artifact and the tasks as placeholders is what makes it a decision tool rather than a tutorial.

**Posture.** Decision-frame first (catches / failure-mode / owner), eval shape last. Explicit about where each eval should run cheaply (Batch API, Code execution tool) and which evals should be blocking vs advisory. Pinned to current model surface.

### `hooks-starter-pack.md` (added 2026-05)

**Why it earns its place.** The Claude Code adoption guide names three Phase 1 hooks (`block-secrets`, `run-linter`, `log-cost`) and stops there — but the same guide names "Hooks enforce destructive-op blocking" and "Audit log: all tool calls in headless mode" as Phase 3 governance requirements without showing the hook body. Engineering leads end up either shipping the 3 starter hooks and discovering gaps in incident review, or attempting 12 hooks at once and ending up with a brittle pre-tool layer that throttles the agent. The pack closes that gap with 10 hooks, each decision-framed (when-to-use / failure-mode / owner) before the body, plus a Phase 1→4 rollout matrix and a blocking-vs-advisory default per hook.

**Why it's not in the original 8.** Original scope assumed hooks would be team-specific enough that templating was unhelpful. Empirically the *event-to-control mapping* is portable across teams (every regulated team needs a PII scrub, every team with protected branches needs a branch guard) — only the patterns and thresholds differ. Treating the structure as the artifact and the patterns as placeholders is what makes this a decision tool rather than a tutorial.

**Posture.** Decision-frame first (when-to-use / failure-mode-without / failure-mode-of-the-hook / owner), hook body last. Phased rollout matrix prevents the "ship 12 hooks on day 1" failure mode. Blocking-vs-advisory matrix mirrors the eval pack's blocking discipline. Pinned to current Claude Code surface.

### `mcp-starter-pack.md` (added 2026-05)

**Why it earns its place.** The Claude Code adoption guide's Phase 2 names four MCP servers worth wiring early (issue tracker, internal docs, CI logs, DB read replica) at the header level — no config bodies, no read-vs-mutate framing, no per-server failure-mode breakdown. The feature decision matrix and reference architectures cite MCP across five patterns without showing the server shape. Engineering leads end up either (a) shipping "MCP for everything immediately" (one of the eight named adoption mistakes) with 7 half-built servers, or (b) deferring MCP indefinitely and wiring bespoke per-agent tools that rot when an agent moves. The pack closes the gap with 7 decision-framed read-only server templates, each gated by an explicit read/mutate scope declaration.

**Why it's not in the original 8.** Same reason as the prior three template packs: original scope assumed MCP servers would be too system-specific to template. Empirically the *server class* (issue tracker, docs, observability, etc.) and the *redaction + allow-list shape* are portable across teams; only the credentials and project keys differ. The structural decision (which scope, which redactor, which owner) is the artifact; the credential is the placeholder.

**Posture.** Decision-frame first (when-to-use / failure-mode-without / failure-mode-of-the-server / owner / scope), config body last. Read-only by design — every server in the pack is gated to read scope, with mutate variants explicitly deferred to Phase 4. Phased rollout matrix mirrors the hooks pack and the adoption guide's 90-day arc. Pinned to current Claude + MCP surface.

### `pilot-selection-worksheet.html` (added 2026-05)

**Why it earns its place.** The adoption playbook Week 0 names "pilot use case" as a decision with a one-line default ("internal-facing workflow with measurable cycle time and a willing team") — but the playbook also names "picking the use case first, sponsor second" and "letting 'the AI committee' replace a single accountable owner" as the top Week 0 mistakes, without a tool to surface those failure modes before the pilot ships. The worksheet operationalizes the decision: 5 weakest-link axes (value, time-to-signal, data readiness, risk, sponsor clarity), per-axis blocker flags, ranked verdicts. A use case scoring 4-4-4-4-1 has the same total as 4-4-3-3-3 but the first one has a fatal axis — the blocker rule catches that.

**Why it's not in the original 8.** Original scope assumed pilot selection was political/contextual enough that templating the scoring would be unhelpful. Empirically the *axes* are portable across orgs (every Week 0 has a value-vs-readiness-vs-sponsor question); only the use cases differ. Treating the axes + verdict logic as the artifact and the use-case names as placeholders is what makes it a decision tool rather than a checklist.

**Posture.** Decision-frame first (axis definitions explain *why* each one is weakest-link, not just what it measures). Multi-use-case (2–6) so it forces comparison rather than rationalization of a pre-picked choice. Blocker rule overrides total — pilots fail on weakest-link, not on average. Pinned to current Claude surface; cross-linked from adoption-playbook.md Week 0.

### `anti-use-cases.md` (added 2026-05)

**Why it earns its place.** Every other artifact in this repo answers *when* and *how* to use Claude. None of them answer *when not to* — except in passing, scattered across governance-overlay, build-vs-buy, and the adoption playbook's failure modes. The result: readers who go through pilot-selection-worksheet still ship use cases that should have been killed in Week 0 (sole-decider on regulated decisions, sub-100ms latency targets, sub-cent unit-cost workloads, prompt-injection-exposed agentic loops). The anti-use list is the explicit-reject filter that runs *before* scoring — 5 categories (Hard nos, Wrong tool, Wrong economics, Governance no-go, Premature) with cited regulator + framework anchors. It is the single biggest credibility lift available: a vendor-explicit repo with no "don't use this for X" reads as marketing recap. This file is the antidote.

**Why it's not in the original 8.** Original scope assumed governance-overlay.md + the failure-mode list in adoption-playbook covered the no-go space. Empirically they don't: governance-overlay is reference depth on compliance posture, not a use-case reject list, and the playbook failure modes are about *running* a pilot, not *picking* one. Anti-use-cases sits upstream of both — it kills bad pilots before they get scored.

**Posture.** Decision-frame first (Pattern → Why not → Do this instead → Cite). Five categories ordered by Week-0 frequency. Cross-linked from pilot-selection-worksheet (runs after this filter), build-vs-buy-worksheet (only meaningful if the use case survives this filter), governance-overlay (depth on the Governance no-go rows), adoption-playbook (the Premature rows are the playbook's pre-flight gates, made blocking).

### `decision-spine.html` (added 2026-05)

**Why it earns its place.** The README's audience map is a table — it works once the reader knows which row they are. For a CIO who isn't sure whether they're "sizing TCO" or "choosing patterns" (because the candidate use case crosses both), or for a transformation lead whose decision spans risk + cost + adoption, the audience map produces a guess, not a route. The spine fixes that: a single front-door flowchart that asks the seven decisions in order (anti-use → pattern → build-vs-buy → cost → ship safely → CLI rollout → measurement), routes to the right artifact at each branch, and names the next decision after each one. The order is load-bearing — anti-use is always question 1, measurement is always wired before pilot launch, governance + adoption playbook converge with CLI rollout at "Pilot → Guardrails → Scale."

**Why it's not in the original 8 (or the post-v1 additions).** Original scope assumed the audience map + the artifact-table-with-arrows in README would cover navigation. Empirically they don't, because the reader doesn't always know which audience row they are. The spine isn't a new artifact in the sense of new content — every branch routes to an existing artifact. It is a new *navigation primitive* that makes the existing artifacts addressable as a system rather than a pile.

**Posture.** Decision-frame first (each branch states the question + who's asking + 1-line frame + artifact links + next decision). Hand-drawn flowchart at top mirrors the `reference-architectures.html` aesthetic — same fonts, same color taxonomy, same hand-drawn rough-line geometry. Print-friendly. No JS dependencies; pure HTML + SVG + anchor navigation. Cross-linked from README (front-door promotion).

### `decision-memes.html` (added 2026-05)

**Why it earns its place.** Every other artifact assumes the reader has already decided to engage with the repo. This artifact handles the activation step before that — the moment when a CIO who has seen 47 AI strategy decks this month opens the 48th. Eight memes, each pointing at a real decision the rest of the repo treats seriously: anti-use filter, model selection, governance discipline, shiny-framework attractor, build-vs-buy moat axis, eval discipline, build-vs-buy convergence, prompt-cache reality. Comedy is the Trojan horse for governance discipline — every visual mocks a bad decision the artifacts help you avoid.

**Why it's not in the original 8.** Original scope assumed executive-grade tone meant no humor. Empirically: tone-deafness is its own off-ramp. A repo that takes itself entirely seriously gets bookmarked and never returned to. A single deliberately-irreverent surface that points back to the serious artifacts increases the chance the artifacts get read at all. Used as a slide-deck opener, skeptic disarmer, onboarding ice-breaker, or workshop facilitation prompt.

**Posture.** Each meme is a 2-column card: visual panel (CSS-drawn, no third-party templates or stock images, no copyright risk) + "the actual point" panel (punchline → 1-line decision frame → artifact link). Distracted-boyfriend template explicitly excluded — the gendered baseline is built into the original meme regardless of how it's relabeled, and the audience includes CHROs and risk leads. Replaced with "Is this a pigeon?" which carries the same misclassification punchline without identity baggage. Footer reiterates: <em>"All visuals CSS-drawn. No third-party meme templates or stock images. Original work, CC-BY-4.0."</em>

### `claude-misconceptions.md` (added 2026-05)

**Why it earns its place.** `decision-memes.html` handles the activation step (skeptic disarmer, ice-breaker) but does it in joke form — useful as a slide-1 opener, weaker as the artifact a CIO forwards to a finance lead or a security architect. Readers consistently arrive with stale priors ("context window is 200K," "Pro covers the API," "Claude refuses everything sensitive," "denyRead protects my .env") that quietly distort which branch they pick on `decision-spine.html` — they exit at anti-use when their workload is viable, or skip caching when caching is the dominant cost lever. This file is the text-form skeptic-disarmer companion: every entry is a misread that drives a *measurable* mis-budget, mis-architecture, or mis-staffing call. If a myth doesn't change a decision, it isn't in the file. ~15 entries across model surface, Claude Code, API economics, safety/refusal, and rate-limits/Computer Use.

**Why it's not in the original 8 (or the prior post-v1 additions).** Original scope assumed `governance-overlay.md` plus the briefing's risks slide and `anti-use-cases.md` covered objection-handling. Empirically they don't: governance-overlay is reference depth on compliance posture (BAA, residency, NIST), anti-use is a use-case reject filter, and the briefing risks slide names categories (vendor concentration, model deprecation) but not vendor-specific factual misreads. The misconception space sits between them — vendor-explicit, fact-level, decision-relevance-filtered. `decision-memes.html` already proved the skeptic-disarmer surface is needed; this is the substantive form.

**Posture.** Decision-frame strict — every entry ends in **What you'd mis-decide** (mis-budget / mis-architect / mis-staff) before the cite. Comparative claims against GPT/Gemini explicitly excluded (the cost-calculator already excludes those by repo decision; consistency matters). All cites resolve to `docs.claude.com`, `anthropic.com`, or this repo's own `feature-inventory.md` — no third-party blog/Medium/aggregator sources. Pinned to the current model surface; refreshed monthly with the feature-inventory pass. Cross-linked from `decision-spine.html`, `decision-memes.html`, `executive-briefing.html` Slide 9, `feature-inventory.md`.

### `cost-calculator.html` — governance gate extension (backlog #2-deeper, shipped 2026-05)

**What shipped.** $/task ceiling and $/day cap inputs with live red banners when computed values exceed thresholds. Inline warnings on cache hit-rate slider (<60%) and batch eligibility slider (>0% and <80%). Calculator's contract shifts from modeling-only to modeling + gating — the four numeric gates from `governance-overlay.md §15.1` are now surfaced in the same UI as the spend estimate. Original lean-version reasoning (conceptual move without bloating UX) still stands as the prior layer; this extension adds visceral feedback for the breach case.

### `data-advisory.md` (added 2026-05)

**Why it earns its place.** Two questions surface before most Claude pilots that no existing artifact fully answers together: *how much data do we need?* and *where does it come from?* The `pilot-selection-worksheet.html` scores a "data readiness" axis without a depth reference; `eval-starter-pack.md` covers eval templates but not eval corpus sizing as a pre-pilot decision; `anti-use-cases.md` §3 names cache-hostile and distillation-trigger economics but doesn't address RAG corpus thresholds or data source governance flags. Transformation leads and architects end up estimating corpus size, eval counts, and cache eligibility from intuition rather than from a single scoping reference. This artifact is that reference: context window vs. RAG threshold, eval corpus minimums, distillation trigger volume, cache eligibility shape, and a source-of-data taxonomy with governance flags per source. Both halves of the question — *how much* and *from where* — are answered in one artifact.

**Why it's not in the original 8.** Original scope assumed data readiness was implicit in the pilot-selection worksheet and the eval pack. Empirically it isn't: the worksheet scores readiness without quantifying it, and the eval pack gives template shapes without pre-pilot sizing guidance. The gap is the *decision layer* between "we have some data" and "we know whether we have enough data in the right shape for this use case." That layer belongs upstream of both the eval pack and the RAG architecture decision.

**Posture.** Sizing lens, not architecture tutorial. Each section: threshold → decision trigger → cite (primary source where one exists; "rule of thumb" label where it doesn't). RAG corpus sizing and distillation training data volumes are explicitly labeled as rules of thumb — not primary Anthropic docs. Eval corpus minimums cite `eval-starter-pack.md` as primary. Cache floor cites `governance-overlay.md §15.1`. Cross-links from `pilot-selection-worksheet.html` (data readiness axis), `adoption-playbook.md` (Week 0 pre-flight), `anti-use-cases.md` (§3 cache-hostile + distillation rows), `governance-overlay.md` (§4 HIPAA + §5 residency for source governance). Cross-link to `ai-enablement-ws` for vendor-neutral data pipeline depth. Pinned to current model surface.

### Pattern for future starter packs

The starter-skills + eval-pack + hooks-pack + mcp-pack + pilot-worksheet quintuple establishes a **template artifact pattern**: when the existing playbook/guide names a failure mode but offers no scaffolding, a starter pack with structured templates (when-to-use / failure-mode / owner / body) — or in the worksheet case, scored axes + verdict logic — earns its place. Candidate future packs to evaluate against this bar:

- **Slash-command starter pack** — 6–8 portable slash commands (review-pr, run-eval, gen-changelog) — only earns place if the adoption guide's slash-command section grows past the current sketch
- **COE charter template** — adoption playbook Weeks 9–13 names "COE pattern operating: intake → triage → support → graduate" without showing the charter. Earns place if asked.

### `model-selection-guide.md` (added 2026-05)

**Why it earns its place.** The `feature-decision-matrix.html` encodes which Claude features fit which patterns, but the upstream question — *which model tier?* — is answered only in tooltips. Executives and architects consistently ask "which tier do we buy?" before they reach the matrix. Without a standalone guide, the answer is scattered across the briefing, calculator, and matrix. This artifact consolidates the decision into one place: 4-question framework, task-type → tier table, cascade pattern, and cost impact of over-tiering.

**Why it's not in the original 8.** Original scope assumed the cost-calculator + feature-decision-matrix covered model selection. Empirically they don't: the calculator shows cost *given* a mix; the matrix shows features *given* a pattern. Neither answers the upstream "which tier for this task?" question that precedes both.

**Posture.** Decision-frame first. Every recommendation includes the failure mode (what goes wrong if you over-tier or under-tier). Numeric cost impact for each tier-swap. Pinned to current model surface; refreshed monthly.

### `multi-agent-patterns.md` (added 2026-05)

**Why it earns its place.** `reference-architectures.html` has one agentic workflow pattern diagram. The feature-inventory lists sub-agents as GA. But neither artifact addresses the question architects face when designing agentic systems: *which decomposition pattern fits, and what are the failure modes?* The `claude-misconceptions.md` addition ("multi-agent ≠ more reliable") names the error-compounding problem but offers no scaffolding. This artifact provides 5 named patterns (orchestrator-worker, parallel fan-out, sequential pipeline, validator-retry, human-in-loop gate), the compounding accuracy math, sub-agent configuration shape, and the decision criteria for when to use each.

**Why it's not in the original 8.** Original scope's agentic pattern in `reference-architectures.html` assumed one pattern was enough. Empirically, teams building agentic systems face 5+ distinct decomposition choices and routinely pick the wrong one. The structural decision — which pattern, which error-handling posture — is what belongs here; the code is in the SDK docs.

**Posture.** Pattern-first (name → diagram sketch → when-to-use → failure mode → mitigation). Error-compounding math is explicit — not hidden. Cross-linked from `reference-architectures.html` (agentic pattern), `eval-starter-pack.md` (tool-call accuracy eval), `cost-calculator.html` (turns multiplier). Pinned to current model surface.

### `incident-response-runbook.md` (added 2026-05)

**Why it earns its place.** `governance-overlay.md §10` covers prompt versioning and rollback. `adoption-playbook.md` names failure modes. Neither answers "what do we do *right now*?" when something breaks in production. The gap is the reactive layer: symptoms → immediate actions → root cause → remediation → post-mortem, per incident class. Five classes cover the realistic failure space: prompt regression, model deprecation, cost spike, agent loop runaway, MCP server compromise.

**Why it's not in the original 8.** Original scope assumed governance-overlay + adoption-playbook failure modes covered incident response. Empirically they don't: the overlay is a design-time reference, the playbook is a planning artifact. Neither is a runbook. The runbook belongs here because it unlocks the governance investments (audit log, rollback, kill-switch) already documented in the overlay.

**Posture.** Runbook format: symptoms → immediate actions (time-boxed) → root cause investigation → remediation → post-mortem template. Five incident classes, each self-contained. Cross-linked from `governance-overlay.md` (§10 rollback, §15 cost gates), `hooks-starter-pack.md` (log-cost + block-secrets), `adoption-playbook.md` (failure modes). Pinned to current model surface.

### `subscription-selection-guide.md` (added 2026-06)

**Why it earns its place.** Every artifact in the repo answered the *API* surface — `cost-calculator.html` models per-token inference, `model-selection-guide.md` picks a model tier. None answered the question a buyer asks *first*: **which Claude subscription do we buy?** Plan facts were scattered as side-notes — a seat-cost block in the calculator (Pro/Max/Teams only), a "Pro doesn't cover the API" myth in `claude-misconceptions.md`, a consumer-plans-are-a-separate-policy-surface caveat in `governance-overlay.md`. A CIO or IT lead asking "Pro vs Max vs Team vs Enterprise for my org, and do we also need API credits?" had no artifact to route to. This guide is that route: a three-gate framework (compliance → team size → build-vs-use) that routes across Free / Pro / Max / Team / Enterprise, a full plan-comparison table (price · seats · Claude Code · usage · SSO/SCIM · no-train · BAA · API quota), a persona→plan table with failure modes, and the "you need both surfaces" pattern that the seat-vs-API split keeps tripping. The gate ordering is load-bearing — compliance is asked before headcount so a regulated org ≤150 is never routed to Team (which carries no BAA).

**Why it's not in the original 8 (or prior additions).** Original scope assumed the cost-calculator's seat-cost block plus the misconceptions entry covered the subscription decision. Empirically they don't: the calculator models *API* cost and treats seats as a footnote (omitting Free and Enterprise rows); the misconception kills one myth without routing the buy decision. The gap is the *decision layer* between "we want Claude" and "we know which seat plan(s) + whether we also need API credits" — upstream of every cost-sizing artifact. It mirrors `model-selection-guide.md`: that one answers *which model tier*, this one answers *which billing surface + seat tier* — the two buy-time decisions.

**Posture.** Decision-frame first (every persona row names the failure mode of the wrong buy — e.g. Team-for-a-HIPAA-workload is a compliance gap because Team carries no BAA). Two-billing-surfaces mental model leads, because the seat-vs-API conflation is the single most common mis-budget. All plan prices graded [H] to `anthropic.com/pricing` with the "subject to change" caveat carried; SCIM/audit tier-mapping flagged [M-inferred]. Cross-linked from `cost-calculator.html` (size the API line there), `model-selection-guide.md` (sibling buy-time decision), `governance-overlay.md` (no-train + BAA depth), `claude-misconceptions.md` (the "Pro covers the API" myth). Pinned to the current plan + model surface; refreshed monthly with the feature-inventory pass.

### `surface-rollout-matrix.md` + `cowork-adoption-guide.md` (added 2026-06, ship as a pair)

**Why they earn their place.** The repo had exactly one feature-level rollout playbook — `claude-code-adoption-guide.md` (plus its four starter packs) — and a platform-level `adoption-playbook.md` (the 90-day org arc). Every *other* product surface (Cowork, Claude Design, Projects, chat) got governance and procurement coverage but no "how do we roll *this surface* out, to whom, in what order" answer. That gap matters because the surfaces are not interchangeable: Claude Code and Cowork take real actions; Projects and Design persist data; chat is the floor — and the most useful surface is rarely the safest to enable first. The pair closes the gap from two altitudes. `surface-rollout-matrix.md` is the one-level-up router (which surface, for whom, sequenced by blast radius, with a governance flag per surface — the column Anthropic's own product docs won't assemble). `cowork-adoption-guide.md` is the deep per-surface guide for the highest-blast-radius non-developer surface, mirroring the Claude Code guide's shape for a non-engineering audience.

**Why they're not in the original 8 (or prior additions).** Two reasons. First, surface-level rollout was implicitly assumed to be covered by the platform `adoption-playbook.md` — but that artifact is surface-agnostic (it's the 90-day arc, not a per-surface decision). Second, the surfaces themselves moved: building these surfaced a staleness finding — **Cowork graduated** from the beta it was logged as in `feature-inventory.md` (now GA on all paid plans, with shipped enterprise admin controls), and **Claude Design is a real Team/Enterprise surface** with Anthropic's own published rollout phases, not the non-existent surface a first pass assumed. Neither could have been scoped at v1; both are current-surface facts that the monthly refresh would otherwise have caught late. Cowork earns the *deep* guide (real-actions-on-a-machine governance is non-trivial); Design earns a *matrix row only* because Anthropic already publishes its rollout phases — the repo's value-add there is the governance flag (persisted assets, no residency, beta/no-BAA), not a re-authored phase plan.

**Posture.** Decision-frame first, sequenced by blast radius not enthusiasm. The matrix's governance column is the substantive differentiator and names a failure mode per surface (repo tone rule). Cowork facts live in the deep guide; the matrix cites + links it rather than restating them (cross-file-consistency rule — avoids the drift that bit cost-calculator vs the subscription guide). The load-bearing compliance fact — **Cowork and Design are both BAA-excluded, Projects/Chat/Artifacts are BAA-covered on Enterprise with admin HIPAA activation** — is sourced [H] to `privacy.claude.com`, not punted to `[?]`. Cross-linked to `adoption-playbook.md` (complementary altitude), `claude-code-adoption-guide.md` (sibling deep guide), `subscription-selection-guide.md` + `cost-calculator.html` (plan + cost), `governance-overlay.md` (compliance depth). Pinned to the current surface set; refreshed monthly with the feature-inventory pass.

### `enterprise-data-boundaries.html` (added 2026-06)

**Why it earns its place.** `governance-overlay.md` is the compliance source of truth, but it's long-form reference prose — a CISO or security architect doing a per-feature data-flow review has to assemble "where does *this feature's* data go" by hand from §1 (data flow), §3 (ZDR), §4 (BAA), §5 (residency), §11 (retention). No artifact draws the trust boundary per feature. This one does: 12 hand-drawn trust-zone diagrams (Customer zone → prompt boundary → Anthropic processing → storage → optional third-party / your-external / hyperscaler egress), each surface-tagged and each carrying its own no-train / retention / ZDR / residency / BAA meta cells, plus a coverage table for every Enterprise-relevant feature. It is the visual companion to the governance overlay — the diagram a security reviewer actually wants in front of them.

**Why it's not in the original 8.** Original scope assumed `governance-overlay.md` covered data-handling and `reference-architectures.html` covered diagrams. Empirically they sit on different axes: the overlay is text reference (no per-feature visual), and reference-architectures draws *solution patterns* (RAG, agentic, batch), not *data boundaries*. The per-feature trust-zone view is a third axis — neither "which pattern" nor "what's the policy" but "for this feature, what crosses the line." It earns a separate artifact because the surface-partitioning (product vs API vs procurement) is load-bearing and the overlay's prose can't carry it visually.

**Posture.** Surface-partitioned and decision-frame-first — every diagram declares its surface, honoring the product-vs-API BAA split hardened into governance §4 (ZDR / `inference_geo` never appear on a chat/projects box; code-exec covered on the product surface, not the API tool). Boundary facts live in per-diagram meta cells, never a blanket legend implying uniform coverage; each cell traces to a `governance-overlay.md §`. "Comprehensive" was delivered as literal per-feature diagrams (user choice) — 12 drawn + a coverage table catching Batch / Computer-use / Web-fetch / Citations. Hand-drawn SVG, same color taxonomy + fonts as `reference-architectures.html`, renders on GitHub Pages. Reviewed by two independent live-verified agents (accuracy/compliance + design/consistency) before ship. Pinned to the current surface; refreshed monthly with the feature-inventory governance rows.

### `roi-worksheet.html` (added 2026-06)

**Why it earns its place.** `cost-calculator.html` sizes what an org *pays*; no artifact sized what it *gets*. A CIO can price Claude to the dollar and still lose the board conversation, because the board asks for return, not spend. This worksheet is the value side of that conversation — people × hours × assist-share × **realized-capture discount** × loaded rate, netted against the cost-calculator's steady-state spend into payback and a value-to-cost ratio, with a sensitivity table. It is the single biggest gap for the CFO/board conversation: the repo could cost a pilot but not justify it.

**Why it's not in the original 8.** Original scope assumed the cost-calculator covered the money question. It covers half — the denominator. The numerator (value) was nowhere, and a half-answered ROI is how pilots die in budget review. It mirrors the cost-calculator deliberately (same axes-to-output worksheet pattern, standalone so it never risks the load-bearing `PRICING` const).

**Posture.** Built to be *defensible to a CFO, not to flatter the project* — conservative defaults, an explicit realized-capture dial (the anti-theater control), a "five ways this number lies" section (double-count, no-baseline, productivity theater, soft-value dominance, pilot-cost optimism), and an explicit list of value it refuses to count (brand halo, optionality, untracked time). Cross-linked as the cost-in/value-out pair with `cost-calculator.html`; feeds the honest team-level measurement in `workforce-change-guide.md`. Pinned to current surface.

### `procurement-pack.md` (added 2026-06)

**Why it earns its place.** `build-vs-buy-worksheet.html` makes the *decision* to use Claude; `governance-overlay.md` states the *facts* in reference prose. Neither gives procurement the artifact it actually needs: the answers to paste into a security questionnaire, the DPA/BAA pre-signature checklist, and the SLA terms to negotiate. The motion stopped one step short of signing. This pack is that step — the governance facts reformatted as a surface-split, cite-per-row Q&A a CISO or vendor-risk reviewer fills directly.

**Why it's not in the original 8.** Original scope assumed governance-overlay covered the compliance surface. It covers the *reference* layer, not the *execution* layer — a reviewer can't paste a prose section into a questionnaire row, and the surface-split (the same BAA question has different answers for Enterprise product vs first-party API vs Cowork) is exactly what trips procurement when prose gets flattened.

**Posture.** The liability artifact of the repo — public and pasteable straight into a binding RFP. Held to the hardest sourcing discipline: **every answer cites a `governance-overlay.md §` / inventory row, or is explicitly flagged "verify at signing."** Zero bare assertions; where Anthropic's published material is silent (encryption specifics, breach-notice timelines, the growing BAA-eligible list), the answer is "verify in the Implementation Guide / DPA / Trust Portal," never an inference. This is the artifact the [[verify-baa-from-source-table]] memory exists to protect. Reviewed by an independent compliance lens before ship. Cross-linked from build-vs-buy, governance-overlay, enterprise-data-boundaries, subscription-selection.

### `workforce-change-guide.md` (added 2026-06)

**Why it earns its place — honestly stated.** Unlike the template packs, no existing artifact *names a failure mode this one scaffolds* — the playbook's failure modes are all pilot-ops, not people. The honest justification is different: **the CHRO is a named audience in the README and has been the least-served one.** Every execution artifact rolls Claude out to *systems* (engineers, non-engineers, surfaces); none rolls it out to *people* — role impact, the augmentation-vs-replacement narrative, tiered reskilling, and the bright line between measuring productivity and surveilling staff. That's a genuinely new domain, not a scaffolding gap, and it's a named-audience hole.

**Why it's not in the original 8.** Original scope treated workforce change as out of band — implicitly a generic-HR concern, not Claude-specific. Empirically the Claude-specific parts (which roles change how, the verification-skill at the practitioner tier, the surveillance-backlash failure mode that drives shadow AI, the works-council consultation gate) are decision-shaping and unaddressed anywhere else in the repo.

**Posture.** Decision-frame first (four CHRO decisions + a labor-consultation gate), failure-mode per recommendation. The comms section follows the repo's anti-marketing voice — plain, honest, answers "am I being replaced?" directly rather than in euphemism. Labor-consultation obligations flagged as jurisdiction-specific ("get employment counsel"), never asserted as fact. Cross-linked to adoption-playbook (complementary altitude), surface-rollout, roi-worksheet (honest team-level measurement), claude-misconceptions (awareness-tier reading).

### `agentic-threat-model.md` (added 2026-06)

**Why it earns its place.** `governance-overlay.md` + `enterprise-data-boundaries.html` answer *where data goes* (the compliance surface); `incident-response-runbook.md` answers *what to do when it breaks* (reactive). Neither answers what a security architect is asked when defending an *agentic* deployment: how does an attacker turn the agent against us, and what stops them? This is the preventive attack-surface register — ten threats on the OWASP-LLM/agentic taxonomy, each mapped to a control that **already exists in the repo** (hooks-pack, mcp-pack, governance §14/§9/§15, anti-use-cases, cowork-guide). It's a router into existing controls, not a new pile.

**Why it's not in the original 8.** Original scope's one agentic pattern (`reference-architectures.html`) assumed the architecture was the risk story. Empirically the agentic surface has a distinct *attack* surface — indirect prompt injection, excessive agency, exfiltration via the agent, MCP supply chain, confused-deputy — that no compliance or reactive artifact carries. As the repo gained agentic surface coverage (Cowork, Claude Code, MCP), the preventive security layer became the conspicuous gap.

**Posture.** Deployer-control model — explicitly *not* a Claude pentest or a claim about Anthropic's internal security (that's the Trust Portal / procurement-pack). Blast-radius graded per threat for an agent with real tool access; four-layer defense-in-depth table; a five-question pre-ship design gate specializing the think-first protocol for agents. Framework-anchored to OWASP LLM. Reviewed by an independent compliance/security lens before ship. Cross-linked to the controls it routes into and to the runbook (its reactive counterpart).

### `maturity-model.md` (added 2026-06)

**Why it earns its place.** `adoption-playbook.md` is a *linear* 90-day arc that assumes a zero start. Most orgs aren't at zero — they're at shadow-usage, or one governed pilot, or a running platform — and a linear plan misroutes all but the greenfield case. This model lets an org *locate itself by capability built* (L0 ad-hoc → L4 agentic-at-scale), via a weakest-link self-assessment, then names the single highest-leverage next move per rung. It's the "where are we / what's next" entry aid the linear playbook can't be.

**Why it's not in the original 8.** Original scope assumed the playbook + decision-spine covered orientation. They don't: the playbook assumes L0, and the spine routes by *question*, not *capability*. The maturity axis — locate-then-advance — is a third orientation primitive, distinct from both (a one-line in-artifact note makes the spine distinction explicit so it doesn't read as a duplicate).

**Posture.** Weakest-link rule (you're at the lowest rung where you fail a gate — maturity is the floor, not the demoed ceiling), explicit self-assessment checklists per rung, one-next-move table routing into the rest of the repo, and a single load-bearing anti-pattern (skipping rungs — L4 agentic ambition on an L1 foundation is the recurring expensive failure). Cross-links every other artifact at the rung where it applies. Pinned to current surface.

### `operating-model-guide.md` (added 2026-06)

**Why it earns its place.** This is the **COE-charter candidate pre-scoped in "Pattern for future starter packs"** above ("earns place if asked") — and it was asked. But it is deliberately *not* a re-derivation of the playbook's `Reference team structure (3 functions)`. The playbook already defines the three functions (Build / Platform / Governance+COE) with owns/skills/reports-to. The genuinely new content is upstream of that: **which org *shape* arranges those functions** (centralized / federated / hub-and-spoke / community-of-practice) and **the RACI matrix** that gives decisions one accountable owner each. A 200-person scale-up and a 50,000-person regulated enterprise need the same three functions in different shapes; nothing in the repo chose the shape.

**Why it's not in the original 8.** Original scope folded org design into the playbook's team-structure section. That section defines the *functions*; it never chose the *shape* or assigned *decision rights*. The shape choice (with a per-shape failure mode) and the decision×role RACI are the new, portable artifact — the function definitions are cross-referenced to the playbook, not repeated.

**Posture.** Leads with an explicit "this picks the shape; the playbook defines the functions — not re-derived here" boundary, per the cross-file-consistency rule (avoids duplicating the playbook). Four shapes with fit-signals + failure-mode each; a default recommendation (hub-and-spoke) with the reasoning; a RACI template (one A per row, A is a named role not a committee); and the platform-owns-vs-product-owns paved-road boundary. Cross-linked to playbook (functions), maturity-model (the L2→L3 move), procurement + workforce (the Security and HR accountable rows in depth).

### `rollout-kickoff-kit.md` (added 2026-06)

**Why it earns its place.** The repo routes four ways — by persona (README audience map), by question (`decision-spine.html`), by capability (`maturity-model.md`), by surface (`surface-rollout-matrix.md`). None routes by **who-acts-when across roles**, which is exactly what a cross-functional kickoff needs. The discriminating test: two things in this kit exist nowhere else — the **roles × time swimlane** (who acts Week 0 vs Weeks 1–4) and the **between-lane handoff seams** (security serial-blocking, CHRO comms lagging the pilot, BAA on the critical path, eval baseline skipped at ignition). Everything else is a pointer.

**Why it's not in the original 8.** Original scope put rollout sequencing in the playbook (by workstream/phase) and decision rights in the operating-model RACI (steady-state). Neither draws the persona-over-time swimlane or the between-lane drops; the audience map gives each persona a *first artifact* but not a *Week-1 deliverable / gate / failure mode*. This kit is the synthesis layer those three leave empty.

**Posture.** Scoped to **Week 0 → Week 4** — it ends exactly where the playbook's Week-5 Guardrails phase begins (no third timeline). Role labels align to the operating-model RACI cast; the first-artifact column mirrors the README audience map (canonical there, not re-listed). Single-lane failure modes are cross-referenced to the playbook's 8 + the RACI, never repeated — only the between-lane seams are original. BAA references are timing-only ("start early, critical-path"), never coverage claims. Cross-linked to playbook (full arc), operating-model (RACI), surface-rollout (surface order), maturity-model (Week-0 input), anti-use + pilot-selection (the Week-0 gates), eval-starter (the baseline gate).

### `user-mindset-cheatsheet.md` (added 2026-06)

**Why it earns its place.** This is **scope-completion, not a new audience**: [`workforce-change-guide.md`](../artifacts/workforce-change-guide.md) §3 already names a *practitioner tier* — "review-and-edit discipline, verification, prompt patterns for their task, when to override" — and explicitly has **no artifact behind it**. Every other rollout artifact targets the decision-maker (exec, architect, rollout-owner); none is the thing an enablement lead actually hands the end user in week one. This cheatsheet *is* that named-but-unsupplied deliverable. The discriminating test: it's the only artifact written *to the individual being onboarded* rather than *to the person choosing/deploying Claude* — the mindset-shift layer (direct-and-check vs do-it-yourself, verify what the model gets wrong, the data boundary) that no decision tool carries because it isn't a decision, it's a behavior change.

**Why it's not in the original 8.** Original scope treated end-user enablement as out of band — training material, not a decision tool. Empirically the gap is real and the repo already promised to fill it: the practitioner tier is named in workforce-change, the enablement-lead lane in [`rollout-kickoff-kit.md`](../artifacts/rollout-kickoff-kit.md) has a deliverable with no artifact, and the surface guides (cowork/claude-code) assume the user already knows *how to think* about the tool. The cheatsheet supplies the one-page mindset handout those three leave as a hole.

**Posture.** Cheatsheet shape, not a guide — scannable tables, minimal prose, print/pin/paste deployable. Seven before→after shifts, each anchored to a Claude specific (Projects/connected files, which surface, the verification skill) and each naming its *over-correction* (rubber-stamping, vague-ask, trust-blind/trust-never) per the repo's always-name-the-failure-mode tone. Keeps the one governance must-have a user-facing doc needs — the data-boundary line (no PHI in Cowork, confirm your surface is cleared) — pointed at [`governance-overlay.md`](../artifacts/governance-overlay.md) without asserting coverage. Claude-specific throughout (a generic-LLM mindset sheet would fail the repo's identity). Cross-linked bidirectionally to workforce-change (the strategy it's the handout for), claude-misconceptions (stale priors), anti-use-cases (where not to reach), surface-rollout (which surface), rollout-kickoff-kit (the enablement lane that deploys it).

### `user-mindset-mindmap.html` (added 2026-06)

**Why it earns its place.** The visual companion to [`user-mindset-cheatsheet.md`](../artifacts/user-mindset-cheatsheet.md) — the same seven shifts as a one-glance radial map. This follows the existing [`enterprise-data-boundaries.html`](../artifacts/enterprise-data-boundaries.html) → [`governance-overlay.md`](../artifacts/governance-overlay.md) precedent: a visual form of a text artifact earns its own slot when the visual does work the prose can't. The specific work surfaced from a pressure-test of the cheatsheet across reader archetypes — the lowest-abstraction / visual-first reader bounces off a two-table text sheet but absorbs a centre-and-branches map at a glance. The mindmap is that reader's form of the same content, and the "pin-on-a-wall / drop-in-a-deck" artifact an enablement lead reaches for.

**Why it's not in the original 8.** Same reason as the cheatsheet — end-user enablement was out of band. It rides in now because the user explicitly asked for a visual ("a cheatsheet or a mindmap"): the cheatsheet shipped first, this is the visual half of the same request. It is **not new content** — strictly a re-rendering of already-reviewed cheatsheet content into a diagram, so it introduces no new factual claims of its own.

**Posture.** Standalone HTML + inline SVG (no JS, prints clean, renders 200 on Pages) — chosen over Mermaid (fragile on GitHub per the repo's mermaid-syntax discipline) and over the hand-drawn-SVG house style (scoped to reference-architectures). Centre = the core shift ("you direct & check; Claude drafts; you own what ships") with the week-one one-task anchor; seven branches = the shifts; a reassurance banner ("changes what you do, not whether you're needed") and the data-boundary strip (no PHI in Cowork) carry the pressure-test's two must-land elements into the visual, so a viewer who only sees the map still gets the accountability and the boundary. Content parity with the cheatsheet held exactly; the boundary line points at governance-overlay without asserting coverage. Bidirectionally linked with the cheatsheet.

Bar for inclusion: existing artifact must already name the failure mode the pack would address; the structure must be portable across teams while the content remains team-specific. **Exception (workforce-change):** a *named-but-under-served audience* with a genuinely new domain also clears the bar, even when no existing artifact pre-names the failure mode — the test is decision-shaping novelty, not only scaffolding. **Exception (user-mindset-cheatsheet):** *scope-completion* clears the bar — an artifact the repo already explicitly promised (a named tier/lane/deliverable with nothing behind it) earns its place by supplying the missing piece, even when it serves a new audience *type* (the end user), because the deliverable — not the audience — is what was already in scope.
