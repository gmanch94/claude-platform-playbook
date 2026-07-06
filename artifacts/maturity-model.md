# Claude Adoption Maturity Model

**As of 2026-07.** Pin to current surface — refresh monthly.

[`adoption-playbook.md`](adoption-playbook.md) is a *linear* 90-day arc — it assumes you're starting at zero. Most orgs aren't: some have shadow usage and no governance, some have one governed pilot, some run a platform. A linear plan tells the second group to redo Week 0 and tells the third nothing. This model fixes that — it lets you **locate yourself by the capability you've actually built**, then names the *single* next move that matters.

> **How this differs from [`decision-spine.html`](decision-spine.html):** the spine routes you by the *question you're asking right now* (→ one artifact). This locates you by the *capability you've built* (→ a quarter's worth of work). Use the spine to pick a document; use this to pick a roadmap.

---

## The five rungs

| Rung | Name | One-line state | You're here if… |
|---|---|---|---|
| **L0** | **Ad hoc / shadow** | Individuals using Claude on their own, off the books | Usage exists but no sponsor, no governance, no eval, often on personal/consumer accounts |
| **L1** | **Pilot** | One sponsored use case, papered and measured | Week 0 done (sponsor, BAA/DPA, metrics); eval v0 exists; governance is shadowing |
| **L2** | **Governed production** | At least one use case live with guardrails | Evals in CI, cost gates wired, audit logging on, rollback tested, on-call exists |
| **L3** | **Platform / repeatable** | Multiple teams self-serve on shared infra | COE operating; shared skills/MCP; surface rollout sequenced; next team doesn't need hand-holding |
| **L4** | **Agentic at scale** | Agents in production, value measured org-wide | Threat-modeled agents live; per-surface data boundaries mapped; ROI tracked; workforce reskilled |

---

## Locate yourself — weakest-link rule

Score the gates below. **You are at the *lowest* rung where you fail a gate** — not the highest you've touched. Maturity is the floor, not the ceiling: a flashy agentic demo (L4 ambition) on top of no evals (fails L2) is an **L1 org with L4 risk**, and that gap is exactly where the expensive failures live.

**L1 gates — have you…**
- [ ] Named a single accountable sponsor (not "the AI committee")?
- [ ] Papered BAA/DPA + captured the no-train policy version?
- [ ] Defined numeric success metrics incl. cost-per-task?
- [ ] Built an eval set v0 (30–80 examples)?

**L2 gates — is there…**
- [ ] An eval suite running in CI, blocking on regression?
- [ ] Cost gates wired ($/task, $/day) — not invoice-discovered?
- [ ] Audit logging (request, prompt, response, model version, cost, user)?
- [ ] A tested rollback + a kill switch?

**L3 gates — do you have…**
- [ ] A COE operating (intake → triage → support → graduate)?
- [ ] A shared, versioned skills/MCP library (not per-engineer copies)?
- [ ] A chosen operating model + RACI (who owns what)?
- [ ] Surface rollout sequenced by blast radius?

**L4 gates — are…**
- [ ] Production agents threat-modeled (least-privilege tools, injection controls)?
- [ ] Per-feature data boundaries mapped for the surfaces in use?
- [ ] Org-wide value measured (not per-person surveillance)?
- [ ] The affected workforce reskilled past awareness into practitioner?

---

## The one next move per rung

Don't boil the ocean. At each rung there's a single highest-leverage move; the rest follows.

| At rung | The one move | Why it's the lever | Artifacts |
|---|---|---|---|
| **L0** | Pick one use case and paper Week 0 | Shadow usage is ungoverned risk *and* unmeasured value — sponsorship converts both | [`anti-use-cases.md`](anti-use-cases.md) → [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html) → [`adoption-playbook.md`](adoption-playbook.md) · [`subscription-selection-guide.md`](subscription-selection-guide.md) |
| **L1** | Wire evals + cost gates into CI | Without them, production is a regression and a cost spike waiting to happen | [`eval-starter-pack.md`](eval-starter-pack.md) · [`governance-overlay.md`](governance-overlay.md#15-cost-as-a-governance-constraint) · [`hooks-starter-pack.md`](hooks-starter-pack.md) |
| **L2** | Stand up the COE + shared library | The 3rd–10th use case shouldn't need the pilot team; repeatability is the unlock | [`operating-model-guide.md`](operating-model-guide.md) · [`claude-code-starter-skills.md`](claude-code-starter-skills.md) · [`mcp-starter-pack.md`](mcp-starter-pack.md) · [`surface-rollout-matrix.md`](surface-rollout-matrix.md) |
| **L3** | Threat-model agents + measure value | Agentic blast radius and org-wide ROI are what L4 is accountable for | [`agentic-threat-model.md`](agentic-threat-model.md) · [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) · [`roi-worksheet.html`](roi-worksheet.html) · [`workforce-change-guide.md`](workforce-change-guide.md) |
| **L4** | Re-audit the convention, not the instance | At scale the leak is the convention; rotate audits per subsystem, retire bug *classes* | [`incident-response-runbook.md`](incident-response-runbook.md) · [`multi-agent-patterns.md`](multi-agent-patterns.md) · [`agentic-threat-model.md`](agentic-threat-model.md) |

---

## The one anti-pattern that matters

**Skipping rungs.** The recurring, expensive failure is L4 ambition on an L1 foundation: agents taking real actions in production before evals, cost gates, audit, and a threat model exist. The blast radius of an agent (runs commands, moves money, touches files) multiplied by the absence of L2 controls is the worst risk profile available — and it's the most common one, because the demo is easy and the foundation is boring.

The fix is the weakest-link rule: **build to your floor before you reach for your ceiling.** An L2 org running one governed use case well is in a far stronger position than an L1 org running five ungoverned agents. If your ambition is two or more rungs above your floor, close the gap before you ship — that gap is the finding.

---

## Companion artifacts

- [`decision-spine.html`](decision-spine.html) — routes by question; this locates by capability.
- [`adoption-playbook.md`](adoption-playbook.md) — the linear arc, for orgs genuinely at L0→L1.
- [`operating-model-guide.md`](operating-model-guide.md) — the L2→L3 move: how to organize ownership.
- [`agentic-threat-model.md`](agentic-threat-model.md) + [`roi-worksheet.html`](roi-worksheet.html) — the L3→L4 accountabilities.
- [`feature-inventory.md`](../docs/feature-inventory.md) — source of truth for what's GA to build on at each rung.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Maturity is the floor you've built, not the ceiling you've demoed. Verify model surface at anthropic.com.`
