# Claude Model Selection Guide

**As of 2026-07.** Pinned to Opus 5 / Sonnet 5 / Haiku 4.5. Refresh monthly with [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

> **The decision upstream of everything else.** Before the feature-decision-matrix, before the cost-calculator, there is one question: *which model tier fits this task?* Getting it wrong costs money (over-tiering) or quality (under-tiering). This guide answers it in four questions.

> **Opus 5 is the new top deployable tier (2026-07-24 launch).** It replaces Opus 4.8 as the escalation target at **identical pricing** ($5/$25 per MTok), and is a step-change rather than an incremental bump — largest gains in deep reasoning, agentic/long-horizon work, and test-time compute scaling. Two consequences for this guide: (a) **effort is now a real cost lever** — Opus 5 converts effort into quality more reliably than any earlier Opus, and `low`/`medium` effort deliver strong quality at a fraction of the tokens and latency, so an Opus-5-at-low-effort row may now beat a Sonnet row you previously chose on price; (b) **thinking is ON by default** (see the migration note below). Opus 4.8 remains available and is not deprecated.
>
> **Sonnet 5 narrows the Opus gap (2026-06-30 launch).** Sonnet 5's launch benchmarks show performance close to the then-current Opus 4.8 at lower price, and it can match it on some tasks at higher effort — a bigger jump than prior Sonnet releases. **Re-validate the Q1 threshold in eval** before assuming last quarter's Opus-vs-Sonnet routing decisions still hold — in *both* directions now: a task that needed Opus under Sonnet 4.6 may clear the bar on Sonnet 5 at higher effort (~1.7× lower cost), while Opus 5 at low/medium effort may reclaim tasks you'd moved down. This guide keeps Opus 5 as the default for the hardest reasoning/code-review row below — don't flip it without an eval delta.
>
> **Migration note (Opus 4.8 → Opus 5).** On Opus 4.8 a request ran *without* thinking unless you set `thinking: {"type":"adaptive"}`. On **Opus 5 the same request runs WITH thinking on**, and `max_tokens` caps thinking **plus** response text — so **revisit `max_tokens` on any workload that ran thinking-less on 4.8**, or responses can truncate. `adaptive` remains valid and equals the default. Effort ladder: `low` / `medium` / `high` (default) / `xhigh` / `max`.

> **A note on the next-gen line.** Anthropic has a tier above the 4.x/5.x family — **Claude Fable 5** (most capable widely released) and **Claude Mythos 5** (Project Glasswing). **Fable 5 is now GA** (access restored 2026-07-01). Mythos 5 remains **invite-only**. At ~2× Opus pricing ($10/$50 per MTok), validate the quality delta against Opus 5 in eval before re-tiering your hardest tasks — a higher bar since 2026-07-24, because Opus 5 leads Anthropic's reported coding + knowledge-work evals at half Fable's price [M — vendor-reported; run your own] and carries no data-retention requirement for general access (Fable requires 30-day retention, not ZDR-eligible) — which removes Fable's disqualifier without itself establishing ZDR coverage; see [`governance-overlay.md`](governance-overlay.md) — the guide's decision framework still applies; use Fable 5 only where that delta justifies the cost premium. Track status in [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

---

## The 4-question framework

Answer in order. Stop at the first match.

**Q1. Does this task require extended multi-step reasoning, deep code analysis, or nuanced judgment on ambiguous inputs?**
→ Yes: start at **Opus 5**. Validate in eval before committing.
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
| Complex code reasoning, architecture review | Opus 5 | Needs multi-step reasoning + nuanced judgment; Anthropic reports improved bug-finding precision per pass, holding at lower effort [M — vendor-reported] | Sonnet misses non-obvious bugs; Haiku hallucinates logic; a low-effort setting that passed your eval last quarter may not hold after a model change — re-run it |
| Agentic workflow orchestration (planning step) | Opus 5 or Sonnet 5 | Planning quality determines downstream execution quality | Under-tiering cascades errors through the whole pipeline |
| RAG synthesis, document Q&A, long-form drafting | Sonnet 5 | Strong instruction-following (context window vs. Sonnet 4.6 not yet confirmed — verify) | Haiku degrades on long retrieved context |
| Structured output generation (JSON, tables, reports) | Sonnet 5 | Consistent schema adherence across edge inputs | Haiku drifts on complex schemas |
| Tool use / function calling (multi-step) | Sonnet 5 | Reliable tool selection + parameter accuracy | Haiku drops required params on ambiguous tool definitions |
| Copilot (interactive, medium complexity) | Sonnet 5 | Quality floor for user-facing response | Haiku frustrates users on nuanced follow-up |
| Intent classification, routing, triage | Haiku 4.5 | Bounded task, high volume, latency-sensitive | Sonnet cost ~3× higher for equivalent accuracy |
| Short-form generation (push notifications, titles, summaries) | Haiku 4.5 | Fast, cheap, adequate quality | Opus/Sonnet is pure cost overhead |
| Batch enrichment (tagging, extraction, scoring) | Haiku 4.5 + Batch API | Max cost efficiency; async SLA acceptable | Sonnet/Opus inflates batch budget by ~3–5× |
| Extended thinking tasks (proofs, complex math, strategic analysis) | Opus 5 (thinking is on by default; raise `effort` to `xhigh`/`max`) | Opus 5 converts added effort into quality more reliably than earlier Opus models | Thinking on Sonnet adds cost without depth gain on hardest problems; at `xhigh`/`max` an under-set `max_tokens` truncates the answer |

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
| Complex reasoning task scores <80% on grounding eval | Move to Opus 5 and raise `effort` (thinking is already on by default — the lever is depth, not on/off) |

## When to move down a tier

Signal → action:

| Signal | Move |
|---|---|
| Sonnet eval pass rate ≥ Opus on task type | Move to Sonnet |
| Task type is classification / routing / triage | Pilot Haiku with regression eval gate |
| Batch workload, no latency SLA | Move to Haiku + Batch API |
| Steady-state cost-per-task 2× modeled budget | Audit tier mix; downgrade non-critical paths |

---

## Thinking + effort: additional decision layer

Thinking is not a model tier — it's a per-model behavior, and **the default flipped on 2026-07-24**. Verify current model support in [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

| Model | Thinking default | Your control |
|---|---|---|
| **Opus 5** | **ON** — model decides when and how much to think per turn | `effort`: `low` / `medium` / `high` (default) / `xhigh` / `max` |
| **Sonnet 5** | **ON** (adaptive thinking on by default; manual `budget_tokens` removed — returns 400) | `effort` |
| Opus 4.7 / 4.8 | OFF unless `thinking: {"type":"adaptive"}` | `effort` once adaptive is set |
| Opus 4.6 and earlier | OFF; manual `budget_tokens` still accepted | `budget_tokens` (adaptive recommended) |

Thinking-on-by-default is **the 5-series behavior, not an Opus 5 quirk** — Sonnet 5 shares it. What's specific to the 4.8 → 5 hop is that it's a *change* from the default you were running.

**When deeper thinking helps:** multi-step math, complex code analysis, strategic planning with many constraints, ambiguous legal/policy interpretation.

**When it doesn't (and you pay anyway):** classification, routing, short-form generation, format conversion, RAG Q&A on well-structured documents.

**Rule — restated for Opus 5.** "Default off" is no longer available as a starting posture on Opus 5, so the lever is **`effort`, not on/off**: start at the default `high`, then **step down to `low`/`medium` where an eval shows quality holds** — Opus 5 is specifically efficient at the low end, so this is where the savings are. Step up to `xhigh`/`max` only for the most demanding work, and set a large `max_tokens` when you do.

> **Disabling thinking requires effort `high` or below — this is a hard 400, not a soft default.** You *can* still send `thinking: {"type": "disabled"}` on Opus 5, but only at effort `high`, `medium`, or `low`. Combining it with `xhigh` or `max` **returns a 400 error**, and the check is enforced **per request** — so a later request that raises effort while thinking is disabled is rejected even though earlier ones in the same conversation succeeded. Fix either way: re-enable thinking, or lower effort to `high`. [H — verified 2026-07-24 against [whats-new-opus-5](https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5)]

**Budget consequence.** Thinking tokens bill as output, and on Opus 5 they are no longer optional-by-default — so the Opus lane's output-per-request runs higher than a thinking-less baseline at the same list price. `max_tokens` caps thinking **plus** response text: under-set it and the answer truncates rather than erroring. See [`feature-decision-matrix.html`](feature-decision-matrix.html) extended-thinking row and [`cost-calculator.html`](cost-calculator.html).

---

## How this artifact connects to the rest

- [`cost-calculator.html`](cost-calculator.html) — model the $/mo impact of any tier decision before committing
- [`feature-decision-matrix.html`](feature-decision-matrix.html) — which features to enable per pattern, after model tier is set
- [`eval-starter-pack.md`](eval-starter-pack.md) — regression eval template to gate tier changes
- [`reference-architectures.html`](reference-architectures.html) — cascade pattern appears in RAG copilot + domain expert assistant architectures
- [`multi-agent-patterns.md`](multi-agent-patterns.md) — per-agent tier selection in multi-agent pipelines

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.`
