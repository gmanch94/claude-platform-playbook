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
- Model versions pinned (4.6 / 4.7 / Sonnet 4.5 / Haiku 4.5 etc.) — never "latest"
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
- **Incident response runbook pack** — Claude-specific incident patterns (prompt regression, model deprecation, MCP server compromise, cost spike) — earns place if a real incident category emerges from playbook readers
- **COE charter template** — adoption playbook Weeks 9–13 names "COE pattern operating: intake → triage → support → graduate" without showing the charter. Earns place if asked.

Bar for inclusion: existing artifact must already name the failure mode the pack would address; the structure must be portable across teams while the content remains team-specific.
