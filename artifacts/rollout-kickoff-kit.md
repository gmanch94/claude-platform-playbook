# Rollout Kickoff Kit — Who Acts, In What Order, The First 30 Days

**As of 2026-07.** Pin to current surface — refresh monthly.

The repo already routes four ways: by **persona** ([README audience map](../README.md#audience)), by **question** ([`decision-spine.html`](decision-spine.html)), by **capability** ([`maturity-model.md`](maturity-model.md)), and by **surface** ([`surface-rollout-matrix.md`](surface-rollout-matrix.md)). What none of them draw is the one thing a cross-functional kickoff actually needs: **who acts, in what order, across roles, in the first weeks** — the orchestration *between* the lanes. This kit is that view. It is the persona-lensed first 30 days of the [`adoption-playbook.md`](adoption-playbook.md), nothing more.

> **Read order:** two things here exist nowhere else — the **roles × time swimlane** (§3) and the **between-lane handoff seams** (§4). Everything else either points you to the canonical artifact or adds the role-specific deliverable / gate the canonical doesn't carry. Scope is **Week 0 → Week 4** (kickoff to first pilot signal); the kit hands off to the playbook's *Guardrails* phase exactly at **Week 5**. It does **not** restate the 90-day arc, the decision-rights RACI, or the per-persona deep guides — those are linked.

---

## 1. How to use

1. Find your row in the **quick-start** (§2) — your first artifact, your Week-1 deliverable, your gate, your one failure mode.
2. Find your lane in the **swimlane** (§3) — what you do Week 0, what you do Weeks 1–4, and who you hand off to.
3. If two lanes touch and stall, check the **handoff seams** (§4).
4. Follow each *go deep →* link for the detail this kit deliberately doesn't repeat.

---

## 2. Quick-start — one row per role

The **first-artifact** column mirrors the [README audience map](../README.md#audience) (canonical there — don't maintain two copies of the chains). What this table adds is what the map lacks: your **Week-1 deliverable**, your **gate**, and your **#1 failure mode**. Role labels match the [`operating-model-guide.md`](operating-model-guide.md) RACI cast where they overlap; four rows (transformation lead, enablement lead, the eval owner folded into Platform, and procurement/vendor-risk — which the RACI carries as a *decision row*, not a principal column) are kickoff actors the steady-state RACI doesn't name as a column.

| Role | You're up when… | First artifact | Week-1 deliverable | Gate — can't advance until | #1 failure mode |
|---|---|---|---|---|---|
| **Exec sponsor** | the decision is "we're doing this" | [`executive-briefing.html`](executive-briefing.html) | a one-paragraph mandate + a funded envelope + a named accountable owner | the owner (the **A**) is a *person*, not a committee | funds the pilot, never names the A → decisions queue |
| **Transformation lead** | the sponsor names you to run it | [`anti-use-cases.md`](anti-use-cases.md) | candidate list run through the anti-use filter; top pilot scored | ≥1 pilot clears anti-use **and** scores Strong/Viable on data readiness | starts the strongest-*sounding* idea, skips the filter → killed in Week 6 |
| **Platform team** (architect / platform / eval-CI) | a pilot pattern is in view | [`reference-architectures.html`](reference-architectures.html) | pattern chosen + data sized + read-only MCP/hooks scaffold + eval baseline wired | the regression eval baseline is **blocking**, not advisory | ships the agent before the baseline → silent drift later |
| **Build team** (product / eng manager) | pattern + guardrail scaffold are ready | [`feature-decision-matrix.html`](feature-decision-matrix.html) | pilot v0, one team / one use case, against the baseline | exit-criteria met: eval ≥ baseline · cost ±30% · no P0/P1 · ≥70% prefer it · sponsor signs off | two use cases at once → neither hits exit-criteria |
| **Security / Risk** (CISO) | a candidate pilot exists | [`agentic-threat-model.md`](agentic-threat-model.md) | threat-review of the candidate, run **parallel** to build | guardrail sign-off before the pilot touches real data | reviews *last*, serial-blocks the build → 2-week stall |
| **Procurement / vendor-risk** | build-vs-buy says "buy a plan" | [`procurement-pack.md`](procurement-pack.md) | BAA/DPA + security questionnaire **in flight** (started Week 0) | signed terms before any regulated/PHI data | starts the BAA after the build → the contract is the critical path |
| **COE / Governance** | more than one team wants Claude | [`operating-model-guide.md`](operating-model-guide.md) | RACI filled (one A per decision) + the surface-enablement call made | eval policy + blocking gates defined before scale | becomes the "AI committee" → the A diffuses |
| **HR / People** (CHRO) | the pilot touches a team's daily work | [`workforce-change-guide.md`](workforce-change-guide.md) | augment-not-replace comms drafted + works-council trigger checked | comms land **before or with** the pilot, never after | comms lag the rollout → rumor sets the narrative |
| **Enablement lead** (Cowork / non-eng) | a non-engineer team is in scope | [`cowork-adoption-guide.md`](cowork-adoption-guide.md) | surface picked by blast radius + the 3 gates cleared | a governance owner is named before broad enablement | enables the widest surface first → biggest blast radius first |

---

## 3. Swimlane — Week 0 → Week 4

Same weeks the [`adoption-playbook.md`](adoption-playbook.md) covers by *workstream*; this is the same span by *role*. The column boundaries are the playbook's own — the kit ends where **Week 5 (Guardrails)** begins. Cells are one action + a handoff, not a re-explanation of the phase.

| Role | Week 0 — pre-flight | Weeks 1–4 — pilot |
|---|---|---|
| **Exec sponsor** | name the A · fund the envelope · set the augment-not-replace tone → hand the owner to the transformation lead | weekly unblock cadence · review first metrics at Week 4 → go / no-go |
| **Transformation lead** | run the anti-use filter · score pilots · pick one → hand the pattern to Platform | run the pilot · watch the 8 failure modes · drive exit-criteria |
| **Platform team** | pick the pattern · size the data · scaffold read-only MCP/hooks + the eval baseline → hand the scaffold to Build | keep the eval blocking · wire the surfaces |
| **Build team** | help scope; otherwise standby | ship pilot v0 against the baseline · hit exit-criteria |
| **Security / Risk** | threat-review the candidate, **concurrent** with scaffolding → feed guardrails to Platform | sign off guardrails before real data |
| **Procurement** | **start** the BAA/DPA + questionnaire (critical-path) | close terms before any regulated data |
| **COE / Governance** | fill the RACI · set eval policy · make the surface-enablement call | hold the blocking gates · prep the scale pattern |
| **HR / People** | draft the comms · check the works-council trigger | send augment-not-replace comms *with* the pilot |
| **Enablement lead** | pick the surface by blast radius · clear the 3 gates | onboard the first non-eng cohort (parallel track, not the pilot team) · review-before-act on |

**→ Week 5:** the [`adoption-playbook.md`](adoption-playbook.md) *Guardrails* phase (Weeks 5–8) takes over. This kit stops here on purpose.

---

## 4. Handoff seams — where rollouts stall *between* lanes

Single-lane failure modes live in the [playbook's 8](adoption-playbook.md) and the [operating-model RACI](operating-model-guide.md); they aren't repeated here. These are the *between-lane* drops — the ones no single owner sees, which is exactly why they stall:

- 🛑 **Security reviews serially instead of in parallel.** Security starts the threat-review only after the pilot is built → a 1–2 week stall at the worst moment. **Fix:** Security's Week-0 lane runs concurrent with Platform's — the review is *advisory* on the daily build cadence (per the [playbook](adoption-playbook.md), Weeks 1–4), but guardrail sign-off is a *hard gate* at the real-data boundary, not a sequential phase. → [`agentic-threat-model.md`](agentic-threat-model.md)
- 🛑 **CHRO comms lag the pilot.** Staff hear about the AI pilot through rumor before the augment-not-replace message lands → fear sets the narrative the rollout then fights for months. **Fix:** comms ship in HR's Week-0/Week-1 lane, with or before the pilot — never at scale. → [`workforce-change-guide.md`](workforce-change-guide.md)
- 🛑 **The BAA lands on the critical path.** Procurement starts the BAA/DPA after the pattern is chosen → the contract, not the build, gates go-live. **Fix:** Procurement's lane starts Week 0, parallel to everything. (Timing only — coverage and eligibility are per [`governance-overlay.md`](governance-overlay.md) §4; verify at signing.) → [`procurement-pack.md`](procurement-pack.md)
- 🛑 **The eval baseline is skipped at ignition.** The pilot ships without a blocking regression baseline → weeks later you can't separate model drift from prompt drift from data drift. **Fix:** the baseline is a Platform Week-0 deliverable and a hard gate before go-live. → [`eval-starter-pack.md`](eval-starter-pack.md)
- ⚠ **No single accountable owner.** The commonest stall, and a single-lane one — so it's not re-explained here: the sponsor funds but names a committee, decisions queue past ~7 days. → [`operating-model-guide.md`](operating-model-guide.md) (RACI: *exactly one A per row*)

---

## Companion artifacts

- [`adoption-playbook.md`](adoption-playbook.md) — the full 90-day arc; this kit is its first 30 days, persona-lensed, and hands back at Week 5.
- [`operating-model-guide.md`](operating-model-guide.md) — the RACI (who **decides**); this kit is who **acts**, when.
- [README audience map](../README.md#audience) — the canonical per-persona artifact chains.
- [`surface-rollout-matrix.md`](surface-rollout-matrix.md) — which surface to enable first, by blast radius.
- [`maturity-model.md`](maturity-model.md) — where you're starting from (a Week-0 input to the sponsor's mandate).
- [`anti-use-cases.md`](anti-use-cases.md) + [`pilot-selection-worksheet.html`](pilot-selection-worksheet.html) — the Week-0 gates the transformation lead runs.
- [`eval-starter-pack.md`](eval-starter-pack.md) — the baseline that gates go-live.
- [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) — the one-page mindset handout the enablement lead deploys in their Week-0 → Week-4 lane; what you actually put in front of each user.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Swimlane and RACI are templates — adapt to your titles. Verify model surface at anthropic.com.`
