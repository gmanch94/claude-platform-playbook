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

### "We don't support X, correct?" is a negative claim about your OWN artifact — grep for it, don't recall it

2026-07-25. Asked whether the config builder supported `managed-settings.d` fragment delivery, the honest-feeling answer was "correct, we don't." Both halves needed checking, and the second half was wrong in a way re-reading could not surface: the parent artifact **did** carry `managed-settings.d` — as five words inside a parenthetical on one line — and carried **none** of its semantics. A full-text fetch of the live settings doc then produced a whole governance mechanism: the base file merges *first* (so it is the weakest input), fragments merge alphabetically with **later scalars winning**, arrays are **concatenated and de-duplicated** so another team can widen `permissions.allow` without touching your file, and a fragment renamed to start with `.` is **ignored silently**.

**Why it survives care:** the existing artifact rule (`~/.claude/rules/artifact-quality.md`) fires the negative-claim tripwire on claims about *external sources*. A claim about your own repo feels verifiable by memory, and a parenthetical is exactly what memory drops. **The tripwire is grammatical, not directional** — `no` / `don't` / `we lack` / `not supported` triggers a grep whether the subject is a vendor's docs or your own file.

**And a coverage claim needs the same treatment.** Three sibling questions (Cloudflare/Akamai/Zscaler, Oracle Cloud, Cloudinary/OpenAI/Vercel/Supabase) all landed on one structural fact: **every curated list reports nothing about what it omits**, and a "gaps visible" matrix built from that list shows no gap for a row that never existed. The fix is a *bar* for inclusion plus a *free-text escape hatch*, never a longer list — and a deliberately-excluded item (OpenAI: a credential with no destructive control plane, so env-var entry and no `ask` rule) is worth shipping visibly, because it shows the bar working instead of leaving a reader to wonder.

### The negative-claim miss recurred TWICE in one day — and the second time the source was one link away

2026-07-25. Two separate false negatives in a single session, both from the same mechanism: a **page-scoped** search standing in for a full one.

1. "We could not find a telemetry statement on the Claude Platform on AWS page." True of that page, false of the docs — the page links the feature-availability matrix, which states plainly that on Bedrock, Vertex, Foundry, and Claude Platform on AWS "error reporting and telemetry to Anthropic are off by default," and lists OpenTelemetry metrics among features that work on every provider.
2. "We don't support `managed-settings.d`, correct?" — the parent artifact did mention it, in a parenthetical.

**The rule needs a second clause.** The existing one says a negative claim needs the full source. Add: **when the source you searched links another source on the same question, you have not finished searching.** Writing the search terms into the artifact (which we did) is not a substitute for following the link — it documents the diligence without performing it. The tell is that both claims *read* as careful sourcing, which is why self-review passes them.

Same session, same class, one more shape: a long-standing `[H]`-shaped claim ("the cloud sends no usage metrics on Bedrock/Vertex/Foundry") was simply **wrong**, and it had been sitting next to the builder's own contradicting text ("OTel metrics still flow — what's missing is Claude-account identity") in a sibling file for weeks. **Two files disagreeing is a finding available for free at any time, and nothing in the repo looks for it.**

### A comment can kill a whole page, and only one of the repo's gates could ever see it

2026-07-25. A new code comment in `claude-code-config-builder.html` contained a glob with `*/` inside it. That closed the block comment early, and the entire 110 KB inline script failed to parse: every generated checkbox list empty, no output at all. **The page still looked plausible** — all the static markup renders regardless — and it was found only because a browser probe counted zero checkboxes.

No existing gate covered it: `check-counts.mjs` read Markdown, the pipe scanner read Markdown, `/stale-check` reads metadata. Fixed at the class level rather than the instance: `check-counts.mjs` gained a section that extracts every `<script>` from `artifacts/*.html` and runs `new vm.Script(body)`, failing with the file and the opening line number. Negative-controlled with a planted `const x = = 1` before trusting it — **a guard you have not watched fail is not a guard.**

Corollary from the same commit: guards interact, and a defect can hide *between* them. A backlog table row separated from its table by a blank line was a phantom-table bug the pipe scanner caught — and closing the blank line is what let the table-structure guard see the row's real defect (unescaped `||` making 7 cells in a 5-column table). The blank line had made the block too short for the structure check to examine. **Fixing one guard's finding is how you surface the other's.**

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

### 2026-07-26 — don't guard a counted claim you can just delete

Writing #85 I introduced a counted sentence in `claude-code-101.md` §7 ("**Three** things make it less obvious than it sounds:") over three bullets. Counted prose is the class `check-counts.mjs` section (b) exists for, so the reflex was right: register it, per the documented extension path — `[file, stated-count regex, row regex, label]`.

**The registration was inert, and the negative control is what said so.** The row regex `/^- \*\*[A-Z]/gm` matched **38** bolded bullets across the whole file, not the three under that sentence. Section (b) counts row markers **file-wide**; it works for the existing registrations because their markers are file-unique by construction — a leading `Q1` table cell, a bolded `A1` one. A plain bolded bullet has no such marker, and no regex gets one without inventing a sentinel to carry it.

The fix wasn't a cleverer regex. **It was deleting the number** — the sentence now reads "What makes it less obvious than it sounds:". No count, nothing to drift, `check-counts.mjs` left untouched.

**The transferable half: a counted claim is a liability you chose to take on.** The guard is the *second*-best answer to it. Before registering a new count, ask whether the count earns its place at all — "three things" carried no information the three bullets didn't already carry. Same family as *retitle rather than renumber*: the cheapest defect is the one you decline to author.

**Second-order, and the reason this is worth logging rather than just fixing:** the failure was visible only because the positive control was run and read. A lazier row regex that happened to match exactly three things elsewhere in the file would have printed `OK  says 3, has 3` and guarded **nothing** — green forever, drift uncaught. **Negative-control every new guard registration** (flip the stated number, confirm it goes red), and read the positive control's *row count*, not just its verdict.

### 2026-07-26 — split the register by audience, don't write the sentence twice

The #85 risk exists at two altitudes: a platform team deciding fleet policy, and a practitioner deciding what to do on their own laptop. The first draft wrote it once, in platform-team language, and pointed the reader at "ask IT what those agents cover."

**That instruction is unrunnable for most of the people who need it.** It assumes an IT department exists, that the reader knows which question to ask, and that terms like *profile container* mean something to them. Many Claude Desktop and product-surface users are not engineers, and the engineers reading `claude-code-101.md` don't know endpoint-management tooling either — that's a different profession.

Shipped as two registers instead:

- **`claude-code-adoption-guide.md`** (platform team) keeps the technical framing and adds the part that makes it act: *which tools sweep a home directory is endpoint-management knowledge, not developer knowledge, so the answer has to travel from you to them.*
- **`claude-code-101.md`** (practitioner) gets a self-check anyone can run — *open whatever backup or file-sync app is on the machine and search it for `.claude`* — with no product names and no "ask IT."

**Transferable: guidance the reader cannot act on transfers anxiety without transferring capability**, which is worse than staying silent. When a risk spans audiences, the test is not "is this accurate" but "can *this* reader do something by Friday." Applies to `cowork-101.md` and `user-mindset-cheatsheet.md` on any future extension.

### 2026-07-25 — the parent-doc diff is a real gate, and it can come back "no"

`claude-code-config-builder.html` is downstream of `claude-code-enterprise-config.md` §2/§4/§5, and **no guard catches builder-vs-parent drift** — not `check-counts.mjs`, not `/stale-check`, not `/doc-verify`. So the UX review's wording and field-structure proposals were held back behind a manual diff while six other PRs shipped. The diff paid for itself on the first item it touched.

**The review recommended merging two fields. The diff said no, for two reasons the reviewers could not have had.**

The proposal was to fold the extra-credential **env var** field and the extra **`denyRead` path** field into one labelled group with two inputs, modelled on the marketplace `src`/`repo` pair. It reads as an obvious tidy-up — the fields are adjacent, and a code comment already flagged pasting a path into the env field as "the likely slip."

1. **The parent doc forbids it on the merits.** §4 keeps `credentials.envVars` "separate from general filesystem rules" and states plainly that *no path rule reaches an env var*. One field feeding both would blur precisely the distinction that section spends two paragraphs establishing — and the builder is the artifact most likely to be read as authoritative on it.
2. **The builder's own logic forbids it independently.** The two fields have different visibility *by design*: env vars are emitted inside the sandbox block and vanish with it, while extra paths also feed `permissions.deny` and stay visible with the sandbox off. A shared `.fld` would hide both together — silently breaking the `val()` hidden-guard from #77, the fix for the very bug class this artifact exists to demonstrate.

Reason 2 is the transferable half. **A blind reviewer proposes against the rendered artifact; they cannot see an invariant that lives in the render function.** Neither reviewer was wrong to suggest it, and neither could have caught it. That asymmetry is the argument for the diff being a step rather than a rubber stamp — it is where the artifact's own constraints get to answer back.

Shipped instead as a **visual** group: one heading, two separate `.fld` elements, labels carrying the distinction ("variable NAMES, not paths" / "absolute PATHS, not variable names"). The reviewer's goal — stop the paste-into-the-wrong-field slip — met without collapsing the surfaces.

**Record which of four outcomes each item got**, because "I did the diff" is not a result:

| Outcome | This round |
|---|---|
| Cleared, applied as proposed | MCP `none` → checkbox · org-name label · "Advisory" by name · two hint lead sentences |
| **Changed by the diff** | the env-var / path merge → visual grouping only |
| Already shipped earlier | card retitles (#82) · drawer badges (#80) |
| Verified, no change needed | the json tab's mutating label — both names appear in the parent doc |

**Generalizes to:** any artifact downstream of a source-of-truth doc with no drift guard — the builder against the config guide, `system-card-readout.md` §4 against the live card, any future composer over a reference doc. Gate the change, run the diff for real, and expect a "no" often enough to be worth the step.

### 2026-07-25 — a UX complaint is a finding, and the blind-review policy generalizes to it

"The config builder is not intuitive" was a one-line report. Treated as a review target rather than a styling note, it returned **three correctness bugs** in `claude-code-config-builder.html` that four prior review rounds, a `doc-verify`, a live probe and a green count guard had all passed over. Landed as #77.

- **Brief reviewers with RENDERED measurements, not just the source.** "Not intuitive" is a property of the rendered interaction, and a source-only read returns generic IA advice ("improve hierarchy", "add whitespace") that is worth nothing. Drive the live page first and hand over facts: document height in viewport-screens, per-column geometry, what is `sticky` or `fixed`, whether the blocker list contains any `a`/`button`, word counts of help text, how many checkboxes are pre-checked. Both reviewers built every finding on those numbers. **Drive it yourself rather than sending reviewers to the browser** — two agents on one browser pane collide, and the measurements are cheap to take once.
- **Two lenses, same as the factual reviews.** First-run operator (can a cold admin finish and trust the output?) and IA/error-recovery (disclosure order, blocker-to-fix loop, signal hierarchy). They converged on the same structural cause from opposite ends, which is the signal that it was structural.
- **State the artifact's hard constraints in the brief or the findings are unusable.** Single file, no CDN, no framework, print-clean, and *field labels and emitted values are load-bearing and footnoted to the parent doc*. Ask for layout/flow/disclosure/feedback changes, and require wording or field-merge proposals in a **separate** section so they can be diffed against `claude-code-enterprise-config.md` first.
- **Reviewers corrected a wrong fact in my brief — both of them.** I told them blocking and advisory gate rows differ only by border colour. They checked the source and pushed back: warn rows carry a `Warning —` prefix, and the real defect is the inverse — **blocking rows carry no prefix**, so the only labelled severity is the one you are allowed to ignore. Brief them to contradict you, and grade what comes back rather than applying it.
- **Reproduce before reporting, and again after fixing.** Every CRITICAL was re-run by hand on the live page before it went in the findings file, and each fix was re-run after. That is what caught the two adjustments neither review predicted: `overscroll-behavior: contain` dead-stops the wheel under the cursor once the rail bottoms out, and the gate grows with the blocker count until it crowds the export buttons out of the rail it was meant to make reachable.

**The bug class underneath all three findings is the one this repo already knows:** a control that exists and enforces nothing. A prefilled required value silently satisfied its own blocker. A hidden field was still read, so a blocker could name something no longer on screen and a typed value could vanish from the output unannounced. A macOS-only key emitted on a Windows-only fleet and blocked export with both remedies off-page. Same shape as the lock-flag-without-its-allowlist entry below — **the builder committed, in its own UI, the class its linter exists to catch.**

### 2026-07-25 — ⚠⚠ THIRD RECURRENCE: "not documented" written from a search that didn't read the source

The grammatical hard stop on `no` / `none` / `not stated` was added 2026-07-24 after two instances in 24 hours. It has now happened a **third** time, same week, and this time it shipped into a published artifact and a new tool. Three claims, all false, all mine:

| Claim written | What the docs actually say |
|---|---|
| "Whether `forceLoginMethod` stops a `claude setup-token` session is **undocumented** — verify with Anthropic" | `authentication.md`: `setup-token` and `/install-github-app` "**enforce only `forceLoginMethod`**, so they can mint a token in a different organization." `settings.md` carries the v2.1.212 gate. Fully documented — and it names a real hole the hedge obscured. |
| "the `.reg` value type and escaping are **this tool's reading of a doc that names the key path but not the encoding**" | `settings.md`: "a `Settings` value (**REG_SZ or REG_EXPAND_SZ**) containing JSON." |
| "this tool **does not have a settings key** for [fail-closed startup]" | `settings.md`: **`forceRemoteSettingsRefresh`** — "Block CLI startup until remote managed settings are freshly fetched… the CLI exits rather than continuing with cached or no settings." |

**Why the existing rule didn't catch it.** The rule says: on `no`/`not stated`, grep the full source. I *did* grep — and got a **false negative**, because `settings.md` writes the type as `REG\_SZ` with kramdown-escaped underscores, so `grep "REG_SZ"` returns nothing. A blind reviewer quoted it, I re-grepped, missed it again, and briefly concluded **the reviewer had fabricated the quote.** Only loosening to `grep -i "reg_sz\|reg.sz"` found it.

- **New clause the rule needs: a failed grep is not a read.** Markdown escaping (`\_`), smart quotes, soft hyphens, and line-wrapped table cells all defeat a literal pattern. Grep **case-insensitively with punctuation loosened**, and on anything load-bearing, read the section.
- **Corollary, and the more dangerous half:** I nearly used my own false negative to *dismiss a correct reviewer finding*. "Verify before fixing" protects against acting on a bad finding; it does **not** protect against discarding a good one on bad verification. When a reviewer supplies a verbatim quote and your grep disagrees, **assume your grep is wrong first** — they read the page, you pattern-matched it.
- **Why hedges specifically:** an unverified negative *feels* like diligence, so it survives self-review in a way an unverified positive would not. Three recurrences in one week is a convention problem, not three slips.

### 2026-07-25 — one convention error wearing four hats: the lock flag without its allowlist

A blind review found four defects in the config builder that were one mistake made four times — **emit the lock flag, omit the allowlist the flag governs**:

| Emitted | Missing | Consequence |
|---|---|---|
| `allowManagedMcpServersOnly: true` | `allowedMcpServers` | Unset means **all servers allowed**, not none — the gate is inert |
| `enforceAvailableModels: true` | `availableModels` | Documented no-op when the list is unset or empty |
| `filesystem.denyRead` | `filesystem.allowManagedReadPathsOnly` | Array keys **merge across scopes**, so a developer re-opens the paths |
| `network.allowedDomains` | `network.allowManagedDomainsOnly` | Same merge — a developer widens egress |

Each arrived as its own finding. Fixing them one at a time leaves the pattern live for the next field. **When several findings share a shape, fix the convention** — here, a linter check that blocks any lock flag emitted without the list it governs, so the fifth instance can't ship.

Three related traps from the same pass:
- **`Object.assign` vs bare assignment.** A later `sb.network = { allowedDomains }` silently dropped the `allowManagedDomainsOnly` set a few lines above — the lock was written, then overwritten. Merge, never replace, when building a config object in stages. Caught only because a probe asserted the key's presence.
- **A guard that fires on valid input gets ignored.** The word-boundary check ran on *all* rules instead of Bash only, blocking export on correct `Read(~/.ssh/**)` gitignore globs.
- **A guard that passes on invalid input is worse.** `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` was counted as covering `GITHUB_TOKEN`/`NPM_TOKEN`; it strips **Anthropic and cloud-provider credentials only**, so the coverage matrix printed green for an untouched variable.

**Assert expected keys positively.** `JSON.parse` succeeding and "no placeholders present" both pass on `{}`. Every one of the above was caught by an assertion of the form *this key must exist with this value in this combination* — never by reading the code.

### 2026-07-25 — the drift a guard can't see, found by a question instead

One user question — *are we protecting critical IP ranges, internal and external?* — surfaced three defects in an artifact that had shipped clean the same day through a blind review, a doc-verify pass, a 27-combination browser probe, and a green count guard. None of those could have found any of them, and the reason each was invisible is the lesson:

- **A parent field the child never rendered.** `network.deniedDomains` sat in the parent artifact's template *and* its prose; the generator downstream of it had no field for it. This is exactly the builder-vs-parent drift the coupling contract in `scope.md` says **no guard catches** — and the contract was right, which is worse than it sounds: writing "no guard catches this" and then relying on the guards is not a mitigation. **A named unguarded gap needs a periodic manual diff, or it is just a documented hope.**
- **A green cell that overstated the control.** The coverage matrix marked egress covered whenever an allowlist existed — but without the managed lock flag the sandbox *prompts* and a developer approves the host, and even when it blocks, the proxy never inspects TLS (a documented domain-fronting path). **Every cell in a coverage matrix needs its states enumerated before its logic is written.** "Covered / not covered" was the bug; the honest axis was blocked / prompted / absent, and it was cheap to add only because the question forced it.
- **A question the platform cannot answer at all.** There is no IP/CIDR primitive; the fields are hostname patterns. The right output is not silence and not a guess — it is the searched terms plus where the capability *does* live (the proxy layer), so the reader stops looking in the wrong file.

**The nesting class recurred, and that makes it a rule.** A new linter check read `o.enableWeakerNetworkIsolation`; the key nests **inside** the sandbox block, so the check would have been permanently silent — the second instance in one artifact of the same shape as the earlier `sandbox.allowUnixSockets` / `sandbox.network.allowUnixSockets` defect. Two instances of one class is a convention problem: **confirm every new config key's nesting against the settings table's own key name, never from the prose describing it** — and a silent check is indistinguishable from a passing one, so plant a defect and watch it fire.

**The usability reviewer then found five HIGH defects in the fix itself**, and the pattern across them is worth more than any one:

- **A validator that accepts the exact input the change existed to reject.** The hostname regex accepts all-digit labels, so `169.254.169.254` passed and was emitted — while the field hint said the docs don't state whether a bare IP matches, and the checklist then certified the entry as the one nothing can override. **An entry that might be inert must never read as a denial.** The shape check was written for typos and reused as a semantic gate.
- **The overstatement moved down a level instead of leaving.** The matrix stopped granting green for an allowlist and started granting it for a *proxy port number* — which the page cannot verify is listening, terminating TLS, or trusted. **A field the tool cannot verify must not upgrade a coverage cell**; it earns a checklist row instead.
- **A guard inverted in the same commit that fixed an inverted guard.** A new check's macOS warning was gated `osScope !== "unix"`, but `unix` is labelled "macOS / Linux / WSL2" — so it was silent exactly where macOS lives and fired on Windows, where the sandbox doesn't exist. Fixing one instance of a class does not inoculate the next line you write.
- **Advice text was HTML-escaped**, printing every `<code>` and `<b>` in a reason as literal markup — the field names in the most important sentence were the least readable part of it. Pre-existing, and the new reasons multiplied it.
- **A hard block whose reason names a remedy the tool doesn't offer** reads as a bug. Either offer the exit or name the narrower configuration; here it became "put that one binary in `excludedCommands` instead."

**Probe hygiene, learned the hard way:** three of that round's re-verifications came back false because my probe *toggled* checkboxes rather than setting them absolutely, leaking state between assertions. **Force state, don't flip it** — and when an assertion fails, print the page's own text before believing the failure. Two of the three "failures" were my regex (`prompts` vs `prompt`) and one was a blocker from a different, correct check.

**Encoded, not just noted:** `check-counts.mjs` gained a **cross-file counted-claims** section (a count stated in one file, implemented in another). It caught two live drifts on its first run — three docs said "9-check linter" against 10 implemented checks, and "five posture questions" against six. The existing in-prose guard couldn't see either, because the sentence and the thing it counts live in **different files**. Same class as the in-prose lesson below, one file-boundary further out.

### 2026-07-25 — a freshness stamp on the container hides the staleness of its contents

A `/stale-check` run reported `feature-inventory.md` Last-verified **2026-07-24** — one day old, comfortably inside the 14-day product-surface window. Three of the five product-surface rows were sitting at as-of **2026-06**, and one of them was factually wrong.

**Why the check couldn't see it.** A refresh that verifies *some* rows still bumps the **file-level** stamp. From then on the file looks fresh and the skipped rows are invisible — the stamp certifies the container, not the contents. The 14-day window was doing nothing, because it was measuring the wrong thing.

- **Fix:** compare **each row's own as-of**, never the file-level date. Anchored in `/stale-check` step 5 with the precedent.
- **Generalizes past this repo:** any per-item table under a document-level freshness stamp has this hole — a partial refresh is indistinguishable from a complete one. The item-level timestamp is the only honest signal, and the aggregate stamp actively conceals its absence.

**What the stale row was hiding.** Claude Design was logged as **Team / Enterprise**; the admin guide says it is **"available in beta to Pro, Max, Team, and Enterprise plans,"** default off on Enterprise only. Wrong in the **permissive** direction: the surface reaches individual paid seats with no org gate, while the plan most likely to want it gated is the one where it ships off. It had propagated to five artifacts.

- **Root cause of the wrong gate: I read the article's *title* as its plan gate.** "Claude Design admin guide **for Team and Enterprise plans**" scopes the *admin instructions*; the availability sentence sits in the body and says something broader. **A title is not an availability statement** — find the sentence that says *available to*.
- Same shape as the negative-claim rule already in `~/.claude/rules/artifact-quality.md`: a plausible-looking artifact of the *source's structure* got mistaken for the source's *claim*.

**Two smaller catches from the same run,** both worth noting because neither is the kind of thing a stamp or count guard sees:

- A permission **label** was wrong — `can-use` / `can-edit` where the UI says **`Can view` / `Can edit`** — and had propagated into an SVG diagram. Labels are what an admin searches the UI for; a wrong one costs real minutes.
- A doc URL 404'd (`agents-and-tools/code-execution` → `agents-and-tools/tool-use/code-execution-tool`). URL health is the one class the spot-check *does* catch — it just has to be run.

**And a false lead worth recording, because it nearly became a fix.** Before correcting Claude Design I "fixed" its `surf prod` badge from *Enterprise product* to *Paid-plan product* in `enterprise-data-boundaries.html` — then found Chat, Projects, and Artifacts carry the identical badge and are also on Pro/Max. The badge is a **category** (product surface vs API vs procurement), not a plan gate. Reverted both edits; the plan-gate fact went in the prose instead. **Before "correcting" a label, check what its siblings use it to mean** — a taxonomy read as a claim produces a confident wrong edit, and this one would have made the page inconsistent while feeling like a fix.

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
