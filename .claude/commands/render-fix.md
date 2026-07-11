---
description: Find and fix kramdown/GitHub-Pages render gotchas in published Markdown — stray-pipe phantom tables, plus table/indent traps — then render-verify on the live page
allowed-tools: Bash, Glob, Grep, Read, Edit
---

Scan every published `.md` for the Jekyll/kramdown render bugs that are invisible in the source and only show on the deployed page, fix the dangerous ones, and render-verify on the live Pages HTML. Full rule: `~/.claude/rules/markdown-render-gotchas.md`. Precedent: `claude-code-enterprise-config.md` §5.4's exporter list `` `otlp` | `prometheus` | `console` | `none` `` rendered as a chopped-off phantom table on the live `.html` while source + editor looked fine (2026-07-11).

**The source is not the artifact — the rendered page is.** A pass that only edits the `.md` and never looks at the published HTML has not verified anything.

## Scope

All Pages-rendered Markdown: `artifacts/*.md`, `docs/*.md`, `README.md`, `CLAUDE.md`. **Not** `.html` artifacts (served as-is, not kramdown-parsed) and **not** `scratch/` or `LESSONS_LEARNED.md` (gitignored / process notes, never published).

## Steps

### 1. Map fenced code blocks (so you don't false-positive on code)

Pipes **inside** ` ``` ` fences (bash `a | b`, JSON `"x|y"`, jq) are safe — they render as code, never a table. Before classifying any pipe hit, know its file's fence ranges:

```
grep -nE '^```' artifacts/<file>.md      # pairs of lines = fence open/close ranges
```

A hit whose line number falls inside a fence range is SAFE — skip it.

### 2. Find the dangerous pattern — ` | ` between cells, outside fences

The trigger is a **text-level** ` | ` acting as a delimiter between two or more cells on a non-table line — including ` | ` **between separate inline-code spans** (`` `a` | `b` ``). A single pipe wholly inside **one** code span (`` `cat x | y` ``) is safe; so is a pipe inside a fence.

Primary danger scan (multi-pipe, non-table-row lines, list items included):

```
grep -rnP '^(?![[:space:]]*\|).*\S ?\| ?\S.*\| ?\S' --include='*.md' \
  artifacts docs README.md CLAUDE.md 2>/dev/null | grep -vP '\|[-: ]+\|'
```

Then drop any hit that step-1 showed is inside a fence. What remains is the fix list.

Also run the single-pipe scan for completeness (lower risk, usually safe — verify, don't blindly edit):

```
grep -rnP '^(?![[:space:]]*\|).*[^|[:space:]] ?\| ?[^|[:space:]]' --include='*.md' \
  artifacts docs README.md CLAUDE.md 2>/dev/null | grep -vP '\|[-: ]+\|'
```

Report:

```
PIPE SCAN
  DANGER artifacts/foo.md:120  `otlp` | `prometheus` | `console`   ← fix (multi-cell, not in fence)
  SAFE   artifacts/bar.md:88   inside ```yaml fence (231-259)
  SAFE   artifacts/baz.md:195  single pipe in one code span — render-verified
```

### 3. Fix each danger hit

Replace the body-text ` | ` separators with commas, ` / `, ` or `, or a middot ` · ` — whichever reads best:

```
`otlp` | `prometheus` | `console` | `none`   →   `otlp`, `prometheus`, `console`, or `none`
```

If a literal pipe is genuinely required in prose, escape it (`\|`) or use `&#124;`. **Never edit a real table** (header + `|---|` separator) and never touch pipes inside a fence.

### 4. Sibling kramdown traps (check while you're here)

- **Real tables need a blank line above and below.** A table glued to the paragraph above it can render as literal text with visible pipes. Grep for a `|---|` separator row whose line-above isn't blank.
- **≥4-space indented body lines become a code block.** A wrapped list item or table indented "to line it up" silently renders monospace. Keep continuation at column 0 or 2, not 4.

### 5. Render-verify on the published target (mandatory)

For every file you edited, confirm the fix on the **live** page — a build/CDN lag means wait ~30–60s after any push, and a `?v=<sha>` query param busts the CDN cache. Two ways:

- **curl** the rendered `.html` and assert the fixed fragment reads inline and the phantom table is gone:
  ```
  curl -sL "https://gmanch94.github.io/claude-platform-playbook/artifacts/<file>.html?v=$(git rev-parse --short HEAD)" \
    | grep -c '<table>'      # count should match the intended real tables only
  ```
  Then grep the page text for the fixed fragment (e.g. `otlp, prometheus, console, or none`) — present = fixed; a tab/`<td>`-separated `otlp…prometheus…console…none` = still broken.
- **Browser** (if available): load the `.html`, and in the DOM confirm the fragment's `<code>` sits in an `<li>`/`<p>`, `closest('table')` is null, and no unexpected `<table>` contains the fragment.

If you edited files but have not pushed, verify locally with `bundle exec jekyll serve` if available; otherwise state that live-verify is pending the next push.

### 6. Summary report

```
━━━ RENDER-FIX REPORT ━━━
PIPE SCAN     X danger  Y safe-in-fence  Z single-pipe-verified
FIXES         N lines in M files  (pipes → commas / or / ·)
SIBLINGS      table-spacing: OK/N issues   indent: OK/N issues
RENDER-VERIFY M files checked live  ·  0 phantom tables remain
━━━━━━━━━━━━━━━━━━━━━━━━━
```

If clean: `All published Markdown is pipe-clean; 0 phantom tables on Pages.`

## Constraints

- **Fence-aware or it's wrong.** Most pipe hits in this repo are inside `bash`/`json`/`yaml` fences (hooks-starter-pack, eval-starter-pack) and must NOT be edited. Always map fences (step 1) before touching anything.
- **A single pipe inside one code span is safe** — verify on the live page rather than mangling a real shell command. The trigger is ` | ` *between* cells, not any pipe.
- **Fixes edit the working tree only — do not commit or push.** Leave the commit/ship to the user (repo posture: deploy = branch → PR → merge; direct-to-main only on explicit instruction).
- **Render-verify is not optional.** The whole class exists because source + editor look fine; only the published HTML tells the truth.
- Report partial results if a tool is missing (no curl / no browser) — say render-verify is pending, never silently skip it.
