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
| Where is our data processed / stored? | First-party API + Claude Platform on AWS: per-request inference geo via `inference_geo` (`global` default or `us`; Opus 4.6+ and Sonnet 4.6 confirmed — **Sonnet 5 unconfirmed, verify**); at-rest + endpoint processing controlled by **Workspace geo**. Bedrock/Vertex/Azure AI Foundry use the hyperscaler's own region selection, not `inference_geo`. | `[gov §5]` `[inv]` |
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
| What's the exit / lock-in story? | Multi-model abstraction at the right layer keeps switching cost bounded; data export + deletion on termination via DPA. Don't pre-build a 3-model fallback you'll never use. | `[gov §12]` `[gov §11]` |

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

## 4. What this pack can't answer (the verify-at-signing list)

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
