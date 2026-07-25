# Model Deprecation Runbook — The Planned Migration Path

**As of 2026-07.** Pin to current surface — refresh monthly.

[`incident-response-runbook.md`](incident-response-runbook.md) names model deprecation as incident class #2 — the *reactive* path, for when a retirement catches you unprepared. This runbook is the *planned* path that keeps class #2 from ever firing. If you're reading this mid-incident, go there; come back after.

**The lifecycle** (per [platform.claude.com/docs/en/about-claude/model-deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)): **active → deprecated → retired**. Deprecated models keep working; retired model IDs return errors. Notices go to org admins by email and appear on the docs page. Historical deprecation-to-retirement windows have run around six months, **but the window is per-model — read the page for your model's dates, never assume the historical pattern.**

---

## Standing preparation (before any notice exists)

You cannot run this runbook well from a cold start. Five things must already be true:

| Prep item | Why | Where it's specified |
|---|---|---|
| **Exact model IDs pinned** (`claude-sonnet-5`, `claude-opus-5`), never "latest" aliases | An alias migrates you silently on someone else's schedule, with no eval gate | Repo-wide sourcing rule; [`model-selection-guide.md`](model-selection-guide.md) |
| **A model-pin manifest** — one grep-able list of every workload × model ID × owner | Step 1 below is a lookup, not an archaeology dig | [`token-budget-governance.md`](token-budget-governance.md) budget ladder doubles as the inventory |
| **Regression eval suite ≥ v1 per workload** | The only thing that can *certify* a successor is a suite that scored the incumbent | [`eval-starter-pack.md`](eval-starter-pack.md) regression template |
| **Cost baseline per workload** ($ per task, current model) | Migration changes cost even at identical list price — see step 4 | [`cost-calculator.html`](cost-calculator.html) |
| **The successor's system card, read** — its RSP/ASL determination, safeguard-policy changes, and honesty profile | The determination is **per-model and re-made every release**; a migration silently re-bases the upstream risk posture your conformity file cites. The launch post does not carry any of it | [`system-card-readout.md`](system-card-readout.md); [`governance-overlay.md`](governance-overlay.md) §7 |

---

## Watch triggers

| Trigger | Cadence | Who watches |
|---|---|---|
| Deprecation notice email to org admins | Event | Platform owner (label mapping to the [`operating-model-guide.md`](operating-model-guide.md) RACI cast is under the protocol below) |
| [Model deprecations docs page](https://platform.claude.com/docs/en/about-claude/model-deprecations) | Monthly, alongside the feature-inventory refresh ritual this repo runs on itself | Platform owner |
| New-model launches (a successor appearing often precedes the predecessor's deprecation) | Monthly | Architect — **a launch is not a deprecation notice**, so this protocol runs in *voluntary-upgrade* mode: work steps 2–5 (parity check, eval cert, cost re-forecast, staged cutover) without the retirement-date pressure, and skip step 6 while the incumbent stays available. Live case: **Opus 5 launched 2026-07-24 and Opus 4.8 was *not* deprecated** — the upgrade is worth running on its merits (same price, thinking-default change), not because a clock started |
| Hyperscaler catalogs (Bedrock / Vertex / Foundry) | Monthly if you procure there | Platform owner — versions lag in **both** directions: successors arrive late, and retirement dates can differ from first-party |

---

## The migration protocol

Owner labels below are operational shorthands, mapped to the [`operating-model-guide.md`](operating-model-guide.md) RACI cast: **Platform owner ≈ Platform team** (the accountable role on watch triggers and pin hygiene); **Architect + Workload owner ≈ Build team (product)** with Platform support; **FinOps ≈ whoever holds the budget-accountable row** in your RACI.

| # | Step | What it means | Owner | Exit criterion |
|---|---|---|---|---|
| 1 | **Pin audit** | Grep the manifest *and* the code/config/env surface for the deprecated ID — manifests drift. Every hit gets a workload owner and a migration ticket. | Platform owner | Zero unaccounted references |
| 2 | **Successor selection + param-parity check** | Pick the candidate tier per [`model-selection-guide.md`](model-selection-guide.md). Then check parameter parity — behavior contracts differ across generations. Real example: Opus 4.8 accepts adaptive thinking only and **rejects non-default `temperature` / `top_p` / `top_k` with HTTP 400** ([`docs/feature-inventory.md`](../docs/feature-inventory.md)). A lift-and-shift of request code can fail before quality is even in question. **Live worked example — Opus 4.8 → Opus 5 (2026-07-24) breaks in _both_ directions, which is why a parity check needs two passes:** (i) a **silent** break — requests that ran thinking-less on 4.8 now run **with thinking on** by default, and `max_tokens` caps thinking **plus** response text, so an unchanged request doesn't error, it **truncates**; (ii) a **hard 400** — `thinking: {"type":"disabled"}` is accepted only at effort `high` or below, so combining it with `xhigh`/`max` is rejected, **validated per request** (a mid-conversation effort bump fails even if earlier turns passed). Parity checks must cover **defaults that changed** *and* **new invalid combinations**, not just parameters that are outright rejected. Also re-tune, don't carry over: Anthropic's migration guide says to **"run a fresh effort sweep on your own evals rather than carrying over a setting tuned for an earlier model."** Two more per-model gotchas that break a lift-and-shift on this hop: **web fetch is not available on Opus 5**, and **Priority Tier is not supported on Opus 5** — both are capability *regressions* against 4.8 that a quality-only eval won't surface. | Architect | Candidate named; request-shape diffs listed |
| 3 | **Regression certification** | Run the quality gates on the successor — regression, format compliance, tool-call accuracy, grounding, adversarial, refusal calibration (of the pack's eight templates, cost-per-task lands in step 4 and latency in step 5's cutover signals). Blocking gate: pass rate within your pre-set threshold of the incumbent baseline. A thin suite is the #1 failure here — happy-path-only certification ships behavior drift to production. | Workload owner | Suite passes at threshold; deltas triaged |
| 4 | **Cost re-forecast** | Three deltas, not one: (a) list-price difference; (b) **tokenizer drift** — Sonnet 5's updated tokenizer maps the same input to ~1.0–1.35× more tokens than Sonnet 4.6, so identical list price can still mean a higher bill; (c) cache-floor changes — the floor moves per model (4,096 on Opus 4.6 → 1,024 on Opus 4.8 → **512 on Opus 5**), so cache *eligibility* shifts in your favour on this hop: short prefixes that never cached now do, with no code change; (d) **thinking-token spend** — if the successor turns thinking on by default (as Opus 5 does), output tokens per request rise even at an identical list price. Tune with `effort`, but budget from measurement: re-run a representative sample and compare actual output tokens, rather than assuming a lower effort setting proportionally shrinks the bill. Re-run [`cost-calculator.html`](cost-calculator.html) per workload; update the budget per [`token-budget-governance.md`](token-budget-governance.md). | FinOps + workload owner | New $/task accepted by budget owner |
| 5 | **Staged cutover** | Route 5% → 50% → 100%, watching the observability golden signals ([`agent-observability-guide.md`](agent-observability-guide.md)) at each stage. Keep the old pin as an instant rollback for as long as the old model remains available — that window *is* your rollback budget. Don't cut over during a business peak. | Workload owner | 100% on successor; signals stable ≥1 week |
| 6 | **Decommission + record** | Remove old-ID references, update the manifest, archive the incumbent's eval baseline (the successor's new baseline is now the incumbent for next time), note the measured cost delta in the value-realization review. | Platform owner | Manifest clean; baseline archived |

**Timeline template** (against a ~6-month window — compress proportionally if the page says less):

- **T+1 week:** pin audit complete (step 1)
- **T+1 month:** successor certified (steps 2–3), cost re-forecast signed (step 4)
- **T+2 months:** cutover complete (step 5) — **at least 8 weeks before retirement**, so rollback stays live long enough to matter
- **Retirement date:** nothing left to do; that's the point

---

## Failure modes

| Failure | What it looks like | Counter |
|---|---|---|
| **Thin eval suite** | "It seems fine" as the certification | The [`maturity-model.md`](maturity-model.md) L2 gate exists for this; if you can't certify, the migration cost is the eval-building cost — pay it now |
| **Param non-parity discovered in prod** | 400 errors at cutover from a rejected sampling param | Step 2 request-shape diff; a staging replay of real traffic |
| **Tokenizer cost surprise** | Bill rises 20–30% at flat list price | Step 4 delta (b); measure tokens-per-task on the successor during the 5% stage |
| **Alias drift** | "latest" alias migrated a workload with no eval, months before you noticed | Never alias in production; the pin audit greps for aliases too |
| **Calendar denial** | Migration starts 2 weeks before retirement | The monthly watch trigger; deprecation goes on the platform roadmap the day the notice lands |
| **Hyperscaler skew** | First-party migrated; Bedrock deployment quietly on a different clock | Track hyperscaler retirement dates as separate manifest rows |

---

**Cross-references:** [`incident-response-runbook.md`](incident-response-runbook.md) (if it already broke) · [`eval-starter-pack.md`](eval-starter-pack.md) (the certification gate) · [`model-selection-guide.md`](model-selection-guide.md) (successor tiering) · [`cost-calculator.html`](cost-calculator.html) + [`token-budget-governance.md`](token-budget-governance.md) (the money) · [`agent-observability-guide.md`](agent-observability-guide.md) (cutover signals) · [`exit-portability-memo.md`](exit-portability-memo.md) (the same discipline at cross-vendor scale).

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.
