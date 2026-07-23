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

### Never rewrite tracked text files with PowerShell `Set-Content -Encoding utf8` (Windows)

Windows PowerShell 5.1 writes UTF-8 **with a byte-order mark**. A bulk regex-swap pass over `index.html` and `docs/feature-inventory.md` (2026-07-23, during the `claude-security-layers` rename) prepended BOMs that merged in [#57](https://github.com/gmanch94/claude-platform-playbook/pull/57) and needed a follow-up [#58](https://github.com/gmanch94/claude-platform-playbook/pull/58) to strip.

- **Use the native Write/Edit tools** for tracked text files. If a scripted rewrite is genuinely necessary: `[System.IO.File]::WriteAllText($p, $s, (New-Object System.Text.UTF8Encoding $false))`.
- **Tell-tale in review:** a diff-stat far larger than the edit justifies, on a file you only touched with a regex swap. A whole-file rewrite means the encoding or line endings moved.
- **Detection — scan for BOTH, the BOM is the lesser problem.** A first pass caught only the BOM and declared victory; a blind review two commits later found the real damage. `Get-Content -Raw` decodes with the **ANSI codepage**, so the re-encode **double-encodes every multi-byte character** — 158 mojibake sequences were sitting in `docs/feature-inventory.md` and 15 in `index.html`, live on the public site, after the "fix."
  - BOM: `$b=[System.IO.File]::ReadAllBytes($p); $b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF`
  - Mojibake: count `[char]0x00E2` occurrences against real em-dashes (`[char]0x2014`). A file with many of the former and few of the latter is corrupted. **Don't grep for the literal `â€"` string** — the console encoding mangles it and PowerShell fails to parse it.
- **Repair by restoring the pre-corruption blob, not by transforming bytes.** `git checkout <good-sha> -- <files>`, then re-apply the intended edits with the native Edit tool. A mojibake-reversal transform is lossy and unverifiable; a restore is provably correct. (Note `git show <sha>:<path> > file` in PowerShell re-adds a BOM through the redirect — use `git checkout`, which writes raw blob bytes.)
- **Why it matters here:** a BOM is invisible in the editor and in rendered `git diff`, but it ships. Ahead of a markdown file's first `#` it can suppress heading parsing on some renderers. Same family as the `.md`→`.html` and phantom-table gotchas — *the source looks fine and only the shipped artifact is wrong.*

### Verify **every** SVG, not just the first, on multi-diagram pages

The house render-probe grabbed `document.querySelector('svg')` — the first one. On a page with six workflow diagrams that checks 1/6 and reports green. Switching to `querySelectorAll` and iterating (2026-07-23) immediately caught a real defect: a callout line running to `x=1297` inside a `1120`-wide viewBox on diagram 2. Per-SVG assertions worth keeping: viewBox overflow, text escaping its own box, and 0 unresolved `var()` in `fill`/`stroke` (the Safari/Firefox trap).

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

### 2026-07-11 — the source is not the artifact (kramdown phantom-table render bug)

**A raw ` | ` in prose or a list item renders as a table on GitHub Pages — invisible in the source and the editor, only visible on the published HTML.** `claude-code-enterprise-config.md` §5.4 wrote an exporter list `` `otlp` | `prometheus` | `console` | `none` `` inside a bullet; kramdown parsed the text-level pipes as table cells and chopped the sentence into a phantom table on the live `.html`. The `.md` looked perfect. Caught only by fetching the **live rendered page** and seeing tab-separated cells where the pipes were.

- **Fix:** body-text separators use commas / ` / ` / ` or ` / ` · `, never raw ` | `. A literal pipe in prose escapes as `\|`.
- **Not every pipe is a bug:** a single pipe wholly inside **one** inline-code span (`` `cat x | y` ``) or **any** pipe inside a ` ``` ` fence is safe. The trigger is ` | ` acting as a delimiter *between* cells (including between separate `` `code` `` spans). Be fence-aware before editing — most pipe hits in this repo (hooks-starter-pack, eval-starter-pack) are inside `bash`/`json`/`yaml` fences and must not be touched.
- **Encoded as `/render-fix`** (`.claude/commands/render-fix.md`) — scans all published `.md`, fixes the danger pattern, render-verifies on the live page. Global rule: `~/.claude/rules/markdown-render-gotchas.md`; also in project memory `github-pages-html-artifact-gotchas.md`.
- **Meta:** render-verify on the deployed target, not the editor. Belongs to the same family as the `.md`→`.html` Jekyll collision and markdown-can't-carry-colour — the published page is the artifact.

### 2026-05-04 — claude-misconceptions.md ship

**Decision-relevance filter is the bouncer.** Started from 25 raw research entries. After applying primary-source + decision-frame filter, only 15 survived. The cuts (vs-GPT/Gemini comparisons, Opus 4.7 jump as informational fact, "Claude is lazy" trope, hallucination index) all *felt* like Claude misconceptions but failed the test "ends in a measurable mis-budget / mis-architect / mis-staff call." A misconception that doesn't change a decision is not in this repo's scope.

**Source quality rebuild beats source quality patch.** First-pass agent cited Finout, Medium, DataStudios, ClaudeCodeCamp, MarkTechPost — all secondary. Cheaper to rebuild from `feature-inventory.md` as the spine and cite primary docs from scratch than to URL-swap inside a draft that was already shaped around secondary phrasing.

### 2026-05-03 — Distracted-boyfriend meme rejection

User caught the gendered-baseline risk in the distracted-boyfriend meme template before it shipped. Replacement: "Is this a pigeon?" — same misclassification punchline without identity baggage. **Rule:** any meme template carries its original baseline regardless of how it's relabeled. Audience for this repo includes CHROs and risk leads — assume zero tolerance for identity-loaded humor even when the punchline is technically about something else.

### 2026-05-03 — Refresh cadence: monthly vs quarterly

Anthropic surface drifts fast (model releases, pricing changes, feature GA). Repo refresh discipline = **monthly** (first Monday, scheduled remote agent). Adopter-side cadences (governance review, no-train re-verification, jailbreak corpus refresh, allow-list review) stay **quarterly** — those are organizational rituals, not feature drift. Don't conflate the two.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07.`
