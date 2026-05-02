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
    └── reference-architectures.html (5 canonical patterns w/ diagrams)
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

Add use case → score on 5 axes (regulated data, latency, customization depth, scale, internal expertise) → recommendation: Claude direct / Claude via Bedrock or Vertex / OpenAI / open-source self-hosted / packaged SaaS.

Output: ranked recommendations + rationale + estimated TCO band.

### 7. `reference-architectures.html` — 5 canonical patterns

Each w/ block diagram (SVG or Mermaid):
1. **RAG copilot** — Files API + caching + Sonnet
2. **Agentic workflow** — Agent SDK + tool use + Sonnet/Opus mix
3. **Batch enrichment** — Batch API + Haiku
4. **Domain expert assistant** — Skills + MCP + Sonnet
5. **Code automation** — Claude Code + computer use + Opus

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
| Stale within 6 months | Quarterly refresh discipline; "as-of" badge on every artifact |

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
