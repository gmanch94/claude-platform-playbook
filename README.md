# Claude Platform Playbook

Executive-grade decision tools for AI transformation **on the Claude platform**. Built for CIOs, CDOs, CTOs, and CHROs sizing Claude adoption — and architects defending the choice to leadership.

> **As of 2026-05.** Pricing, model versions, and feature surface change. Verify at [anthropic.com](https://www.anthropic.com) and [docs.claude.com](https://docs.claude.com) before final decisions.

---

## Why this exists

Most "use Claude" content is developer tutorials. This repo fills the **executive gap**:

- **Anti-use cases** — explicit list of where Claude should *not* be used (sole-decider on regulated decisions, sub-100ms latency, sub-cent unit-cost workloads, prompt-injection-exposed agents)
- Build vs buy vs platform — when Claude beats DIY / OpenAI / in-house
- Cost economics — prompt caching (90% off cached input), batch (50% off), Haiku 4.5 / Sonnet 4.6 / Opus 4.7 mix
- Time-to-value — Skills + MCP + Files API + Agent SDK + plugins + memory tool = weeks not quarters
- Governance fit — no-train, BAA paths, prompt versioning, audit trail, EU AI Act + NIST AI RMF mapping
- 90-day adoption arc — pilot → guardrails → scale
- Engineering rollout — Claude Code with hooks, settings, MCP, plugins

Not Anthropic marketing. Decision-frame first, features second.

**Single source of truth for feature status:** [`docs/feature-inventory.md`](docs/feature-inventory.md). Refresh weekly — the rest of the artifacts cite it.

---

## Where to start

**Don't know which row you are?** Open [`decision-spine.html`](artifacts/decision-spine.html) — single front-door flow that walks you through the seven decisions in order (anti-use → pattern → build-vs-buy → cost → ship safely → CLI rollout → measurement) and routes to the right artifact at each branch.

## How this repo is organized

Three abstraction layers. Same artifacts, three lenses — pick the lens that matches what you're doing.

| Layer | Reader's question | Artifacts |
|---|---|---|
| **Strategy** — *why and whether* | "Should we use Claude here? At what cost? Build or buy?" | [`executive-briefing.html`](artifacts/executive-briefing.html) · [`anti-use-cases.md`](artifacts/anti-use-cases.md) · [`build-vs-buy-worksheet.html`](artifacts/build-vs-buy-worksheet.html) · [`cost-calculator.html`](artifacts/cost-calculator.html) |
| **Architecture** — *how it fits together* | "Which pattern? Which features? What governance shape?" | [`reference-architectures.html`](artifacts/reference-architectures.html) · [`feature-decision-matrix.html`](artifacts/feature-decision-matrix.html) · [`governance-overlay.md`](artifacts/governance-overlay.md) |
| **Execution** — *how it ships* | "How do we run the pilot? Score candidates? Roll out the CLI? Measure quality?" | [`adoption-playbook.md`](artifacts/adoption-playbook.md) · [`pilot-selection-worksheet.html`](artifacts/pilot-selection-worksheet.html) · [`claude-code-adoption-guide.md`](artifacts/claude-code-adoption-guide.md) · [`claude-code-starter-skills.md`](artifacts/claude-code-starter-skills.md) · [`hooks-starter-pack.md`](artifacts/hooks-starter-pack.md) · [`mcp-starter-pack.md`](artifacts/mcp-starter-pack.md) · [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) |

**Cross-cutting:** [`decision-spine.html`](artifacts/decision-spine.html) (entry-point flow across all three layers) · [`docs/feature-inventory.md`](docs/feature-inventory.md) (single source of truth, cited by every artifact above).

Different roles enter at different layers. CIOs/CTOs read Strategy first. Architects start at Architecture. Transformation leads + engineering managers live in Execution. The spine is for anyone who doesn't already know which layer they're in.

## Audience

| You are... | Start with |
|---|---|
| Anyone, first time | [`decision-spine.html`](artifacts/decision-spine.html) |
| CEO / board sponsor for AI bets | [`executive-briefing.html`](artifacts/executive-briefing.html) |
| CIO / CTO sizing Claude TCO | [`cost-calculator.html`](artifacts/cost-calculator.html) → [`build-vs-buy-worksheet.html`](artifacts/build-vs-buy-worksheet.html) |
| Architect choosing patterns | [`reference-architectures.html`](artifacts/reference-architectures.html) → [`feature-decision-matrix.html`](artifacts/feature-decision-matrix.html) |
| Transformation lead running rollout | [`anti-use-cases.md`](artifacts/anti-use-cases.md) → [`pilot-selection-worksheet.html`](artifacts/pilot-selection-worksheet.html) → [`adoption-playbook.md`](artifacts/adoption-playbook.md) → [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) |
| Risk / compliance reviewer | [`anti-use-cases.md`](artifacts/anti-use-cases.md) → [`governance-overlay.md`](artifacts/governance-overlay.md) → [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) |
| Engineering manager rolling out Claude Code | [`claude-code-adoption-guide.md`](artifacts/claude-code-adoption-guide.md) → [`claude-code-starter-skills.md`](artifacts/claude-code-starter-skills.md) → [`hooks-starter-pack.md`](artifacts/hooks-starter-pack.md) → [`mcp-starter-pack.md`](artifacts/mcp-starter-pack.md) → [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) |
| Security / privacy engineer hardening Claude Code rollout | [`hooks-starter-pack.md`](artifacts/hooks-starter-pack.md) → [`mcp-starter-pack.md`](artifacts/mcp-starter-pack.md) → [`governance-overlay.md`](artifacts/governance-overlay.md) |
| Platform engineer wiring Claude into internal systems | [`mcp-starter-pack.md`](artifacts/mcp-starter-pack.md) → [`reference-architectures.html`](artifacts/reference-architectures.html) |
| ML / platform lead setting up CI for prompts + Skills | [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) |

---

## Artifacts

| Artifact | Type | What it does |
|---|---|---|
| [`decision-spine.html`](artifacts/decision-spine.html) | Reference (entry-point flow) | Single front-door flowchart routing to the right artifact for the question at hand. 7 branches (anti-use → pattern → build-vs-buy → cost → ship safely → CLI rollout → measurement). Hand-drawn SVG; print-friendly; no JS deps. |
| [`anti-use-cases.md`](artifacts/anti-use-cases.md) | Reference (reject filter) | Explicit list of where Claude should *not* be used — 5 categories (Hard nos, Wrong tool, Wrong economics, Governance no-go, Premature). Each entry: pattern → why not → do this instead → cite. Runs *before* pilot-selection-worksheet. |
| [`executive-briefing.html`](artifacts/executive-briefing.html) | 10-slide deck | Full-screen leadership deck: platform shift, Claude in 60s, when Claude wins, cost economics, time-to-value, governance, 90-day plan, risks. Arrow-key nav, print-to-PDF. |
| [`cost-calculator.html`](artifacts/cost-calculator.html) | Interactive | Inputs: monthly volume × token mix × model mix × cache hit rate × batch eligible %. Outputs: monthly $, per-request cost, savings vs naive baseline. |
| [`feature-decision-matrix.html`](artifacts/feature-decision-matrix.html) | Decision grid | Use-case patterns × Claude features (caching, thinking, tool use, computer use, Files, Skills, MCP, Agent SDK, batch, citations). Hover for rationale. |
| [`adoption-playbook.md`](artifacts/adoption-playbook.md) | Operational | 90-day rollout: week 0 pre-flight, weeks 1-4 pilot, 5-8 guardrails, 9-13 scale. 8 failure modes. Reference team structure. |
| [`pilot-selection-worksheet.html`](artifacts/pilot-selection-worksheet.html) | Decision tool | Score 2–6 candidate pilot use cases on 5 axes (value, time-to-signal, data readiness, risk, sponsor clarity) → ranked verdicts (Strong / Viable / Risky / Not yet) with blocker flags. Operationalizes Week 0 of the playbook. |
| [`governance-overlay.md`](artifacts/governance-overlay.md) | Reference | Data flow taxonomy, no-train terms, BAA paths, EU AI Act + NIST AI RMF mapping, audit trail, prompt versioning, vendor concentration mitigation. |
| [`build-vs-buy-worksheet.html`](artifacts/build-vs-buy-worksheet.html) | Decision tool | Add use case → score 6 axes (regulated data · latency · customization · scale · expertise · strategic moat) → recommendation: Claude direct / via Bedrock or Vertex / OpenAI / open-source / packaged SaaS. TCO band + rationale. |
| [`reference-architectures.html`](artifacts/reference-architectures.html) | Reference | 6 canonical patterns with hand-drawn SVG diagrams: RAG copilot, agentic workflow, batch enrichment, domain expert assistant, code automation, embedded copilot. |
| [`claude-code-adoption-guide.md`](artifacts/claude-code-adoption-guide.md) | Operational | Engineering-team rollout for Claude Code (CLI). Pilot selection, hooks, skills, settings, MCP, security model, measurement. |
| [`claude-code-starter-skills.md`](artifacts/claude-code-starter-skills.md) | Templates | 8 team-grade Skill templates (PR review, test gen, migration guard, bug triage, doc refresh, release notes, on-call, refactor scout). Each framed by when-to-use / failure-mode / owner before the prompt body. |
| [`hooks-starter-pack.md`](artifacts/hooks-starter-pack.md) | Templates | 10 Claude Code hook templates (block-secrets, run-linter, log-cost, PII scrub, branch guard, dependency-license check, audit log, commit-msg, session-context, eval-trigger). Each framed by when-to-use / failure-mode / owner. Phased Phase 1→4 rollout matrix + blocking-vs-advisory defaults. |
| [`mcp-starter-pack.md`](artifacts/mcp-starter-pack.md) | Templates | 7 read-only MCP server templates (issue tracker, internal docs, CI logs, DB read replica, observability, API catalog, code search). Each framed by when-to-use / failure-mode / owner / scope. Read-only by design; mutate variants explicitly deferred to Phase 4. |
| [`eval-starter-pack.md`](artifacts/eval-starter-pack.md) | Templates | 8 evaluation templates (regression, format compliance, tool-call accuracy, grounding, adversarial, cost-per-task, latency, refusal calibration). Each framed by what it catches / failure-mode of the eval itself / owner. Plus a blocking-vs-advisory matrix. |

---

## How to view

Live at **https://gmanch94.github.io/claude-platform-playbook/** — direct in-browser preview, JS executes, print-to-PDF works.

Or fork the repo, customize for your org, host wherever you want.

---

## Sourcing discipline

- Pricing claims dated and link to [anthropic.com/pricing](https://www.anthropic.com/pricing)
- Model versions pinned (Sonnet 4.x, Haiku 4.x, Opus 4.x) — never "latest"
- All technical claims cite [docs.claude.com](https://docs.claude.com) by URL + as-of date
- No reproducing Anthropic marketing copy verbatim — paraphrase + cite
- Footer pattern on every artifact: `© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify at anthropic.com.`
- Quarterly refresh discipline — pricing/model surface drifts fast

---

## Companion repos

- [`ai-architect-showcase`](https://github.com/gmanch94/ai-architect-showcase) — vendor-neutral AI strategy artifacts (NIST AI RMF, EU AI Act, EEOC anchored). Read this first if you're earlier in the AI journey.
- [`ai-enablement-ws`](https://github.com/gmanch94/ai-enablement-ws) — architect-grade operational reference (cookbooks, governance frameworks, audit templates, ADRs, ~25 Claude Code skills).

---

## License

[CC-BY-4.0](LICENSE) — free to share, adapt, and reuse with attribution.

`© gmanch94 · CC-BY-4.0 · As of 2026-05.`
