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

### 2026-07-25 — the comparison, not the number: quoting two measurements taken under different conditions

The Opus 5 system-card sweep landed a browser-use prompt-injection row reading **"31.5% → 0%"** across three files. Both numbers were transcribed correctly from the card. The *comparison* was wrong: 31.5% is Opus 4.8 **unsafeguarded**, 0-of-129 is Opus 5 **with connector auto mode on**. The card publishes the missing cell one column over — **Opus 4.8 with the same safeguard was already at 0.08% (1 of 129)**. The generational delta lives almost entirely in the unsafeguarded condition (31.5% → 3.70%). Caught by a blind factual reviewer; I had shipped it twice, and an advisor pass over the same diff hadn't flagged it either.

- **Why it survived a careful pass.** Every individual number was verified against the source and every rate carried its own test-condition caveat. The defect isn't in any cell — it's in the *pairing*. Fact-checking cell by cell cannot see it, which is exactly why it reached review.
- **The general class:** any vendor table with a safeguard, config, harness, or variant column invites a best-case-vs-worst-case pairing, and it always flatters the newer thing. It is also the single most likely sentence to be lifted into a board deck, which makes it a credibility risk rather than a precision nit.
- **Check to run on any comparative claim:** name the condition on *both* sides out loud. If they differ, either find the matching cell or say plainly that the comparison isn't like-for-like. If a vendor publishes the matching cell and you omitted it, that omission is the finding.
- **Landed as a rule, not just a fix.** `system-card-readout.md` §3 rule 6 ("compare like with like"), a four-column table in `agentic-threat-model.md` (both models × safeguard on/off), and an explicit warning in the `feature-inventory.md` note block.

### 2026-07-25 — in-prose counts have no guard, and growing a list breaks them silently

Appending a third item to `claude-security-layers.md` §9 left **four** in-prose counts wrong across three files: the artifact intro ("Two further controls"), the §9 lead ("Two more things"), the visual companion's sub-line, the README catalog row, and the `CLAUDE.md` tree line. `scripts/check-counts.mjs` passed green throughout — it guards **artifact** counts (`artifacts/` vs README catalog vs `scope.md` vs `CLAUDE.md`), not counts stated inside prose.

- Worse than a stale number: the companion page's sub-line promised three controls over a body that showed two, so a reader was told a third existed and never shown it. A second reviewer flagged that independently.
- **⚠ RECURRED same day, and the reminder didn't hold.** `system-card-readout.md` §5 gained two rows in the review pass; the heading was bumped by one and shipped **"six actions" over seven rows** — live, through four blind reviewers and every guard. Caught by the user reading the table. **A rule that says "remember to grep" is not a control** (the repo's own enforce-vs-guide thesis, applied to its own process). So `scripts/check-counts.mjs` gained a second section: **in-prose counted lists** — a heading's number word must equal the rows beneath it, rows are ground truth, non-zero exit on mismatch. Verified by breaking the heading deliberately (exit 1) and restoring it (exit 0). Extend it with a `[file, stated-count regex, row regex, label]` row whenever an artifact grows a counted list that gets rewritten on a cadence.
- **⚠ RECURRED AGAIN, one commit later — a different structural class.** Fixing the count above, I added a new 5-column header to §5 and **left the old 4-column header in place**. The second header and its separator rendered as data rows, live. The user saw it immediately; the fresh in-prose guard passed, because the row *count* was right. **Each guard only sees the class it was written for** — counts don't imply structure. `check-counts.mjs` gained a third section: **markdown table structure** (one header, separator on row 2, consistent column count, repo-wide, fenced code blanked so a `| sed …` pipeline isn't misread — it false-positived on exactly that in the first pass). Verified by reintroducing the user's bug and both other modes, each exiting 1. It also found two pre-existing defects nothing had caught: a 6-cell row in a 5-column inventory table, and a 2-cell row in a 3-column scope table.
- **Verify the render claim, not just the render.** Triaging the 6-cell row I asserted GFM truncates over-wide rows, so content was being lost. Fetching the live page showed kramdown renders **all six cells** — misalignment, not loss. The fix was the same either way; the *severity* I'd have reported was wrong. Check the rendered artifact before characterizing a render bug, exactly as `markdown-render-gotchas.md` says.
- **Give counted rows stable IDs.** §5's actions are `A1`–`A7`, not bare ordinals, so inserting an action doesn't renumber every cross-reference in README/`CLAUDE.md`/`scope.md`. The orphan that started this — a lone "0." on the first row of an otherwise unnumbered table — came from taking a reviewer's *positional* suggestion ("add a row 0") as literal cell text.
- **Rule:** after growing or shrinking any *counted* list, grep the count words across the artifact, its visual companion, README, and `CLAUDE.md` before commit. Numerals and words both (`three`, `3`, `two adjacent`).
- **Related and cheaper:** when a section's contents outgrow its title, retitle rather than stretch. §9 became "Adjacent **and underneath**" because a model-level safeguard isn't adjacent to the stack, it's beneath it — and retitling kept every `§9`/`§10`/`§11` cross-reference in `README.md` and `CLAUDE.md` intact, which renumbering would have broken.

### 2026-07-24 — a system card is its own fact class, and the launch-post sweep misses all of it

The Opus 5 launch sweep (PRs #64/#65) was thorough on everything the **launch post and docs** carry: pricing, context, thinking defaults, cache floor, capability and tier regressions. It landed **none** of the model's governance facts, because they aren't in those sources. The **system card** — read a day later, only because the user handed over the PDF — was the sole source for: the RSP determination and that **ASL-3 protections apply**; the **Frontier Compliance Framework** (Anthropic's named framework for California TFAIA + the EU AI Act GPAI Code of Practice) and **Anthropic Ireland, Limited** as the EEA provider; a **safeguards policy change** (source-code vulnerability discovery unblocked at general availability, compiled binaries still blocked) plus the **Cyber Verification Program**; measured prompt-injection robustness and the two vendor safeguard layers; and the honesty profile (**accuracy +11%, hallucination +6%** vs Opus 4.8).

- **Root cause: the refresh ritual enumerates *sources*, and the system card wasn't one of them.** `feature-inventory.md`'s checklist named docs.claude.com and anthropic.com/pricing; the 2026-07-23 hardening added support.claude.com + claude.com/product for surface drift. Each addition came from a specific miss. Same shape here: a source class that exists, is authoritative, is published on the same day as the model, and nothing pointed at it.
- **These are not nice-to-have facts.** ASL-3 and the FCF are what a risk committee and an EU legal review ask for *by name*; the source-code unblock changes what an AppSec team can do that day; the hallucination delta contradicts the intuition that a smarter model needs less checking.
- **Fix landed in both guards:** `feature-inventory.md` monthly checklist step 7 and `CLAUDE.md`'s model-surface process step 5 now require reading the system card and landing its findings as **Compliance rows**, not prose.
- **Carry the test conditions with every number.** The cards measure capability and robustness with **production safety interventions disabled**, and the adaptive-attacker tests are deliberately permissive (attacker optimizes against the same scenarios, many attempts). A rate quoted without its condition reads as a deployed-system property — the exact misread this repo's tone rules exist to prevent. A `0%` on a fixed 129-scenario set is a strong result, not a proof of impossibility.
- **Watch for name collisions when importing vendor vocabulary.** The card's connector **"auto mode"** (a prompt-injection safeguard that *blocks* tool calls) collides with Claude Code's permission **"auto mode"** (which *relaxes* approval prompts) already documented in `claude-security-layers.md` §5. Disambiguated in both files on landing — same failure mode as the five meanings of "tier" (`claude-misconceptions.md` §6).

### 2026-07-24 — "not stated in the docs" is a claim, and a failed search is not evidence for it

**The Opus 5 sweep asserted five times that a fact "isn't stated in launch materials" when the docs state it plainly** — in one case under a section *heading* ("Lower prompt cache minimum: … 512 tokens, down from 1,024"). The commit message simultaneously claimed `[H] live-verified` against that same doc. Caught by a blind factual reviewer, then re-verified first-hand before fixing.

- **Root cause: partial retrieval read as absence.** I queried the docs through a search tool that returns *matched sections*, got no hit for the cache floor, and wrote "unstated — verify." The section existed; my query didn't reach it. A retrieval miss and a documentary silence are indistinguishable from inside the search, and I treated one as the other.
- **The hedge felt like discipline, which is why it slipped.** "Verify rather than assume" reads as careful sourcing, so it passes self-review — but an unverified *absence* claim is as wrong as an unverified presence claim, and worse here: it **deleted a real decision lever** (the floor halved to 512, making short prompts cache-eligible) and, in another instance, **hid a hard HTTP-400 breaking change behind a fabricated unknown** (disabling thinking requires effort `high` or below).
- **Rule going forward — before writing "the docs don't say X":** fetch the **full** doc (`curl <url>.md`) and grep it, don't rely on a section-level search; say **"I could not find X in <named doc>, searched <terms>"**, never bare "unstated"; and treat a *negative* claim as needing the same `[H]` evidence as a positive one. Cheapest tell: if you're about to write "not stated," you haven't finished verifying.
- **⚠ RECURRED 2026-07-25, one day later.** Drafting the "who evaluated this besides the vendor?" question in `system-card-readout.md`, I wrote *"no independent evaluation of the alignment or honesty findings."* The card has **§6.4.8 — External testing from the UK AI Security Institute**, an open-ended misalignment review with findings reproduced verbatim. Caught pre-commit only because the claim felt strong enough to check. **A lesson that recurs within 24 hours is a convention problem, not a slip:** the trigger isn't "am I sure?" (I was), it's the *grammatical form*. Treat "no / none / not stated / nothing in X" as a hard stop that requires a grep of the full source before the sentence is finished — the same way a security review treats a bare `catch {}`.
- **Same class, found while fixing:** Sonnet 5's 1M context window was also flagged "unverified" repo-wide since its launch — it is documented. And a **pre-existing** wrong value (Haiku 4.5 cache floor listed 1,024; it is 4,096) survived because nobody re-read the canonical per-model list. `/doc-verify` exists for exactly this; run it on model rows after a launch.

### 2026-07-24 — the Models table has no propagation path, so model facts don't fan out

Every other section of `feature-inventory.md` carries a **`Used in artifacts`** column, and the refresh ritual is "edit the inventory, then grep `Used in artifacts` to find every file that must follow." **The Models table has no such column** — so a model-surface change has *no mechanical way* to reach its dependents, and the Opus 5 sweep found them by hand.

That's why the first pass shipped a `model-selection-guide.md` that contradicted itself: the header said thinking is on by default while §Extended-thinking three screens below still said *"Rule: default off."* A reader following the rule walks into the truncation failure the header warns about.

- **Fix to make:** add a `Used in artifacts` column to the Models table (or a per-model dependents list), so "new model" becomes a grep, not an archaeology dig. Until then, a model change **must** be swept against the full `Opus|Sonnet|Haiku` grep *and* re-read for **advice that assumed the old default** — label-swap is the easy half; the stale-but-not-obviously-wrong guidance is the half that ships broken.
- **Model launches also change guard rules.** `/stale-check`'s pin guard read `Opus 4\.\d — flag if not 4.8`. Bumping the canonical pin to Opus 5 without rewriting that line left a guard that reports **green** on every lingering 4.8 pin — the exact drift it exists to catch. Half-updated automation is worse than none, because it certifies.

### 2026-07-23 — surface drift is its own class; the refresh routine now audits for it

**The monthly feature-surface refresh missed that Cowork moved from desktop-only local execution to remote execution on Anthropic's servers + web/mobile beta.** The routine checked status / pricing / doc-URL health — none of which changed — so a status/pricing-only diff read "no drift" while the inventory row and 8 dependent artifacts (`cowork-101`, `cowork-101-workflow`, `cowork-adoption-guide`, `claude-product-101`, `surface-rollout-matrix`, `claude-enterprise-architecture`, `agentic-threat-model`, `README`) stayed stale. Caught only by an independent blind reviewer who fetched the live `support.claude.com` get-started article.

- **Root cause 1 — wrong sources.** Product-surface facts (Cowork/Design/Tag/Science) live on `support.claude.com` + `claude.com/product/*`; `docs.claude.com` doesn't cover them, and the routine wasn't fetching the support pages.
- **Root cause 2 — wrong diff dimensions.** The diff checked status/pricing/URL/new/removed. **Availability surfaces** (desktop/web/mobile), **execution/hosting model** (local vs remote; files-local vs files-in-account), **plan gate**, and **governance flags** are separate drift dimensions none of those catch.
- **Fix (2026-07-23):** updated the cloud routine `trig_019PnZmQxwkS5r9iLU9aWthe` — STEP 2 fetches `support.claude.com` + product pages for the product surfaces; STEP 3 added availability / execution / plan / governance as first-class diff dimensions and put the four product surfaces on the every-run attention list; STEP 4c greps dependents for stale surface phrases (`isolated VM`, `not web/mobile`, `on your machine`, `desktop-only`) so a surface change is fixed everywhere, not half-corrected. CLAUDE.md's Automation description updated to match.
- **Meta:** a "no drift" from a checker that only inspects the dimensions that didn't change is a false negative, not a clean bill. When a class of fact slips through, add the dimension to the checker — don't just fix the instance.

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
