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

Canonical pins (from CLAUDE.md): **Opus 5 / Sonnet 5 / Haiku 4.5** — the current deployable (GA) tier.

Grep across all artifacts for any occurrence of:
- `Opus 4\.\d` — flag unless the hit is an explicit historical / version-history / price-comparison reference (the repo deliberately preserves several — context-window and cache-floor history, the Azure GA row, "same price as Opus 4.8"). Current-state mentions should read `Opus 5`
- `Sonnet 4\.\d` — flag unless it's an explicit "(prev)" / historical reference to Sonnet 4.6; current-state mentions should read `Sonnet 5`
- `Haiku 4\.\d` — flag if not `4.5`
- `claude-opus-[0-9]`, `claude-sonnet-[0-9]`, `claude-haiku-[0-9]` — report exact strings found

Also flag any floating aliases: `latest Claude`, `most recent model`, `newest model`.

**Fable 5 / Mythos 5 are NOT pin errors.** A next-gen line sits above the 4.x/5.x family: Claude Fable 5 (`claude-fable-5`, **GA — access restored 2026-07-01**, frontier-reasoning tier at ~2× Opus) and Claude Mythos 5 (`claude-mythos-5`, invite-only via Project Glasswing, not generally usable). This repo's default operational rec is **Opus 5** (top deployable GA tier since 2026-07-24), with Fable 5 reserved for the hardest-reasoning subset where an eval shows a real delta. Do NOT flag Fable/Mythos references as stale; DO flag if an artifact calls **Opus 5** the "most capable Claude model" without acknowledging the Fable/Mythos line, or still describes Fable 5 as unavailable.

Report:

```
MODEL PINS
  OK    artifacts/executive-briefing.html    Opus 5, Sonnet 5, Haiku 4.5
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

Read the `## Product surfaces (Claude.ai apps)` table in `docs/feature-inventory.md` — **read the rows that are actually there, don't work from a list in this file** (it drifted once: it named three surfaces when the table held five, having missed Claude Tag and Claude Science). **Product surfaces drift faster than the API feature set** — a beta→GA graduation or a BAA-coverage change can land between monthly refreshes. Precedent (2026-06-29): Cowork had silently graduated beta→GA on all paid plans and Claude Design had appeared as a new Team/Enterprise surface — neither was catchable by the stamp / pin / URL checks above, because none of them look at product-surface **status**, **plan gate**, or **BAA coverage**.

**⚠ Compare each row's own as-of, never the file-level "Last verified" — this is the check's known blind spot.** A refresh that verifies *some* rows still bumps the file-level stamp, which then makes the skipped rows look covered. Precedent (2026-07-25): the file read Last-verified 2026-07-24 while Claude Design, Projects, and Claude Tag all sat at as-of **2026-06** — and the Design row's plan gate was wrong in the permissive direction (logged Team/Enterprise; actually **Pro / Max / Team / Enterprise**, default off on Enterprise only). The 14-day window below did not catch it because the *file* looked one day old.

**Second lesson from that run: a doc's title is not an availability statement.** The wrong gate came from reading "admin guide for Team and Enterprise plans" as the plan gate. Read the sentence that says *available to*, in the body.

Use a **14-day** window here — tighter than the 35-day inventory window in step 4, because these move fast. For each row read its **Status** (GA / beta / preview), **plan gate**, **BAA** note (the Governance-flag column), **As-of**, and **Doc anchor**. Then:

- **DUE** — if the top-of-file "Last verified" date is more than **14 days** before today, flag *every* product-surface row for re-verification: re-check Status / plan gate / BAA against each row's Doc anchor (`support.claude.com` / `privacy.claude.com`).
- **STALE** — flag any individual row whose **As-of** month is older than the "Last verified" month (that row was skipped in the last refresh).
- **DRIFT** — consistency check: any surface marked **GA** in this table must NOT still be grouped under "beta" in the `BAA (HIPAA workloads)` row (~line 130) or in `governance-overlay.md §4`. Flag the contradiction (this is the exact shape of the 2026-06-29 miss).

Report:

```
PRODUCT SURFACES (N rows as found in the table · 14-day window · per-row as-of)
  OK    Cowork          GA · paid-only · BAA-excluded       As-of 2026-06
  OK    Projects        GA · all-plans · BAA on Enterprise  As-of 2026-06
  DUE   (all rows)      Last verified 19 days ago ← re-check status/gate/BAA at support.claude.com + privacy.claude.com
  STALE Claude Design   beta · Team/Ent · BAA-excluded      As-of 2026-05 ← skipped last refresh
  DRIFT Cowork          GA here but listed "beta" in BAA row 130 ← reconcile
```

If all rows are within the window and consistent: `Product surfaces: N rows OK, 0 due, 0 drift.` State N as counted from the table, and confirm you compared **per-row** as-of values.

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

### 7. Artifact count consistency

Run `node scripts/check-counts.mjs` — a deterministic guard (no deps). Three sections: artifact counts, **in-prose counted lists** (a heading's number word vs the rows beneath it), and **markdown table structure** (one header, separator on row 2, consistent column count, repo-wide). Any of the three fails the run. On the counts:

- `artifacts/` file count (ground truth) **==** README `## Artifacts` catalog rows **==** every stated count in `docs/scope.md` (`now ships N`, `full N-row catalog`, `All N mapped`) and `CLAUDE.md` (`currently ships N`).
- Reports `index.html` card count as **info** (visual companions are reached via a parent card's sub-links, so `cards <= artifacts` is expected — not a mismatch).

Exit 0 = PASS, exit 1 = a mismatch (or a `??` = a count sentence was reworded and the regex needs re-pointing). This retires the recurring "bumped an artifact, forgot the count" drift (precedent 2026-07-19: the docs said 46 while the repo held 51). Report the script's output verbatim under a `COUNTS` heading. If `node` is unavailable, say so and fall back to comparing `ls artifacts | wc -l` against the README catalog rows by hand.

### 8. System-card readout freshness

`artifacts/system-card-readout.md` §4 is a **worked instance of a specific card**, and it is the one section in the repo that a model-name sweep can silently falsify — flip `Opus 5` → the successor and last release's numbers sit under the new model's name with every other check in this file passing.

Two reads, both cheap:

- **Card date vs pinned model.** `grep -n "CARD-STAMP" artifacts/system-card-readout.md` returns `model=… card-date=…`; compare against the top-GA model in `docs/feature-inventory.md`. If the pinned model released *after* that card date, §4 describes a model the repo no longer treats as current → flag **§4 STALE**.
- **Name/stamp mismatch.** If §4's body names a current-state model that isn't the one in `CARD-STAMP`, someone search-and-replaced into it. (Prior-model comparisons inside the rows are expected and fine — it's the subject of the findings that must match.) Flag **§4 CONTAMINATED** — this is the failure the wholesale-replace rule exists to prevent, and it is worse than staleness because the numbers now read as current.

Read-only, like the rest of this command. The fix path is `/card-sweep`, which replaces §4 wholesale from the new card. Never patch §4 in place from here.

### 9. Summary report

Print a single consolidated block:

```
━━━ STALE-CHECK REPORT ━━━ (as of 2026-05)

STAMPS        X ok  Y stale
MODEL PINS    X ok  Y wrong  Z floating
INVENTORY     last verified N days ago  X missing refs
PRODUCT SURF  X ok  Y due/stale  Z drift
URLS          X ok  Y broken  (sampled Z of N)
COUNTS        N artifacts · all refs agree  (or: K mismatched)
CARD READOUT  §4 card YYYY-MM-DD vs pinned <model>  ok | STALE | CONTAMINATED

Action needed:
  [ ] /bump-as-of              — Y files have stale stamps
  [ ] Fix model pins manually  — Y occurrences in Z files
  [ ] Update feature-inventory — N days since last verify
  [ ] Re-verify product surfaces — Y rows past 14-day window, Z status-drift
  [ ] Fix broken URLs          — Y links returning non-200
  [ ] Fix artifact count       — a stated count ≠ artifacts/ (node scripts/check-counts.mjs)
  [ ] /card-sweep              — system-card-readout §4 is stale or contaminated
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
