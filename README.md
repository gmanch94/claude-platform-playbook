# Claude Platform Playbook

Executive-grade decision tools for AI transformation **on the Claude platform**. Built for CIOs, CDOs, CTOs, and CHROs sizing Claude adoption — and architects defending the choice to leadership.

> **As of 2026-07.** Pricing, model versions, and feature surface change. Verify at [anthropic.com](https://www.anthropic.com) and [platform.claude.com](https://platform.claude.com/docs/en) before final decisions.

---

## Why this exists

Most "use Claude" content is developer tutorials. This repo fills the **executive gap**:

- **Anti-use cases** — explicit list of where Claude should *not* be used (sole-decider on regulated decisions, sub-100ms latency, sub-cent unit-cost workloads, prompt-injection-exposed agents)
- Build vs buy vs platform — when Claude beats DIY / OpenAI / in-house
- Cost economics — prompt caching (90% off cached input), batch (50% off), Haiku 4.5 / Sonnet 5 / Opus 4.8 mix
- Time-to-value — Skills + MCP + Files API + Agent SDK + plugins + memory tool = weeks not quarters
- Governance fit — no-train, BAA paths, prompt versioning, audit trail, EU AI Act + NIST AI RMF mapping
- 90-day adoption arc — pilot → guardrails → scale
- Rollout orchestration — who acts, in what order, across roles, in the first 30 days (the cross-functional kickoff, not just the phase plan)
- Engineering rollout — Claude Code with hooks, settings, MCP, plugins
- Surface rollout — which Claude surface (chat, Projects, Claude Code, Cowork, Design, Tag, Science) for whom, in what order, sequenced by blast radius
- Value case — net ROI against spend (conservative, CFO-defensible) + procurement security-questionnaire answers with a source on every line
- Workforce change — role impact, honest comms, tiered reskilling, measuring productivity without surveilling people
- Run-state operations — measure realized value at month 6 (renew / expand / kill), govern the token budget, instrument production, migrate off retiring models, and know what exit would cost
- User onboarding — the one-page mindset cheatsheet you hand each person in week one (direct-and-check, not do-it-yourself; verify what the model gets wrong; know the data boundary)
- Agentic security + ownership — attack-surface threat model mapped to controls, a maturity self-locator, and who-owns-Claude (CoE / RACI)

Not Anthropic marketing. Decision-frame first, features second.

**Single source of truth for feature status:** [`docs/feature-inventory.md`](docs/feature-inventory.md). Refresh monthly — the rest of the artifacts cite it.

---

## Where to start

**Don't know which row you are?** Open [`decision-spine.html`](artifacts/decision-spine.html) — single front-door flow that walks you through the seven decisions in order (anti-use → pattern → build-vs-buy → cost → ship safely → CLI rollout → measurement) and routes to the right artifact at each branch.

## How this repo is organized

Three abstraction layers. Same artifacts, three lenses — pick the lens that matches what you're doing.

| Layer | Reader's question | Artifacts |
|---|---|---|
| **Strategy** — *why and whether* | "Should we use Claude here? At what cost? What's the return? Build or buy? Which plan? What do we sign? What would leaving cost?" | [`executive-briefing.html`](artifacts/executive-briefing.html) · [`anti-use-cases.md`](artifacts/anti-use-cases.md) · [`build-vs-buy-worksheet.html`](artifacts/build-vs-buy-worksheet.html) · [`cost-calculator.html`](artifacts/cost-calculator.html) · [`roi-worksheet.html`](artifacts/roi-worksheet.html) · [`subscription-selection-guide.md`](artifacts/subscription-selection-guide.md) · [`procurement-pack.md`](artifacts/procurement-pack.md) · [`exit-portability-memo.md`](artifacts/exit-portability-memo.md) |
| **Architecture** — *how it fits together* | "Which pattern? Which model tier? Which features? What governance shape? Where does data cross? How is it attacked?" | [`reference-architectures.html`](artifacts/reference-architectures.html) · [`feature-decision-matrix.html`](artifacts/feature-decision-matrix.html) · [`model-selection-guide.md`](artifacts/model-selection-guide.md) · [`multi-agent-patterns.md`](artifacts/multi-agent-patterns.md) · [`governance-overlay.md`](artifacts/governance-overlay.md) · [`enterprise-data-boundaries.html`](artifacts/enterprise-data-boundaries.html) · [`agentic-threat-model.md`](artifacts/agentic-threat-model.md) |
| **Execution** — *how it ships* | "Which surface? How do we run the pilot? Who acts first, in what order? Score candidates? Roll out the CLI or Cowork? Measure quality? Handle an incident? Bring people along? How does each person's own work change? Who owns it? Is it still working at month 6? Is the bill inside forecast? Who watches it in prod? What happens when a model retires?" | [`adoption-playbook.md`](artifacts/adoption-playbook.md) · [`rollout-kickoff-kit.md`](artifacts/rollout-kickoff-kit.md) · [`surface-rollout-matrix.md`](artifacts/surface-rollout-matrix.md) · [`pilot-selection-worksheet.html`](artifacts/pilot-selection-worksheet.html) · [`claude-code-adoption-guide.md`](artifacts/claude-code-adoption-guide.md) · [`cowork-adoption-guide.md`](artifacts/cowork-adoption-guide.md) · [`workforce-change-guide.md`](artifacts/workforce-change-guide.md) · [`user-mindset-cheatsheet.md`](artifacts/user-mindset-cheatsheet.md) · [`operating-model-guide.md`](artifacts/operating-model-guide.md) · [`incident-response-runbook.md`](artifacts/incident-response-runbook.md) · [`value-realization-guide.md`](artifacts/value-realization-guide.md) · [`token-budget-governance.md`](artifacts/token-budget-governance.md) · [`agent-observability-guide.md`](artifacts/agent-observability-guide.md) · [`model-deprecation-runbook.md`](artifacts/model-deprecation-runbook.md) · [`claude-code-starter-skills.md`](artifacts/claude-code-starter-skills.md) · [`hooks-starter-pack.md`](artifacts/hooks-starter-pack.md) · [`mcp-starter-pack.md`](artifacts/mcp-starter-pack.md) · [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) |

**Cross-cutting:** [`decision-spine.html`](artifacts/decision-spine.html) (entry-point flow across all three layers) · [`maturity-model.md`](artifacts/maturity-model.md) (locate yourself by capability rung, L0→L4, and see the next move) · [`decision-memes.html`](artifacts/decision-memes.html) (8 ice-breaker memes, each pointing at a real artifact) · [`claude-misconceptions.md`](artifacts/claude-misconceptions.md) (skeptic disarmer in text form — myths that drive mis-budget / mis-architect calls) · [`data-advisory.md`](artifacts/data-advisory.md) (pre-pilot data sizing — how much data, from where, governance flags per source) · [`docs/feature-inventory.md`](docs/feature-inventory.md) (single source of truth, cited by every artifact above).

Different roles enter at different layers. CIOs/CTOs read Strategy first. Architects start at Architecture. Transformation leads + engineering managers live in Execution. The spine is for anyone who doesn't already know which layer they're in.

## Audience

| You are... | Start with |
|---|---|
| Anyone, first time | [`decision-spine.html`](artifacts/decision-spine.html) |
| Anyone, skeptical / wants the 30-second tour | [`decision-memes.html`](artifacts/decision-memes.html) |
| Anyone arriving with priors ("Claude refuses everything," "context is 200K," "Pro covers the API") | [`claude-misconceptions.md`](artifacts/claude-misconceptions.md) |
| Not sure how mature you are / what to do next | [`maturity-model.md`](artifacts/maturity-model.md) |
| CEO / board sponsor for AI bets | [`executive-briefing.html`](artifacts/executive-briefing.html) → [`rollout-kickoff-kit.md`](artifacts/rollout-kickoff-kit.md) (your first moves) |
| CIO / CTO sizing Claude TCO | [`cost-calculator.html`](artifacts/cost-calculator.html) → [`build-vs-buy-worksheet.html`](artifacts/build-vs-buy-worksheet.html) |
| CFO / finance lead sizing the value case | [`roi-worksheet.html`](artifacts/roi-worksheet.html) → [`cost-calculator.html`](artifacts/cost-calculator.html) |
| IT / procurement lead choosing seat plans | [`subscription-selection-guide.md`](artifacts/subscription-selection-guide.md) → [`cost-calculator.html`](artifacts/cost-calculator.html) |
| Procurement / vendor-risk reviewer (security questionnaire, DPA/BAA) | [`procurement-pack.md`](artifacts/procurement-pack.md) → [`governance-overlay.md`](artifacts/governance-overlay.md) |
| Architect choosing patterns | [`reference-architectures.html`](artifacts/reference-architectures.html) → [`feature-decision-matrix.html`](artifacts/feature-decision-matrix.html) → [`data-advisory.md`](artifacts/data-advisory.md) |
| Transformation lead running rollout | [`anti-use-cases.md`](artifacts/anti-use-cases.md) → [`pilot-selection-worksheet.html`](artifacts/pilot-selection-worksheet.html) → [`data-advisory.md`](artifacts/data-advisory.md) → [`adoption-playbook.md`](artifacts/adoption-playbook.md) → [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) |
| Transformation lead choosing which surface to enable first | [`surface-rollout-matrix.md`](artifacts/surface-rollout-matrix.md) → [`adoption-playbook.md`](artifacts/adoption-playbook.md) |
| Risk / compliance reviewer | [`anti-use-cases.md`](artifacts/anti-use-cases.md) → [`governance-overlay.md`](artifacts/governance-overlay.md) → [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) |
| CISO / security architect mapping data boundaries | [`enterprise-data-boundaries.html`](artifacts/enterprise-data-boundaries.html) → [`governance-overlay.md`](artifacts/governance-overlay.md) |
| Security architect threat-modeling an agentic deployment | [`agentic-threat-model.md`](artifacts/agentic-threat-model.md) → [`hooks-starter-pack.md`](artifacts/hooks-starter-pack.md) |
| Engineering manager rolling out Claude Code | [`claude-code-adoption-guide.md`](artifacts/claude-code-adoption-guide.md) → [`claude-code-starter-skills.md`](artifacts/claude-code-starter-skills.md) → [`hooks-starter-pack.md`](artifacts/hooks-starter-pack.md) → [`mcp-starter-pack.md`](artifacts/mcp-starter-pack.md) → [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) |
| Ops / enablement lead rolling out Cowork to non-engineers | [`cowork-adoption-guide.md`](artifacts/cowork-adoption-guide.md) → [`surface-rollout-matrix.md`](artifacts/surface-rollout-matrix.md) → [`governance-overlay.md`](artifacts/governance-overlay.md) |
| Research / life-sciences lead evaluating Claude Science | [`surface-rollout-matrix.md`](artifacts/surface-rollout-matrix.md) → [`enterprise-data-boundaries.html`](artifacts/enterprise-data-boundaries.html) → [`governance-overlay.md`](artifacts/governance-overlay.md) |
| CHRO / people lead rolling Claude out to staff | [`workforce-change-guide.md`](artifacts/workforce-change-guide.md) → [`adoption-playbook.md`](artifacts/adoption-playbook.md) |
| An individual being onboarded — how your *own* work changes | [`user-mindset-cheatsheet-color.html`](artifacts/user-mindset-cheatsheet-color.html) (colour · print) · [plain text](artifacts/user-mindset-cheatsheet.md) · [mindmap](artifacts/user-mindset-mindmap.html) → [`claude-misconceptions.md`](artifacts/claude-misconceptions.md) |
| Deciding who owns Claude (CoE / RACI / operating model) | [`operating-model-guide.md`](artifacts/operating-model-guide.md) → [`adoption-playbook.md`](artifacts/adoption-playbook.md) |
| Coordinating a cross-functional rollout — who acts, in what order | [`rollout-kickoff-kit.md`](artifacts/rollout-kickoff-kit.md) → [`adoption-playbook.md`](artifacts/adoption-playbook.md) |
| Sponsor at month 6 deciding renew / expand / kill | [`value-realization-guide.md`](artifacts/value-realization-guide.md) → [`roi-worksheet.html`](artifacts/roi-worksheet.html) |
| FinOps / budget owner governing AI spend | [`token-budget-governance.md`](artifacts/token-budget-governance.md) → [`cost-calculator.html`](artifacts/cost-calculator.html) |
| Platform / SRE owner instrumenting production workloads | [`agent-observability-guide.md`](artifacts/agent-observability-guide.md) → [`incident-response-runbook.md`](artifacts/incident-response-runbook.md) |
| Platform owner holding a model deprecation notice | [`model-deprecation-runbook.md`](artifacts/model-deprecation-runbook.md) → [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) |
| Procurement / architect costing an exit before signing | [`exit-portability-memo.md`](artifacts/exit-portability-memo.md) → [`procurement-pack.md`](artifacts/procurement-pack.md) |
| Security / privacy engineer hardening Claude Code rollout | [`hooks-starter-pack.md`](artifacts/hooks-starter-pack.md) → [`mcp-starter-pack.md`](artifacts/mcp-starter-pack.md) → [`governance-overlay.md`](artifacts/governance-overlay.md) |
| Platform engineer wiring Claude into internal systems | [`mcp-starter-pack.md`](artifacts/mcp-starter-pack.md) → [`reference-architectures.html`](artifacts/reference-architectures.html) |
| ML / platform lead setting up CI for prompts + Skills | [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) |

---

## Artifacts

| Artifact | Type | What it does |
|---|---|---|
| [`decision-spine.html`](artifacts/decision-spine.html) | Reference (entry-point flow) | Single front-door flowchart routing to the right artifact for the question at hand. 7 branches (anti-use → pattern → build-vs-buy → cost → ship safely → CLI rollout → measurement). Hand-drawn SVG; print-friendly; no JS deps. |
| [`decision-memes.html`](artifacts/decision-memes.html) | Ice-breaker (8 memes) | Eight CSS-drawn memes, each pointing at a real decision artifact. Slide-1 opener, skeptic disarmer, onboarding ice-breaker, workshop facilitation prompt. The artifacts the memes point to are not jokes. |
| [`claude-misconceptions.md`](artifacts/claude-misconceptions.md) | Reference (skeptic disarmer) | 18 myths about Claude that drive *measurable* mis-budget / mis-architect / mis-staff calls — context window, hooks, sandbox, caching, batch, refusal, rate limits, Computer Use. Format: myth → reality → what you'd mis-decide → cite. All cites primary (`docs.claude.com` / `anthropic.com`). Text-form companion to `decision-memes.html`. |
| [`anti-use-cases.md`](artifacts/anti-use-cases.md) | Reference (reject filter) | Explicit list of where Claude should *not* be used — 5 categories (Hard nos, Wrong tool, Wrong economics, Governance no-go, Premature). Each entry: pattern → why not → do this instead → cite. Runs *before* pilot-selection-worksheet. |
| [`data-advisory.md`](artifacts/data-advisory.md) | Reference (pre-pilot sizing) | How much data, and from where. Context window vs. RAG threshold, eval corpus minimums, distillation trigger volume, cache eligibility shape, and a source-of-data taxonomy with governance flags per source. Pre-pilot checklist. |
| [`executive-briefing.html`](artifacts/executive-briefing.html) | 10-slide deck | Full-screen leadership deck: platform shift, Claude in 60s, when Claude wins, cost economics, time-to-value, governance, 90-day plan, risks. Arrow-key nav, print-to-PDF. |
| [`cost-calculator.html`](artifacts/cost-calculator.html) | Interactive | Inputs: monthly volume × token mix × model mix × cache hit rate × batch eligible %. Outputs: monthly $, per-request cost, savings vs naive baseline. |
| [`roi-worksheet.html`](artifacts/roi-worksheet.html) | Interactive | The value side of cost-calculator. People × hours × assist-share × realized-capture × loaded rate, netted against annual Claude spend → net value, payback, value-to-cost ratio, capture sensitivity. Conservative by design; "five ways this number lies" built in. |
| [`feature-decision-matrix.html`](artifacts/feature-decision-matrix.html) | Decision grid | Use-case patterns × Claude features (caching, thinking, tool use, computer use, Files, Skills, MCP, Agent SDK, batch, citations). Hover for rationale. |
| [`adoption-playbook.md`](artifacts/adoption-playbook.md) | Operational | 90-day rollout: week 0 pre-flight, weeks 1-4 pilot, 5-8 guardrails, 9-13 scale. 8 failure modes. Reference team structure. |
| [`operating-model-guide.md`](artifacts/operating-model-guide.md) | Reference (org design) | Who owns Claude: the shape choice (centralized / federated / hub-and-spoke CoE / community-of-practice) + a decision×role RACI + the platform-vs-product paved-road boundary. Cross-refs the playbook's 3-function structure rather than repeating it. |
| [`rollout-kickoff-kit.md`](artifacts/rollout-kickoff-kit.md) | Operational (orchestration) | Who acts, in what order, the first 30 days. Persona × time swimlane (Week 0 → Week 4) + one-row-per-role quick-start (first artifact · Week-1 deliverable · gate · failure mode) + the between-lane handoff seams where rollouts stall (security serial-blocking, comms lagging the pilot, BAA on the critical path). The persona-lensed first 30 days of the playbook; hands off at Week 5. |
| [`maturity-model.md`](artifacts/maturity-model.md) | Reference (self-locator) | Locate your org by capability rung (L0 ad-hoc → L4 agentic-at-scale) via a weakest-link self-assessment, then the one highest-leverage next move per rung. Routes by capability; the spine routes by question. |
| [`surface-rollout-matrix.md`](artifacts/surface-rollout-matrix.md) | Reference (rollout router) | Which Claude surface to roll out, to whom, in what order — sequenced by blast radius. Chat / Projects / Claude Code / Cowork / Design / Tag / Science, each with plan gate, week-0 gate, governance flag, and a per-surface failure mode. Complements the 90-day playbook (which is surface-agnostic). |
| [`pilot-selection-worksheet.html`](artifacts/pilot-selection-worksheet.html) | Decision tool | Score 2–6 candidate pilot use cases on 5 axes (value, time-to-signal, data readiness, risk, sponsor clarity) → ranked verdicts (Strong / Viable / Risky / Not yet) with blocker flags. Operationalizes Week 0 of the playbook. |
| [`governance-overlay.md`](artifacts/governance-overlay.md) | Reference | Data flow taxonomy, no-train terms, ZDR scope + eligibility, HIPAA / BAA per-feature coverage, data residency (`inference_geo` + Workspace geo), retention defaults (30-day / 2-year AUP / 7-year T&S / 5-year feedback), certifications (ISO 27001, ISO 42001, SOC 2), EU AI Act + NIST AI RMF mapping, audit trail, prompt versioning, vendor concentration, cost-as-governance. |
| [`enterprise-data-boundaries.html`](artifacts/enterprise-data-boundaries.html) | Reference (per-feature diagrams) | 20 hand-drawn trust-zone diagrams for an Enterprise deployment — per feature, what crosses the prompt boundary, where it's processed/stored, and the per-surface BAA verdict. Surface-tagged (product / API / procurement / seat-plan); ZDR + `inference_geo` never drawn on the product UI. Coverage table catches Bash / Batch / Computer-use / Web-fetch / Advisor. Visual companion to `governance-overlay.md`. |
| [`agentic-threat-model.md`](artifacts/agentic-threat-model.md) | Reference (security) | Preventive attack surface for agentic deployments — 10 threats (indirect prompt injection, excessive agency, exfiltration, MCP supply chain, confused-deputy…) on the OWASP-LLM shape, each mapped to a control already in the repo. Four-layer defense + 5-question pre-ship gate. Preventive counterpart to the incident runbook. |
| [`build-vs-buy-worksheet.html`](artifacts/build-vs-buy-worksheet.html) | Decision tool | Add use case → score 6 axes (regulated data · latency · customization · scale · expertise · strategic moat) → recommendation: Claude direct / via Bedrock or Vertex / OpenAI / open-source / packaged SaaS. TCO band + rationale. |
| [`procurement-pack.md`](artifacts/procurement-pack.md) | Reference (vendor-risk) | Security-questionnaire answers, DPA/BAA pre-signature checklist, SLA terms to negotiate, EU AI Act vendor asks, direct-vs-hyperscaler procurement-path choice. Surface-split; every answer cites a `governance-overlay.md §` or says "verify at signing." Reformats governance facts as pasteable Q&A. |
| [`reference-architectures.html`](artifacts/reference-architectures.html) | Reference | 6 canonical patterns with hand-drawn SVG diagrams: RAG copilot, agentic workflow, batch enrichment, domain expert assistant, code automation, embedded copilot. |
| [`claude-code-adoption-guide.md`](artifacts/claude-code-adoption-guide.md) | Operational | Engineering-team rollout for Claude Code (CLI). Pilot selection, hooks, skills, settings, MCP, security model, measurement. |
| [`cowork-adoption-guide.md`](artifacts/cowork-adoption-guide.md) | Operational | Per-surface rollout for Cowork (desktop agent, non-engineers). Three gates (compliance → plan+device → governance owner), 4-phase arc, governance/security model (folder scope, egress, review-before-act, isolated VM, enterprise admin), success metrics, 7 failure modes. Cowork is BAA-excluded — no PHI. |
| [`workforce-change-guide.md`](artifacts/workforce-change-guide.md) | Operational (people) | The CHRO/people side: role-impact map, augmentation-vs-replacement narrative + comms, tiered reskilling, and the bright line between measuring productivity and surveilling staff. Plus the works-council consultation gate. |
| [`user-mindset-cheatsheet.md`](artifacts/user-mindset-cheatsheet.md) | Operational (end-user handout) | One-page mindset cheatsheet for the person *using* Claude. Seven before→after shifts (direct-and-check, describe the outcome, iterate, bring context, decompose, verify, reach-first), each with its over-correction; daily task patterns by surface; an always-verify list; the data boundary; a first-week habit. The practitioner-tier handout `workforce-change-guide.md` names but didn't supply. |
| [`user-mindset-mindmap.html`](artifacts/user-mindset-mindmap.html) | Reference (visual companion) | The one-glance version of the cheatsheet — the seven shifts as a radial mindmap (centre: *you direct & check; Claude drafts; you own what ships*; each branch an old→new reflex + its watch-out), with a reassurance banner and the data-boundary strip. Print / pin / drop in a deck. Inline SVG, no JS. |
| [`user-mindset-cheatsheet-color.html`](artifacts/user-mindset-cheatsheet-color.html) | Reference (colour / print) | The colour-coded form of the cheatsheet — same content as the `.md`, in HTML so it can carry colour (markdown can't on GitHub): green = the shift to make, amber = the trap, red = the data boundary. Prints with colour intact; reuses the mindmap palette. |
| [`claude-code-starter-skills.md`](artifacts/claude-code-starter-skills.md) | Templates | 8 team-grade Skill templates (PR review, test gen, migration guard, bug triage, doc refresh, release notes, on-call, refactor scout). Each framed by when-to-use / failure-mode / owner before the prompt body. |
| [`hooks-starter-pack.md`](artifacts/hooks-starter-pack.md) | Templates | 10 Claude Code hook templates (block-secrets, run-linter, log-cost, PII scrub, branch guard, dependency-license check, audit log, commit-msg, session-context, eval-trigger). Each framed by when-to-use / failure-mode / owner. Phased Phase 1→4 rollout matrix + blocking-vs-advisory defaults. |
| [`mcp-starter-pack.md`](artifacts/mcp-starter-pack.md) | Templates | 7 read-only MCP server templates (issue tracker, internal docs, CI logs, DB read replica, observability, API catalog, code search). Each framed by when-to-use / failure-mode / owner / scope. Read-only by design; mutate variants explicitly deferred to Phase 4. |
| [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) | Templates | 8 evaluation templates (regression, format compliance, tool-call accuracy, grounding, adversarial, cost-per-task, latency, refusal calibration). Each framed by what it catches / failure-mode of the eval itself / owner. Plus a blocking-vs-advisory matrix. |
| [`model-selection-guide.md`](artifacts/model-selection-guide.md) | Reference (decision guide) | 4-question framework for Opus / Sonnet / Haiku selection. Task-type → tier table, cascade pattern, cost impact of over/under-tiering, and signals for when to move tiers. |
| [`subscription-selection-guide.md`](artifacts/subscription-selection-guide.md) | Reference (decision guide) | Which Claude subscription to buy. Three-gate framework (compliance → team size → build) across Free / Pro / Max / Team / Enterprise, plan-comparison table (price · seats · Claude Code · SSO/SCIM · no-train · BAA · API quota), persona→plan with failure modes, and the seat-vs-API "you need both" pattern. |
| [`multi-agent-patterns.md`](artifacts/multi-agent-patterns.md) | Reference (patterns) | 5 named multi-agent patterns (orchestrator-worker, parallel fan-out, sequential pipeline, validator-retry, human-in-loop gate). Error-compounding math, sub-agent configuration, and decision table for choosing a pattern. |
| [`incident-response-runbook.md`](artifacts/incident-response-runbook.md) | Operational (runbook) | 5 Claude-specific incident classes (prompt regression, model deprecation, cost spike, agent loop runaway, MCP server compromise). Each: symptoms → immediate actions → root cause → remediation → post-mortem template. |
| [`value-realization-guide.md`](artifacts/value-realization-guide.md) | Operational (measurement) | What receives the playbook's Day-90 handoff: measure actuals vs the ROI projection (realized capture measured, not assumed), five metric families each with its Goodhart counter-metric, per-surface leading indicators, and the quarterly renew / expand / kill decision table. Team-level measurement only — the workforce-change surveillance boundary holds. |
| [`token-budget-governance.md`](artifacts/token-budget-governance.md) | Operational (FinOps) | Keeps the actual bill inside the calculator's forecast: a 4-level budget ladder (org → workspace → workload → seat surface) mapped to real platform controls, caps-on-experiments / alerts-on-prod placement rule, metering → showback → chargeback graduation, priced levers (cache, batch, tier mix), and a monthly variance triage (volume vs mix vs token drift vs price). |
| [`agent-observability-guide.md`](artifacts/agent-observability-guide.md) | Operational (day-2 telemetry) | The layer between the eval pack (pre-ship) and the incident runbook (post-burn): minimum telemetry schema, six golden signals ($/task, tokens/task, tool-error rate, refusal/truncation, loop depth, sampled quality score), and an alert table routed to incident classes. PII-in-logs named as the top failure mode; judge-sampling costed honestly. |
| [`model-deprecation-runbook.md`](artifacts/model-deprecation-runbook.md) | Operational (runbook) | The planned migration path that keeps incident class #2 from firing: standing prep (exact pins, manifest, regression evals, cost baseline), watch triggers, 6-step protocol (pin audit → param-parity → eval certification → cost re-forecast incl. tokenizer drift → staged cutover → decommission), timeline template, hyperscaler-lag caveat. |
| [`exit-portability-memo.md`](artifacts/exit-portability-memo.md) | Reference (strategy) | What leaving Claude would actually cost, component by component: portability ledger (data, evals, MCP, prompts, skills, orchestration, caching, seats), the hedges honestly graded (Bedrock/Vertex = procurement not model diversification; gateway = a feature tax), five week-1 actions that keep exit cheap, and exit-planning theater named as the memo's own failure mode. |

---

## How to view

Live at **https://gmanch94.github.io/claude-platform-playbook/** — direct in-browser preview, JS executes, print-to-PDF works.

Or fork the repo, customize for your org, host wherever you want.

---

## Sourcing discipline

- Pricing claims dated and link to [anthropic.com/pricing](https://www.anthropic.com/pricing)
- Model versions pinned (Sonnet 5, Haiku 4.x, Opus 4.x) — never "latest"
- All technical claims cite [platform.claude.com](https://platform.claude.com/docs/en) by URL + as-of date (docs.claude.com redirects to platform.claude.com)
- No reproducing Anthropic marketing copy verbatim — paraphrase + cite
- Footer pattern on every artifact: `© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.`
- Monthly refresh discipline (scheduled remote agent, first Monday) — pricing/model surface drifts fast

---

## Companion repos

- [`ai-architect-showcase`](https://github.com/gmanch94/ai-architect-showcase) — vendor-neutral AI strategy artifacts (NIST AI RMF, EU AI Act, EEOC anchored). Read this first if you're earlier in the AI journey.
- [`ai-enablement-ws`](https://github.com/gmanch94/ai-enablement-ws) — architect-grade operational reference (cookbooks, governance frameworks, audit templates, ADRs, ~25 Claude Code skills).

---

## License

[CC-BY-4.0](LICENSE) — free to share, adapt, and reuse with attribution.

`© gmanch94 · CC-BY-4.0 · As of 2026-07.`
