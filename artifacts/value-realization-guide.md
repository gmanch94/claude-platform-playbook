# Value Realization Guide — Renew, Expand, or Kill

**As of 2026-07.** Pin to current surface — refresh monthly.

[`adoption-playbook.md`](adoption-playbook.md) hands off at Day 90. [`roi-worksheet.html`](roi-worksheet.html) *projected* the value before you started. This guide is what receives the handoff: how to measure what actually happened, compare it to the projection, and make the decision the sponsor will schedule whether or not you're ready for it — **renew, expand, or kill**.

> **How this differs from [`roi-worksheet.html`](roi-worksheet.html):** the worksheet is a *projection* tool — it estimates value with a realized-capture discount you assume. This guide *measures* that capture, then feeds the measured number back into the worksheet. Projection without realization is a pitch; realization without projection has no baseline. You need both.

---

## The realization loop

1. **Instrument** — telemetry per [`agent-observability-guide.md`](agent-observability-guide.md); spend per [`token-budget-governance.md`](token-budget-governance.md).
2. **Measure** — the metric set below, monthly.
3. **Compare** — actuals vs the roi-worksheet projection. The delta is the realized-capture rate, measured instead of assumed.
4. **Decide** — quarterly renew/expand/kill, using the table at the bottom.
5. **Re-baseline** — update the worksheet inputs with measured values; next quarter compares against the corrected projection.

Skipping step 3 is the most common failure: teams report actuals in isolation, the sponsor has nothing to compare them to, and the review becomes vibes.

---

## The metric set

Five families. Every metric carries its counter-metric — the way teams game it — because a metric without its Goodhart failure mode is an invitation.

| Family | Metric | Leading or lagging | Where it comes from | How it gets gamed (watch this) |
|---|---|---|---|---|
| **Adoption** | Weekly active users / provisioned seats | Leading | Plan admin analytics (verify the granularity your plan tier actually exposes); Claude Code telemetry | Logins counted as usage. Pair with a depth metric or it's a vanity number. |
| **Depth** | Tasks completed with Claude per active user per week | Leading | Sampled workflow data; Claude Code sessions; API task counts | Task inflation (splitting one task into five). Fix the task definition per workload. |
| **Quality** | Eval pass rate on the production suite ([`eval-starter-pack.md`](eval-starter-pack.md)); rework rate on Claude-assisted output | Lagging | Eval CI; review-stage sampling | Eval suite frozen while the workload drifts — passing a stale suite measures nothing. Refresh the suite quarterly. |
| **Cost** | $ per task (not $ per token), vs the pre-Claude unit cost of the same task | Lagging | Usage & Cost Admin API rollups; [`cost-calculator.html`](cost-calculator.html) baseline | Cherry-picking cheap task classes into the average. Report per-workload, then aggregate. |
| **Value** | Hours captured × loaded rate, at the *measured* capture rate | Lagging | Time-sampling on matched tasks (below) | Self-report inflation — self-reports typically overstate savings (assume ~2× as a planning heuristic, not a sourced constant). Haircut 0.5× or measure directly. |

**Per-surface leading indicators** (first 90 days after each surface ships, per [`surface-rollout-matrix.md`](surface-rollout-matrix.md)):

| Surface | Early signal that value will follow | Early signal it won't |
|---|---|---|
| Chat / Projects | Projects created with real org knowledge attached; repeat weekly use | One-shot novelty prompts, no Projects, usage decays week 3 |
| Claude Code | PR cycle time on instrumented repos; % PRs with Claude-assisted commits | Tool installed, sessions near zero — an enablement gap, not a tool verdict |
| Cowork | Recurring workflows (weekly reports, file ops) run ≥3 times | Single demos that never repeat |
| API workloads | Cost per task stable or falling while volume grows | Token spend growing faster than task volume (see the variance triage in [`token-budget-governance.md`](token-budget-governance.md)) |

---

## Measuring realized capture (the honest way)

The roi-worksheet's realized-capture discount exists because assisted hours don't convert 1:1 into redeployed hours. To measure it:

- **Matched-task sampling.** Pick 3–5 recurring task types per workload. Measure cycle time on a sample before and after (or assisted vs unassisted cohorts in the same period). 20–30 samples per task type is enough for a decision-grade signal — this is a management measurement, not a paper.
- **Discount self-report.** Where sampling isn't feasible, collect self-reported time saved and apply a 0.5× haircut. Label it as self-reported in the review.
- **Count only redeployed time.** An hour saved that evaporates into slack is real to the person but not to the P&L. The worksheet's capture rate is exactly this ratio — now you have it measured.

**The surveillance boundary.** All measurement at team level or above. No individual leaderboards, no per-person time tracking, no using adoption data in performance reviews. This is the bright line [`workforce-change-guide.md`](workforce-change-guide.md) draws — crossing it poisons the adoption you're trying to measure, because people who feel watched stop logging real usage.

---

## The quarterly decision

Bands are **illustrative starting points** — set your own before the first review, because thresholds chosen after seeing the data are theater.

| Signal pattern | Decision | What it means in practice |
|---|---|---|
| Value-to-cost ≥ 3× measured **and** adoption ≥ 60% of target seats | **Expand** | Add the next use case ([`pilot-selection-worksheet.html`](pilot-selection-worksheet.html)) or next surface ([`surface-rollout-matrix.md`](surface-rollout-matrix.md)). Fund from the measured surplus. |
| Value-to-cost 1–3× | **Renew + fix the weakest lever** | Identify which family is dragging (usually depth or capture). One quarter, one named fix, re-measure. |
| Value-to-cost < 1× with **healthy adoption** (people use it, value doesn't land) | **Re-scope** | Wrong use case, not wrong tool. Back to [`anti-use-cases.md`](anti-use-cases.md) and pilot selection — the workload may be one Claude shouldn't own. |
| Value-to-cost < 1× with **low adoption** after an enablement push | **Kill or pause** | Two consecutive quarters here and renewal is sunk-cost. Kill the workload, keep the platform learnings. |
| High value, low adoption | **Enablement problem** | The users who adopted are winning — the gap is training/mindset, not the tool. [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) + [`workforce-change-guide.md`](workforce-change-guide.md), not more features. |

**The month-6 review agenda** (60 minutes, sponsor in the room):

1. Actuals vs projection, per workload (10 min) — the one slide that matters.
2. Measured capture rate vs the assumed discount (5 min).
3. Quality trend: eval pass rate + rework rate (10 min).
4. Cost per task trend + variance causes (10 min).
5. Adoption depth by team — aggregate, never individual (5 min).
6. Decision per workload from the table above (15 min).
7. Re-baseline: updated worksheet inputs for next quarter (5 min).

---

## Failure modes

| Failure | What it looks like | Counter |
|---|---|---|
| **Vanity metrics** | Seats provisioned and messages sent presented as value | Depth + value families are mandatory in every review; adoption alone never clears a renew |
| **Attribution theater** | Claiming every cycle-time improvement for Claude while three other initiatives ran | Matched-task sampling; name concurrent initiatives in the review |
| **Self-report inflation** | "Saves me 10 hours a week" × headcount = fantasy number | 0.5× haircut on self-report; direct sampling where the money is |
| **Surveillance drift** | Dashboards quietly become per-person | Team-level aggregation enforced in the dashboard spec, not in policy prose |
| **Silent eval decay** | Pass rate steady at 98% because the suite hasn't changed since launch | Quarterly suite refresh is a standing review item |
| **Sunk-cost renewal** | Two red quarters, renewed anyway because of the integration effort | Pre-committed kill band; the sponsor signs the thresholds before the first review |

---

**Cross-references:** [`roi-worksheet.html`](roi-worksheet.html) (the projection this audits) · [`adoption-playbook.md`](adoption-playbook.md) (the 90-day arc that hands off here) · [`agent-observability-guide.md`](agent-observability-guide.md) (the telemetry that feeds this) · [`token-budget-governance.md`](token-budget-governance.md) (the cost side of the same review) · [`workforce-change-guide.md`](workforce-change-guide.md) (the measurement boundary) · [`docs/feature-inventory.md`](../docs/feature-inventory.md) (Usage & Cost Admin API row).

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.
