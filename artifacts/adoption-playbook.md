# Claude Adoption Playbook — 90-day rollout

**As of 2026-05.** Pin to current model surface (Opus 4.7 / Sonnet 4.6 / Haiku 4.5) — refresh monthly.

A 90-day arc from "we want to use Claude" to "Claude is in production with guardrails and a Center of Excellence pattern." Built for transformation leads, not for engineers — engineers should pair this with [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md).

> 🛑 **Before Week 0:** run candidate use cases through [`anti-use-cases.md`](anti-use-cases.md). The "Premature" rows there are the same pre-flight gates this playbook names — but blocking, with cited frameworks. If a candidate hits any row, kill or re-route before scoring.

---

## Week 0 — Pre-flight (before anyone writes a prompt)

Skipping Week 0 is the single most common cause of stalled Claude pilots. Spend 5 working days here.

### Decisions to make

| Decision | Default for most orgs | When to deviate |
|---|---|---|
| **Executive sponsor** | Named C-level (CIO, CTO, or business unit P&L owner). Not "the AI committee." | Skip only if pilot is a single team, single use case, no cross-functional asks. |
| **Pilot use case** | One internal-facing workflow with measurable cycle time and a willing team. Use [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html) to score 2–6 candidates on 5 axes (value, speed, data, risk, sponsor) before committing. | Don't lead with customer-facing — too much governance overhead before you have evidence. |
| **Success metrics** | Cycle time, accuracy/quality, user satisfaction, and **cost-per-task**. Numeric, not adjectival. | If you can't measure cost-per-task, you'll lose the budget conversation in week 12. |
| **Procurement path** | Direct API via `console.anthropic.com` for speed. Bedrock or Vertex if hyperscaler commits dictate. | Bedrock/Vertex add a regional + procurement path but cost a model-version lag. |
| **BAA / DPA** | Sign before any data flows. | Healthcare, finance, EU operations: required before pilot. |
| **No-train confirmation** | Default for API + console workloads is no-train. Document the policy version + as-of date. | Re-verify quarterly; terms drift. |
| **Data residency** | Choose region per workload sensitivity. | EU PII, China, regulated public sector: region constraint may dictate procurement path. |

### Artifacts produced in Week 0

- 1-page **Pilot charter** — sponsor, scope, metrics, exit criteria, named team, 90-day budget envelope
- **Risk register** seeded with: vendor concentration, model deprecation, prompt drift, cost surprise, prompt injection, hallucination, IP leakage
- **Approval log** for legal/security sign-offs (BAA, DPA, no-train policy version, region)
- **Stakeholder list** with explicit RACI: who can say yes, who can say no, who's just informed

### Common Week 0 mistakes

1. **Picking the use case first, sponsor second.** Reverses the political work and stalls in week 4 when funding is needed.
2. **Defining success as "users like it."** Soft metrics don't survive contact with a CFO.
3. **Letting "the AI committee" replace a single accountable owner.** Committees diffuse decisions; pilots need someone whose neck is out.
4. **Skipping the BAA/DPA because "it's just a pilot."** Legal blocks the production migration if you didn't paper it up front.

---

## Weeks 1–4 — Pilot (one team, one use case, governance shadow)

Goal: prove the use case works with Claude in your environment, and surface your real constraints before they become production blockers.

### Build sequence

| Week | Workstream | Owner | Output |
|------|-----------|-------|--------|
| 1 | Use case decomposition: who uses this, when, what data, what output | Pilot lead | Workflow diagram + data flow map |
| 1 | Model + feature selection — start with [`feature-decision-matrix.html`](feature-decision-matrix.html) | Architect | Stack decision (model tier, caching, MCP, Skills, citations) |
| 2 | Eval set v0 — 30–80 representative inputs with expected outputs | Pilot lead + 1 SME | Versioned evalset in the team's repo |
| 2 | First prompt + Skill — minimum viable, not pretty | Engineer | First passing eval run |
| 3 | Cost + latency baseline using [`cost-calculator.html`](cost-calculator.html) inputs from real traffic | Architect | Cost-per-task estimate + monthly $ projection |
| 3 | Governance shadow — security/risk reviewer attached to standups, not blocking | Risk function | Issues log (not gate) |
| 4 | User trial with 5–10 pilot users, instrumented | Pilot lead | Usage logs + qualitative feedback + accuracy delta vs baseline |

### Pilot exit criteria (gate to weeks 5–8)

- Eval set passes ≥ baseline target (set per use case)
- Cost-per-task within projected envelope (±30%)
- No P0/P1 governance issues outstanding
- Pilot users prefer Claude-assisted workflow at ≥ 70% rate (or measurable cycle-time win)
- Sponsor signs off on continuation

If any criterion fails: do **not** proceed to weeks 5–8. Either iterate within weeks 1–4 (extend by ≤ 2 weeks) or kill the pilot and write the postmortem.

### Pilot anti-patterns

- **Building the pretty version first.** UX polish before workflow validation wastes 2 weeks.
- **No eval set.** Without an evalset you cannot detect regression when prompts or models change. You will regress.
- **Over-tuning the prompt.** Long, brittle prompts mask a missing Skill or tool. If your prompt is > 4k tokens of instruction, the design is wrong.
- **Skipping the cost baseline.** "We'll figure out cost in production" = the production migration gets cancelled in a budget review.

---

## Weeks 5–8 — Guardrails (turn the pilot into something safe to scale)

Goal: codify what worked, paper over what didn't, and make the pattern repeatable for the next team.

### Workstreams

#### 1. Eval suite hardening
- Grow evalset to 200–500 examples covering: golden path, common edge cases, adversarial inputs, regression seeds from pilot bugs
- Wire eval to CI — run on every prompt change, every model version bump
- Add cost regression: alert if cost-per-task moves > 15% between runs
- Decide: which evals block deploy vs. which are advisory

For the 8-category eval scaffolding (regression, format compliance, tool-call accuracy, grounding, adversarial, cost-per-task, latency, refusal calibration) — each framed by what it catches / failure-mode / owner — see [`eval-starter-pack.md`](eval-starter-pack.md). Pick 2–3 categories per use case in Phase 1; expand through Phase 2.

#### 2. Cost controls
- Caching strategy locked in (cache hits should be ≥ 60% in steady state for any production workload — see [`cost-calculator.html`](cost-calculator.html))
- Model tier routing (Haiku 4.5 triage → Sonnet 4.6 default → Opus 4.7 escalation only when justified)
- Batch eligibility audit — anything that can wait 24h moves to batch
- Per-team or per-product cost dashboards with weekly review cadence

#### 3. Prompt + Skill versioning
- Source-controlled prompts and Skills (treat as code)
- Versioning scheme — tag with eval pass rate at lock
- Rollback procedure — last-known-good documented and tested
- Change review: same rigor as a database migration

#### 4. Governance + audit
- Logging in place: request, full prompt, full response, model version, latency, cost, user, timestamp, redaction status
- Retention policy aligned with data classification — see [`governance-overlay.md`](governance-overlay.md)
- Red team pass — prompt injection, data exfiltration, jailbreak attempts; log results
- Compliance mapping — which controls satisfy which framework requirement (NIST AI RMF / EU AI Act risk class)

#### 5. Production safety nets
- Output validation layer (schema check, refusal handling, length cap, content filter)
- Human-in-the-loop checkpoints for high-stakes outputs
- Kill switch — single config flag to disable Claude calls and fall back to a static response

### Exit criteria (gate to weeks 9–13)

- Evalset ≥ 200 examples, all running in CI, ≥ baseline accuracy
- Cost-per-task in steady state ±15% of projection
- Logging captures everything required by your audit posture
- Red team report has no unresolved P0/P1 issues
- Documented runbook for "Claude is down" / "model regression detected" / "cost spike"

---

## Weeks 9–13 — Scale (second use case, internal docs, COE pattern)

Goal: prove the pattern repeats, and stand up the structure so the 3rd–10th use case doesn't need the transformation team's hand-holding.

### Activities

| Activity | Output |
|---|---|
| Onboard use case #2 with a different team | New evalset + cost projection + governance shadow following weeks 1–4 template |
| Stand up Center of Excellence (3–5 people, fed by pilot team alumni) | Charter, intake form, weekly office hours, templates |
| Internal documentation — how to start a Claude project | One-pager + a [`build-vs-buy-worksheet.html`](build-vs-buy-worksheet.html) walkthrough |
| Training — eng + product + risk | 2-hour intro, 1-day deep-dive, ongoing slack channel |
| Reusable Skills + plugins library | Versioned, discoverable, evalled |
| Shared MCP servers for org-wide systems | One CRM connector, one ticketing connector — not 14 |
| Quarterly governance review | Risk register update, no-train policy verification, model version refresh, cost trend |

### Exit criteria (90-day mark)

- 2+ use cases in production, each with passing evals + cost dashboards + on-call rotation
- COE pattern operating: intake → triage → support → graduate
- Documented "next-use-case kit" — anyone can read this and replicate without asking the pilot team
- Re-pricing decision made: continue direct API / Bedrock / Vertex / mixed
- Public commitment: which 3 use cases are next, with named owners

---

## Common failure modes (8 patterns)

### Heatmap — scored

Each failure mode scored on **probability** (Low / Med / High) and **cost-if-hit** (★ = ~$1K, ★★ = ~$10K, ★★★ = ~$100K, ★★★★ = ~$1M, ★★★★★ = $10M+ including regulatory exposure). Early-signal column is the observable indicator that fires *before* the failure mode lands — wire alerting on these, not on the failure itself. Detection-latency column is the gap between early signal and visible damage.

| # | Pattern | Prob | Cost | Early signal | Detection latency | Mitigation |
|---|---------|------|------|--------------|-------------------|-----------|
| 1 | **Pilot purgatory** | High | ★★ | Week 4 retro: nobody can name the 2nd use case | Weeks | Pre-commit 2nd use case in Week 0 charter — see [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html). Score 2–6 candidates so a backup exists. |
| 2 | **Eval debt** | High | ★★★ | Prompt or Skill change merged without eval run | Months | Block CI on missing eval pass — see [`eval-starter-pack.md`](eval-starter-pack.md) blocking-vs-advisory matrix. |
| 3 | **Cost surprise** | Med | ★★★★ | Daily $ trending up >20% week-over-week, or single workload >50% of total | Days | Wire 4 numeric gates ($/task, $/day, cache floor, batch floor) — see [`governance-overlay.md`](governance-overlay.md#12-cost-as-a-governance-constraint) §12. Hook-enforced, not invoice-discovered. |
| 4 | **Prompt sprawl** | High | ★★ | Two teams shipping similar Skills independently; no shared registry | Weeks | Canonical Skills library + COE registry by Week 10 — see [`claude-code-starter-skills.md`](claude-code-starter-skills.md). |
| 5 | **Governance afterthought** | High | ★★★★ | Risk function not on Week 1 stand-up; no DPA/BAA log | Months | Embed risk reviewer in Week 1 (advisory not blocking) — see [`governance-overlay.md`](governance-overlay.md). Issues surface early, cheaply. |
| 6 | **Vendor concentration panic** | Med | ★★ | CFO/board ask "what if Anthropic disappears?" in QBR | Weeks | [`governance-overlay.md`](governance-overlay.md) §9 multi-model abstraction at the right layer. Don't pre-build a 3-model fallback you'll never use. |
| 7 | **Model deprecation thrash** | Med | ★★★ | Anthropic announces deprecation date for a pinned model | Hours | COE owns model-bump runbook; pin family not point release; gate on regression eval pass — see [`eval-starter-pack.md`](eval-starter-pack.md). |
| 8 | **The "AI committee" tax** | High | ★★★ | Decision queue >7 days; no single sponsor name on use case | Weeks | Single named sponsor with veto — see [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html) sponsor-clarity axis. Committee informs, doesn't decide. |

**Scoring posture.** Probability and cost are calibrated against post-mortems from public AI rollout failures + the pattern frequencies named in this playbook's own readers. Re-calibrate quarterly; if your org sees a different distribution, override the scores in your fork. The shape (early signal → detection latency → mitigation) is portable; the specific scores are not.

### Detail — symptom + fix

Below: each mode in prose, with the original symptom + fix framing. Use the heatmap above to pick which to monitor first; use the prose below for runbook depth.

| # | Pattern | Symptom | Fix |
|---|---------|---------|-----|
| 1 | **Pilot purgatory** | Pilot succeeds, never scales. No second use case identified. | Pre-commit to the 2nd use case in Week 0 charter — even if you swap it later. |
| 2 | **Eval debt** | Prompts evolve faster than the evalset. Quality regresses unnoticed. | Block prompt changes in CI without eval pass. Owner: pilot lead. |
| 3 | **Cost surprise** | Month 4 bill is 5× the pilot's monthly run rate. | Cost dashboard live by Week 6, weekly review. Cap-with-alert per use case. |
| 4 | **Prompt sprawl** | Every team writes its own copy of the same instruction set. | Skills + plugins library by Week 10. COE owns the canonical versions. |
| 5 | **Governance afterthought** | Risk function shows up in Month 5 with blocking issues. | Embed risk reviewer in Week 1 (advisory, not blocking). Issues surface early, cheaply. |
| 6 | **Vendor concentration panic** | CFO/board asks "what if Anthropic disappears?" | Address in [`governance-overlay.md`](governance-overlay.md) §9. Multi-model abstraction at the right layer. Don't pre-build a 3-model fallback you'll never use. |
| 7 | **Model deprecation thrash** | Anthropic rev-bumps; quality moves; nobody owns re-eval. | COE owns the model bump runbook. Pin model family, not point release. |
| 8 | **The "AI committee" tax** | Decisions take weeks. Nothing ships. | Single named sponsor with veto. Committee informs, doesn't decide. |

---

## Reference team structure (3 functions)

You can run a small adoption with 4–6 people. Larger orgs will scale each function but the three roles don't merge.

### 1. Build team
- Embeds in the use-case team
- Owns: prompts, Skills, evals, cost-per-task, latency
- Skills: software engineering, prompt design, evaluation
- Reports to: product / engineering line

### 2. Platform team
- Owns: shared infrastructure — auth, logging, cost dashboards, model routing, MCP servers, plugins distribution
- Owns: model bump runbook, on-call rotation, kill switch
- Skills: platform/SRE, security
- Reports to: CTO / CIO

### 3. Governance + COE
- Owns: risk register, audit log review, eval policy, training, intake
- Owns: regulatory mapping (NIST / EU AI Act / industry-specific)
- Skills: risk, compliance, evaluation rigor
- Reports to: chief risk officer / general counsel / COO

---

## Companion artifacts

- [`executive-briefing.html`](executive-briefing.html) — the 10-slide deck for sponsor + board
- [`cost-calculator.html`](cost-calculator.html) — model your projected $/month
- [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html) — Week 0 use-case scoring (5 axes, ranked verdicts, blocker flags)
- [`feature-decision-matrix.html`](feature-decision-matrix.html) — pick the right Claude features for the pattern
- [`build-vs-buy-worksheet.html`](build-vs-buy-worksheet.html) — score a use case for Claude direct vs. alternatives
- [`reference-architectures.html`](reference-architectures.html) — 6 canonical patterns with diagrams
- [`governance-overlay.md`](governance-overlay.md) — risk + compliance overlay
- [`eval-starter-pack.md`](eval-starter-pack.md) — 8 evaluation templates (regression, format, tool-call, grounding, adversarial, cost, latency, refusal) — Weeks 5–8 scaffolding
- [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) — engineering-team rollout for Claude Code
- [`claude-code-starter-skills.md`](claude-code-starter-skills.md) — 8 team-grade Skill templates for Claude Code rollouts

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify model surface + pricing at anthropic.com.`
