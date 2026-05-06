---
description: Audit the repo for stale content — as-of stamps, model pins, URL health, and feature-inventory cross-references
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

Canonical pins (from CLAUDE.md): **Opus 4.7 / Sonnet 4.6 / Haiku 4.5**

Grep across all artifacts for any occurrence of:
- `Opus 4\.\d` — flag if not `4.7`
- `Sonnet 4\.\d` — flag if not `4.6`
- `Haiku 4\.\d` — flag if not `4.5`
- `claude-opus-[0-9]`, `claude-sonnet-[0-9]`, `claude-haiku-[0-9]` — report exact strings found

Also flag any floating aliases: `latest Claude`, `most recent model`, `newest model`.

Report:

```
MODEL PINS
  OK    artifacts/executive-briefing.html    Opus 4.7, Sonnet 4.6, Haiku 4.5
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

### 5. URL spot-check

Grep all files for `https://docs.anthropic.com` and `https://docs.claude.com` links. Collect unique URLs (deduplicate). Check up to **10 unique URLs** with `curl -sL -o /dev/null -w "%{http_code}" --max-time 10 <url>` (follow redirects). Skip this step if curl is unavailable.

Report:

```
URLS (spot-check, 10 of N unique)
  200  https://docs.anthropic.com/en/docs/about-claude/models
  404  https://docs.claude.com/some-old-path ← broken, update artifact
  ...
```

If >10 unique URLs exist, note "sampled 10 of N — run full audit manually."

### 6. Summary report

Print a single consolidated block:

```
━━━ STALE-CHECK REPORT ━━━ (as of 2026-05)

STAMPS        X ok  Y stale
MODEL PINS    X ok  Y wrong  Z floating
INVENTORY     last verified N days ago  X missing refs
URLS          X ok  Y broken  (sampled Z of N)

Action needed:
  [ ] /bump-as-of              — Y files have stale stamps
  [ ] Fix model pins manually  — Y occurrences in Z files
  [ ] Update feature-inventory — N days since last verify
  [ ] Fix broken URLs          — Y links returning non-200
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If everything is clean, print: `All checks pass. Repo is fresh as of YYYY-MM.`

## Constraints

- Read-only. No edits, no commits, no bumps.
- Do NOT flag family pins like "Sonnet 4.x" — those are intentional stable references (governance-overlay, adoption-playbook).
- Do NOT flag occurrences inside `LESSONS_LEARNED.md` or `scratch/` — those are process notes, not audience-facing copy.
- Do NOT fetch or curl URLs from `scratch/` or `LICENSE`.
- If curl times out on a URL, mark it as **TIMEOUT** (not broken) and note it separately.
- Report findings even if partial (e.g. curl unavailable). Never silently skip a step.
