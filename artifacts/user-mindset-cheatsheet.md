# User Mindset Cheatsheet — How Your Work Changes with Claude

**As of 2026-07.** Pin to current surface — refresh monthly.

The one-page handout for the person actually using Claude. It's about *mindset*, not prompt mechanics: the few reflexes that have to change before the tool starts paying off for you. Read it once, then keep it where you'll see it. Print it, pin it, paste it in the team channel.

> **Start here — if you read nothing else.** This week, take one task you already do, do it *with* Claude, and check the result yourself before it goes anywhere. That's the shift in one move: **Claude drafts; you direct, check, and own what ships.** It changes *what* you do, not *whether* you're needed — the judgment is the part that's now yours.

---

## The seven shifts

The basic shift is the box above. These seven reflexes turn it into a habit. Read the old→new shift and what it means on Claude first; treat the last column — the **trap if you overdo it** — as a caveat for once you're moving, not a step to take now.

| Old reflex | New reflex | On Claude, that means | The trap if you overdo it |
|---|---|---|---|
| **Do the whole task yourself** | **Direct it, then check it** | Claude drafts; you edit and you stay accountable for what ships. Your value moves from typing to judging. | **Rubber-stamping** — you're accountable on paper but you stopped reading, so the mistake ships under your name and you never saw it. The "approve all" trap. |
| **Type a terse command** | **Describe what "good" looks like** | Give the goal, the audience, the format, and one example of done-right — not step-by-step keystrokes. | **Vague ask, no success criteria** → confident output of the wrong shape, and you can't say why it's wrong. |
| **Expect a perfect first answer** | **Treat the first reply as a draft and steer** | It's a conversation. Correct it, narrow it, add a constraint, ask for a redo — Claude holds the thread across turns. | **One-shot-or-abandon** — tossing a near-miss instead of saying "tighter, drop the intro, keep the table." |
| **Assume it knows your world** | **Bring the context to it** | It can't see your files, standards, or history unless you provide them — paste the standard, keep recurring context in a **Project**, connect the folder in **Cowork**. | **Two edges:** under-context (generic guesswork) *and* over-stuffing (dumping everything in degrades quality and runs up cost — the context window is a tool, not a dumping ground). |
| **Send one giant ask** | **Break it into steps** | Decompose: outline → draft → check → format. Verify each step before the next builds on it. | **One mega-prompt** that fails silently three requirements deep, where you can't tell which part broke. |
| **Trust it / distrust it (either extreme)** | **Verify what it gets wrong** | Know the model's failure surface and check *those* outputs every time — it can be confidently wrong. The five things to always check are listed below. | **Trust-blind** = a quality incident with your name on it. **Trust-never** = you never actually adopt. The skill is calibrated checking, not faith or fear. |
| **Reach for it for everything (or nothing)** | **Reach first for the right class of task** | Rote, draft, transform, summarize, triage → Claude-first. Judgment calls, relationships, the final accountable decision → still you. | Using it **where [`anti-use-cases.md`](anti-use-cases.md) says don't** — high-stakes irreversible calls, unverifiable domains. |

The pattern down the whole column: **the task shrinks, the judgment grows.** What's left is the part that needs you.

---

## Where you are on the curve — and your next move

You don't adopt all seven shifts at once. They land in order, as you're ready — so locate yourself and work the *next* shift, not all of them:

- **Trying it** — you've moved one task off your plate (shift 1). *Next:* stop tossing near-misses; steer the draft across turns (**shift 3**).
- **Directing it** — you delegate drafts and check them (shifts 1–3). *Next:* stop re-pasting context every time; keep it in a **Project** and reuse the prompt that worked (**shift 4**).
- **Fluent** — you bring context and break work into steps (shifts 4–5). *Next:* match the surface to the task and verify the model's *failure surface*, not everything (**shift 6**).
- **Multiplier** — you reach calibrated-first and know where *not* to (shifts 6–7). *Next:* package what works as a shared **Project** or **Skill** so your team inherits it, and codify the team's verify list.

**What mature use looks like:** not "Claude does more of my job" — a smaller task and bigger judgment on *every* item. You direct a portfolio of drafts and own each call that ships. That's the whole column above, made routine.

This is a locator, not a ladder to climb fast: most people live at *Directing it* and that's a real win. The point is knowing your *one* next move, not racing to Multiplier.

---

## Daily task patterns — what to hand over, what to keep

| Task | Claude-first move | Keep it yours | Best surface |
|---|---|---|---|
| **Draft** | First version of the email, doc, code, reply | The voice, the final call, anything that commits you | Chat · Projects |
| **Summarize** | Long thread, document, or meeting into the gist | Deciding what to *do* about it | Chat · Projects |
| **Analyze** | Wrangle data, reconcile feedback, surface patterns | The interpretation and the decision | Chat · Cowork (your files) |
| **Convert / reformat** | Restructure, translate, change format, clean up | Verifying nothing was dropped or altered | Chat · Cowork |
| **Brainstorm** | Options, names, angles, counter-arguments | Choosing; killing the bad ideas | Chat |
| **Review** | A second pair of eyes on *your* draft | Whether to accept each suggestion | Chat · Claude Code (eng) |

Which surface is cleared for *you* is a rollout decision — see [`surface-rollout-matrix.md`](surface-rollout-matrix.md). Don't assume a surface is approved for your data just because you can open it.

---

## Always verify these (the model can sound certain and be wrong)

- **Facts and citations** — names, dates, quotes, references. It can fabricate a plausible-looking source.
- **Numbers and math** — totals, percentages, anything that has to add up.
- **Anything time-sensitive** — events, prices, or releases after the model's training cutoff; it doesn't know what it doesn't know.
- **Your internal specifics** — your policies, your codebase, your customer data. It guesses unless you give it the real thing.
- **Anything you'll be held accountable for** — if your name goes on it, you check it. Full stop.

Verification *is* the practitioner skill — see [`workforce-change-guide.md`](workforce-change-guide.md) §3. A team that can't verify never safely adopts; a team that verifies nothing ships errors faster.

---

## 🛑 The boundary — before you paste or connect anything

Know your sanctioned surface and what it's cleared for. **Don't put regulated, secret, or customer data into a surface that isn't covered for it.** Two common traps:

- **Cowork carries no BAA** — no PHI in a folder Cowork can reach. ([`cowork-adoption-guide.md`](cowork-adoption-guide.md) Gate 0.)
- **Your chat surface may not be cleared** for customer or regulated data — confirm before you paste it.

⚠ When you're not sure whether data is allowed on a surface, **ask your governance owner first.** "Ask first" is cheap; "clean up a leak after" is not. The compliance picture lives in [`governance-overlay.md`](governance-overlay.md) — you don't have to read it, but the person who provisioned you does.

---

## Your first week (build the habit on one task)

1. **Pick one rote task** you do every week — a recurring report, a class of email, a cleanup job.
2. **Do it with Claude this week**, then verify the output against how you'd have done it by hand. Compare honestly.
3. **Keep the prompt that worked**, reuse it next week — and keep checking the result each time, since the task (and the model) drift. One reliable habit beats ten experiments you never repeat.

The goal of week one isn't to use Claude for everything. It's to move *one* task from "I do it" to "I direct and check it" — and feel the difference.

---

## Companion artifacts

- [`user-mindset-cheatsheet-color.html`](user-mindset-cheatsheet-color.html) — this same sheet **colour-coded** for screen and print (green = the shift, amber = the trap, red = the boundary).
- [`user-mindset-mindmap.html`](user-mindset-mindmap.html) — the one-glance **visual** version of this sheet: the same seven shifts as a mindmap, to pin on a wall or drop in a deck.
- [`workforce-change-guide.md`](workforce-change-guide.md) — the CHRO/people strategy this is the user-facing handout for; this cheatsheet is its practitioner tier, made deployable.
- [`claude-misconceptions.md`](claude-misconceptions.md) — the stale priors people arrive with ("it refuses everything," "it needs fine-tuning"); kill them alongside this.
- [`anti-use-cases.md`](anti-use-cases.md) — where *not* to reach for Claude; the right-hand edge of shift seven.
- [`surface-rollout-matrix.md`](surface-rollout-matrix.md) — which surface you're cleared for, and in what order.
- [`cowork-adoption-guide.md`](cowork-adoption-guide.md) / [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) — the deep guide for your surface (non-engineer / engineer).
- [`rollout-kickoff-kit.md`](rollout-kickoff-kit.md) — the enablement lead deploys this cheatsheet in their Week-0 → Week-4 lane.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.`
