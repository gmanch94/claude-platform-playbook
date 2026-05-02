---
description: Bump "As of YYYY-MM" stamps across all artifacts to the current month
argument-hint: "[YYYY-MM] (optional — defaults to current month)"
allowed-tools: Bash, Glob, Grep, Read, Edit
---

Sweep all `As of YYYY-MM` references across the repo and bump them to the current month (or the explicit argument $ARGUMENTS if provided).

## Steps

1. **Resolve target stamp.** If `$ARGUMENTS` is provided and matches `YYYY-MM`, use it. Otherwise run `date -u +%Y-%m` and use that.

2. **Find all stamps.** Use Grep to locate every occurrence of the pattern `As of \d{4}-\d{2}` across:
   - `README.md`
   - `CLAUDE.md`
   - `docs/feature-inventory.md` (including the "Last verified" line at top)
   - `artifacts/*.html` (footers + visible asof badges)
   - `artifacts/*.md` (headers + footers)

3. **Group by file.** For each file with matches, list current stamps and the proposed new stamp.

4. **Show diff before changing.** Print a summary:
   ```
   README.md: 2026-05 → 2026-08 (3 occurrences)
   docs/feature-inventory.md: 2026-05 → 2026-08 (12 occurrences) + Last verified: 2026-05-01 → 2026-08-DD
   artifacts/cost-calculator.html: 2026-05 → 2026-08 (4 occurrences)
   ...
   ```

5. **Ask for confirmation** before editing.

6. **Edit each file** with `replace_all: true` for the stamp pattern. Use a separate Edit call per file. Update "Last verified: YYYY-MM-DD" in `feature-inventory.md` to today's full date.

7. **Verify after.** Re-grep `As of \d{4}-\d{2}` and report count of matches at the new stamp.

## Constraints

- Do NOT change content other than the as-of stamps and the "Last verified" full date.
- Do NOT bump if any file in `feature-inventory.md` rows shows a row-level as-of date that's older than 30 days from the new target — that signals real drift, not just a stamp refresh. Flag those rows for human review and STOP. The user must run the actual feature-surface audit (see the monthly refresh routine) before bumping.
- Do NOT touch `LICENSE` or `docs/scope.md`.
- If the target stamp equals the current stamp on every file, print "No changes needed" and exit.

## Why this exists

Quarterly refresh discipline requires a sweep across 11+ files. Doing it by hand misses occurrences. This command standardizes the sweep + adds the drift-check guard so the stamp never lies about underlying content freshness.
