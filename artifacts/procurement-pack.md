# Claude Procurement & Vendor-Risk Pack

**As of 2026-07.** Pin to current model + plan surface — refresh monthly. Facts here are current as of this stamp; **re-verify at signing**.

The decision to use Claude is made elsewhere ([`build-vs-buy-worksheet.html`](build-vs-buy-worksheet.html)). The compliance posture is stated in reference prose ([`governance-overlay.md`](governance-overlay.md)). This pack is the **procurement-execution layer** between them: the answers a CISO, procurement lead, or vendor-risk reviewer actually needs to fill a security questionnaire, paper a DPA/BAA, and negotiate the contract. It reformats the governance facts as question-and-answer, surface-split, with a source on every line.

> ⚠ **Not legal advice.** This is a sourcing aid, not a contract. Every answer below either cites a section of [`governance-overlay.md`](governance-overlay.md) (which cites the primary source) or is explicitly flagged **verify at signing**. Where Anthropic's published material is silent, the honest answer is "verify in the Implementation Guide / DPA / at signing" — not an inference. Do not paste an answer into a binding response without confirming it against the live source for your plan and surface.

---

## How to use this pack

1. **Cite or verify — never assert.** Each answer ends in a tag: `[gov §N]` = stated and sourced in the governance overlay; `[inv]` = feature-inventory row; **verify: `<where>`** = not assertable from published material, confirm directly. If you delete the tag when pasting, keep the verification habit.
2. **Surface matters — the same question has different answers per surface.** A BAA answer for the Enterprise product (Chat/Projects) is *not* the answer for the first-party API, which is *not* the answer for Cowork. Answers below are tagged by surface where it changes. Carrying one surface's verdict to another is the most common procurement error here. See [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) for the per-feature view.
3. **Re-verify at signing.** Status (GA/beta), the BAA-eligible feature list, and certifications drift. The feature-inventory's 14-day staleness window applies — anything older than that gets re-checked before it goes in a binding document.

---

## 1. Security questionnaire — standard rows

The questions most vendor-risk questionnaires ask, with Claude-grounded answers. **Answer column is a starting draft, not a warranty.**

### Data handling & privacy

| Question | Answer (draft) | Source |
|---|---|---|
| Is our data used to train your models? | No — commercial API and Console default is no-train. Consumer plans (Free/Pro/Max) are a separate policy surface and are **not** in scope for a commercial agreement. | `[gov §2]` `[inv: no-train]` |
| How long is our data retained? | Backend deletion default **30 days**. Carve-outs: inputs/outputs up to **2 years** where AUP-flagged; Trust & Safety classifier scores up to **7 years** (persist even under ZDR); feedback you submit **5 years**. | `[gov §11]` `[inv]` |
| Do you offer Zero Data Retention? | Yes — enterprise, **approval required**. Covers Messages + Token Counting APIs and Claude Code. **Not** the Team/Enterprise product UI; **not** consumer plans. T&S classifier scores are still retained. | `[gov §3]` `[inv: ZDR]` |
| Can we delete our data on request? | Deletion mechanisms exist per the retention policy; export + deletion on contract termination → **verify at signing (DPA)**. | `[gov §11]` · verify: DPA |
| Where is our data processed / stored? | First-party API + Claude Platform on AWS: per-request inference geo via `inference_geo` (`global` default or `us`; Opus 4.6+ and Sonnet 4.6+ and later confirmed — Sonnet 5 confirmed per the platform pricing doc, verified 2026-07-06; `us` applies a 1.1× multiplier); at-rest + endpoint processing controlled by **Workspace geo**. Bedrock/Vertex/Azure AI Foundry use the hyperscaler's own region selection, not `inference_geo`. | `[gov §5]` `[inv]` |
| Who are your sub-processors? | Published list → **verify: trust.anthropic.com** and the DPA sub-processor schedule. | verify: trust.anthropic.com |
| Is data encrypted in transit and at rest? | **verify: trust.anthropic.com** (Trust Portal / SOC 2 report). Not separately asserted in this repo — do not state specifics you haven't pulled from the report. | verify: trust.anthropic.com |

### Compliance & certifications

| Question | Answer (draft) | Source |
|---|---|---|
| What certifications do you hold? | SOC 2 Type I & Type II; ISO/IEC 27001:2022; ISO/IEC 42001:2023 (AI management systems). Request current reports from the Trust Portal. | `[gov §6]` `[inv]` |
| Can you sign a BAA for HIPAA workloads? | Yes, for **first-party API** and **Enterprise** plans only. Enterprise is **not automatic** — an admin must activate HIPAA compliance (admin settings → Data & Privacy) and sign the BAA. Excludes Workbench/Console, Free/Pro/Max/Team, Cowork, and beta features. | `[gov §4]` `[inv: BAA]` |
| Which features are BAA-covered? (Enterprise product) | Chat, Projects, Artifacts, file creation & code execution **excluding network access / external websites**, Voice, Web search, Research. (Skills *may* have been added in the 2026-06-29 source update but is unconfirmed first-hand — treat as verify-at-signing, not asserted covered.) Eligible list grows — **verify the current list in the Implementation Guide at signing.** | `[gov §4]` · verify: Implementation Guide |
| Which features are BAA-covered? (first-party API) | Messages, Token Counting, Models, Organization; Web search, Memory, Prompt caching, Structured outputs, Bash. **Not covered (non-exhaustive):** Web fetch, Files API, Batch API, Computer use, Code execution, Skills — the API returns a 400 on *any* non-eligible feature, so confirm the full set at signing. | `[gov §4]` · verify: Implementation Guide |
| Is Cowork / Claude Design BAA-covered? | **No.** Both are BAA-excluded (Cowork GA but excluded; Design is beta). No PHI on either surface. | `[gov §4]` `[inv: product surfaces]` |
| Do third-party integrations stay within the BAA? | MCP servers, Connectors, Enterprise Search, and Claude-in-Chrome are available, but **their third-party data flows are not covered** by Anthropic's BAA. Those flows need their own agreements. | `[gov §4]` |
| EU AI Act — what is your role and documentation? | Anthropic is a GPAI (general-purpose AI) model provider; you are typically a deployer with your own obligations. Request GPAI provider technical documentation, instructions-for-use, and training-data summary. | `[gov §7]` · verify: vendor docs |
| Do you map to NIST AI RMF? | Govern/Map/Measure/Manage mapping is provided as deployer guidance in the overlay; Anthropic's own attestations → Trust Portal. | `[gov §8]` |

### Access, audit & operations

| Question | Answer (draft) | Source |
|---|---|---|
| SSO / SCIM / RBAC support? | SSO on Team + Enterprise; **SCIM on Enterprise**; custom roles / RBAC on Enterprise. SCIM/audit tier-mapping is inferred from the plan-compare matrix — **verify per contract.** | `[inv: plans]` · verify: contract |
| Do you provide audit logging? | Application-side audit-trail patterns (what *you* should log: request, prompt, response, model version, cost, user, redaction status) are in the overlay. Enterprise admin usage/audit controls → **verify per contract.** | `[gov §9]` · verify: contract |
| Breach / incident notification terms? | **verify at signing (DPA).** Not asserted here. | verify: DPA |
| Vulnerability management / pentest cadence? | **verify: trust.anthropic.com.** | verify: trust.anthropic.com |
| Uptime SLA? | Status history at status.anthropic.com; a contractual uptime SLA is an **Enterprise-negotiated** term. | verify: contract |

### AI-specific risk

| Question | Answer (draft) | Source |
|---|---|---|
| Are model outputs accurate / guaranteed? | No accuracy warranty — foundation-model outputs can be wrong. Mitigations are the deployer's: evals, grounding/citations, human-in-the-loop for high-stakes. Some workloads should not use Claude at all. | `[gov §14]` · [`anti-use-cases.md`](anti-use-cases.md) · [`eval-starter-pack.md`](eval-starter-pack.md) |
| Who owns the outputs? | Customer ownership of outputs is addressed in the commercial terms; training-data provenance and any IP indemnity → **verify in commercial terms at signing.** | `[gov §13]` · verify: commercial terms |
| How is prompt injection handled? | Shared responsibility — content-safety + injection mitigations are a deployer control (input/output validation, least-privilege tools, allow-listed MCP). Not a vendor-only guarantee. | `[gov §14]` · [`hooks-starter-pack.md`](hooks-starter-pack.md) |
| What's the exit / lock-in story? | Multi-model abstraction at the right layer keeps switching cost bounded; data export + deletion on termination via DPA. Don't pre-build a 3-model fallback you'll never use. Component-by-component exit costing: [`exit-portability-memo.md`](exit-portability-memo.md). | `[gov §12]` `[gov §11]` |

---

## 2. Pre-signature checklist

Paper these **before any real data flows**. Each is a row in your approval log (mirrors [`adoption-playbook.md`](adoption-playbook.md) Week 0). Owner = who signs it off.

| # | Item | Why it gates | Owner | Source |
|---|---|---|---|---|
| 1 | **DPA executed** | Governs processing, sub-processors, breach notice, deletion-on-exit. | Legal | verify: DPA |
| 2 | **BAA executed + HIPAA activated** (if PHI) | No PHI may flow until the BAA is signed *and* (Enterprise) an admin has activated HIPAA in Data & Privacy. Confirm your features are on the covered list. | Legal + Admin | `[gov §4]` |
| 3 | **No-train policy version captured** | Record the policy version + as-of date you're relying on; re-check quarterly (terms drift). | Risk | `[gov §2]` |
| 4 | **ZDR addendum** (if required) | ZDR is approval-gated and surface-limited; confirm it covers the surfaces you'll actually use. | Security | `[gov §3]` |
| 5 | **Residency configured** | Set `inference_geo` and/or Workspace geo per workload sensitivity; confirm Bedrock/Vertex region if that's the path. | Architect | `[gov §5]` |
| 6 | **Sub-processor list reviewed** | Pull the current list; flag any that breach your data-locality or fourth-party rules. | Risk | verify: trust.anthropic.com |
| 7 | **Certifications on file** | Current SOC 2 Type II + ISO 27001/42001 reports archived for your auditors. | Risk | `[gov §6]` |

---

## 3. Commercial & SLA terms to negotiate

Which terms are published vs negotiated. Don't assume a published default is the best you can get on Enterprise.

| Term | Posture | Note |
|---|---|---|
| **Model-deprecation notice window** | Negotiate | Pin to model *family* not point release; ask for a written notice window so a deprecation doesn't strand a pinned model. The COE owns the bump runbook. `[gov §10]` `[gov §12]` · [`incident-response-runbook.md`](incident-response-runbook.md) |
| **Price lock / committed-use discount** | Negotiate (Enterprise) | List pricing is "subject to change at Anthropic's discretion" — a price-lock is an Enterprise term, not a default. Verify current list at anthropic.com/pricing. `[inv]` |
| **Rate limits / throughput** | Negotiate (Enterprise) | Tier-based by default; Enterprise can raise. Size against [`cost-calculator.html`](cost-calculator.html) steady-state volume. verify: contract |
| **Support tier + response times** | Plan-dependent | Confirm severity definitions and response SLAs in writing. verify: contract |
| **Uptime SLA + credits** | Negotiate (Enterprise) | status.anthropic.com is history, not a contractual SLA. verify: contract |
| **Data export + deletion on termination** | DPA | Confirm format and timeline so exit isn't a lock-in lever. `[gov §11]` · verify: DPA |

---

## 4. Procurement path — direct vs hyperscaler

Buying Claude through a hyperscaler (Bedrock / Vertex / Azure Foundry) is a **billing-and-governance decision, not a model decision.** The model weights are identical on every path, and Anthropic operates the inference behind all of them — Azure's own GA post states *"Anthropic operates the inference and is the data processor and SLA provider."* So a hyperscaler path **does not diversify your model dependency**; it changes who invoices you and whose IAM/audit plane the calls run through. What you trade for that integration is **feature freshness** — new models and Anthropic-native features land on the first-party API first.

### The five paths

| Path | Billing | Governance inheritance | Feature freshness | Note |
|---|---|---|---|---|
| **Direct API** | Anthropic invoice / Console | You build auth, logging, isolation | **Newest — day-one models + all features** | The reference surface. `[inv]` |
| **Claude Platform on AWS** | AWS marketplace / drawdown | AWS billing plumbing | **Full — direct-API feature set** | Cloud bill *without* the lag. `[inv]` |
| **Amazon Bedrock** | AWS invoice + EDP drawdown | IAM, VPC/PrivateLink, CloudTrail, KMS | Lags (weeks–months) | AWS-native platform layer (below). `[inv]` |
| **Google Vertex AI** | GCP invoice + CUD drawdown | GCP IAM, VPC-SC | Lags | Regional endpoint ≈ **+10%** over global; multi-region GA 2026-05-15. `[inv]` |
| **Microsoft Azure Foundry** | Azure invoice (CCU line) + MACC | Entra ID, Azure RBAC, Control Plane | Lags (hosted-on-Azure) | GA 2026-06-29; Global/US data zone; ZDR available. `[inv]` |

**The nuance a two-column "cloud vs direct" framing hides:** freshness and cloud-native billing are *partly decoupled*. **Claude Platform on AWS** and **Azure's hosted-on-Anthropic mode** give you a cloud/marketplace invoice **without** forfeiting day-one features — only Bedrock/Vertex/Azure-hosted make you choose. `[inv]` · verify: catalog

### What the hyperscaler platform layer adds (Bedrock as the example)

The reason to accept the lag is the managed platform wrapped around the model. On Bedrock you gain, over the bare direct API:

- **Managed AI services:** Guardrails (content/PII/prompt-attack/grounding filters), Knowledge Bases (managed RAG), **AgentCore** (production agent runtime — memory, gateway, identity, code-interpreter; no direct-API equivalent), Flows, Data Automation, Evaluations, Distillation.
- **AWS infra & ops:** IAM auth, VPC/PrivateLink (no public egress), CloudTrail audit, KMS customer-managed keys, cross-region inference, Provisioned Throughput, batch (~50% off).
- **Claude-specific:** fine-tuning **Claude 3 Haiku** is available on Bedrock **but not on the first-party API** (us-west-2; must serve on Provisioned Throughput).

Caveat for vendor-risk: **buckets one and two are AWS features, not Claude features** — they carry AWS lock-in and do not port if you leave AWS. Vertex (Agent Builder / RAG Engine) and Azure (Foundry Agent Service / Control Plane) have their own equivalents. Verify the exact feature/model set **per catalog** at decision time — it drifts. `[inv]` · verify: AWS / GCP / Azure catalog

### Procurement implications

| Question | Answer (draft) | Source |
|---|---|---|
| Does a hyperscaler path reduce vendor-concentration risk? | **No.** Same model, Anthropic-operated inference on every path. It diversifies the *commercial* relationship (billing, contracting), not the *model* dependency. Hedge model risk with portable evals + a swap-ready abstraction on simple workloads, not a second cloud bill. | `[inv]` · [`exit-portability-memo.md`](exit-portability-memo.md) |
| Who is the SLA / data-processor party? | **Differs by path — confirm per contract.** On Azure hosted-on-Azure, Anthropic is the data processor & SLA provider even though Azure carries billing/identity. On Bedrock/Vertex, the hyperscaler's model-service SLA applies. Direct = Anthropic's API SLA. | `[inv]` · verify: contract |
| Where is data processed on a hyperscaler path? | The hyperscaler's own region selection — **not** `inference_geo`/Workspace geo (those are first-party API + Claude Platform on AWS only). Vertex offers global vs multi-region; Azure offers Global vs US data zone. | `[gov §5]` `[inv]` |
| Is compliance (HIPAA/FedRAMP/ISO) inherited from the cloud? | **Do not inherit — verify per surface.** Hyperscaler compliance is governed by *its* program (AWS Artifact / GCP / Azure trust portals), which is a different attestation from Anthropic's first-party certs. Confirm the covering party and scope for your workload before it enters a questionnaire. | verify: hyperscaler trust portal + trust.anthropic.com |
| Which path for cost commitment? | If you have an under-burning **AWS EDP / GCP CUD / Azure MACC** commitment, hyperscaler spend draws it down — often outweighing small per-token deltas. On-demand per-token price is at parity with direct in standard regions; Vertex regional adds ~10%. | `[inv]` · verify: contract |

**Decision shorthand:** need day-one models + full feature set → **Direct** or **Claude Platform on AWS**. Need cloud billing without the lag → **Claude Platform on AWS** / **Azure hosted-on-Anthropic**. AWS/GCP/Microsoft shop wanting native IAM + commit drawdown + managed agent/RAG platform → the matching **Bedrock / Vertex / Foundry** path, accepting the freshness lag. Think a hyperscaler hedges "what if Anthropic goes away" → it doesn't.

---

## 5. What this pack can't answer (the verify-at-signing list)

Be explicit with your reviewers about what is **not** assertable from public material and must be confirmed directly. Listing these is a credibility signal, not a gap:

- Encryption specifics, sub-processor list, pentest cadence, vuln-management process → **Trust Portal (trust.anthropic.com)**.
- Breach-notification timelines, deletion-on-exit format, indemnities → **DPA / commercial terms**.
- The *current* BAA-eligible feature list (it grows) → **Implementation Guide at signing**.
- SCIM/audit/RBAC exact tier mapping → **per-contract**.

If a questionnaire forces a yes/no on one of these and you can't pull the source, answer "confirmed at contract" and attach the verification owner — never guess. Shipping a wrong HIPAA or encryption answer in a binding questionnaire is the failure mode this pack exists to prevent.

---

## Companion artifacts

- [`governance-overlay.md`](governance-overlay.md) — the reference prose every answer above cites (§1–§15).
- [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) — per-feature trust-zone diagrams; the visual surface-split behind the BAA rows.
- [`build-vs-buy-worksheet.html`](build-vs-buy-worksheet.html) — upstream: is Claude the right call, and via which procurement path.
- [`subscription-selection-guide.md`](subscription-selection-guide.md) — which plan carries which compliance surface (BAA on Enterprise, not Team).
- [`anti-use-cases.md`](anti-use-cases.md) — workloads where the right procurement answer is "don't."
- Companion repo [`ai-architect-showcase`](https://github.com/gmanch94/ai-architect-showcase) — vendor-neutral EU AI Act + NIST AI RMF deployer obligations.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Not legal advice — verify every answer against the live source for your plan and surface before it enters a binding document. Verify pricing/models at anthropic.com.`
