# Data Advisory — How Much Data, and From Where?

**As of 2026-05.** Pin to current model surface (Opus 4.7 / Sonnet 4.6 / Haiku 4.5) — refresh monthly with [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

> Two questions surface before most Claude pilots: *do we have enough data to make this work?* and *where does that data come from?* This file answers both — in sizing terms, not architecture tutorials. Read it alongside [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html) (data readiness axis) and before you commit to a RAG build or eval investment.

---

## How to read this

Each section answers a pre-build sizing question:

- **Threshold** — the number or test that drives the decision
- **Decision trigger** — what changes depending on which side of the threshold you land on
- **Cite / caveat** — primary source when one exists; "rule of thumb" label when it doesn't

Rows marked **(rule of thumb)** reflect field practice, not primary Anthropic documentation. Use them for initial scoping; verify against your actual workload before committing architecture or budget.

---

## 1. Context window: what fits in a single call

All current Claude models (Opus 4.7, Sonnet 4.6, Haiku 4.5) share a 200,000-token context window.

| Material type | Approximate fit in 200K tokens |
|---|---|
| Prose / documents | ~150,000 words · ~500 pages |
| Source code | ~6,000 lines (density-dependent) |
| JSON records | ~15,000 mid-size records (~300 tokens each) |
| Conversation turns | ~400–800 turns (length-dependent) |

**Decision trigger.** If your working reference material fits in 200K tokens *and* is stable across calls, a long-context call may be enough — no RAG pipeline needed. RAG adds retrieval latency, chunking complexity, and an additional failure mode (retrieval misses). Don't build RAG to solve a problem the context window already solves.

**Cite.** [docs.claude.com — models overview](https://docs.claude.com/en/docs/about-claude/models/overview). Token-to-word conversions are rule of thumb (English prose ≈ 0.75 tokens/word).

---

## 2. RAG corpus: when the context window isn't enough

RAG (retrieval-augmented generation) is warranted when one or more of these conditions holds:

| Condition | Threshold | What breaks without RAG |
|---|---|---|
| Material size | > 200K tokens of reference content | Truncation or multi-call patchwork |
| Update frequency | Material changes more often than queries are stable | Stale answers from pinned context |
| Citation tracing | Reader must verify which source span grounded the answer | No span-level attribution without retrieval |
| Multi-tenant isolation | Each user / org has a distinct corpus | Context contamination across tenants |

**Rough corpus sizing (rule of thumb — not primary-cited):**

| Corpus size | Architecture |
|---|---|
| < 200K tokens | Long-context single call — skip RAG |
| 200K – 2M tokens | Chunked semantic retrieval (standard RAG) |
| > 2M tokens, or high-update cadence | Full retrieval pipeline with scheduled corpus refresh |

**Cite.** Architecture rules of thumb from field practice. Verify against your actual retrieval latency + freshness requirements before committing.

---

## 3. Eval corpus sizing

From [`eval-starter-pack.md`](eval-starter-pack.md):

| Eval type | Minimum to start | Grow to | Notes |
|---|---|---|---|
| Regression | 30–80 | 200–500 (when eval is proven valuable) | Block on > 5% pass-rate drop |
| Format compliance | 50–100 | — | Any failure = blocking |
| Tool-call accuracy | 50–150 | — | Per-tool threshold |
| Grounding / hallucination | 50–200 | — | Per-task threshold |
| Adversarial / jailbreak | 30–100 | Refresh quarterly | Advisory |
| Cost-per-task | 100+ (sampled from production) | — | Alert on > 20% regression |
| Latency | 30–50 | — | Alert on > 20% regression on p50/p95 |
| Refusal calibration | 50–100 | — | Advisory |

**Minimum viable eval for a first pilot:** 30-row regression + 50-row format compliance. Full Sonnet 4.6 run via Batch API (50% off) with caching costs under $5. No reason to skip it.

**Decision trigger.** Without at least a 30-row regression eval locked before Week 1, you cannot tell if prompt changes improved or regressed quality — the #2 named failure mode in [`adoption-playbook.md`](adoption-playbook.md).

**Cite.** [`eval-starter-pack.md`](eval-starter-pack.md); [`adoption-playbook.md`](adoption-playbook.md) failure mode #2.

---

## 4. Distillation trigger: when to train a classifier instead

Cross-reference [`anti-use-cases.md`](anti-use-cases.md) §3 (Wrong economics):

| Signal | Threshold | What to do |
|---|---|---|
| Request volume | > 10M req/mo for a rule-extractable classification task | Distill: use Claude to label, then train a small classifier |
| Unit cost target | < $0.001/req | Classical ML or rules — not Claude at any model tier |
| Task complexity | Clearly rules-extractable (spam, intent routing, basic content tier) | Distill; route the ambiguous 20% tail to Claude |

**Training data needed (rule of thumb — not primary-cited):**

- 1K–10K labeled examples for a DistilBERT-class classifier
- Labels can be generated by Claude offline via Batch API (50% off) — send unlabeled samples, get labeled output, human-review 5–10% sample before training
- Below 10M req/mo, direct Claude per-request cost is lower than the distillation overhead. Don't distill prematurely.

**Cite.** [`anti-use-cases.md`](anti-use-cases.md) §3 for the economics threshold. Training data volume is rule of thumb; not primary-cited.

---

## 5. Cache eligibility: what data shape is required

From [`governance-overlay.md §15.1`](governance-overlay.html#15-cost-as-a-governance-constraint):

**Cache floor target:** ≥ 60% hit rate on stable workloads.

**What enables cache hits:**

| Requirement | Detail |
|---|---|
| Stable prefix | System prompt is consistent across requests — no per-request variation in the cached portion |
| Minimum length | System prompt exceeds the cache-eligibility minimum (~1,024 tokens per API behavior — below this, caching overhead doesn't pay back) |
| Variable tail only | Only the per-request portion (user message + dynamic context) varies |

**What kills cache hit rate:**

- Unique system prompt per request (cache floor = 0%)
- Frequently rotating instructions or personalization embedded in the prefix
- Very short system prompts (< ~1K tokens) — not worth caching

**Decision trigger.** If your architecture forces unique system prompts per request, the cost-calculator numbers (which assume ≥ 60% cache) do not apply to your workload. See [`anti-use-cases.md`](anti-use-cases.md) §3 "Cache-hostile workloads" — the re-architecture path is to hoist common context into a stable cached prefix and vary only the tail.

**Cite.** [`governance-overlay.md §15.1`](governance-overlay.html#15-cost-as-a-governance-constraint); [docs.claude.com/en/docs/build-with-claude/prompt-caching](https://docs.claude.com/en/docs/build-with-claude/prompt-caching).

---

## 6. Sources of data

Where does the data for your Claude workload actually come from? Each source has a different fit, governance flag, and freshness profile.

| Source | Best fit for | Governance flag | Key risk |
|---|---|---|---|
| **First-party ops data** — support tickets, call transcripts, internal decisions, historical logs | RAG corpus, eval seed cases, distillation labels | May contain PII / PHI. Scrub before any API call. See [`governance-overlay.md`](governance-overlay.html) §4 (HIPAA) and §5 (residency). | Staleness — ops data from 12+ months ago may reflect superseded policies or edge cases that are no longer representative |
| **Internal knowledge base** — wikis, SOPs, policy docs, code repos, runbooks | RAG corpus, grounding source, Skill prompt context | Usually lower PII risk than ops data, but may contain trade secrets. Verify data classification before loading. | Unstructured format requires a chunking strategy. Stale pages silently degrade answer quality — wire a refresh cadence. |
| **Production traffic (anonymized)** — sampled real requests + responses | Cost eval corpus (100+ tasks), latency eval seeds, regression ground truth | PII scrub before use. Do not send raw logs to the API. Log pipeline required. | Most representative source; also the hardest to access without a proper log and sampling pipeline |
| **Synthetic labels from Claude** — Claude labels a sample; labels train a downstream classifier or seed an eval | Distillation training data, eval annotations | No PII enters the labeling call if you redact first. Run in Batch mode (50% off). | Claude-generated labels can be biased toward Claude's own output style. Human-review 5–10% sample before training. |
| **User feedback signals** — thumbs up/down, explicit corrections, escalations | Eval grounding, quality regression signal | Low PII risk if feedback is sparse and separated from content. | Signal rate is low (1–5% of sessions generate explicit feedback). Supplement with implicit signal: edits to Claude output, task abandonment rate. |
| **Public / licensed datasets** — jailbreak corpora (DAN variants), prompt injection benchmarks | Adversarial eval (30–100 examples, refresh quarterly) | Verify license before use. DAN corpora are typically MIT or CC-licensed. | Jailbreak techniques drift. A corpus from 12+ months ago misses current technique classes. Refresh quarterly minimum. |
| **Claude-generated synthetic test cases** — Claude writes adversarial prompts, edge cases, format variants | Format compliance eval, tool-call accuracy, schema edge cases | No PII risk if prompts are clean. | Synthetic tests are biased toward what Claude can imagine — not what users will actually do. Add human-authored adversarial cases alongside synthetic. |

**Governance check before loading any source.** Answer three questions:

1. Does it contain PII or PHI? → Scrub at gateway before the API call. See [`governance-overlay.md`](governance-overlay.html) §4.
2. Is it covered by a data classification or DLP policy? → Confirm handling path with security / privacy team.
3. Where does inference happen? → Set `inference_geo` if US-only residency is required. See [`governance-overlay.md`](governance-overlay.html) §5.

---

## 7. Pre-pilot data readiness checklist

Before Week 1:

- [ ] Data source(s) identified: which rows in §6 does the use case draw from?
- [ ] Context window vs. RAG decision made: material size + update frequency checked against §1–§2
- [ ] Eval corpus scoped: at minimum 30-row regression + 50-row format compliance (§3)
- [ ] PII / PHI scrub path defined for any source containing regulated data (§6 governance flag)
- [ ] Cache eligibility confirmed: system prompt stable and > ~1K tokens (§5)
- [ ] If volume > 10M req/mo on a rule-extractable task: distillation plan in place (§4)

---

## How this artifact connects to the rest

- [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html) — "data readiness" axis: use §1–§5 to score it.
- [`eval-starter-pack.md`](eval-starter-pack.md) — depth on each eval type; §3 above is the sizing lens, the pack has the template bodies.
- [`anti-use-cases.md`](anti-use-cases.md) — §3 (cache-hostile, distillation trigger, sub-cent budget) maps directly to §4–§5 here.
- [`governance-overlay.md`](governance-overlay.html) — §4 HIPAA + §5 residency are the compliance depth behind the governance flags in §6.
- [`adoption-playbook.md`](adoption-playbook.md) — the pre-pilot checklist in §7 mirrors Week 0 pre-flight requirements.
- [`ai-enablement-ws`](https://github.com/gmanch94/ai-enablement-ws) — vendor-neutral data strategy depth: pipeline architecture, data governance frameworks, catalog patterns.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify pricing/models at anthropic.com.`
