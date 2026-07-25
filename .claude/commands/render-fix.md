---
description: Find and fix kramdown/GitHub-Pages phantom-table render gotchas in this repo's published Markdown — thin wrapper over the global check-md skill
allowed-tools: Bash, Glob, Grep, Read, Edit
---

Run the global **`check-md`** skill against this repo. It encodes the full procedure (fence-aware stray-pipe scan, real-table/indent traps, render-verify on the live page) and is repo-agnostic — nothing here needs to restate it.

```
node ~/.claude/skills/check-md/check-md-pipes.mjs      # scan tracked .md; exit 1 = suspects
```

Then follow the skill's fix + render-verify steps. Full rule: `~/.claude/rules/markdown-render-gotchas.md`.

Repo specifics the skill will auto-discover — noted here only for convenience:

- **Publish surface:** `https://gmanch94.github.io/claude-platform-playbook/artifacts/<file>.html` (a `?v=<sha>` param busts the CDN cache; Pages build lags ~30–60s after push).
- **Scope:** `artifacts/*.md`, `docs/*.md`, `README.md`, `CLAUDE.md`. Not `.html` artifacts, `scratch/`, or `LESSONS_LEARNED.md`.
- **Known-safe hits** the scanner flags for human review. **Don't pin line numbers here — they rot** (this list said `claude-code-101.md:195`; the line had drifted to 267, so the exemption silently stopped matching). Identify by *shape* instead, and note that as of **2026-07-25 all 10 repo-wide hits were false positives, render-verified on the published HTML**:
  - Files that *document* the bug — this file, `LESSONS_LEARNED.md`, `CLAUDE.md`, `.claude/commands/stale-check.md`.
  - A **single pipe wholly inside one inline-code span** — e.g. `claude-code-101.md`'s `cat build.log | claude -p …` bullet. Renders as `<code>…</code>` inside `<li>`, no table.
  - **Pipes with no spaced ` | ` delimiter** — a regex alternation like `(Opus|Sonnet|Haiku)` in `docs/feature-inventory.md`. The trigger is a *spaced* pipe acting as a cell separator, not any pipe.
- **Re-verify by shape, on the live page.** When the scanner fires, don't consult a line-number list — check whether the hit is one of the three shapes above, then confirm on the published HTML (`grep -o "<snippet>.\{0,200\}"` on the fetched page; a real phantom table shows a `<table>` wrapping the prose). Source and editor both look fine in the failing case, which is the entire point.
- **Standing gap (global skill, not fixable from this repo):** `check-md-pipes.mjs` does not implement its own documented exemptions, so it reports these three safe shapes every run. Until it does, the gate's signal has to be read by shape — treat a *new* hit outside the three shapes as the only actionable one.

Precedent: `claude-code-enterprise-config.md` §5.4's exporter list rendered as a chopped-off phantom table on the live `.html` while source + editor looked fine (2026-07-11).
