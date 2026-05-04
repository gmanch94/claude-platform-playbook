# LESSONS_LEARNED.md

Running log of process lessons for working in this repo. Append, don't overwrite. New lessons go at the top of "Repo-specific lessons" with a date-stamp.

---

## Session-start protocol (universal — applies to every session in this repo)

**At the start of every session in this repo, before any tool calls beyond orientation:**

1. **Check for a resume bookmark.** In this repo: [`scratch/NEXT_SESSION.md`](scratch/NEXT_SESSION.md). The bookmark captures HEAD, recent landings, current backlog with triggers, and "things to NOT do without explicit instruction." `scratch/` is gitignored — the bookmark is the user's personal resume aid, not part of the published artifact set.
2. **Read [`CLAUDE.md`](CLAUDE.md).** Repo posture, single-source-of-truth rule (`docs/feature-inventory.md` first, artifacts second), tone constraints, things to avoid.
3. **Read this file.** Lessons compound — re-reading prevents repeat misses.
4. **Verify state.** `git status` + `git log --oneline -5` should match the bookmark's HEAD line.
5. **Only then ask the user what they want to work on.** Don't start backlog items proactively.

**Why this exists.** A prior session shipped substantive work without reading `NEXT_SESSION.md` first. The bookmark contained guards ("Don't add a 17th artifact without scope.md justification," "scratch/ is gitignored," "bias toward asking before content-integrity-affecting sweeps") that the work would have benefited from. The miss was caught by the user. Recording here so the lesson sticks.

---

## Universal process lessons

### Background agent + session-limit edge case

When launching a background `Agent` to produce a file deliverable while parent session usage is already high:

- **"Agent completed" notification is NOT proof of file existence.** Verify the file exists with `Glob` or `ls` immediately after the notification fires. The first attempt at this session's misconceptions doc reported "completed" but produced no file; only the second run wrote successfully.
- If the parent session hits its usage limit *before* the background agent completes, agent state is effectively lost — there's no `SendMessage` available in the standard toolset to resume a finished agent and ask "where's the file?".
- **Best practice in the agent prompt:** include the literal sentence "Confirm the file exists at `<absolute-path>` before ending. Do not skip the Write step." — and verify on receipt.
- **Cap exposure:** if the parent is already past 90% usage, prefer writing the file yourself synchronously over launching a background agent that may finish into a closed session.

### Sweep authorization

Wholesale content-integrity sweeps (e.g. mass href rewrites, mass model-version bumps, mass footer changes) need an **explicit directive**, not user-observation. "I noticed X is inconsistent" ≠ "fix X across the repo." The 28-href `.md → .html` sweep was correctly blocked on first attempt because the trigger was an observation; user then explicitly approved. Bias toward asking before sweeps that touch many files for a stylistic reason.

### Scope vs. invention for new artifacts

Before adding a new artifact to this repo:

1. Read [`docs/scope.md`](docs/scope.md) — original 8 + post-v1 justifications. Recurring pattern in justifications: *"existing artifact names the failure mode but offers no scaffolding."*
2. Read [`docs/feature-inventory.md`](docs/feature-inventory.md) — verify any feature/pricing/model claims align before drafting.
3. Audit overlap with adjacent artifacts (e.g. `anti-use-cases.md`, `feature-decision-matrix.html`, `governance-overlay.md`) — at least three artifacts in this repo cover ground that *almost* overlaps with most candidate adds.
4. Filter candidate content for **decision-relevance** (every entry must end in mis-budget / mis-architect / mis-staff). Comparative claims against GPT/Gemini are **excluded by repo decision** (mirrors `cost-calculator.html` posture).
5. Source rule: only `docs.claude.com`, `code.claude.com`, `anthropic.com`, or this repo's `feature-inventory.md`. Third-party blogs, Medium, aggregators are **not** acceptable primary sources.
6. Write the scope.md justification block **before** the artifact, not after. Easier to defend a tight scope than to apologize for a loose one.

### `.md` cross-link convention inside HTML artifacts

GitHub Pages with default Jekyll renders `.md` source as `.html`. Inside `.html` files, cross-links must point at `.html` even when the target file on disk is `.md`. Inside `.md` files, cross-links stay `.md` (jekyll-relative-links handles them).

### Repo-specific footer + as-of pattern

Every artifact ends with: `© gmanch94 · CC-BY-4.0 · As of YYYY-MM. Verify pricing/models at anthropic.com.`

The as-of stamp is **load-bearing** on `cost-calculator.html` — readers commit budgets to the visible number. Bump as-of stamps via `/bump-as-of` slash command on every release-time sweep. Don't bump as housekeeping.

---

## Repo-specific lessons

### 2026-05-04 — claude-misconceptions.md ship

**Decision-relevance filter is the bouncer.** Started from 25 raw research entries. After applying primary-source + decision-frame filter, only 15 survived. The cuts (vs-GPT/Gemini comparisons, Opus 4.7 jump as informational fact, "Claude is lazy" trope, hallucination index) all *felt* like Claude misconceptions but failed the test "ends in a measurable mis-budget / mis-architect / mis-staff call." A misconception that doesn't change a decision is not in this repo's scope.

**Source quality rebuild beats source quality patch.** First-pass agent cited Finout, Medium, DataStudios, ClaudeCodeCamp, MarkTechPost — all secondary. Cheaper to rebuild from `feature-inventory.md` as the spine and cite primary docs from scratch than to URL-swap inside a draft that was already shaped around secondary phrasing.

### 2026-05-03 — Distracted-boyfriend meme rejection

User caught the gendered-baseline risk in the distracted-boyfriend meme template before it shipped. Replacement: "Is this a pigeon?" — same misclassification punchline without identity baggage. **Rule:** any meme template carries its original baseline regardless of how it's relabeled. Audience for this repo includes CHROs and risk leads — assume zero tolerance for identity-loaded humor even when the punchline is technically about something else.

### 2026-05-03 — Refresh cadence: monthly vs quarterly

Anthropic surface drifts fast (model releases, pricing changes, feature GA). Repo refresh discipline = **monthly** (first Monday, scheduled remote agent). Adopter-side cadences (governance review, no-train re-verification, jailbreak corpus refresh, allow-list review) stay **quarterly** — those are organizational rituals, not feature drift. Don't conflate the two.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05.`
