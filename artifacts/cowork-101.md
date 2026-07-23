# Claude Cowork 101 — driving the desktop agent well

**You have Cowork. This is how it actually behaves when you hand it a task — the plan it drafts, the folders it touches, the sub-agents it spins up, the review gate — and the gotcha on each.**

Audience: a knowledge worker with a paid seat (Pro / Max / Team / Enterprise) using Cowork on the desktop app — the surface that connects it to your local folders, which is the work this guide is about — and wants to drive it well. Not the rollout plan (that's [`cowork-adoption-guide.md`](cowork-adoption-guide.md) — should we deploy it, for whom, with what guardrails), not the product-surface tour (that's [`claude-product-101.md`](claude-product-101.md) §4, which stays thin on Cowork by design), not the mindset primer (that's [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md)). This is the **operator** layer — the mechanics that separate "I asked it to do a thing" from fluent, verified operation.

**Read the mindset primer first:** [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) carries the seven mindset shifts, the which-surface-for-which-task table, and the always-verify list. This guide is the layer under it — not *how your work changes* but *how Cowork behaves so you drive it well.* It points at the cheatsheet's reflexes rather than repeating them.

**The visual companion:** [`cowork-101-workflow.html`](cowork-101-workflow.html) draws the task lifecycle, the review-gate decision, and the folder-scope blast radius as diagrams. Read the two together — the picture is the fastest way to hold the loop in your head.

**Sourcing:** surface facts (status, plan gate, governance) come from [`../docs/feature-inventory.md`](../docs/feature-inventory.md), the repo's single source of truth, each row citing its `support.claude.com` anchor `[H]`. Behavioral notes (how a run *feels* in practice) are labeled as such and kept judgment-level — volatile UI specifics (exact toggles, current limits) live in the linked docs, which are canonical. Model pricing/tiers are **not** restated — see the inventory. *Not legal advice.*

---

## 0. What this adds over the other guides

Three artifacts already touch Cowork, and each stops short of the operator:

- The **cheatsheet** answers *how does my work change* — direct-and-check, verify, the data boundary. It names Cowork as the highest-privilege surface and moves on.
- **`claude-product-101.md` §4** carries three gotchas (BAA-excluded, scope the folder, review before you approve) and points here for depth.
- The **adoption guide** answers *should the org deploy this, and how* — three gates, a four-phase arc, governance ownership. That's the rollout decision, not the daily loop.

This guide answers the next question: *what actually happens when I hand Cowork a task, and how do I drive that well.* The one line that still governs everything: **chat answers; Cowork acts — you brief it, watch the plan, verify the deliverable, and own what ships.** Everything below is a mechanic in service of that.

---

## 1. What happens when you hand Cowork a task — the lifecycle

Cowork runs your session **remotely on Anthropic's servers** (beta) and is reached from the **desktop app, web, or mobile** — the **desktop app (macOS/Windows) is what bridges it to your local folders**, which is the work this guide is about. It reads and writes the **local folders you connect**, coordinates **sub-agents** to break work into parallel steps, and produces a **finished deliverable** — Excel with working formulas, PowerPoint, a formatted document — without you prompting each step. It supports long-running and **scheduled** tasks; your sessions and files live with your Claude account and follow you across surfaces. [H — [support.claude.com get-started](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)]

A task runs on this loop:

1. **You brief it** — a goal, the folder it needs, the output format, the constraints.
2. **It drafts a plan** — the steps it intends to take before touching anything.
3. **You review** — the *review-before-act* gate, especially on sensitive files (§4).
4. **It works** — reads and edits real files in the connected folders, spinning up sub-agents for the parallel parts (§5). Shell commands and code it writes run in an **isolated environment on Anthropic's servers, separate from your computer** — that isolation protects your machine, but it **doesn't change what Claude can read or do through the folder access you granted.** Those edits are real. [H]
5. **It returns a deliverable** — a finished object, not a chat reply.
6. **You verify** — open the output, check it against the source. Nothing is "done" until you've looked (§2).

[`cowork-101-workflow.html`](cowork-101-workflow.html) is this loop as a diagram. **The gotcha:** treating Cowork like chat — firing a vague one-liner and expecting an answer. What you get instead is an agent doing real file work off a thin brief. The lifecycle is the value; skipping the plan-review step or the verify step removes the two places where you stay in control.

---

## 2. The daily loop, done well

Plan → act → verify, in operator terms. This is the same discipline the engineer guides instill, minus the jargon.

- **Brief it like a careful expert, not a search box.** Goal, the folder, the format you want, the constraints — up front. A sharp brief beats three correction rounds mid-run. (*Respond, don't react.*) *Gotcha:* the vague ask ("clean this up") gets a confident deliverable of the wrong shape, and you can't say why it's wrong.
- **Watch the plan before you approve it.** The plan step exists so you catch a wrong assumption before it writes files, not after. Read what it intends to touch. *Gotcha:* approving the plan without reading it — you've handed write access to an assumption you never checked.
- **Let it work — don't micromanage each step.** The sub-agents (§5) exist to run the parallel parts; hovering over every step fights the decomposition and wastes the agent. Brief the goal, not a keystroke script.
- **Verify against the source, every time.** Open the deliverable. Check a formula, reconcile a number, spot the figure against the file it came from. *Gotcha — the house one:* the **finished-*looking*** deliverable. A fully populated spreadsheet with one broken formula looks done. A first pass is a draft until you've verified exactly where the task's failure mode lives (a wrong cell, a stale source file).

The cheatsheet's calibrate-confidence habit applies directly: separate what the agent *verified* from what it *assumed*, and check where the assumption would bite.

---

## 3. Connecting folders — the privilege dial

This is the entire governance story in one mechanic. Cowork reads and writes only the folders you connect — and it touches everything inside them.

- **Connect the narrowest folder that holds the task's files.** A tight scope is a small blast radius. *Gotcha:* connecting a synced-drive root "to be safe" does the opposite — it grants Claude the whole drive.
- **The isolation boundary is not your files.** Code and shell commands Claude writes run in an isolated environment **on Anthropic's servers, separate from your computer and network**. That isolation **protects your machine; it doesn't change what Claude can read or do through the folder access you granted** — those are real files Claude edits for real. [H] Don't read "isolated" as "your data stays put."
- **Egress follows the settings you set.** Network access is whatever you configured, not a safe default you can assume. On a sensitive folder, an unset-and-permissive egress is a data-exfil path. Set it deliberately before the task, not per-run.

Think of a connected folder as handing over a key. The question before every task: *what's the smallest key that lets it do the job?*

---

## 4. The review-before-act gate — in practice

The gate lets you review planned actions before allowing them, especially on sensitive files. [H] It is only protection **if you actually read what it's about to do.** Rubber-stamping the gate is the same failure as rubber-stamping a draft — with write access.

The tier discipline that makes oversight work (the operator form of [`claude-product-101.md`](claude-product-101.md) §9):

- **Ask-first — outward-facing or hard to undo.** Overwriting or deleting files, sending a message or email, changing permissions or settings, spending. A prior "go ahead" on the *task* does not carry to these; consent is per-action.
- **Hard-stop — never on autopilot, even if you told it to "just handle it."** Permanently deleting data, moving money, publishing externally, changing who can access something. You approve each, every time.

The test for which tier: ***can this be undone quietly if it's wrong?*** Yes → let it run. No → it's yours to approve, explicitly.

**Worked mini-example.** You tell Cowork *"sort last quarter's invoices into folders."* That authorizes the sorting. It does **not** authorize deleting a file it judged a duplicate, or emailing a vendor about a mismatch it spotted — those are irreversible or outward-facing, so it should stop and ask. You gave consent to the *sort*, once; the *delete* and the *send* each need their own yes.

*The security-architect version of this — bounding an agent's authority so a hijacked or over-eager agent can't even reach the irreversible action — is [`agentic-threat-model.md`](agentic-threat-model.md) (excessive agency). The org-level rollout controls are in [`cowork-adoption-guide.md`](cowork-adoption-guide.md).*

---

## 5. Sub-agents — how it parallelizes, and what that means for you

Cowork breaks a task into steps and runs the parallel ones as **sub-agents** — a wide read across many files comes back distilled, not as forty steps for you to babysit. What this changes about how you brief:

- **Brief the goal; let it decompose.** The decomposition is the agent's job. Handing it your own keystroke-by-keystroke script fights that and usually underperforms. *Gotcha:* over-specifying steps ties its hands; under-specifying the goal gets a confident answer of the wrong shape.
- **Wide reads are a strength — use them.** "Scan all 40 files and pull the anomalies" is exactly the shape sub-agents are good at. You get the distilled result.
- **More agents is not free, and errors compound.** Each hand-off is a place a small error can propagate. For the mechanism and the error-compounding math, see [`multi-agent-patterns.md`](multi-agent-patterns.md) — the engineering-depth version of what Cowork does under the hood.

---

## 6. Long-running and scheduled tasks

Cowork can run long tasks and run them **on a schedule** — a weekly reconciliation, a morning digest, a recurring report. [H] Two rules keep this from turning into an unwatched liability:

- **Verify one manual run before you schedule it.** A scheduled task you never checked is a wrong deliverable produced on a cadence, unwatched. Prove the single run is right first.
- **Turn it on deliberately, not everywhere.** Cowork draws down your plan's usage faster than chat [H — [support.claude.com](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)], and scheduled tasks run whether or not anyone's watching. Scope each to the folder it needs; sizing is a plan-tier question (Pro vs Max 5×/20× vs Team), handled in [`subscription-selection-guide.md`](subscription-selection-guide.md) — it is *not* an output of the API-token [`cost-calculator.html`](cost-calculator.html).

---

## 7. Worked examples

Four end-to-end walkthroughs, one per common role. Each names the brief that works, the shape of the plan, where to check, and the failure mode. *Scenarios are illustrative — the capabilities they use (folder-scope, review-before-act, sub-agents, scheduled tasks, Excel/PPT/doc output) are the inventory's; the specifics are made up.*

### (a) Analyst — reconcile 40 monthly spreadsheets into one summary

- **Brief:** *"In the `FY26-monthly/` folder there are 40 spreadsheets, one per business unit per month. Build one summary workbook with a tab per quarter, each cell a working formula that references the source files, and flag any unit whose spend jumped more than 20% month-over-month."*
- **Plan to expect:** enumerate the files, infer the shared column layout, build the summary with live formulas, run the anomaly check as a sub-agent pass across all 40.
- **Where to check:** open two or three summary cells and confirm the **formula** references the right source, not a pasted static number; re-derive one flagged anomaly by hand.
- **Failure mode:** a summary that *looks* right but hard-coded values instead of formulas — it won't update when a source file changes. This is the finished-looking trap (§2), and it bites exactly at the cell you didn't open.

### (b) Ops — turn a folder of notes into a formatted deck

- **Brief:** *"From `QBR-notes/` (meeting notes) and `metrics.xlsx`, build a 10-slide QBR deck: agenda, three wins, three risks, the metrics as charts, next-quarter asks. Use our template if one's in the folder; otherwise clean and consistent."*
- **Plan to expect:** read the notes, pull structure, read the metrics, generate charts, assemble the PPTX.
- **Where to check:** the numbers on the chart slides against `metrics.xlsx`; that no "risk" was invented that the notes don't support (grounding).
- **Failure mode:** a confident narrative that smooths over a gap in the notes — a slide that reads well but asserts something the source doesn't. Ask it to cite which note each claim came from.

### (c) Finance — clean and de-dup a messy transaction export

- **Brief:** *"`transactions-2026.csv` has duplicate rows, inconsistent vendor names, and mixed date formats. Produce a cleaned copy: dedup, normalize vendor names to one spelling each, ISO dates, and a short change-log of what you merged or dropped. Do not delete the original."*
- **Plan to expect:** load, detect duplicates, propose a vendor-name mapping, normalize dates, write a *new* file plus the change-log.
- **Where to check:** the change-log first — it's the audit trail. Confirm "duplicates" were true duplicates, not distinct transactions that looked alike; confirm the original is untouched.
- **Failure mode:** an over-eager merge that collapses two real vendors into one, or drops a row it misjudged as a dupe. The delete/overwrite of the original is an **ask-first** action (§4) — the "do not delete the original" line plus the change-log is what keeps this reversible.

### (d) Research — extract figures from a document set, with citations

- **Brief:** *"Read every PDF in `market-reports/` and build a table of market-size figures: metric, value, year, and the exact file and page each came from. If a figure is an estimate or a range, mark it as such. Don't fill a gap with a number that isn't in the sources."*
- **Plan to expect:** sub-agent reads across the set, extract-and-cite, assemble the table.
- **Where to check:** open two citations and confirm the figure is actually on that page (the web-search reflex from the cheatsheet, applied to files) — the citation is the claim, not Claude's summary of it.
- **Failure mode:** a plausible number with a citation that doesn't support it. The "don't fill a gap" instruction plus spot-checking the citations is the guard; a table you didn't sample is a set of claims you're now vouching for.

---

## 8. The data boundary — the one governance must-have

A user-facing guide carries exactly one governance rule, and it's this: **no PHI or regulated data in a folder Cowork can reach.** Cowork is **BAA-excluded as of 2026-07** — "not yet available for any HIPAA-ready Enterprise plans." [H — [privacy.claude.com BAA](https://privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers); [support.claude.com](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)] The covered set expands over time, so confirm current scope with your admin or Anthropic rep before relying on it — but the default posture is: any PHI a connected folder exposes is outside HIPAA coverage today. And because Cowork **runs your session remotely and your sessions and files live with your Claude account** [H], a connected folder's contents leave your machine — one more reason the boundary is real, not theoretical.

This guide **asserts no coverage of its own.** The actual posture — what's BAA-covered, ZDR-eligible, residency-controlled, per surface — lives in [`governance-overlay.md`](governance-overlay.md) (the reference) and [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) (the per-feature trust-zone diagrams). The org's Cowork-specific controls are in [`cowork-adoption-guide.md`](cowork-adoption-guide.md). When in doubt about your data, that's the map, and the rule is: **confirm your folder's data is cleared before you connect it.**

---

## 9. Trick list — the power-user moves

- **Brief with a format and one example.** "Like this row, for all 40" beats a paragraph of description.
- **Point at the real file and cell.** Grounding it on the actual source is what stops it inventing; ask it to cite where each figure came from.
- **One task per session.** Keep unrelated work in separate sessions — it holds cost down and stops the output drifting toward an old topic.
- **Dry-run the plan against a copy folder.** For anything touching many files or a folder you care about, run it once on a duplicate before the real one.
- **Schedule only after a clean manual run** (§6). Prove it, then automate it.
- **Ask for the plan first** on anything that touches many files or a sensitive folder — the plan is your cheapest checkpoint.

---

## 10. Approach with extreme caution — the house failure modes

- **Rubber-stamping the review gate.** The gate is only protection if you read it. Approving without looking is write access on autopilot. (§4)
- **Connecting a drive root "to be safe."** It grants the whole drive. Scope to the narrowest folder. (§3)
- **PHI or regulated data in a connected folder.** Cowork carries no BAA as of 2026-07 — that data is outside coverage. Confirm before you connect. (§8)
- **Default-permissive egress on sensitive data.** Egress follows your settings; unset plus sensitive is an exfil path. (§3)
- **Treating a finished-*looking* deliverable as finished.** A populated spreadsheet with a broken formula looks done. Verify where the failure lives. (§2)
- **Scheduling an unverified task.** A wrong deliverable, produced on a cadence, unwatched. Prove one run first. (§6)
- **Budgeting Cowork as free-with-the-seat.** It draws down the plan's usage faster than chat; heavy scheduled use can push you to the next tier. Size it as plan-tier headroom, not metered API. (§6, [`subscription-selection-guide.md`](subscription-selection-guide.md))

---

*See also: [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) (the mindset primer) · [`cowork-101-workflow.html`](cowork-101-workflow.html) (the visual companion) · [`cowork-adoption-guide.md`](cowork-adoption-guide.md) (the org rollout + governance) · [`claude-product-101.md`](claude-product-101.md) (the other product surfaces) · [`claude-code-101.md`](claude-code-101.md) (the engineer twin) · [`multi-agent-patterns.md`](multi-agent-patterns.md) (sub-agent mechanism) · [`subscription-selection-guide.md`](subscription-selection-guide.md) (plan-tier + burn) · [`agentic-threat-model.md`](agentic-threat-model.md) (bounding agent authority) · [`governance-overlay.md`](governance-overlay.md) + [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) (the boundary) · [`../docs/feature-inventory.md`](../docs/feature-inventory.md) (source of truth).*

---

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify Cowork availability + governance at support.claude.com.
