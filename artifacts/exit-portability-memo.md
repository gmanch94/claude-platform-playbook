# Exit & Portability Memo — What Leaving Claude Would Actually Cost

**As of 2026-07.** Pin to current surface — refresh monthly.

Procurement asks it in every enterprise review: *"what if we need to leave?"* [`procurement-pack.md`](procurement-pack.md) answers the sign-side questions; this memo answers the term-side one — component by component, what ports as-is, what ports with rework, what doesn't, and the cheap decisions in week 1 that keep exit viable without sabotaging adoption.

**Read the last section first if you're tempted to architect for exit.** The most expensive outcome isn't lock-in — it's exit-planning theater: a lowest-common-denominator abstraction that forfeits the caching and batch economics the whole cost case rests on, purchased as insurance against an exit that never happens.

---

## The portability ledger

Effort bands are illustrative order-of-magnitude planning figures, not quotes.

| Component | Ports? | Effort band | Notes |
|---|---|---|---|
| **Your data** (documents, KBs, transaction data) | **Yes, as-is** | Near zero | It lives in your stores; Claude reads it at request time. Commercial API defaults to no-train with 30-day retention ([`governance-overlay.md`](governance-overlay.md)) — there is no accumulating vendor-side corpus to extract. |
| **Eval suites** ([`eval-starter-pack.md`](eval-starter-pack.md)) | **Yes, if harness-agnostic** | Days | **The single most valuable exit asset.** A regression suite that scores any model's output re-baselines a successor vendor in days. An eval suite hard-wired to one SDK's response shapes is a rewrite. Build harness-agnostic from day 1 — it costs nothing extra. |
| **MCP servers** ([`mcp-starter-pack.md`](mcp-starter-pack.md)) | **Mostly as-is** | Low | MCP is an open standard ([modelcontextprotocol.io](https://modelcontextprotocol.io)) with adoption beyond Anthropic — verify the current adoption map at decision time rather than assuming. Your server code (the integration work) survives; the client wiring changes. |
| **Prompts + system prompts** | **With rework** | 1–3 weeks per workload | Prompts are tuned to a model's behavior, not just its API. Expect re-tuning and re-evaluation per workload — this is where the eval suite pays for itself. |
| **Skills** ([`claude-code-starter-skills.md`](claude-code-starter-skills.md)) | **With rework** | Days–weeks | Skills are markdown + scripts — the procedure knowledge ports as documentation anywhere. Invocation semantics and tool references are Claude-specific. |
| **Agent orchestration** (Agent SDK, sub-agents, hooks) | **With rework** | Weeks per workload | The *pattern* ([`multi-agent-patterns.md`](multi-agent-patterns.md)) is portable; the implementation is SDK-specific. Hooks and settings are Claude Code-specific but their governance logic (block-secrets, audit log) re-implements anywhere. |
| **Caching + batch architecture** | **Concept only** | Re-derive | Cache pricing, TTLs, and minimum-prompt floors are vendor-specific. A workload shaped around Claude's cache economics (60–80% steady-state reduction vs naive use — the repo's modeled band, per [`cost-calculator.html`](cost-calculator.html)) needs its economics re-modeled, not just re-pointed. |
| **Seat-surface workflows** (Projects, Cowork, Tag) | **Low** | Rebuild | Org knowledge in Projects is file-based — you hold the source files; the workflows around them (sharing, folder scopes, channel wiring) rebuild on whatever replaces them. |
| **Model weights / fine-tunes** | **Largely N/A** | — | No first-party fine-tuning offering in the current platform surface — Claude customization lives in the context layer (prompts, skills, MCP, RAG), so there's no weights artifact to abandon. Verify hyperscaler catalogs before relying on this (fine-tuning has appeared there historically). Consequence: the eval suite, not a weights artifact, is your exit asset. |

---

## The hedges, honestly graded

| Hedge | What it actually buys | What it doesn't |
|---|---|---|
| **Bedrock / Vertex / Azure AI Foundry procurement** ([`docs/feature-inventory.md`](../docs/feature-inventory.md) procurement paths) | Billing, contracting, and infrastructure diversification — real value for procurement leverage and cloud-commit drawdown | **Not model diversification.** It's the same Anthropic models behind a different bill. If the exit scenario is "Anthropic," a hyperscaler path doesn't hedge it; if the scenario is "commercial terms," it does. |
| **LLM gateway / abstraction layer** ([`reference-architectures.html`](reference-architectures.html)) | Config-level model swap for *simple* request/response workloads; central metering | A tax on every Claude-specific capability: adaptive thinking, cache semantics, tool-use shapes, context handling all flatten to the lowest common denominator. The gateway also becomes the metering chokepoint — done badly it breaks the per-workspace attribution [`token-budget-governance.md`](token-budget-governance.md) depends on. |
| **Multi-vendor from day 1** | Genuine model optionality | Doubles eval, prompt, and ops surface before you've proven value on one. Defensible at scale (L3+ on [`maturity-model.md`](maturity-model.md)); premature at pilot stage. |

---

## Week-1 actions that keep exit cheap (without blocking anything)

1. **Version prompts in the repo**, not in dashboards or heads. An exit inventory that starts with "find all the prompts" is already weeks behind.
2. **Build evals harness-agnostic** — model-in, score-out, no SDK response shapes in the scoring path.
3. **Tag Claude-specific dependencies in code** (a grep-able marker on cache-shaped flows, adaptive-thinking params, tool-use shapes). The exit estimate is then a grep, not an archaeology dig.
4. **Capture the export path at signing** — data export, deletion on termination, retention terms. [`procurement-pack.md`](procurement-pack.md) carries the checklist; verify at signing, don't assume.
5. **Keep the cost model per-workload** ([`cost-calculator.html`](cost-calculator.html)) so the re-platforming cost of any single workload is computable on demand.

Total cost of the five: near zero. That's the point — the cheap version of exit-readiness is discipline, not architecture.

---

## Failure modes

| Failure | What it looks like | Counter |
|---|---|---|
| **Exit-planning theater** | Six weeks of gateway architecture before the first pilot ships | The five week-1 actions above are the whole pre-L3 exit budget |
| **Premature abstraction** | Every workload forced through a vendor-neutral wrapper; caching savings quietly forfeited | Abstract per-workload, and only the simple ones; let agentic workloads use the platform natively |
| **"Bedrock = exit" fallacy** | Vendor-concentration risk marked mitigated because procurement is diversified | Name which risk each hedge covers: commercial terms vs model dependency |
| **Evals as afterthought** | Exit estimate balloons because nothing can certify a successor | Harness-agnostic evals from day 1 — also required by [`model-deprecation-runbook.md`](model-deprecation-runbook.md) for same-vendor migrations |
| **Unpriced exit clause theater** | A contractual exit right nobody has costed operationally | This memo's ledger, kept current, *is* the costing |

---

**Cross-references:** [`procurement-pack.md`](procurement-pack.md) (sign-side asks) · [`build-vs-buy-worksheet.html`](build-vs-buy-worksheet.html) (the decision this hedges) · [`governance-overlay.md`](governance-overlay.md) (retention + vendor concentration) · [`model-deprecation-runbook.md`](model-deprecation-runbook.md) (the same discipline, same-vendor scale) · [`reference-architectures.html`](reference-architectures.html) (gateway pattern).

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.
