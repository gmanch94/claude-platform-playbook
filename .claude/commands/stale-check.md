---
description: Audit the repo for stale content — as-of stamps, model pins, product-surface status, URL health, and feature-inventory cross-references
allowed-tools: Bash, Glob, Grep, Read
---

Read-only staleness audit. Reports drift; never edits. Fix workflow: `/bump-as-of` for stamps, monthly refresh agent for feature surface, manual edit for model pins.

## Steps

### 1. Resolve current month

Run `date -u +%Y-%m` to get the expected stamp (e.g. `2026-05`). All checks use this as the freshness baseline.

### 2. As-of stamp audit

Grep `As of \d{4}-\d{2}` across:
- `README.md`
- `CLAUDE.md`
- `docs/feature-inventory.md`
- `artifacts/*.html`
- `artifacts/*.md`

For each file, collect every stamp found. Flag any stamp older than the current month as **STALE**. Report:

```
STAMPS
  OK    artifacts/cost-calculator.html       As of 2026-05 (3 occurrences)
  STALE artifacts/adoption-playbook.md       As of 2026-04 (2 occurrences) ← run /bump-as-of
  ...
```

Count: X OK, Y stale.

### 3. Model pin audit

Canonical pins (from CLAUDE.md): **Opus 4.8 / Sonnet 5 / Haiku 4.5** — the current deployable (GA) tier.

Grep across all artifacts for any occurrence of:
- `Opus 4\.\d` — flag if not `4.8`
- `Sonnet 4\.\d` — flag unless it's an explicit "(prev)" / historical reference to Sonnet 4.6; current-state mentions should read `Sonnet 5`
- `Haiku 4\.\d` — flag if not `4.5`
- `claude-opus-[0-9]`, `claude-sonnet-[0-9]`, `claude-haiku-[0-9]` — report exact strings found

Also flag any floating aliases: `latest Claude`, `most recent model`, `newest model`.

**Fable 5 / Mythos 5 are NOT pin errors.** As of 2026-06 a next-gen line exists above the 4.x family: Claude Fable 5 (`claude-fable-5`, most capable widely released but currently *unavailable*) and Claude Mythos 5 (`claude-mythos-5`, invite-only via Project Glasswing). They are not GA-deployable, so this repo's operational recs stay on Opus 4.8. Do NOT flag Fable/Mythos references as stale; DO flag if an artifact claims Opus 4.8 is the "most capable Claude model" without acknowledging the Fable/Mythos line exists.

Report:

```
MODEL PINS
  OK    artifacts/executive-briefing.html    Opus 4.8, Sonnet 5, Haiku 4.5
  STALE artifacts/feature-decision-matrix.html  found "Opus 4.6" ← wrong pin
  FLOAT artifacts/adoption-playbook.md      found "latest Claude" ← pin to specific version
  ...
```

### 4. Feature-inventory cross-reference audit

Read `docs/feature-inventory.md`. For every artifact path listed in the `Used in artifacts` column:
- Check that the file actually exists on disk (Glob or Bash `test -f`)
- Flag any that are missing

Also check the "Last verified" date at the top of feature-inventory.md. If it's more than 35 days before today, flag as **OVERDUE** (monthly refresh is late).

Report:

```
FEATURE INVENTORY
  Last verified: 2026-05-04 — OK (2 days ago)
  Cross-refs: 18 artifact paths checked, 0 missing
  — or —
  Last verified: 2026-03-12 — OVERDUE (54 days ago) ← run monthly refresh agent
  Missing: artifacts/some-deleted-file.md ← remove from Used in artifacts column
```

### 5. Product surface audit

Read the `## Product surfaces (Claude.ai apps)` table in `docs/feature-inventory.md` (currently: Cowork, Claude Design, Projects). **Product surfaces drift faster than the API feature set** — a beta→GA graduation or a BAA-coverage change can land between monthly refreshes. Precedent (2026-06-29): Cowork had silently graduated beta→GA on all paid plans and Claude Design had appeared as a new Team/Enterprise surface — neither was catchable by the stamp / pin / URL checks above, because none of them look at product-surface **status**, **plan gate**, or **BAA coverage**.

Use a **14-day** window here — tighter than the 35-day inventory window in step 4, because these move fast. For each row read its **Status** (GA / beta / preview), **plan gate**, **BAA** note (the Governance-flag column), **As-of**, and **Doc anchor**. Then:

- **DUE** — if the top-of-file "Last verified" date is more than **14 days** before today, flag *every* product-surface row for re-verification: re-check Status / plan gate / BAA against each row's Doc anchor (`support.claude.com` / `privacy.claude.com`).
- **STALE** — flag any individual row whose **As-of** month is older than the "Last verified" month (that row was skipped in the last refresh).
- **DRIFT** — consistency check: any surface marked **GA** in this table must NOT still be grouped under "beta" in the `BAA (HIPAA workloads)` row (~line 130) or in `governance-overlay.md §4`. Flag the contradiction (this is the exact shape of the 2026-06-29 miss).

Report:

```
PRODUCT SURFACES (3 rows · 14-day window)
  OK    Cowork          GA · paid-only · BAA-excluded       As-of 2026-06
  OK    Projects        GA · all-plans · BAA on Enterprise  As-of 2026-06
  DUE   (all 3 rows)    Last verified 19 days ago ← re-check status/gate/BAA at support.claude.com + privacy.claude.com
  STALE Claude Design   beta · Team/Ent · BAA-excluded      As-of 2026-05 ← skipped last refresh
  DRIFT Cowork          GA here but listed "beta" in BAA row 130 ← reconcile
```

If all rows are within the window and consistent: `Product surfaces: 3 rows OK, 0 due, 0 drift.`

### 6. URL spot-check

Grep all files for `https://docs.anthropic.com` and `https://docs.claude.com` links. Collect unique URLs (deduplicate). Check up to **10 unique URLs** with `curl -sL -o /dev/null -w "%{http_code}" --max-time 10 <url>` (follow redirects). Skip this step if curl is unavailable.

Report:

```
URLS (spot-check, 10 of N unique)
  200  https://docs.anthropic.com/en/docs/about-claude/models
  404  https://docs.claude.com/some-old-path ← broken, update artifact
  ...
```

If >10 unique URLs exist, note "sampled 10 of N — run full audit manually."

### 7. Summary report

Print a single consolidated block:

```
━━━ STALE-CHECK REPORT ━━━ (as of 2026-05)

STAMPS        X ok  Y stale
MODEL PINS    X ok  Y wrong  Z floating
INVENTORY     last verified N days ago  X missing refs
PRODUCT SURF  X ok  Y due/stale  Z drift
URLS          X ok  Y broken  (sampled Z of N)

Action needed:
  [ ] /bump-as-of              — Y files have stale stamps
  [ ] Fix model pins manually  — Y occurrences in Z files
  [ ] Update feature-inventory — N days since last verify
  [ ] Re-verify product surfaces — Y rows past 14-day window, Z status-drift
  [ ] Fix broken URLs          — Y links returning non-200
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If everything is clean, print: `All checks pass. Repo is fresh as of YYYY-MM.`

## Constraints

- Read-only. No edits, no commits, no bumps.
- **Product surface audit (step 5) is read-only too** — its fix path is the monthly refresh or a manual `feature-inventory.md` edit, never an auto-bump. The 14-day window is intentional (surfaces drift faster than the API feature set); don't widen it to step 4's 35-day window.
- Do NOT flag version-agnostic family pins like "current Sonnet tier" — those are intentional stable references (governance-overlay, adoption-playbook), used instead of a version-number family string precisely because a major bump (e.g. 4.6 → 5) can outlive it.
- Do NOT flag occurrences inside `LESSONS_LEARNED.md` or `scratch/` — those are process notes, not audience-facing copy.
- Do NOT fetch or curl URLs from `scratch/` or `LICENSE`.
- If curl times out on a URL, mark it as **TIMEOUT** (not broken) and note it separately.
- Report findings even if partial (e.g. curl unavailable). Never silently skip a step.
