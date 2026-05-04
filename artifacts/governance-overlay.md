# Claude Governance Overlay

**As of 2026-05.** Pin to current model surface (Opus 4.7 / Sonnet 4.6 / Haiku 4.5) — refresh monthly. See [`../docs/feature-inventory.md`](../docs/feature-inventory.md) for canonical feature + status list.

This is a **risk + compliance overlay** — not a generic AI governance framework. It tells you what changes when your AI runs on Claude specifically, and where the standard NIST / EU AI Act controls map onto Claude's surface.

> ⚠ **Verification posture.** No-train terms, BAA scope, data residency options, and pricing all drift. Anything below cited as a fact must be re-verified at signing time and quarterly thereafter. Treat this as a checklist of *questions to confirm*, not a guarantee of state.

> 🛑 **Read first:** [`anti-use-cases.md`](anti-use-cases.md). This overlay tells you how to govern a Claude deployment that *should* exist. The anti-use list tells you which deployments shouldn't exist in the first place — sole-decider on regulated decisions, prompt-injection-exposed agents, missing BAA / DPA paths. Run that filter before designing controls.

---

## 1. Data flow taxonomy — what leaves your network

| Workload | What leaves | What stays | Destination |
|---|---|---|---|
| Direct API call | Prompt + tool definitions + tool results + uploaded Files | Your VPC, DBs, source systems | `api.anthropic.com` |
| Bedrock-routed call | Same prompt content | Same | AWS region you specify |
| Vertex-routed call | Same prompt content | Same | GCP region you specify |
| Computer use 2.0 loop | Screenshots + action descriptions | The host machine binaries | Anthropic API |
| Agent SDK / MCP | Tool input + tool output | Tool internals (DB credentials, full record set unless retrieved) | Anthropic API |
| Files API upload | The uploaded file content | The original file in your storage (only a copy moves) | Anthropic Files store |
| Memory tool reads/writes | Memory blob content | Other process state | Anthropic memory store |

**Implication for design:** the prompt is the trust boundary. Anything in the prompt is on Anthropic's infra for the duration of the request (and longer if you use Files API or memory tool). Architect tool layers so they retrieve only what the model needs to see.

---

## 2. No-train guarantee

**Default for paid API + Console workloads:** Anthropic does not train on customer prompts or outputs.

**What to verify before relying on this:**
1. Sign with the policy version current at signing time. Record the version + URL + date.
2. Confirm that all entry points your traffic uses inherit the same policy. Bedrock and Vertex inherit through their respective agreements.
3. Re-verify quarterly. Terms can be amended.
4. Treat consumer-tier products (e.g., free chat) as a **separate** policy surface — they may have different defaults.

**Audit evidence to retain:**
- Signed agreement + date
- Policy version captured at signing (PDF or markdown)
- Quarterly re-check log (1 line per quarter, signed off by counsel)

---

## 3. BAA / HIPAA paths

For PHI workloads:
- **Available** via direct procurement; verify scope at signing
- BAA is workload-specific — covers what you signed for, not arbitrary Claude usage company-wide
- Confirm the BAA covers: API calls, Files API uploads, batch jobs, memory tool storage (these are separate sub-services in some agreements)
- Bedrock + Vertex have their own BAA paths; do not assume they inherit Anthropic's BAA

**Common gap:** BAA covers the API but not the auxiliary stores (Files, memory). Re-verify each before storing PHI in those surfaces.

---

## 4. EU AI Act mapping

EU AI Act sorts AI systems into 4 risk classes. Claude (the model) is a general-purpose AI (GPAI). **Your application** is what gets classified — Anthropic carries GPAI-provider obligations, you carry deployer / provider obligations for the application.

| Risk class | Examples | Your obligations | What Claude features help |
|---|---|---|---|
| Prohibited | Social scoring, real-time biometric ID in public | n/a — don't build | n/a |
| High-risk | Hiring, credit, education access, critical infra, law enforcement | Risk mgmt system, data governance, technical docs, transparency, human oversight, accuracy/robustness, post-market monitoring | Citations, audit logging, eval suite, human-in-the-loop checkpoints, model version pinning |
| Limited-risk | Chatbots, deepfakes, emotion-recognition | Transparency: tell users they're interacting with AI | Standard system prompt disclosure |
| Minimal-risk | Most internal copilots, code assist, batch enrichment | Voluntary codes of conduct | n/a |

**Your responsibility split:**
- *Provider* obligations (registration, conformity assessment, post-market monitoring) attach if you build the high-risk system
- *Deployer* obligations (human oversight, data input quality, monitoring) attach if you deploy a high-risk system
- *GPAI* obligations (technical documentation of foundation model) sit with Anthropic — you can request the GPAI documentation package for your conformity assessment

---

## 5. NIST AI RMF mapping (Govern / Map / Measure / Manage)

| NIST function | Claude artifact in this repo | Your local responsibility |
|---|---|---|
| **Govern** | [`adoption-playbook.md`](adoption-playbook.md) Week 0 — sponsor, policies, RACI, risk register | Maintain the register. Quarterly review. |
| **Map** | [`feature-decision-matrix.html`](feature-decision-matrix.html), [`reference-architectures.html`](reference-architectures.html) | Document context, intended use, users, data flow per use case. |
| **Measure** | Eval suite (this overlay §6), cost dashboards | Pre-deploy eval, ongoing accuracy + cost monitoring, red team |
| **Manage** | Kill switch, model rollback runbook, incident process | Test the rollback. Run incident drills. |

---

## 6. Audit trail — what to log

Per request, capture:
- Request ID
- User ID (authenticated identity, not just IP)
- Model + model version (e.g., `claude-sonnet-4-6`)
- Full prompt (system + messages + tool defs + retrieved context)
- Full response (including thinking blocks if extended thinking enabled)
- Tool calls + tool results
- Latency (p50 / p95 / p99 across the loop, not just terminal call)
- Token counts (input / cache read / cache write / output)
- Cost (computed)
- Refusal / safety filter triggered (boolean + reason)
- Citation metadata (source doc IDs)
- Eval result if request was an eval

**Retention default:** 90 days hot, 1–7 years cold based on workload class. Healthcare, finance, regulated public sector trend toward 7+ years.

**PII handling:** redact in storage if not required for audit purpose. Log the redaction event, not the redacted content.

**Where this matters:** EU AI Act high-risk systems must produce an automatic event log; NIST AI RMF Manage requires monitoring; SOC 2 audit requires consistency between logged behavior and stated policy.

**For Claude Code (CLI) workloads:** the `audit-log-append` and `pii-scrub-prompt` hooks in [`hooks-starter-pack.md`](hooks-starter-pack.md) are how this control lands at the engineer's machine. Local-file mode is pilot-only — production audit needs append-only storage (S3 with object-lock, write-only logging endpoint) so engineers can't edit their own audit trail.

---

## 7. Prompt + Skill versioning + rollback

Prompts and Skills are configuration of the AI system. Treat with the same rigor as a database migration.

| Practice | Default | Why |
|---|---|---|
| Source-controlled | Mandatory | Without git history, you cannot prove what was deployed when. |
| Tagged with eval pass rate | Mandatory | Lets you reject regressions before they ship. |
| Versioned identifier in API request | Recommended | Captured in audit log → answers "what prompt produced this output?" |
| Last-known-good rollback path | Mandatory | Rollback from a regression must take minutes, not hours. |
| Change review required | Mandatory | Same gate as a schema change. |
| Eval-gated CI | Mandatory | No prompt change merges without eval pass. |

**Model version handling:** Pin to a specific model version (e.g., `claude-sonnet-4-6`) in production. When Anthropic releases a new revision, the model bump is its own change with its own eval gate. Never use floating "latest" aliases in production.

---

## 8. Retention + deletion

Inventory of where Claude-touched data lives:

| Surface | Retained where | Default retention | Deletion path |
|---|---|---|---|
| API requests | Anthropic logs (per privacy policy) | Per current policy version — verify | API key rotation, deletion request per privacy policy |
| Files API | Anthropic Files store | Until user deletes | Files API delete call |
| Memory tool blobs | Anthropic memory store | Until user deletes | Memory tool delete operation |
| Batch jobs | Anthropic batch store | Per current policy — verify | Per policy + key rotation |
| Your audit logs | Your storage | Per your retention policy | Your deletion process |

**GDPR right to erasure:** for EU subjects, the deletion path must reach all surfaces above + your audit logs (with documented exceptions for legal-hold). Run a "delete drill" quarterly — pick a synthetic user ID, prove it's gone everywhere.

---

## 9. Vendor concentration risk + multi-model abstraction

The "what if Anthropic disappears?" question. Real answer:
- Disappearing is unlikely; **service degradation** (price changes, outage, model deprecation) is the realistic risk
- Pre-building a 3-model fallback you never test is worse than no fallback — it gives false confidence and rots
- Build the abstraction at the **call site**, not the model — your business logic should depend on a small, stable interface (`generate(messages, tools)`), not on Claude SDK shape
- Validate the abstraction by running a **periodic shadow test** with a second model (OpenAI / open-source) on a small subset of traffic, comparing eval pass rate — this is the real signal that the abstraction works

| Mitigation tier | Effort | When justified |
|---|---|---|
| Stable internal SDK shape | Low — write once | Always |
| Procurement diversity (Bedrock or Vertex available alongside direct) | Medium | Regulated industries, hyperscaler commits |
| Periodic shadow eval with alternate model | Medium-high | High-stakes workloads, board-level concentration concern |
| Hot multi-model failover | Very high — accuracy + cost ladder differs per model | Rarely justified — usually theater |

**Anti-pattern:** building a "model-agnostic" wrapper that strips features (no caching, no tool use, no thinking) so it works across vendors. Net effect: you're paying full price for naive use. See [`cost-calculator.html`](cost-calculator.html) for the cost of going naive.

---

## 10. IP, training data, and output ownership

**Training data on Claude itself:** Anthropic's training data composition is publicly disclosed at a high level — review their model card / GPAI documentation when scoping IP-sensitive workloads.

**Outputs:** Per current Anthropic terms (verify version), customer owns outputs. But:
- Outputs may overlap with public training material — same as any LLM
- Outputs are not patentable / copyrightable as-is in most jurisdictions
- For commissioned content, validate against your existing IP policy

**Your input data:** stays yours. No-train is the operative protection here (see §2).

**Licensed content as input:** if you upload third-party copyrighted content via Files API or in prompts, your existing license must cover the copy that goes to Anthropic for processing. Review per workload.

---

## 11. Prompt injection + content safety

Claude has built-in safety and refusal behavior, but **prompt injection** is your problem to solve at the application layer. Patterns:

| Pattern | Purpose |
|---|---|
| Separate trusted vs untrusted content in the prompt structure | Clear boundary the model can defend |
| Treat tool results as untrusted | An MCP-returned blob could carry an injection — see [`mcp-starter-pack.md`](mcp-starter-pack.md) for read-only-by-design server templates with redaction at the server layer |
| Sandboxed tool execution | If the agent can run code, sandbox the runtime |
| Output validation | Schema-check structured outputs; reject malformed |
| Content filtering on outputs | Reject PII / unsafe content before exposure |
| Red team eval set | Adversarial inputs in CI |

**Computer use 2.0 specific:** the model sees and acts on a live UI — a malicious page can attempt injection via on-screen text. Run computer use only against trusted targets, or in an isolated environment with no access to sensitive credentials.

---

## 12. Cost as a governance constraint

Most readers come at cost via [`cost-calculator.html`](cost-calculator.html) — model the spend, get a number, move on. That treats cost as a *curiosity* rather than a *constraint*. In production, cost behaves like any other governance gate: it has a threshold, a kill-switch, and an early-warning signal. If those three aren't defined before pilot launch, "cost surprise" stays on the risk register as a named adoption playbook failure mode (see [`adoption-playbook.md`](adoption-playbook.md)).

This section names the gates. Run [`cost-calculator.html`](cost-calculator.html) to find your numbers; record the four thresholds below in your Week 0 pilot charter.

### 12.1 Four numeric gates to define before launch

| Gate | What it caps | How to set | What triggers when breached |
|---|---|---|---|
| **$/task ceiling** | Per-request cost at production token mix + cache hit rate. | Take the cost-calculator output for your steady-state assumptions. Set ceiling at 1.5× — leaves headroom for prompt growth, fails loud if real volume diverges from model. | Hard-stop in the application; alert the use-case owner. |
| **$/day cap** | Total daily spend across the workload. | (Expected daily volume × $/task ceiling). Round up to a number you can defend in a Slack message at 2am. | Auto-throttle at 80% of cap; auto-disable at 100%. Wire `log-cost` hook (see [`hooks-starter-pack.md`](hooks-starter-pack.md)) to billing alerts. |
| **Cache hit-rate floor** | Minimum sustained cache hit rate across the workload. | Production cache reuse should be ≥ 60% on stable workloads (RAG, agentic, embedded copilot). If hit rate drops below floor, prompts have probably drifted. | Alert; bisect last week's prompt changes; if a Skill or system prompt rotated, that's the cause. |
| **Batch eligibility floor** | % of eligible workload running through Batch API instead of real-time. | Any non-interactive task should target ≥ 80% batch eligibility. If the workload could run async but is using real-time, you're paying 2× without justification. | Quarterly review; re-platform stale real-time loops to batch. |

These gates are not soft. The point of a governance constraint is that breaching it is an *event* — logged, alerted, owned — not a budget overrun discovered three months later in a finance review.

### 12.2 Why cost is a governance question, not a finance question

Three reasons it lives here, not in the calculator alone:

1. **Bound to compliance posture.** Cost spikes correlate with prompt-injection attempts (a malicious input can inflate output tokens 100×), runaway agent loops (agentic patterns can recurse on tool errors), and cache invalidation incidents. Treating cost as a security signal — not just a budget line — catches these earlier.
2. **Bound to vendor concentration.** A 10× cost spike on a single procurement path (direct API) without an alternative path (Bedrock / Vertex / open-source fallback) is a vendor-concentration *and* a budget incident. See [`§9 Vendor concentration risk`](#9-vendor-concentration-risk--multi-model-abstraction).
3. **Bound to audit trail.** A breach of the $/day cap is an audit event. Log: which use case, which model, which prompt, what triggered the throttle. Wire to the same audit pipeline as no-train + BAA evidence (see [`§6 Audit trail`](#6-audit-trail--what-to-log)).

### 12.3 Anti-pattern — "we'll watch the bill monthly"

Monthly billing review is not a governance gate. Cloud cost discipline learned this 10 years ago: by the time the invoice arrives, the bad week has already happened, the runaway loop has already burned the budget, and the post-mortem points at a hook that should have existed. Same lesson, same fix:

- Daily cap, not monthly review.
- Hook-enforced, not invoice-discovered.
- Owner-on-call, not "the AI committee."

If your pilot doesn't have a daily $ cap with auto-throttle wired before Week 1, [`anti-use-cases.md`](anti-use-cases.md) Wrong-economics row "Pilot with no defined volume cap or kill-switch" applies — go fix that before continuing.

### 12.4 What good looks like

A well-governed Claude workload has, on Week 1 of pilot:

- Four gate numbers in the pilot charter ($/task, $/day, cache floor, batch floor)
- `log-cost` hook (or equivalent) wired to billing alerts at 50% / 80% / 100% of $/day cap
- Auto-throttle at 80%, auto-disable at 100%
- One named owner who gets the alert
- Quarterly review where the four gate numbers get re-set against actual production data — not the launch estimate

Workloads without those five elements aren't ungoverned because someone forgot — they're ungoverned because cost wasn't classified as a governance question. This section reclassifies it.

---

## 13. Companion artifacts

- [`adoption-playbook.md`](adoption-playbook.md) — 90-day rollout
- [`feature-decision-matrix.html`](feature-decision-matrix.html) — per-pattern feature picks
- [`reference-architectures.html`](reference-architectures.html) — diagrams + stack notes
- [`cost-calculator.html`](cost-calculator.html) — cost modeling
- [`build-vs-buy-worksheet.html`](build-vs-buy-worksheet.html) — Claude vs alternatives
- [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) — engineering team rollout
- [`hooks-starter-pack.md`](hooks-starter-pack.md) — operationalizes audit log + PII scrub + branch guard for Claude Code
- [`mcp-starter-pack.md`](mcp-starter-pack.md) — read-only MCP server templates; §1 data flow + §11 prompt injection apply (server returns are untrusted)
- [`eval-starter-pack.md`](eval-starter-pack.md) — adversarial + refusal calibration evals tie to NIST AI RMF *Measure*
- [`../docs/feature-inventory.md`](../docs/feature-inventory.md) — canonical feature + status list

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify all status claims at anthropic.com + docs.claude.com.`
