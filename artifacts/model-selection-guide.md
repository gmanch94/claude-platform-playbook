# Claude Model Selection Guide

**As of 2026-07.** Pinned to Opus 4.8 / Sonnet 5 / Haiku 4.5. Refresh monthly with [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

> **The decision upstream of everything else.** Before the feature-decision-matrix, before the cost-calculator, there is one question: *which model tier fits this task?* Getting it wrong costs money (over-tiering) or quality (under-tiering). This guide answers it in four questions.

> **Sonnet 5 narrows the Opus gap (2026-06-30 launch).** Sonnet 5's launch benchmarks show performance close to Opus 4.8 at lower price, and it can match Opus 4.8 on some tasks at higher effort — a bigger jump than prior Sonnet releases. **Re-validate the Q1 threshold in eval** before assuming last month's Opus-vs-Sonnet routing decisions still hold; a task that needed Opus 4.8 under Sonnet 4.6 may now clear the bar on Sonnet 5 at higher effort, at ~1.7× lower cost. This guide keeps Opus 4.8 as the default for the hardest reasoning/code-review row below until that re-validation happens — don't flip it without an eval delta.

> **A note on the next-gen line.** Anthropic has a tier above the 4.x/5.x family — **Claude Fable 5** (most capable widely released) and **Claude Mythos 5** (Project Glasswing). **Fable 5 is now GA** (access restored 2026-07-01). Mythos 5 remains **invite-only**. At ~2× Opus pricing ($10/$50 per MTok), validate the quality delta against Opus 4.8 in eval before re-tiering your hardest tasks — the guide's decision framework still applies; use Fable 5 only where that delta justifies the cost premium. Track status in [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

---

## The 4-question framework

Answer in order. Stop at the first match.

**Q1. Does this task require extended multi-step reasoning, deep code analysis, or nuanced judgment on ambiguous inputs?**
→ Yes: start at **Opus 4.8**. Validate in eval before committing.
→ No: continue to Q2.

**Q2. Does this task require reliable instruction-following, structured output, tool use, or RAG synthesis across long context?**
→ Yes: **Sonnet 5** is the default. Covers ~70% of production workloads (pre-Sonnet-5 figure — likely higher now given the narrowed Opus gap; re-measure rather than assume).
→ No: continue to Q3.

**Q3. Is this task high-volume, latency-sensitive, or clearly bounded (classification, routing, short-form generation, triage)?**
→ Yes: **Haiku 4.5**. Run a regression eval before switching from Sonnet — Haiku under-performs on tasks that *look* simple but have long-tail edge cases.
→ No: continue to Q4.

**Q4. Is this task interactive and latency-sensitive, with output quality that isn't critical?**
→ Yes: **Haiku 4.5** for the shell, escalate to Sonnet on confidence threshold.
→ Uncertain: default to Sonnet 5 and measure.

---

## Task-type → tier table

| Task type | Default tier | Rationale | Failure mode if wrong |
|---|---|---|---|
| Complex code reasoning, architecture review | Opus 4.8 | Needs multi-step reasoning + nuanced judgment | Sonnet misses non-obvious bugs; Haiku hallucinates logic |
| Agentic workflow orchestration (planning step) | Opus 4.8 or Sonnet 5 | Planning quality determines downstream execution quality | Under-tiering cascades errors through the whole pipeline |
| RAG synthesis, document Q&A, long-form drafting | Sonnet 5 | Strong instruction-following (context window vs. Sonnet 4.6 not yet confirmed — verify) | Haiku degrades on long retrieved context |
| Structured output generation (JSON, tables, reports) | Sonnet 5 | Consistent schema adherence across edge inputs | Haiku drifts on complex schemas |
| Tool use / function calling (multi-step) | Sonnet 5 | Reliable tool selection + parameter accuracy | Haiku drops required params on ambiguous tool definitions |
| Copilot (interactive, medium complexity) | Sonnet 5 | Quality floor for user-facing response | Haiku frustrates users on nuanced follow-up |
| Intent classification, routing, triage | Haiku 4.5 | Bounded task, high volume, latency-sensitive | Sonnet cost ~3× higher for equivalent accuracy |
| Short-form generation (push notifications, titles, summaries) | Haiku 4.5 | Fast, cheap, adequate quality | Opus/Sonnet is pure cost overhead |
| Batch enrichment (tagging, extraction, scoring) | Haiku 4.5 + Batch API | Max cost efficiency; async SLA acceptable | Sonnet/Opus inflates batch budget by ~3–5× |
| Extended thinking tasks (proofs, complex math, strategic analysis) | Opus 4.8 with thinking enabled | Extended thinking only available on Opus 4.x in agentic contexts | Thinking on Sonnet adds cost without depth gain on hardest problems |

---

## Cascade pattern — the highest-leverage architecture

Most production workloads are not uniform. Mixing tiers per request is the dominant cost-reduction lever.

```
Request → Haiku triage
           ├── Confidence ≥ threshold → return Haiku output (60–80% of traffic)
           └── Confidence < threshold → escalate to Sonnet
                                         ├── Success → return Sonnet output
                                         └── Hard case flag → escalate to Opus (2–5% of traffic)
```

**Typical cost impact:** blended cost 40–60% lower than all-Sonnet at equivalent average quality. Model the mix in [`cost-calculator.html`](cost-calculator.html) with the model-mix sliders.

**Confidence threshold options:**
- Explicit uncertainty signal in model output ("I'm not sure…", "This could mean…")
- Structured output with a `confidence` field the application reads
- Output length heuristic (Haiku outputs under N tokens on ambiguous inputs → escalate)
- Separate lightweight classifier trained on escalation labels

**Failure mode:** threshold set too high → Haiku handles cases it shouldn't, quality regresses. Measure escalation rate and acceptance rate on escalated outputs as ongoing signals. See [`eval-starter-pack.md`](eval-starter-pack.md) regression eval template.

---

## Cost impact of getting it wrong

Based on pricing as of 2026-07 (verify at [`cost-calculator.html`](cost-calculator.html)):

| Tier swap | Input cost ratio | Output cost ratio | Monthly $ impact at 1M req, 8k in / 600 out |
|---|---|---|---|
| Haiku → Sonnet | 3× | 3× | +~$22k/mo |
| Haiku → Opus | 5× | 5× | +~$44k/mo |
| Sonnet → Opus | ~1.7× | ~1.7× | +~$22k/mo |

**Over-tiering Opus for work Sonnet handles** is the most common budget error. At 1M requests/month, every percentage point of traffic unnecessarily routed to Opus instead of Sonnet costs ~$220/mo.

**Under-tiering Haiku for work Sonnet handles** is the most common quality error. Track acceptance rate, task completion rate, and user override rate as signals.

---

## When to move up a tier

Signal → action:

| Signal | Move |
|---|---|
| Eval pass rate drops >5% vs Sonnet baseline | Move task type to Sonnet |
| Users override / re-prompt >15% of Haiku responses | Move to cascade or Sonnet |
| Agent loop makes >1 tool-selection error per 10 tasks | Move planning step to Sonnet or Opus |
| Complex reasoning task scores <80% on grounding eval | Move to Opus with extended thinking |

## When to move down a tier

Signal → action:

| Signal | Move |
|---|---|
| Sonnet eval pass rate ≥ Opus on task type | Move to Sonnet |
| Task type is classification / routing / triage | Pilot Haiku with regression eval gate |
| Batch workload, no latency SLA | Move to Haiku + Batch API |
| Steady-state cost-per-task 2× modeled budget | Audit tier mix; downgrade non-critical paths |

---

## Extended thinking: additional decision layer

Extended thinking is not a model tier — it's a feature available on Opus 4.x (verify current model support in [`../docs/feature-inventory.md`](../docs/feature-inventory.md)). It adds cost and latency in exchange for deeper step-by-step reasoning.

**When it helps:** multi-step math, complex code analysis, strategic planning with many constraints, ambiguous legal/policy interpretation.

**When it doesn't help (and you're paying for it anyway):** classification, routing, short-form generation, format conversion, RAG Q&A on well-structured documents.

**Rule:** default off. Enable only after measuring that the task type scores meaningfully higher with thinking enabled. See [`feature-decision-matrix.html`](feature-decision-matrix.html) extended-thinking row.

---

## How this artifact connects to the rest

- [`cost-calculator.html`](cost-calculator.html) — model the $/mo impact of any tier decision before committing
- [`feature-decision-matrix.html`](feature-decision-matrix.html) — which features to enable per pattern, after model tier is set
- [`eval-starter-pack.md`](eval-starter-pack.md) — regression eval template to gate tier changes
- [`reference-architectures.html`](reference-architectures.html) — cascade pattern appears in RAG copilot + domain expert assistant architectures
- [`multi-agent-patterns.md`](multi-agent-patterns.md) — per-agent tier selection in multi-agent pipelines

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.`
