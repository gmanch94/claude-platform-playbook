# Anti-Use Cases — Where Claude Should *Not* Be Used

**As of 2026-05.** Pin to current model surface (Opus 4.7 / Sonnet 4.6 / Haiku 4.5) — refresh monthly with [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

> If your candidate use case fits any row below, **stop**. Re-route, narrow scope, or kill. Most of these are not "Claude is bad at this" — they are "no LLM is the right primitive for this decision class, and shipping one anyway destroys trust faster than any cost saving recovers."

This is the credibility artifact. Every other file in this repo answers *when* and *how* to use Claude. This one is the explicit "no" list — read it before the build-vs-buy worksheet, not after.

---

## How to read this

Each row:

- **Pattern** — the shape of the use case
- **Why not** — the failure mode (legal, technical, economic, or governance)
- **Do this instead** — the specific re-route
- **Cite** — the source for the constraint (regulator, doc, framework)

Rows are ordered by how often they show up in pilot intake. The first row (sole-decider on regulated decisions) is the one that kills the most pilots in Week 0.

---

## 1. Hard nos — legal / ethical no-go

These are "don't ship this even if it works." The blocker is not model quality; it is the decision class.

| Pattern | Why not | Do this instead | Cite |
|---|---|---|---|
| **Sole-decider on credit denial, sentencing, medical diagnosis, hiring rejection, or benefits termination** | EU AI Act Article 6 + Annex III classifies these as high-risk; sole-LLM decision = non-compliant. US: ECOA / FCRA / Title VII / EEOC require explainability + human-in-loop for adverse actions. | Claude as **decision-support** with a named human reviewer; log model version + prompt + output for audit. Reviewer's call, not the model's. | EU AI Act Annex III; EEOC AI guidance 2023; CFPB circular 2023-03 |
| **Generation of legal advice, medical advice, or financial advice presented as authoritative** | Liability falls on whoever publishes the output. "Claude said so" is not a defense. Hallucination rate on cited statutes / dosages / instruments is non-zero and not user-visible. | Retrieval-grounded copilot for a licensed professional, with citations the human verifies before acting. Make the human's name on the output, not the model's. | ABA Formal Opinion 512 (2024); FDA SaMD guidance |
| **Surveillance / scoring of individuals without consent** (employee monitoring beyond disclosed scope, predictive policing, social scoring) | EU AI Act Article 5 prohibits social scoring + predictive policing. US state laws (IL BIPA, CA CCPA, CO AI Act 2024) restrict employee monitoring. | Don't. If the use case requires this framing, the use case is wrong, not the tool. | EU AI Act Art. 5; IL BIPA; CO SB24-205 |
| **Generating synthetic content of real people without consent** (voice clones, likeness, deepfakes) | Right of publicity laws (state-level US, GDPR Art. 6 EU). Anthropic AUP prohibits non-consensual likeness generation. | If you need a person's likeness, get written consent or use licensed talent. | Anthropic AUP §"Generate Sexualized Content of Real People"; GDPR Art. 6 |
| **Autonomous action with irreversible real-world consequences** (file deletion at scale, production DB writes, money movement, irl device control) without human confirmation | Agent loops + tool use can produce confident-sounding wrong actions. Irreversible = no rollback path. Compounds with prompt injection risk. | Two-key pattern: agent proposes, human (or second-system check) authorizes. Or scope tools to read-only + dry-run. See [`mcp-starter-pack.md`](mcp-starter-pack.md) read-only-by-design posture. | OWASP LLM Top 10 (LLM02 Insecure Output Handling, LLM07 System Prompt Leakage) |

---

## 2. Wrong tool — LLM is the wrong primitive

These are "the model can produce an answer, but a deterministic system would produce a *better* answer for less money with less risk."

| Pattern | Why not | Do this instead | Cite |
|---|---|---|---|
| **Exact arithmetic, financial reconciliation, tax calculation, billing math** | LLMs are stochastic. Even with extended thinking + code execution tool, a 0.1% error rate on $10M of throughput = $10K errors / period. Spreadsheets and SQL get the same answer every time. | SQL / spreadsheet / dedicated calc engine. Use Claude only to *explain* a deterministic system's output, not to compute it. Or restrict Claude's role to generating the SQL/code that runs deterministically. | Anthropic guidance on tool use (`docs.claude.com/en/docs/agents-and-tools/tool-use`) — recommends code execution tool for math |
| **Sub-100 ms latency requirements** (high-freq trading, real-time bidding, live game-state decisions) | Even Haiku 4.5 first-token latency is in the hundreds of ms; full response is seconds. Time-to-first-token is structurally not the problem the model is solving. | Pre-computed lookup tables, classical ML at the edge, or rule engine. Use Claude offline to *generate* the rules. | Architectural — see latency budgets in [`reference-architectures.html`](reference-architectures.html) |
| **Exact-match lookup against a structured catalog** (SKU lookup, stock check, employee directory) | LLM rephrases what the DB already knows + adds hallucination surface. Pure cost overhead. | Direct query. Claude only at the conversational shell layer if the user actually needs natural language; the lookup itself is SQL or REST. | — |
| **Deterministic transformations** (CSV reformat, JSON schema migration, currency conversion at fixed rate) | A 50-line script does this 100% correctly. Claude does it 99% correctly with non-zero risk on edge rows. | Script. If the script doesn't exist, ask Claude to *write* the script once, then run the script forever. One-time generation, not per-row inference. | — |
| **Compliance attestation, regulatory filing content, official record-of-decision** | "Generated by AI" disclaimers don't substitute for human review when the document is the legal artifact. Audit trail must show human author. | Claude as drafter; named human as author of record. Log the prompt + draft + edits chain. | NIST AI RMF Govern 1.5 (accountability); EU AI Act Art. 14 (human oversight) |

---

## 3. Wrong economics — works, but unit cost kills it

These work technically but the math doesn't survive contact with real volume. Run [`cost-calculator.html`](cost-calculator.html) before committing.

| Pattern | Why not | Do this instead | Cite |
|---|---|---|---|
| **High-volume rule-extractable classification** (spam filter, content moderation Tier 0, basic intent routing) at >10M req/mo | Claude per-request cost at Haiku 4.5 prices is ~10–100× a fine-tuned classifier or regex bank for the same task. At >10M req/mo, the difference is 5–6 figures/mo. | Distill: use Claude offline to *label* training data, then train a small classifier (DistilBERT-class or smaller). Or rule engine for the 80% that are obvious; Claude for the 20% ambiguous tail. | [`cost-calculator.html`](cost-calculator.html); [`feature-decision-matrix.html`](feature-decision-matrix.html) batch-vs-realtime row |
| **Cache-hostile workloads** (every request has a unique system prompt, no shared context) | Prompt caching is the dominant cost lever (cache read ≈ 10% of input rate). Without cache reuse, steady-state cost runs 5–10× higher. If the architecture forces unique prompts per request, the cost-calculator numbers in the briefing don't apply to you. | Re-architect: hoist common context into a cached prefix; vary only the per-request tail. If that's not possible, the use case is probably the wrong shape — see Wrong tool above. | `docs.claude.com/en/docs/build-with-claude/prompt-caching` |
| **Sub-cent per-request budget targets** (ad-tech bid scoring, IoT message tagging, micro-transaction enrichment) | Even with caching + Haiku 4.5 + batch, sustained per-request cost floors at fractions of a cent for non-trivial output. If the unit economics need <$0.001/req, LLMs aren't the primitive. | Classical ML / heuristics / rules. Reserve Claude for cold-start label generation only. | [`cost-calculator.html`](cost-calculator.html) |
| **Pilot with no defined volume cap or kill-switch** | "Costs blew up" is the #3 named failure mode in [`adoption-playbook.md`](adoption-playbook.md). Without a budget alert + auto-throttle, a misconfigured loop or runaway agent burns six figures over a weekend. | Define all four numeric gates before Week 1 (see [`governance-overlay.md §15.1`](governance-overlay.md#15-cost-as-a-governance-constraint)): (1) $/task ceiling at 1.5× modeled $/req — use [`cost-calculator.html`](cost-calculator.html) to model; (2) $/day cap with auto-throttle at 80% + auto-disable at 100%; (3) cache hit-rate floor ≥60% on stable workloads; (4) batch eligibility floor ≥80% for non-interactive traffic. Wire `log-cost` hook (see [`hooks-starter-pack.md`](hooks-starter-pack.md)) to billing alerts. | [`governance-overlay.md §15.1`](governance-overlay.md#15-cost-as-a-governance-constraint); [`adoption-playbook.md`](adoption-playbook.md) failure mode #3 |

---

## 4. Governance no-go — compliance posture says no

These are "until the paperwork exists, don't ship." Most are recoverable with the right contract or architecture, but shipping first and fixing later is the wrong order.

| Pattern | Why not | Do this instead | Cite |
|---|---|---|---|
| **PHI / PII at scale without a signed BAA on the procurement path** | HIPAA covered entities + business associates need a BAA before PHI touches the API. No-train default doesn't substitute for a BAA. | Sign BAA on direct API or via Bedrock/Vertex BAA; or de-identify at the gateway before the call. See [`governance-overlay.md`](governance-overlay.md) BAA section. | HIPAA Privacy Rule §164.504(e); Anthropic BAA available on direct path |
| **EU resident personal data with no DPA / Schrems II analysis** | GDPR Art. 28 + Schrems II (C-311/18) require contractual + technical safeguards for transfers. "We use Claude" without a DPA = Art. 28 violation. | DPA on procurement; choose EU-resident region where available; document SCCs. See [`governance-overlay.md`](governance-overlay.md) data-residency section. | GDPR Art. 28; CJEU C-311/18 (Schrems II) |
| **Training-data leakage exposure** (the use case requires sharing customer-confidential code or data verbatim with a model that may be used for future training) | Even with no-train default, a misconfigured procurement path or a debug-log exposure can leak. The risk isn't the model; it's the wider data flow. | Verify no-train clause in current contract version; redact at gateway; log + monitor egress. See [`governance-overlay.md`](governance-overlay.md) data-flow taxonomy. | Anthropic API Terms (verify version); [`governance-overlay.md`](governance-overlay.md) |
| **Prompt-injection-exposed surfaces with no sandbox** (agents that read untrusted external content — emails, web pages, user uploads — and have write tools available) | Indirect prompt injection (OWASP LLM01) is a confirmed live attack class. Read-untrusted + write-tool = vulnerable by construction. | Read-only by default; isolate untrusted-content tools from privileged-action tools (no shared session). See [`mcp-starter-pack.md`](mcp-starter-pack.md) read-only posture + [`hooks-starter-pack.md`](hooks-starter-pack.md) destructive-op block. | OWASP LLM Top 10 (LLM01); NIST AI RMF Manage 4.1 |
| **Cross-border data flow without explicit residency mapping** | Data sovereignty rules (EU, UAE, Saudi Arabia, India DPDP, China PIPL) require knowing where the inference happens. "It's in the cloud" is not residency. | Map inference region per workload; pick procurement path that supports required region; record the choice in the audit trail. | [`governance-overlay.md`](governance-overlay.md); India DPDP 2023; UAE PDPL |

---

## 5. Premature — the use case may be fine, but you're not ready

These are "come back in 4 weeks." Shipping now means shipping into a vacuum where you can't tell if it's working.

| Pattern | Why not | Do this instead | Cite |
|---|---|---|---|
| **No eval baseline** | Without a held-out evalset, you cannot tell if the next prompt change improved or regressed quality. "Evals exist but nobody runs them" is the #2 failure mode in [`adoption-playbook.md`](adoption-playbook.md). | Build a 50-row regression evalset before pilot launch. See [`eval-starter-pack.md`](eval-starter-pack.md). Block ship on >5% regression. | [`adoption-playbook.md`](adoption-playbook.md); [`eval-starter-pack.md`](eval-starter-pack.md) |
| **No rollback path** | Prompts and Skills drift. If you can't pin a known-good version + roll back in <1 hour, a bad ship blocks the whole product until manual repair. | Version-control prompts + Skills like code; tag each release; document rollback runbook in pilot pre-flight. See [`adoption-playbook.md`](adoption-playbook.md) Week 0. | [`adoption-playbook.md`](adoption-playbook.md) Week 0 |
| **No named human owner** | "The AI committee owns it" = nobody owns it. Failure mode named in [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html) sponsor-clarity axis. | One name on the use case. Their calendar has the recurring review meeting. | [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html) |
| **No human-in-loop for material decisions** | If the output drives a decision worth >$10K or affects a person's status, a human must review before action. Otherwise the failure mode is silent + compounding. | Insert review checkpoint between model output and downstream action. Log reviewer + decision. | NIST AI RMF Manage 1.3; EU AI Act Art. 14 |
| **No success metric defined before launch** | "We'll know it when we see it" = pilot drifts for 90 days, gets killed for vague reasons, leaves no playbook for the next attempt. | Pick 1–2 numeric success metrics before Week 1. Time-to-resolution, accept rate, $/task, NPS delta. See [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html) value axis. | [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html); [`adoption-playbook.md`](adoption-playbook.md) Week 0 |

---

## When to revisit

This list is not static. Three triggers for a re-read:

1. **Anthropic ships a new capability** that changes the cost/latency/governance math (e.g., guaranteed-deterministic mode, sub-100ms tier, new BAA-by-default region) — refresh the relevant rows.
2. **Regulator publishes a new framework** (NIST AI RMF revision, EU AI Act delegated act, state law) — update Cite columns + add new rows.
3. **A pilot fails for a reason not captured here** — add a row. The list is grown by post-mortem, not by speculation.

Refresh cadence: monthly with the rest of the repo (scheduled remote agent, first Monday), plus reactive on the three triggers above.

---

## How this artifact connects to the rest

- [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html) — runs candidate use cases through scoring axes; this file is the explicit-reject filter that runs *before* scoring.
- [`build-vs-buy-worksheet.html`](build-vs-buy-worksheet.html) — picks the procurement path *if* the use case survives this list.
- [`governance-overlay.md`](governance-overlay.md) — Section 4 (Governance no-go) above cross-references the BAA / DPA / residency depth of the overlay.
- [`adoption-playbook.md`](adoption-playbook.md) — the "Premature" rows above are the same failure modes the playbook names; this file makes them blocking instead of advisory.
- [`cost-calculator.html`](cost-calculator.html) — the "Wrong economics" section is meaningless without running the calculator on real volume.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify pricing/models at anthropic.com.`
