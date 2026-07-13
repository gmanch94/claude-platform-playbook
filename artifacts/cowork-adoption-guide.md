# Claude Cowork Adoption Guide — rolling out agentic knowledge work

**As of 2026-07.** Pinned to the current Cowork surface. Refresh monthly with [`../docs/feature-inventory.md`](../docs/feature-inventory.md). All product facts cite primary sources — verify at [support.claude.com](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork) before committing budget or policy.

A per-surface rollout guide for **Claude Cowork** — the desktop agent that takes a goal and returns a finished deliverable by working across your local files and apps. This is the everyday knowledge-work rollout guide; [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) is its software-development counterpart. For the platform-wide 90-day arc, see [`adoption-playbook.md`](adoption-playbook.md); for where Cowork sits against the other surfaces, see [`surface-rollout-matrix.md`](surface-rollout-matrix.md).

> **The decision this guide serves:** *Do we put an agent that takes real actions on our people's machines — and if so, for whom, on which files, with what guardrails?* Cowork is the highest-agency, highest-blast-radius product surface Anthropic ships to non-developers. The rollout question is not "is it useful" (it is); it's "what can it touch, and who governs that." [H — [anthropic.com/product/claude-cowork](https://www.anthropic.com/product/claude-cowork)]

---

## What Cowork is (and why it's a different rollout from chat)

Cowork runs in the **Claude desktop app**, reads and writes the **local files and folders you connect**, coordinates **sub-agents** to break work into parallel steps, and produces **finished deliverables** — Excel with working formulas, PowerPoint, formatted documents — without you prompting each step. It supports long-running and **scheduled tasks**. [H — [support.claude.com get-started](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)]

The rollout difference from chat in one line: **chat answers; Cowork acts.** In chat, Claude can't reach your files. In Cowork, Claude reads, edits, and creates files in folders you specify and takes real actions on your behalf. That single capability is the entire governance story. [H]

**Who it's for:** non-technical knowledge workers whose day is high-effort, repeatable file work — researchers, analysts, operations, legal, finance. No coding background required. The value is the tedious-but-skipped task (scanning data, reconciling feedback) that now actually gets done. [H — [anthropic.com/product/claude-cowork](https://www.anthropic.com/product/claude-cowork)]

---

## The operating posture to instill

Cowork hands non-engineers the same high-agency agent engineers get — so the same working style matters, minus the jargon. Bake it into onboarding and the week-1 handout so everyone drives Cowork like **a careful expert who owns the outcome** — optimistic the agent can do the work, rigorous about proving it did. It's the non-engineer form of the posture the [`claude-code-101.md`](claude-code-101.md) and [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) guides instill in engineers.

- **Plan → act → verify.** Have Cowork lay out what it intends to do before it touches your files — review-before-act is this habit built into the product — let it work, then check the deliverable against the source. No "done" until you've opened the output and confirmed it.
- **Respond, don't react.** Give it the goal and the context up front — which folder, the format you want, the constraints — instead of firing a vague one-liner and re-steering mid-run. A sharp brief beats three correction rounds.
- **Mandate an adversarial check.** A finished-*looking* deliverable is a draft until verified. Spot-check the numbers, open the formula, reconcile against the source; have a second pass — you, a colleague, or Cowork critiquing its own output — before it leaves the building. This is the non-engineer equivalent of the engineer's code review.
- **Ground it; don't let it guess.** The agent invents less when it works from the real thing. Connect the actual source folder, point it at the real file, ask it to cite where a figure came from, and let its sub-agents do the wide reads so the result comes back distilled and grounded. When it can't verify something, it should say so — not fill the gap with a confident number.
- **Mind the plan burn.** Cowork draws down your plan's usage faster than chat — this is the non-engineer form of "stay token-frugal." Scope each task to the folder it needs, keep unrelated work in separate sessions, and turn on scheduled tasks deliberately, not everywhere. Sizing is a plan-tier question — see [`subscription-selection-guide.md`](subscription-selection-guide.md).
- **Calibrate confidence.** Separate what the agent verified from what it assumed; treat a first pass as a draft, not a finished artifact; know the failure mode of the task (a wrong cell in a formula, a stale source file) and check exactly there.

Give the people you onboard [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) as the week-1 handout — it carries the same direct-and-check, verify-what-it-gets-wrong habits in end-user language.

---

## The decision: three gates before you provision anyone

**Gate 0 — Compliance (ask first).**
Is PHI, or any data requiring a **BAA** or **data residency**, ever going to sit in a folder Cowork can reach? → **Cowork is not an option for that workload.** The BAA explicitly does **not** cover Cowork (it covers the first-party API and Enterprise Chat/Projects/Artifacts/file-creation, with admin HIPAA activation). Route that work to a BAA-covered surface or keep it out of connected folders. This is independent of how useful Cowork is. [H — [privacy.claude.com BAA](https://privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers); enumerated in [`governance-overlay.md`](governance-overlay.md) §4]

**Gate 1 — Plan + device.**
Cowork requires a **paid Claude plan** (Pro, Max, Team, or Enterprise) **and** the **desktop app** for macOS or Windows — it is not on web or mobile (Pro/Max get mobile *messaging* into a session, not the full surface). No free tier. If your knowledge workers are on Free, or you're a web-only/locked-down-laptop shop, that's the first blocker to clear. [H — [support.claude.com get-started](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)]

**Gate 2 — Governance ownership.**
Because Cowork takes real actions on a real machine, *someone* must own the answer to "which folders, which egress, reviewed by whom." On Team/Enterprise that owner uses admin controls (below). For individual Pro/Max seats there is no central admin — the user *is* the governance boundary. Decide who owns this before broad enablement, not after the first incident.

---

## Availability & prerequisites

| Requirement | Detail | Source |
|---|---|---|
| **Plan** | Paid only — Pro, Max, Team, Enterprise. No Free. | [H] support.claude.com |
| **App** | Claude Desktop for macOS or Windows (latest version). Not web, not mobile. | [H] support.claude.com |
| **Connectivity** | Active internet required for the whole session. | [H] support.claude.com |
| **Mobile** | Pro/Max can *message* a session from mobile — not the full desktop surface. | [H] support.claude.com |
| **BAA / residency** | Not covered by BAA; treat as out-of-scope for PHI and residency-bound data. | [H] privacy.claude.com |

---

## Rollout arc

Anthropic publishes a product get-started flow; this guide adds the executive/governance layer on top. Four phases, gated — don't skip the pilot folder discipline.

### Phase 0 — Pre-flight (before anyone connects a folder)
- **Name the governance owner** (Gate 2). On Team/Enterprise, confirm an admin will manage feature access, spend, and usage. [H — [claude.com/blog/cowork-for-enterprise](https://claude.com/blog/cowork-for-enterprise)]
- **Draw the folder boundary.** Decide which folders are pilot-eligible. Rule of thumb: start with a *throwaway or low-sensitivity* working folder, never a synced corporate drive root.
- **Confirm Gate 0.** Document that no PHI / residency-bound data lives in pilot-eligible folders.
- **Set egress expectations.** Network access follows the egress settings you configure — decide the default before the pilot, not per-task.

### Phase 1 — Pilot (one team, scoped folders)
- One willing team, the kind of work Cowork is best at (high-effort, repeatable, file-heavy).
- Connect **only** the pilot folders. Keep "review Claude's planned actions before allowing" on for sensitive files — this is the core safety behavior. [H]
- Measure against a baseline (see metrics) so you can defend the expansion in Phase 3.

### Phase 2 — Expand (more teams, same discipline)
- Add teams whose work matches the pattern. Each new team repeats the folder-boundary + Gate-0 check; the check is per-team, not once.
- Introduce **scheduled tasks** for recurring deliverables once a team trusts the single-run output.
- If you're Enterprise, stand up a **private plugin marketplace** so teams use vetted plugins, not arbitrary ones. [H — [claude.com/blog/cowork-plugins-across-enterprise](https://claude.com/blog/cowork-plugins-across-enterprise)]

### Phase 3 — Enterprise governance (make it durable)
- Use enterprise admin controls to **manage feature access, control spend, and track usage** across the org. [H — [claude.com/blog/cowork-for-enterprise](https://claude.com/blog/cowork-for-enterprise)]
- Size Cowork as **plan-capacity burn, not metered API.** Anthropic states Cowork *draws down more usage than standard chat* [H — [support.claude.com](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)] — it draws down the seat plan's usage allowance, so it's a **plan-tier** sizing question (Pro vs Max 5×/20× vs Team), handled in [`subscription-selection-guide.md`](subscription-selection-guide.md). It is *not* an output of [`cost-calculator.html`](cost-calculator.html), which models API tokens + flat seat license — neither captures Cowork's in-plan burn.
- Review the folder-boundary policy quarterly; connected-folder scope drifts as people get comfortable.

---

## Governance & security model (the part chat doesn't have)

This is where Cowork rollout earns its own guide. The layered protections, and what each does *not* cover:

| Control | What it does | What it does **not** do |
|---|---|---|
| **Code-execution isolation** | Shell commands and code Claude writes run in an isolated VM, separate from your OS. | Does not isolate the *connected folders* — those are real files Claude edits for real. [H] |
| **Folder-scoped file access** | Claude reads/writes only folders you connect. | Does not stop a too-broad connection — connecting a drive root grants the drive root. |
| **Egress settings** | Network access follows the egress you configure. | Default-permissive egress on a sensitive folder is a data-exfil path; set it deliberately. |
| **Review-before-act** | You can review planned actions before allowing them, especially on sensitive files. | Only protects if reviewers actually read — "approve all" defeats it. [H] |
| **Enterprise admin (Team/Ent)** | Manage feature access, spend, usage; private plugin marketplace. | Not present on individual Pro/Max — the user is the only boundary there. [H] |
| **BAA** | — | **Does not exist for Cowork.** No PHI. [H] |
| **Data residency** | — | Not a Cowork guarantee — treat residency-bound data as out-of-scope. |

See [`governance-overlay.md`](governance-overlay.md) for the cross-surface no-train / BAA / residency picture.

---

## Success metrics (numeric, defensible)

Pick a baseline in Phase 0 so Phase 3 has evidence:

- **Cycle time per deliverable** — hours-to-finished for the target task, before vs. with Cowork.
- **Tasks-now-done** — count of "high-effort, skipped" tasks (data scans, feedback reconciliation) that now complete. This is Cowork's distinctive value; measure it explicitly. [H — [anthropic.com/product/claude-cowork](https://www.anthropic.com/product/claude-cowork)]
- **Review-rejection rate** — share of planned actions a user rejects on review. Rising rate = scope or trust problem; near-zero with sensitive folders = rubber-stamping risk.
- **Plan-capacity burn** — Cowork draws down the seat plan's usage allowance faster than chat [H — [support.claude.com](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)]; track which users approach their limit so month-two is a planned tier upgrade, not a surprise — measure capacity headroom, not the person (see [`workforce-change-guide.md`](workforce-change-guide.md) §4 on measuring without surveillance). This is plan-tier headroom (see [`subscription-selection-guide.md`](subscription-selection-guide.md)), not metered API.

---

## Failure modes

1. **Connecting a drive root "to be safe."** The opposite — it grants Claude the whole drive. Scope to the narrowest folder that holds the task's files. → data blast radius.
2. **Rubber-stamping review prompts.** Review-before-act is the core guardrail; "approve all" on sensitive folders removes it. → unintended edits/deletes.
3. **PHI in a connected folder.** Cowork carries no BAA as of 2026-07 ("not yet available for any HIPAA-ready Enterprise plans" — support.claude.com; coverage expands over time, so confirm current scope with your Anthropic rep before relying on it). Any PHI a connected folder exposes is outside HIPAA coverage today. → compliance breach. [H]
4. **Default-permissive egress on sensitive data.** Network egress follows your settings; an unset default plus a sensitive folder is an exfil path. → data leak.
5. **Broad enablement with no admin owner.** On Team/Enterprise, enabling org-wide without assigning feature-access/spend/usage ownership means no one is watching the blast radius. → ungoverned agency.
6. **Arbitrary plugins on Enterprise.** Without a private plugin marketplace, teams pull unvetted plugins into an agent that touches local files. → supply-chain surface. [H]
7. **Budgeting Cowork as free-with-the-seat.** It draws down the plan's usage allowance — heavy scheduled-task use can push a user to the next tier (Pro→Max, or a premium Team seat). Size it as plan-tier headroom, not metered API. → mis-budget.

---

## How this connects to the rest

- Sits beside [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) — Cowork for everyday deliverables, Claude Code for software and coding work; same "agent takes real actions" governance shape, different kind of work.
- Role-impact + augmentation-vs-replacement framing for the people you onboard: [`workforce-change-guide.md`](workforce-change-guide.md) (§4 — measure capacity, not the person).
- Plots against the other surfaces in [`surface-rollout-matrix.md`](surface-rollout-matrix.md).
- Platform-wide rollout context in [`adoption-playbook.md`](adoption-playbook.md) (90-day org arc).
- Compliance depth (no-train, BAA, residency) in [`governance-overlay.md`](governance-overlay.md).
- Plan-tier headroom + seat decision in [`subscription-selection-guide.md`](subscription-selection-guide.md) (Cowork's usage burn is a plan-tier question); API inference cost in [`cost-calculator.html`](cost-calculator.html).
- The week-one mindset handout for the people you onboard: [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) — direct-and-check, verify what the model gets wrong, and the data boundary (no PHI in a connected folder).
- Surface status + source-of-truth: [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify Cowork availability + governance at support.claude.com.`
