# Agent Observability Guide — Day-2 Telemetry for Claude Workloads

**As of 2026-07.** Pin to current surface — refresh monthly.

[`eval-starter-pack.md`](eval-starter-pack.md) gates quality *before* ship. [`incident-response-runbook.md`](incident-response-runbook.md) fires *after* something burns — and each of its five incident classes lists "symptoms" that, in most deployments, nothing actually watches for. This guide is the layer between them: the telemetry schema, the golden signals, and an alert table that routes each signal to the incident class it predicts. **A symptom list nobody instruments is a post-mortem template.**

> **Scope:** API-built workloads and Claude Code fleets — the surfaces you instrument yourself. Seat surfaces (chat, Projects, Cowork) report through plan-admin analytics instead; their adoption signals live in [`value-realization-guide.md`](value-realization-guide.md).

---

## The minimum telemetry schema

The [`maturity-model.md`](maturity-model.md) L2 gate says "audit logging (request, prompt, response, model version, cost, user)." Expanded into the fields that make the signals below computable — per request:

| Field | Why it's load-bearing |
|---|---|
| Request ID + timestamp | Correlation; everything else hangs off it |
| Workload / task-class tag | $/task and quality roll up by workload, not by endpoint |
| **Prompt version** (hash or tag) | The #1 root-cause question in incident class #1 (prompt regression) is "what changed?" — unanswerable without this |
| Model ID (exact pin) | Tier-mix drift detection; migration verification ([`model-deprecation-runbook.md`](model-deprecation-runbook.md)) |
| Tokens: input / output / **cache read / cache write** (from the API `usage` fields) | Cost attribution; cache-hit-rate decay is invisible without the split |
| Computed request cost | Don't derive at query time from prices that change; stamp it |
| Latency (+ time-to-first-token if streaming) | The user-facing SLO |
| Stop reason | `max_tokens` stops = truncated work; a rising rate is quality decay nobody reports |
| Tool calls: name, success/error, duration | Agent workloads fail through their tools first |
| **Turn count / loop depth** (agentic) | The leading indicator for incident class #4 (agent loop runaway) |
| Refusal flag | Refusal-rate spikes = prompt regression or input drift |
| User / workspace attribution | The [`token-budget-governance.md`](token-budget-governance.md) ladder needs it; keep it team-granular in dashboards ([`workforce-change-guide.md`](workforce-change-guide.md) boundary) |
| Eval-sample flag | Marks the 1–5% sampled into scoring (below) |

**Where it comes from:** API responses carry `usage` (token counts incl. cache reads/writes) and stop reasons per request (Messages API reference: platform.claude.com/docs/en/api/messages). Org-level rollups by workspace / key / model come from the **Usage & Cost Admin API** (Admin key required — see [`docs/feature-inventory.md`](../docs/feature-inventory.md), verify endpoint surface at next refresh). **Claude Code fleets** export metrics and events via OpenTelemetry (`CLAUDE_CODE_ENABLE_TELEMETRY`, OTLP exporters — per its monitoring docs) into whatever backend you already run. A gateway, if you run one, is a natural capture point — with the attribution caveat in [`exit-portability-memo.md`](exit-portability-memo.md).

**PII in logs — the top failure mode of this guide.** Full prompts/responses are the most useful debugging payload and the most dangerous log field. Your log store now holds whatever users typed, under *your* retention policy, subject to the data-boundary rules in [`governance-overlay.md`](governance-overlay.md). Default: log metadata always, payloads scrubbed (the PII-scrub pattern in [`hooks-starter-pack.md`](hooks-starter-pack.md)) or sampled with short retention. Decide deliberately, in writing, before the first production request.

---

## Golden signals

Six signals cover the failure surface. Each with its drift question:

| Signal | Computed as | The question it answers |
|---|---|---|
| **$ / task** | Cost ÷ completed tasks, per workload | Is the unit economics holding? (Feeds the [`token-budget-governance.md`](token-budget-governance.md) variance triage) |
| **Tokens / task** | Split by input / output / cached | Context bloat? Cache decay? Output verbosity creep? |
| **Tool-error rate** | Tool-call failures ÷ tool calls | Integration rot — the earliest agent-degradation signal |
| **Refusal + truncation rate** | Refusals and `max_tokens` stops ÷ requests | Prompt regression or input-distribution drift |
| **Loop depth p95** | Turns per task, agentic workloads | Runaway precursor — degrades cost and latency before it becomes an incident |
| **Quality sample score** | LLM-judge on the eval-sample slice | Is output quality drifting between eval-suite runs? |

**Sampled judging, costed honestly:** score 1–5% of production traffic against the [`eval-starter-pack.md`](eval-starter-pack.md) rubrics with a Haiku-tier judge. Order-of-magnitude check: 100k requests/month × 3% sampled × ~2k tokens per judge call at Haiku pricing ($1/$5 per MTok) ≈ **$10–15/month** — rounding error. The same math with an Opus judge on 100% of traffic is a second AI budget. Judge config is itself versioned: a silent judge-model or rubric change makes the quality trend lie.

---

## Alerts → incident classes

The routing that turns the incident runbook's symptom lists into detection rules. Thresholds are illustrative — set yours from a 2-week baseline, then tighten:

| Alert | Illustrative threshold | Routes to |
|---|---|---|
| $/task drift | >30% above trailing 7-day baseline | [`incident-response-runbook.md`](incident-response-runbook.md) class #3 (cost spike) + budget variance triage |
| Refusal / truncation spike | >2× baseline over 1h | Class #1 (prompt regression) |
| Quality sample score drop | Below eval-suite pass threshold, 2 consecutive windows | Class #1; block prompt deploys until triaged |
| Loop depth p95 | > 2× baseline, or absolute turn ceiling hit | Class #4 (agent loop runaway) — page, don't email |
| Tool-error rate | >5% sustained 30 min | Class #5 if the tool is an MCP server (compromise/rot); else integration on-call |
| Model-ID mismatch | Any request on a non-manifest pin | [`model-deprecation-runbook.md`](model-deprecation-runbook.md) pin audit — something migrated silently |
| 4xx/5xx + rate-limit pressure | Sustained against workspace limits | Capacity review — tier mix or service-tier decision ([`token-budget-governance.md`](token-budget-governance.md)) |

**Three audiences, three altitudes:** on-call sees the alert table live; ops reviews weekly trends (the six signals per workload); the exec review consumes the monthly rollup inside [`value-realization-guide.md`](value-realization-guide.md). Same data, three zoom levels — build once.

---

## Failure modes

| Failure | What it looks like | Counter |
|---|---|---|
| **PII lake** | Full prompts logged "temporarily," discovered at audit | Scrub-by-default before first prod request; payload logging is an explicit, written exception |
| **Alert fatigue from token noise** | Paging on hourly token wiggle; on-call mutes the channel | Alert on $/task and rates, not raw volume; page only on class #4/#5 shapes |
| **Judge drift** | Quality trend moves because the judge changed, not the workload | Version the judge model + rubric; annotate dashboards on judge changes |
| **Observability exceeding workload cost** | Full-traffic Opus-judge scoring on a Haiku workload | The sampling math above — observability spend is a named line in the budget |
| **Dashboard without an owner** | Signals exist, nobody's paged, incident post-mortem says "the graph showed it for 3 weeks" | Assign an owner per alert row when instantiating the table, drawn from your [`operating-model-guide.md`](operating-model-guide.md) RACI cast |
| **Metadata-only regret** | Incident triage impossible because no payload was kept anywhere | Short-retention sampled payloads (scrubbed) for debugging — the deliberate middle between lake and blind |

---

**Cross-references:** [`incident-response-runbook.md`](incident-response-runbook.md) (where alerts route) · [`eval-starter-pack.md`](eval-starter-pack.md) (the rubrics the judge reuses) · [`token-budget-governance.md`](token-budget-governance.md) (cost signals' consumer) · [`value-realization-guide.md`](value-realization-guide.md) (the monthly rollup) · [`agentic-threat-model.md`](agentic-threat-model.md) (detection for the threat side) · [`governance-overlay.md`](governance-overlay.md) + [`hooks-starter-pack.md`](hooks-starter-pack.md) (the PII boundary and the scrub).

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.
