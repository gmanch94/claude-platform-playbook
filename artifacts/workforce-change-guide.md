# Workforce Change Guide — Rolling Claude Out to People

**As of 2026-07.** Pin to current surface — refresh monthly.

Every other execution artifact in this repo rolls Claude out to *systems*: [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) to engineers, [`cowork-adoption-guide.md`](cowork-adoption-guide.md) to non-engineers, [`surface-rollout-matrix.md`](surface-rollout-matrix.md) across surfaces. None of them roll it out to *people* — the role impact, the narrative, the reskilling, and the line between measuring productivity and surveilling staff. The CHRO is a named audience for this repo and has been the least-served one. This is the people-side guide: decision-framed, honest, and built to keep adoption from dying on contact with the workforce.

> **Complements, doesn't repeat.** [`adoption-playbook.md`](adoption-playbook.md) is the 90-day *org* timeline; this is the *human-change* layer that runs alongside it. The technical guides say how to turn the surface on; this says how to bring the people with it.

---

## The CHRO's four decisions (+ one gate)

| Decision | Default | Failure mode if you get it wrong |
|---|---|---|
| **1. The narrative** — augmentation or replacement, said out loud | State it plainly, early, in writing. Ambiguity is read as the bad answer. | Silence → rumor fills the vacuum → the best people leave first (they have options). |
| **2. Sequence** — which roles change first | Start where the task is bounded, the win is measurable, and the team is willing — same logic as pilot selection. | Leading with the most anxious or most regulated role stalls the whole program. |
| **3. Reskilling** — from awareness to capability | Tiered (awareness / practitioner / builder), matched to role. Not one generic "prompt training." | "Everyone trained, nobody uses it" — capability theater. |
| **4. Measurement** — productivity without surveillance | Measure teams and outcomes, never keystrokes or per-person prompt content. | Surveillance backlash kills adoption and invites legal/works-council action. |
| **GATE. Labor consultation** | In many jurisdictions a material change to how work is done is a **consultation or bargaining obligation**, not a unilateral rollout. | Skipping it can void the rollout and trigger disputes. **Get legal/ER sign-off before launch.** |

---

## 1. Role-impact map

What actually changes per role archetype. Net effect is the honest version — some tasks shrink, the role rarely vanishes, and the reskill move is the path forward. Illustrative, not a headcount model; calibrate to your org.

| Role archetype | What Claude changes | Net effect on the role | Reskill move |
|---|---|---|---|
| **Support / service** | Drafts replies, summarizes tickets, surfaces KB answers | Volume-per-agent up; role shifts toward edge cases + empathy + escalation judgment | Practitioner: review-and-edit discipline, when to override the draft |
| **Analysts / knowledge work** | First-draft analysis, data wrangling, doc synthesis | Faster to first draft; value moves to question-framing + judgment + verification | Practitioner: grounding/verification, knowing what the model can't be trusted on |
| **Developers** | Code gen, review, migration, test scaffolding | Throughput up; value moves to design, review, system thinking | Builder: [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) + skills/hooks |
| **Writers / marketing** | Drafts, variants, repurposing | Output volume up; value moves to voice, strategy, editorial judgment | Practitioner: editing for voice, fact-checking, brand guardrails |
| **Ops / admin** | Scheduling, data entry, routine docs, inbox triage | Routine load down; role shifts to exception handling + coordination | Awareness → practitioner; Cowork for desktop tasks |
| **Managers** | Summarizes status, drafts reviews, preps 1:1s | Admin load down; more time for the parts that need a human manager | Awareness: how their team uses it, how to measure it humanely |

The pattern across every row: **the task shrinks, the judgment grows.** The honest message is not "your job is safe forever" and not "you'll be replaced" — it's "the part of your job that was rote is changing, and the part that needs you is what's left." Say that.

---

## 2. The narrative — what to say

Plain, early, written. The comms below deliberately avoid hype and avoid euphemism — both read as evasion to a workforce that is already anxious.

**Answer the real question directly.** People hear "AI rollout" as "am I being replaced?" Don't make them ask. Lead with it:

> "We're giving you Claude to take the rote parts of your work off your plate. We're not running this to cut headcount in [team] — we're running it because [the bounded, true reason: faster response times / more analysis capacity / less after-hours admin]. What changes is the work, not whether we need you. Here's the part we're still figuring out, and here's how you'll be involved."

**Cascade in order.** Exec frames the why (and the honest scope of any headcount intent — if there is one, say so; if there isn't, commit to it). Managers translate to their team's actual tasks. ICs get hands-on enablement, not a town-hall slide. A message that only lives in an all-hands is a message nobody remembers.

**What not to say:**

- ❌ "AI will transform everything" — abstract hype erodes trust; people want specifics about *their* Tuesday.
- ❌ "Nothing will change" — visibly false; destroys credibility for everything after it.
- ❌ Silence on jobs — the single most damaging choice. The rumor is always worse than the truth, and your strongest people leave first.
- ❌ Euphemism ("synergies," "efficiencies") — read instantly as "layoffs we won't name."

---

## 3. Reskilling — three tiers, matched to role

"Prompt training" as a one-size course is the capability-theater trap: attendance without adoption. Tier it.

| Tier | Who | Goal | Time |
|---|---|---|---|
| **Awareness** | Everyone affected | What it is, what it can't be trusted on, how to start, where the guardrails are | ~1–2 hrs |
| **Practitioner** | Daily users in changed roles | Review-and-edit discipline, verification, prompt patterns for *their* task, when to override | ~1 day + ongoing |
| **Builder** | Power users, COE feeders | Skills, MCP, evals, building reusable tooling for the team | Ongoing; feeds the COE in [`adoption-playbook.md`](adoption-playbook.md) |

The non-obvious tier is **practitioner**, and its core skill is *verification* — knowing what the model gets wrong and catching it. A workforce that trusts output blindly is a quality incident waiting to happen; a workforce that can't trust it at all never adopts. Practitioner training is where that judgment is built. The one-page handout for this tier is [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) — give it to every user in week one. Pair with [`claude-misconceptions.md`](claude-misconceptions.md) to kill the stale priors people arrive with.

---

## 4. Measure productivity without surveilling people

There's a bright line, and crossing it is the fastest way to kill a rollout. Measurement earns trust; surveillance destroys it (and in many jurisdictions is a legal exposure).

| Measure (team + outcome) | Don't measure (person + activity) |
|---|---|
| Team cycle-time, throughput, quality/error rate | Per-person keystrokes, prompts-per-day, "AI usage" leaderboards |
| Adoption rate (% of eligible team active) | Individual prompt *content* / conversation surveillance |
| Cost-per-task, deflection rate, CSAT | Per-person ranking by tool usage |
| Self-reported time-saved (anonymous, aggregate) | Anything that feeds a performance review without consent |

**Why the right column backfires:** usage surveillance trains people to game the metric (paste-and-pray to hit a prompt quota), drives real usage *underground* (shadow AI on personal accounts — a worse governance outcome), and in works-council / co-determination jurisdictions can be an unlawful monitoring measure. You get worse data, worse governance, and legal risk in exchange for a vanity dashboard. Measure whether the *work* got better, not whether a *person* clicked enough.

This also feeds the ROI case honestly — see the realized-capture discount in [`roi-worksheet.html`](roi-worksheet.html). Team-level outcome data is exactly what defends the value number to a CFO; per-person surveillance data does not.

---

## 5. Labor consultation — the gate before launch

In many jurisdictions, materially changing how people work is not a unilateral management decision:

- **EU / works-council countries** (Germany, France, Netherlands, others): co-determination / information-and-consultation obligations may apply *before* rollout, especially where monitoring is involved. This is jurisdiction-specific — **get employment counsel and employee-relations sign-off**; don't infer the obligation from this guide.
- **Unionized workforces**: a change to working conditions may be a bargaining subject. Engage early; a surprise rollout is a grievance.
- **Even where not legally required**: early consultation buys adoption. People support what they helped shape.

Treat this as a hard gate in the Week 0 approval log ([`adoption-playbook.md`](adoption-playbook.md)) for any affected population — alongside the BAA/DPA gates in [`procurement-pack.md`](procurement-pack.md).

---

## Failure modes (people-side)

| # | Pattern | Symptom | Fix |
|---|---|---|---|
| 1 | **Replacement-panic freeze** | Rumors of layoffs; quiet quitting; top performers leave | Name the headcount intent honestly and early — even "no cuts in this team" in writing |
| 2 | **Mandate without enablement** | "Everyone must use AI" with no training, no time, no guardrails | Tiered reskilling + protected ramp time; mandate is not a method |
| 3 | **Surveillance backlash** | Usage dashboards by person; trust collapses; usage goes underground | Measure teams + outcomes only (§4); kill per-person activity tracking |
| 4 | **Capability theater** | 100% "trained," ~10% actually using it | Measure adoption + outcomes, not attendance; practitioner tier, not awareness-only |
| 5 | **Shadow AI** | Staff use personal accounts to avoid scrutiny or fill a tooling gap | Provide a sanctioned, governed surface ([`surface-rollout-matrix.md`](surface-rollout-matrix.md)) + safe enablement; surveillance *causes* this |
| 6 | **Manager bypass** | Middle managers don't adopt, so their teams don't either | Enable managers first (awareness tier); they're the cascade's load-bearing layer |

---

## Companion artifacts

- [`adoption-playbook.md`](adoption-playbook.md) — the 90-day org timeline this runs alongside; Week 0 approval log + COE.
- [`surface-rollout-matrix.md`](surface-rollout-matrix.md) — which surface to give which population first.
- [`cowork-adoption-guide.md`](cowork-adoption-guide.md) / [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) — the technical rollout per audience.
- [`roi-worksheet.html`](roi-worksheet.html) — the value case; realized-capture discount ties to honest, team-level measurement.
- [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) — the practitioner-tier handout (§3) made deployable: the one-page mindset shift you give every user in week one.
- [`claude-misconceptions.md`](claude-misconceptions.md) — kills the stale priors people arrive with (awareness-tier reading).
- Companion repo [`ai-architect-showcase`](https://github.com/gmanch94/ai-architect-showcase) — EEOC / responsible-AI workforce framing, vendor-neutral.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Labor-consultation obligations are jurisdiction-specific — verify with employment counsel. Verify model surface at anthropic.com.`
