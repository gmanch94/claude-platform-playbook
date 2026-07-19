# Token Budget Governance — Caps, Attribution, Chargeback

**As of 2026-07.** Pin to current surface — refresh monthly.

[`cost-calculator.html`](cost-calculator.html) tells you what the spend *should* be. This guide is the discipline that keeps the actual bill inside it: who owns the budget, where the caps live, when alerts fire, and how showback graduates to chargeback. It exists because of one recurring failure the [`maturity-model.md`](maturity-model.md) L2 gate already names: **cost gates wired ($/task, $/day) — not invoice-discovered.**

> **How this differs from the calculator:** the calculator is a sizing tool you run before committing. This is the operating discipline after — allocation, attribution, caps, and the monthly review. Same numbers, opposite direction.

---

## The budget-unit ladder

Budgets fail when they exist at only one altitude. Four levels, each mapped to a real control (platform controls per [`docs/feature-inventory.md`](../docs/feature-inventory.md) — cap granularity marked verify-in-Console):

| Level | Budget unit | The control that enforces it | Owner |
|---|---|---|---|
| **Org** | Total monthly AI spend (API + seats) | Contract / plan commitments; org-level reporting via the Usage & Cost Admin API | CIO / FinOps |
| **Workspace** | Per-team or per-product API budget | **Console workspaces** — per-workspace API keys, rate limits, spend caps. Make workspace boundaries match budget boundaries and attribution falls out for free. | Platform owner |
| **Workload** | $ per task class (support triage, doc extraction, code assist) | Cost-per-task SLO, monitored per [`agent-observability-guide.md`](agent-observability-guide.md); alerts at drift | Workload owner |
| **Seat surfaces** | Plan seats + per-surface spend | Enterprise admin spend controls on Cowork; org and per-channel caps on Claude Tag (per the inventory rows); seat counts per [`subscription-selection-guide.md`](subscription-selection-guide.md) | IT / plan admin |

Owner labels are operational shorthands — map them to your [`operating-model-guide.md`](operating-model-guide.md) RACI cast (Platform owner ≈ Platform team; Workload owner ≈ Build team).

**Cap placement rule:** hard caps on experiments, alerts on production. A blanket org-level hard cap means the month's last week browns out production because someone's experiment ate the ceiling. Cap the sandbox workspaces tightly; give production workspaces alert thresholds (50% / 80% / 100% of forecast) and an escalation path instead of a cliff.

---

## Attribution before chargeback

The graduation path — skipping a stage is the classic self-inflicted wound:

| Stage | When | What it looks like |
|---|---|---|
| **1. Metering** | Month 1 | Every request attributable: workspace = team, API key = service, model + token counts logged. The Usage & Cost Admin API gives org rollups by workspace, key, and model — wire it into the FinOps dashboard rather than hand-building from invoices. |
| **2. Showback** | Months 2–4 | Teams see their spend monthly, next to their $/task. No money moves. Errors in attribution surface here, where they're cheap. |
| **3. Chargeback** | Month 5+, only if needed | Spend hits team budgets. Only after two clean showback cycles — teams accept charges they've watched and verified. |

**Premature chargeback is the named anti-pattern:** billing teams for tokens in month 1 teaches them to stop experimenting, which kills the L1→L2 pipeline the whole adoption depends on. Experimentation budget should be explicit, capped, and free to the team.

---

## The levers, priced

Unit-economics levers the budget owner should demand before granting a budget increase. List-price ratios per the inventory's token-economics note; the 60–80% steady-state band is this repo's modeled estimate ([`cost-calculator.html`](cost-calculator.html)), not a vendor number:

| Lever | Effect | Where it applies |
|---|---|---|
| **Prompt caching** | Cache reads ≈ 10% of input price; 60–80% steady-state reduction vs naive use on cache-shaped workloads | High-volume workloads with stable system prompts / shared context ([`data-advisory.md`](data-advisory.md) cache-eligibility shape) |
| **Batch API** | ≈ 50% off all rates | Anything that tolerates async turnaround |
| **Tier mix** | Haiku ≈ 3× cheaper than Sonnet at standard rates (≈ 2× during Sonnet 5's introductory pricing through 2026-08-31), ≈ 5× vs Opus | Route by task difficulty per [`model-selection-guide.md`](model-selection-guide.md); cascade pattern |
| **Priority tier** | **Closed to new purchase (2026-07)** — existing capacity commitments run to contract end; new guaranteed capacity is contact-sales, and it's unsupported on Sonnet 5. No longer a self-serve lever | Only orgs with an existing commitment; otherwise n/a |

**Budget-increase protocol:** no workload gets more budget until it shows its lever usage. "We need 2× budget" with 0% cache hit rate on a cacheable workload is an engineering request wearing a finance costume.

---

## Monthly variance triage

When actuals diverge from forecast, the cause is one of four — in order of how often it's actually the culprit:

| Cause | Signature | Response |
|---|---|---|
| **Volume** | Tokens/task flat, task count up | Good news wearing a red flag — re-forecast, check value side in [`value-realization-guide.md`](value-realization-guide.md) |
| **Mix** | Share of expensive-tier tokens rising | Check routing policy drift; was an Opus fallback quietly widened? |
| **Tokens-per-task drift** | Same tasks, fatter prompts/outputs | Context bloat or an agent loop lengthening — route to [`agent-observability-guide.md`](agent-observability-guide.md) golden signals |
| **Price/tokenizer change** | Everything flat, unit price moved | Model migration or pricing update — [`model-deprecation-runbook.md`](model-deprecation-runbook.md) step 4 owns this (e.g. Sonnet 5's tokenizer maps the same input to ~1.0–1.35× more tokens) |

---

## Failure modes

| Failure | What it looks like | Counter |
|---|---|---|
| **Invoice discovery** | The bill is the monitoring system | The L2 gate: alerts at 50/80/100% of forecast, wired in week 1 of any production workload |
| **Blanket org cap** | Production brownout in the last week of the month | Cap placement rule above — caps on experiments, alerts on prod |
| **Optimizing $/token instead of $/task** | Cheaper model, more retries, higher total cost per completed task | $/task is the only budget SLO; $/token is diagnostics |
| **Attribution debt** | One shared API key across six teams; chargeback impossible, so accountability never arrives | Workspace-per-team from day 1 — it's free at setup and painful to retrofit · each workload its own non-human identity ([`service-accounts-guide.md`](service-accounts-guide.md)) |
| **Gateway metering blind spot** | An abstraction layer aggregates all traffic under one identity | If you run a gateway ([`exit-portability-memo.md`](exit-portability-memo.md)), it must propagate per-team attribution or the ladder collapses |
| **Seat/API double vision** | API budget scrutinized monthly; seat spend (plans, Cowork, Tag) unreviewed | One review covers both — the org-level row is *total* AI spend |

---

**Cross-references:** [`cost-calculator.html`](cost-calculator.html) (sizing) · [`subscription-selection-guide.md`](subscription-selection-guide.md) (seat-vs-API split) · [`model-selection-guide.md`](model-selection-guide.md) (mix policy) · [`agent-observability-guide.md`](agent-observability-guide.md) (the telemetry feeding this) · [`value-realization-guide.md`](value-realization-guide.md) (the value side of the same review) · [`docs/feature-inventory.md`](../docs/feature-inventory.md) (Admin API, workspaces, service tiers rows).

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.
