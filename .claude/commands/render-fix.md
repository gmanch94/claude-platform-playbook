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
- **Known-safe hits** the scanner flags for human review: files that *document* the bug (this file, `LESSONS_LEARNED.md`, `CLAUDE.md`) and `claude-code-101.md:195` (single pipe inside one code span — render-verified safe).

Precedent: `claude-code-enterprise-config.md` §5.4's exporter list rendered as a chopped-off phantom table on the live `.html` while source + editor looked fine (2026-07-11).
