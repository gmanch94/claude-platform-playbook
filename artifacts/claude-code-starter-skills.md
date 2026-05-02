# Claude Code Starter Skills Pack

**As of 2026-05.** Pin to current model surface (Opus 4.7 / Sonnet 4.6 / Haiku 4.5). Companion to [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md). See [`../docs/feature-inventory.md`](../docs/feature-inventory.md) for the canonical Skills + plugin surface inventory.

Eight team-grade Skill templates an engineering lead can drop into a plugin on day one. Each Skill is framed by **decision** first (when it earns its keep, what it costs you, who owns it) — the prompt body is last, because the prompt is the cheapest part to write and the most expensive part to govern.

If you ship all eight, your team plugin has a real productivity floor by week 2 and you defuse the most common adoption mistake from the adoption guide: *"5 engineers, 5 plugins, 0 reuse."*

---

## How to use this pack

1. **Pick 2–3 to start.** Don't ship eight Skills the same week you ship the plugin — pick the two that match the team's loudest pain (almost always PR review + test generation).
2. **Assign an owner per Skill** before merging. Skills without owners rot inside a quarter — see Phase 3 of the adoption guide.
3. **Eval each Skill** with 5–10 representative tasks before promoting it past pilot. A Skill that fires the wrong way 30% of the time is worse than no Skill.
4. **Tune the description, not the body.** Claude Code uses the `description` to decide whether to load a Skill. Vague descriptions mis-trigger; this is the #1 failure mode for Skills in production.

Each template below is structured the same way:

- **When to use** — the trigger in the developer's workflow
- **Failure mode** — what goes wrong if you ship it without thinking
- **Owner archetype** — who in the team should own the Skill
- **Skill template** — copy into `team-plugin/skills/<name>/SKILL.md`

---

## 1. PR review (team style)

**When to use.** Engineer opens a PR or asks Claude Code to review a diff. Encodes the team's review register: what blocks merge, what's a nit, what's out of scope.

**Failure mode.** Skill becomes a nitpick generator. Engineers ignore the output, then ignore Claude Code review entirely. Mitigate by ranking comments by severity and capping nits per file.

**Owner archetype.** Tech lead for the codebase area. Updates the Skill when the team's review norms shift (quarterly at most).

```markdown
---
name: pr-review
description: Use when the user asks to review a PR, review a diff, or check changes before merge. Do NOT use for general code review of code the user is currently writing — that's a different mode.
---

You are reviewing a pull request the way THIS team reviews PRs.

## What blocks merge
- Behavior changes without test coverage
- Public API changes without an entry in CHANGELOG.md
- New dependencies without justification in the PR description
- TODOs without an owner or ticket reference
- Logging at info level inside hot loops

## What's a nit (mention once, don't repeat)
- Variable naming preferences
- Comment style
- Import ordering (the formatter handles it)

## What's out of scope
- Architectural rewrites — open a separate ADR PR
- Renames that span >5 files — open a separate refactor PR

## Output shape
1. **Blocks** (must fix before merge) — file:line, one sentence each
2. **Nits** (cap 3 per file) — file:line, one sentence each
3. **Out of scope** (do not gate merge) — one paragraph max

If the diff has zero blocks, say so clearly. Do not invent issues to look thorough.
```

---

## 2. Test generation (matched to team conventions)

**When to use.** Engineer writes a function and asks for tests, or Claude Code finishes an edit and the team's hook runs the test-gen prompt automatically.

**Failure mode.** Skill generates tests in the wrong framework, with the wrong fixtures, importing utilities that don't exist. Mitigate by anchoring to a real test file in the repo as the canonical example.

**Owner archetype.** Whoever owns the test infrastructure (test framework, fixture library, CI pipeline).

```markdown
---
name: test-generation
description: Use when the user asks to write tests, add test coverage, or generate test cases for new or modified code. Use both for greenfield tests and adding cases to existing test files.
---

Generate tests in THIS team's idiom.

## Framework + tooling
- Framework: <pytest / jest / go test / rspec — name yours>
- Fixture library: see `tests/fixtures/` — reuse existing fixtures before creating new ones
- Mocking: <pytest-mock / jest.fn / gomock> — never patch the network layer in unit tests
- Canonical example: `tests/<path-to-good-test-file>` — match this style

## What to cover
- Happy path (one test)
- Error paths the function explicitly raises (one test each)
- Boundary conditions named in the docstring
- One regression test if the user references a bug

## What NOT to do
- Do not test private helpers directly — test through the public API
- Do not assert on log output unless the log is the contract
- Do not reach for parameterization for fewer than 3 cases
- Do not mock what you can construct cheaply

## Output shape
- Plain test file matching the framework's conventions
- One sentence above each test stating what it asserts and why
- Flag (do not write) any test that requires fixtures you cannot find — list them and stop
```

---

## 3. Migration guard (database / schema changes)

**When to use.** Engineer drafts a migration (Alembic, Rails, Liquibase, sqlx, etc.). Skill enforces the team's migration safety rules before the change goes near a shared environment.

**Failure mode.** Skill blesses a migration that's safe in dev but locks a 50M-row table in prod. Mitigate by anchoring rules to **operations** (table size, lock type, online-DDL availability) not framework keywords.

**Owner archetype.** Database / platform engineer. This is the highest-stakes Skill in the pack — it gates production changes.

```markdown
---
name: migration-guard
description: Use when the user is writing, reviewing, or about to apply a database migration. Triggers on schema files, Alembic/Rails migration files, or explicit user requests to check migration safety.
---

You are reviewing a database migration for safety in production.

## Required for every migration
- A backout plan (revert migration that the user has actually written, not "we could revert")
- Table size context — small (<100k rows), medium (<10M), large (>10M)
- Lock posture — does this take a table-level lock? For how long? Under concurrent writes?

## Block these unless explicitly defended
- `ALTER TABLE ... ADD COLUMN NOT NULL` on a large table without a default
- `ALTER COLUMN TYPE` that requires a full table rewrite
- Adding a non-concurrent index on a large table
- Dropping a column with a backfill in the same migration
- Foreign key adds without `NOT VALID` then `VALIDATE CONSTRAINT` split

## Output shape
1. **Verdict**: SAFE / NEEDS CHANGES / BLOCKED
2. **Reasoning** — one paragraph naming the lock posture and table size assumption
3. **Required changes** (if any) — concrete diff suggestions
4. **Backout** — the literal SQL or migration code to revert

Never bless a migration with verdict SAFE if any input above (lock, size) is unknown. Ask first.
```

---

## 4. Bug triage (reproduction + root cause draft)

**When to use.** Engineer is handed a bug report or a stack trace. Skill produces a reproduction attempt + root cause hypothesis + scope-of-blast-radius statement before any fix is written.

**Failure mode.** Skill jumps to a fix on the first plausible hypothesis. Mitigate by gating "propose a fix" behind "have you reproduced it?" — if reproduction failed, the Skill should say so and stop.

**Owner archetype.** Senior engineer or on-call lead. The Skill encodes the team's debugging discipline.

```markdown
---
name: bug-triage
description: Use when the user reports a bug, pastes a stack trace, or asks to investigate unexpected behavior. Do NOT use for performance investigations — there's a separate Skill for those.
---

You triage bugs in THIS order. Do not skip steps.

## Step 1 — Reproduce
- Read the bug report or stack trace literally
- Identify the smallest failing input you can name
- Try to reproduce locally (run the relevant test, hit the relevant endpoint)
- If you cannot reproduce, STOP. Output what you tried and ask for the missing input.

## Step 2 — Root cause hypothesis
- Name the failing component
- State ONE hypothesis in one sentence — "the X happens because Y assumes Z which is false when W"
- Note which lines of code that hypothesis depends on (file:line references)

## Step 3 — Blast radius
- Which other call sites touch the suspect code path?
- Is this a hot path? (search logs, request rates if available)
- Could a fix here regress unrelated behavior?

## Step 4 — Output
- Reproduction steps (verbatim, copy-pasteable)
- Root cause hypothesis (one sentence)
- Blast radius (one paragraph)
- DO NOT write a fix. The fix is a separate decision after triage is reviewed.
```

---

## 5. Doc refresh (find stale references)

**When to use.** Run as a scheduled background task or when an engineer asks "is the README still right?" Walks the repo's docs, flags references to functions, files, or commands that no longer exist.

**Failure mode.** Skill flags every typo as drift. Mitigate by scoping to **structural** references (paths, function names, command flags) not prose.

**Owner archetype.** Docs-conscious engineer or DX team. Run monthly via background tasks (see Phase 3 of adoption guide).

```markdown
---
name: doc-refresh
description: Use when the user asks to check documentation freshness, audit stale doc references, or find broken links in the repo's docs. Triggers on explicit requests; also suitable for scheduled runs.
---

You audit docs for STRUCTURAL drift only.

## What counts as drift
- Function or class names referenced that no longer exist in the codebase
- File paths referenced that no longer exist
- Command flags referenced that the CLI no longer accepts
- API endpoints referenced that have been removed or renamed
- Config keys referenced that have been removed

## What does NOT count
- Prose that's "a bit out of date" but factually still correct
- Code examples that are simplified versions of current code
- Anything in CHANGELOG.md (historical record by design)

## Output shape
For each piece of drift:
- File:line in the doc
- The stale reference (verbatim)
- Evidence it's stale (file:line where it used to be / search that came up empty)
- Suggested fix in one line — or "remove" if the section is no longer relevant

If you find zero drift, say so. Do not pad the report.
```

---

## 6. Release notes (diff → changelog entry)

**When to use.** End of a sprint or before cutting a release. Skill reads the git log range and drafts a CHANGELOG entry in the team's voice.

**Failure mode.** Skill writes a press release. Mitigate by anchoring to the team's existing CHANGELOG.md — first instruction is to read prior entries and match register.

**Owner archetype.** Release manager or whoever cuts versions.

```markdown
---
name: release-notes
description: Use when the user asks to draft release notes, write a CHANGELOG entry, or summarize commits between two refs. Pass the git ref range explicitly when invoking.
---

You write release notes that match THIS project's CHANGELOG voice.

## Step 1 — Calibrate
- Read the most recent 3 entries in CHANGELOG.md
- Note: section ordering (Added / Changed / Fixed / Removed?), bullet density, link convention, semver discipline

## Step 2 — Read the diff
- Run `git log <range> --oneline --no-merges`
- For each commit: classify as Added / Changed / Fixed / Removed / Internal
- Drop Internal commits from the public changelog (refactors, test additions, doc tweaks) unless the prior entries include them

## Step 3 — Draft
- Group by classification, ordered the way prior entries were ordered
- One bullet per user-visible change — not one bullet per commit
- Link to PR or issue numbers if the prior entries did
- Pin breaking changes at the top with **Breaking:** prefix

## Output shape
- A markdown block ready to paste into CHANGELOG.md
- One paragraph above the block highlighting any breaking changes
- A list of commits you dropped as Internal (so the user can sanity-check)
```

---

## 7. On-call investigation (alert → incident draft)

**When to use.** A pager fires. Engineer pastes the alert into Claude Code and asks for an investigation. Skill drafts the incident timeline + blast radius + likely owners.

**Failure mode.** Skill mocks confidence — declares root cause from the alert text alone. Mitigate by requiring the Skill to enumerate what it *cannot* see (logs it didn't read, dashboards it can't reach) before stating a hypothesis.

**Owner archetype.** SRE / platform on-call lead. Pair with read-only MCP servers (logs, metrics, issue tracker) — see Phase 2 of the adoption guide.

```markdown
---
name: oncall-investigate
description: Use when the user pastes an alert, pager message, or production incident description and asks for triage. NOT for post-incident reviews — that's a different Skill.
---

You investigate live alerts. Speed matters; false confidence is dangerous.

## Step 1 — Restate the alert
- What service / component / region?
- What threshold or condition tripped?
- When did it start? Is it ongoing?

## Step 2 — Enumerate visibility
- List the data sources you CAN reach (MCP-connected logs / metrics / dashboards)
- List the data sources you CANNOT reach — the user may need to fetch these manually
- Do not skip this step. False confidence in oncall is the highest-cost failure mode.

## Step 3 — Hypothesis
- ONE primary hypothesis, with the evidence behind it (logs you read, metric trend you saw)
- ONE alternative hypothesis, with what would falsify the primary
- Confidence: low / medium / high — never "certain"

## Step 4 — Blast radius + suggested actions
- Customer-facing? Internal-only?
- Likely owner team (best guess based on service ownership data, if reachable)
- Suggested next 3 actions in priority order — first action should be diagnostic, not remedial, unless the bleed is severe
```

---

## 8. Refactor scout (find candidates + estimate scope)

**When to use.** Tech lead is sizing a refactor — "how many places call this deprecated function?" Skill returns a scoped inventory + risk assessment.

**Failure mode.** Skill returns 200 grep results without scope. Mitigate by requiring the Skill to **classify** matches (true call sites vs comments vs vendored copies) and estimate effort in person-days.

**Owner archetype.** Staff engineer or whoever drives refactor planning.

```markdown
---
name: refactor-scout
description: Use when the user asks to find all uses of a function, all instances of a pattern, or estimate the scope of a refactor before committing to it.
---

You scope refactors. Output is a plan, not a changelist.

## Step 1 — Identify the target
- Function, class, pattern, or anti-pattern named by the user
- The intended replacement, if the user named one — otherwise ask

## Step 2 — Inventory
- Run grep / search across the repo
- Classify each match into: TRUE call site / comment or doc / test (intentional) / test (incidental) / vendored or generated code (do not touch)
- Count by classification

## Step 3 — Risk pockets
- Are any call sites in hot paths? (search for log noise, request handlers)
- Are any in code paths without test coverage?
- Are any in code paths owned by another team?

## Step 4 — Effort estimate
- Mechanical replacements: count × ~5 min each
- Call sites needing API adaptation: count × ~30 min each
- Risk pockets: name explicitly, do not bake into the estimate

## Output shape
- One-paragraph summary
- Table: classification × count
- List of risk pockets with file:line
- Effort estimate as a range, with the assumptions stated
- Recommendation: ship as one PR / split by directory / split by classification
```

---

## What this pack does NOT include (and why)

- **Code generation Skills** — too repo-specific to template usefully. Build per-team.
- **Code-style enforcement Skills** — formatters and linters do this better; don't pay model cost for what `prettier` solves.
- **Slack / Teams response drafting** — out of scope for engineering; risk of ghost-writing in human channels.
- **Production deployment Skills** — too high-stakes to ship as a starter template. Build with your release engineer or skip.

---

## Companion artifacts

- [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) — phase 2 of the rollout is where this pack lands
- [`eval-starter-pack.md`](eval-starter-pack.md) — every Skill above should pass at minimum the regression + format-compliance evals before promotion
- [`hooks-starter-pack.md`](hooks-starter-pack.md) — Skills and hooks compose: a Skill says *what to do*, a hook says *what to never do*. Pair the migration-guard / refactor-scout Skills with `block-secrets` + `branch-guard` hooks.
- [`feature-decision-matrix.html`](feature-decision-matrix.html) — Skills row maps here
- [`adoption-playbook.md`](adoption-playbook.md) — broader Claude rollout context
- [`../docs/feature-inventory.md`](../docs/feature-inventory.md) — Skills + plugin canonical surface

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify Skills surface at docs.claude.com/en/docs/agents-and-tools/skills.`
