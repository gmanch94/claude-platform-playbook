# Claude Governance Overlay

**As of 2026-05.** Pin to current model surface (Opus 4.7 / Sonnet 4.6 / Haiku 4.5) — refresh monthly. See [`../docs/feature-inventory.md`](../docs/feature-inventory.md) for canonical feature + status list.

This is a **risk + compliance overlay** — not a generic AI governance framework. It tells you what changes when your AI runs on Claude specifically, and where the standard NIST / EU AI Act controls map onto Claude's surface.

> ⚠ **Verification posture.** No-train terms, ZDR scope, BAA per-feature eligibility, data residency options, retention defaults, and pricing all drift. Anything below cited as a fact must be re-verified at signing time and quarterly thereafter. Treat this as a checklist of *questions to confirm*, not a guarantee of state. Primary sources cited inline; verify against current versions at [`docs.claude.com`](https://docs.claude.com), [`privacy.claude.com`](https://privacy.claude.com), and the [Trust Portal](https://trust.anthropic.com).

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

**Default for commercial API + Console workloads:** Anthropic does not train on customer prompts or outputs. Source: [Anthropic privacy policy](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training).

**What to verify before relying on this:**
1. Sign with the policy version current at signing time. Record the version + URL + date.
2. Confirm that all entry points your traffic uses inherit the same policy. Bedrock and Vertex inherit through their respective agreements.
3. Re-verify quarterly. Terms can be amended.
4. **Consumer-tier products (Free, Pro, Max) are a separate policy surface** with different defaults — do not extend commercial no-train assumptions to consumer plans, including when consumer accounts use Claude Code.

**Audit evidence to retain:**
- Signed agreement + date
- Policy version captured at signing (PDF or markdown)
- Quarterly re-check log (1 line per quarter, signed off by counsel)

**Note on no-train vs. no-store:** The default no-train guarantee does **not** mean Anthropic doesn't store your data. Standard retention is 30 days at rest (see §11). To eliminate at-rest storage entirely, see §3 (Zero Data Retention).

---

## 3. Zero Data Retention (ZDR)

ZDR is a **separate enterprise agreement** distinct from no-train. Source: [Anthropic ZDR docs](https://platform.claude.com/docs/en/build-with-claude/api-and-data-retention) (verify current version).

**What ZDR changes:** customer prompts and responses are not stored at rest after the API response is returned, except where required to comply with law or combat misuse.

**What ZDR does NOT remove:** User Safety classifier results — Anthropic still retains these to enforce the [Usage Policy](https://www.anthropic.com/legal/aup), even under a ZDR agreement.

**Eligibility and scope:**
- Enterprise API customers, **subject to Anthropic approval** — not self-serve. Contact sales.
- **Covered surfaces:** Messages API (`/v1/messages`), Token Counting API, Claude Code when used with a Commercial organization API key (or via Claude Enterprise with ZDR enabled).
- **Not covered:** Claude Free / Pro / Max plans; Claude Teams and Claude Enterprise product UIs (chat, projects) — exception: Claude Code via Claude Enterprise with ZDR enabled. Third-party integrations are not ZDR-eligible (review their terms separately).
- **Per-feature eligibility:** features are marked Yes / Yes (qualified) / No in Anthropic's eligibility table. "Yes (qualified)" means narrow technical retention is required for the feature to function — review the table at signing for each feature you use.

**Mis-decision watch:**
- Assuming ZDR is implied by the standard API contract — it is not. Without an explicit ZDR agreement, 30-day retention applies (see §11).
- Assuming ZDR auto-extends to a UI-based Enterprise workflow because the org has ZDR — only the API surfaces and Claude Code are covered.
- Confusing ZDR with no-train — they are distinct guarantees. Standard no-train applies regardless of ZDR.

**Audit evidence to retain:** signed ZDR agreement + amendment date; per-feature eligibility table version captured at signing; list of API endpoints + Claude Code workspaces in scope.

---

## 4. HIPAA / BAA paths

**Two paths to HIPAA-ready use:**

1. **HIPAA-ready API access (without ZDR)** — Anthropic now supports HIPAA-ready API integrations without a ZDR prerequisite. The Claude API enforces feature eligibility automatically: a HIPAA-enabled organization that sends a request with a non-eligible feature receives a `400` error explicitly naming the disallowed feature. Source: [API and data retention](https://platform.claude.com/docs/en/build-with-claude/api-and-data-retention#hipaa-readiness).
2. **HIPAA-ready services + signed BAA** — for production PHI workloads. Anthropic provides a BAA covering HIPAA-ready services across the first-party API and Enterprise plans, after review of compliance items and use case. Source: [BAA article](https://privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers).

**What the BAA covers (first-party API features marked eligible at the time of signing — verify the [Implementation Guide](https://trust.anthropic.com/) at signing):**

| API surface | BAA-covered |
|---|---|
| Messages API, Token Counting, Models API, Org Management API | Covered |
| Web search tool | Covered |
| Memory tool | Covered |
| Prompt caching, Structured outputs | Covered |
| Bash tool | Covered |
| Web fetch tool | Not covered |
| Advisor tool | Not covered |
| Code execution tool | Not covered (and network access excluded even where the surrounding feature is covered) |

**What the BAA does NOT cover (product surface):**
- Workbench, Console (use the API directly with a HIPAA-enabled org instead)
- Claude Free, Pro, Max, Team plans
- Beta features (e.g., Cowork, Claude for Office at the time of writing)

**PHI handling rules carried over from Anthropic's HIPAA configuration:**
- Patient-specific information must appear **only in message content** (where HIPAA safeguards apply)
- Patient-specific data must NOT appear in: schema property names, `enum` values, `const` values, or `pattern` regular expressions in structured-output schemas

**Common gaps to confirm before going live with PHI:**
- Bedrock + Vertex have their own BAA paths through AWS / GCP — do not assume they inherit Anthropic's BAA
- Per-feature scope can change as Anthropic adds eligibility for additional features — re-verify at each model or feature surface change
- Claude Code + Skills + MCP servers + Plugins compose third-party surface area; the BAA does not extend to your MCP servers or to data they fetch

---

## 5. Data residency

Two **independent** controls determine where data is processed and stored. Source: [Data residency docs](https://platform.claude.com/docs/en/build-with-claude/data-residency).

| Control | Scope | Set via | Values |
|---|---|---|---|
| **`inference_geo`** | Per-request — controls where model inference runs | API parameter on `POST /v1/messages` (or workspace default) | `"global"` (default — any geo) · `"us"` (US-only) |
| **Workspace geo** | Workspace-level — controls at-rest storage and endpoint processing (image transcoding, code execution, etc.) | Console workspace setting | Per Anthropic Console workspace configuration |

**Key constraints:**
- `inference_geo` is supported on **Opus 4.6 and later models**. Older models return a `400` error if the parameter is set.
- `inference_geo` is **first-party API only** — on Bedrock and Vertex, geographic processing is determined by the AWS region or GCP region you choose, not by this parameter.
- Claude Managed Agents do **not** support `inference_geo`, but do respect Workspace geo.
- The API response's `usage.inference_geo` field reports where inference actually ran — log this for residency audit evidence (see §9).

**Mis-decision watch:**
- Treating `inference_geo: "us"` as a substitute for a workspace-geo policy. Inference geo controls where the model **runs**; workspace geo controls where data is **stored**. Both must be set for an end-to-end US-only posture.
- Assuming Bedrock / Vertex regions inherit `inference_geo` semantics. They do not — those paths are governed by the hyperscaler's region choice, with their own residency commitments.

---

## 6. Compliance certifications

Anthropic's current certification posture (as of 2026-05; verify at [Trust Portal](https://trust.anthropic.com/)):

| Certification | Status | Notes |
|---|---|---|
| HIPAA-ready configuration (BAA available) | Held | See §4. Per-feature scope. |
| ISO 27001:2022 | Held | Information Security Management. |
| ISO/IEC 42001:2023 | Held | AI Management Systems — AI-specific certification, distinct from generic InfoSec. Important for procurement teams that need an AI-governance attestation alongside SOC 2. |
| SOC 2 Type I & Type II | Held | Annual refresh. Request current report from Trust Portal before audit. |

**Audit evidence to retain:** Trust Portal report PDFs at the version current at procurement; refresh annually; map each cert to which of your internal controls it underwrites (don't double-document what the cert already covers).

---

## 7. EU AI Act mapping

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

## 8. NIST AI RMF mapping (Govern / Map / Measure / Manage)

| NIST function | Claude artifact in this repo | Your local responsibility |
|---|---|---|
| **Govern** | [`adoption-playbook.md`](adoption-playbook.md) Week 0 — sponsor, policies, RACI, risk register | Maintain the register. Quarterly review. |
| **Map** | [`feature-decision-matrix.html`](feature-decision-matrix.html), [`reference-architectures.html`](reference-architectures.html) | Document context, intended use, users, data flow per use case. |
| **Measure** | Eval suite ([`eval-starter-pack.md`](eval-starter-pack.md)), audit trail (§9), cost dashboards (§15) | Pre-deploy eval, ongoing accuracy + cost monitoring, red team |
| **Manage** | Kill switch, model rollback runbook, incident process | Test the rollback. Run incident drills. |

---

## 9. Audit trail — what to log

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

## 10. Prompt + Skill versioning + rollback

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

## 11. Retention + deletion

**Anthropic-side retention defaults (commercial API, no ZDR).** Source: [How long does Anthropic store organization data](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data) — last updated by Anthropic 2026-03-16; verify current.

| Class of data | Default retention | Notes |
|---|---|---|
| **Inputs and outputs (standard)** | **30 days** at rest, then auto-deleted | Backend deletion. Resets on new request. |
| **Inputs and outputs (AUP-flagged)** | Up to **2 years** | Triggered by Trust & Safety classifier hit. |
| **Trust & Safety classifier scores** | Up to **7 years** | Retained even under ZDR (see §3). |
| **Feedback data** (thumbs up/down, bug reports) | **5 years** | Tied to the feedback submission. |
| **Files API content** | Until user deletes | Lives longer than 30 days because retention is user-controlled. |
| **Memory tool blobs** | Per Anthropic memory tool docs | Client-side memory storage; you control retention via memory operations. |
| **Console / Workbench saved chats** | Until user deletes (within 30 days of deletion request) | Not BAA-covered. |

**Override paths:** Zero Data Retention agreement (§3) eliminates the 30-day storage for eligible API surfaces. AUP / legal compliance overrides ZDR for misuse classifier data. Custom retention controls are available on Enterprise plans — see Anthropic's [custom retention article](https://privacy.claude.com/en/articles/10440198-configure-custom-data-retention-controls-for-enterprise-plans).

**Where Claude-touched data lives — your-side inventory:**

| Surface | Retained where | Default retention | Deletion path |
|---|---|---|---|
| API requests (no ZDR) | Anthropic logs | 30 days, then auto-delete | Auto. ZDR removes the 30-day window. |
| API requests (with ZDR) | Not stored at rest | n/a (T&S classifier scores retained — see above) | n/a |
| Files API | Anthropic Files store | Until user deletes | Files API delete call |
| Memory tool blobs | Per memory tool config | Until user deletes | Memory tool delete operation |
| Batch jobs | Anthropic batch store | Per current policy — verify | Per policy + key rotation |
| Your audit logs | Your storage | Per your retention policy | Your deletion process |

**GDPR right to erasure:** for EU subjects, the deletion path must reach all surfaces above + your audit logs (with documented exceptions for legal-hold + AUP-flagged data + the 7-year T&S classifier scores). Run a "delete drill" quarterly — pick a synthetic user ID, prove it's gone everywhere it can be removed; document where it can't.

---

## 12. Vendor concentration risk + multi-model abstraction

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

## 13. IP, training data, and output ownership

**Training data on Claude itself:** Anthropic's training data composition is publicly disclosed at a high level — review their model card / GPAI documentation when scoping IP-sensitive workloads.

**Outputs:** Per current Anthropic terms (verify version), customer owns outputs. But:
- Outputs may overlap with public training material — same as any LLM
- Outputs are not patentable / copyrightable as-is in most jurisdictions
- For commissioned content, validate against your existing IP policy

**Your input data:** stays yours. No-train (§2) and ZDR (§3) are the operative protections; storage retention is governed by §11.

**Licensed content as input:** if you upload third-party copyrighted content via Files API or in prompts, your existing license must cover the copy that goes to Anthropic for processing. Review per workload.

---

## 14. Prompt injection + content safety

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

## 15. Cost as a governance constraint

Most readers come at cost via [`cost-calculator.html`](cost-calculator.html) — model the spend, get a number, move on. That treats cost as a *curiosity* rather than a *constraint*. In production, cost behaves like any other governance gate: it has a threshold, a kill-switch, and an early-warning signal. If those three aren't defined before pilot launch, "cost surprise" stays on the risk register as a named adoption playbook failure mode (see [`adoption-playbook.md`](adoption-playbook.md)).

This section names the gates. Run [`cost-calculator.html`](cost-calculator.html) to find your numbers; record the four thresholds below in your Week 0 pilot charter.

### 15.1 Four numeric gates to define before launch

| Gate | What it caps | How to set | What triggers when breached |
|---|---|---|---|
| **$/task ceiling** | Per-request cost at production token mix + cache hit rate. | Take the cost-calculator output for your steady-state assumptions. Set ceiling at 1.5× — leaves headroom for prompt growth, fails loud if real volume diverges from model. | Hard-stop in the application; alert the use-case owner. |
| **$/day cap** | Total daily spend across the workload. | (Expected daily volume × $/task ceiling). Round up to a number you can defend in a Slack message at 2am. | Auto-throttle at 80% of cap; auto-disable at 100%. Wire `log-cost` hook (see [`hooks-starter-pack.md`](hooks-starter-pack.md)) to billing alerts. |
| **Cache hit-rate floor** | Minimum sustained cache hit rate across the workload. | Production cache reuse should be ≥ 60% on stable workloads (RAG, agentic, embedded copilot). If hit rate drops below floor, prompts have probably drifted. | Alert; bisect last week's prompt changes; if a Skill or system prompt rotated, that's the cause. |
| **Batch eligibility floor** | % of eligible workload running through Batch API instead of real-time. | Any non-interactive task should target ≥ 80% batch eligibility. If the workload could run async but is using real-time, you're paying 2× without justification. | Quarterly review; re-platform stale real-time loops to batch. |

These gates are not soft. The point of a governance constraint is that breaching it is an *event* — logged, alerted, owned — not a budget overrun discovered three months later in a finance review.

### 15.2 Why cost is a governance question, not a finance question

Three reasons it lives here, not in the calculator alone:

1. **Bound to compliance posture.** Cost spikes correlate with prompt-injection attempts (a malicious input can inflate output tokens 100×), runaway agent loops (agentic patterns can recurse on tool errors), and cache invalidation incidents. Treating cost as a security signal — not just a budget line — catches these earlier.
2. **Bound to vendor concentration.** A 10× cost spike on a single procurement path (direct API) without an alternative path (Bedrock / Vertex / open-source fallback) is a vendor-concentration *and* a budget incident. See [`§12 Vendor concentration risk`](#12-vendor-concentration-risk--multi-model-abstraction).
3. **Bound to audit trail.** A breach of the $/day cap is an audit event. Log: which use case, which model, which prompt, what triggered the throttle. Wire to the same audit pipeline as no-train + BAA evidence (see [`§9 Audit trail`](#9-audit-trail--what-to-log)).

### 15.3 Anti-pattern — "we'll watch the bill monthly"

Monthly billing review is not a governance gate. Cloud cost discipline learned this 10 years ago: by the time the invoice arrives, the bad week has already happened, the runaway loop has already burned the budget, and the post-mortem points at a hook that should have existed. Same lesson, same fix:

- Daily cap, not monthly review.
- Hook-enforced, not invoice-discovered.
- Owner-on-call, not "the AI committee."

If your pilot doesn't have a daily $ cap with auto-throttle wired before Week 1, [`anti-use-cases.md`](anti-use-cases.md) Wrong-economics row "Pilot with no defined volume cap or kill-switch" applies — go fix that before continuing.

### 15.4 What good looks like

A well-governed Claude workload has, on Week 1 of pilot:

- Four gate numbers in the pilot charter ($/task, $/day, cache floor, batch floor)
- `log-cost` hook (or equivalent) wired to billing alerts at 50% / 80% / 100% of $/day cap
- Auto-throttle at 80%, auto-disable at 100%
- One named owner who gets the alert
- Quarterly review where the four gate numbers get re-set against actual production data — not the launch estimate

Workloads without those five elements aren't ungoverned because someone forgot — they're ungoverned because cost wasn't classified as a governance question. This section reclassifies it.

---

## 16. Companion artifacts

- [`adoption-playbook.md`](adoption-playbook.md) — 90-day rollout
- [`feature-decision-matrix.html`](feature-decision-matrix.html) — per-pattern feature picks
- [`reference-architectures.html`](reference-architectures.html) — diagrams + stack notes
- [`cost-calculator.html`](cost-calculator.html) — cost modeling
- [`build-vs-buy-worksheet.html`](build-vs-buy-worksheet.html) — Claude vs alternatives
- [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) — engineering team rollout
- [`hooks-starter-pack.md`](hooks-starter-pack.md) — operationalizes audit log + PII scrub + branch guard for Claude Code
- [`mcp-starter-pack.md`](mcp-starter-pack.md) — read-only MCP server templates; §1 data flow + §14 prompt injection apply (server returns are untrusted)
- [`eval-starter-pack.md`](eval-starter-pack.md) — adversarial + refusal calibration evals tie to NIST AI RMF *Measure*
- [`../docs/feature-inventory.md`](../docs/feature-inventory.md) — canonical feature + status list

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify all status claims at anthropic.com + docs.claude.com.`
