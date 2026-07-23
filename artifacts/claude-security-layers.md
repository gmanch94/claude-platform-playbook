# Claude security layers — which one do you actually turn on?

Anthropic ships **six** distinct code-security layers plus two adjacent controls that get called "Claude security" in the same breath. They differ by plan, billing model, what they scan, and whether they work at all under Zero Data Retention. This artifact is the chooser.

Visual companion: [claude-security-workflows.html](claude-security-workflows.html) — the stack at a glance plus one workflow diagram per layer.

**Sourcing:** every mechanic `[H]` against `code.claude.com` docs, live-fetched **2026-07-23**. Dates and press figures graded inline.

---

## 1. First: four things called "Claude security"

Four differently-named offerings shipped in five months. Mixing them up is the main way this gets mis-budgeted.

| Thing | What it actually is | When | Who gets it |
|---|---|---|---|
| **Claude Security plugin** | Claude Code plugin. `/claude-security`. On-demand **deep scan** of a repo or diff → reviewed report → optional patches. Beta. | ~2026-07-21 `[M]` | Claude Code, **paid plan** `[H]` |
| Security **guidance** plugin | Different plugin. Reviews Claude's own edits **as it writes**, three checkpoints, fixes in-session. Free. | 2026-05-26 `[M]` | All Claude Code users `[H]` |
| **Claude Security** (the product) | Managed, hosted service that scans **connected repositories** from `claude.ai/security`. Public beta, ran on Opus 4.7 at launch. | 2026-04-30 `[H]` | Claude **Enterprise**, premium seats `[H]` |
| **Compliance API** + security partners | Not code scanning at all. DLP/SIEM/eDiscovery governance of Claude *usage*. 28 partners at launch, now 60+. | 2026-05-21 `[H]` | Enterprise + Platform `[H]` |

Same word, four price points, four buyers. Sections 3–8 below take the code-security ones layer by layer.

---

## 2. The stack at a glance

Anthropic's own framing — earliest catch at the top, broadest catch at the bottom `[H]`:

| # | Stage | Layer | What it covers |
|---|---|---|---|
| 1 | In session | Security **guidance** plugin | Common vulnerabilities in code Claude writes, fixed in the same session |
| 2 | On demand, single pass | `/security-review` | One-time security pass on the current branch, run when you ask |
| 3 | On demand, deep scan | **Claude Security plugin** | Multi-agent scan of a repo or diff, independently reviewed findings and patches |
| 4 | On pull request | **Code Review** (Team, Enterprise) | Multi-agent correctness + security review with full codebase context |
| 5 | Managed | **Claude Security** product (Enterprise) | Hosted scanning that monitors connected repositories |
| 6 | In CI | Your existing SAST + SCA | Language-specific rules, supply-chain checks, policy enforcement |

Each layer catches what the one above it missed. None replaces another. Two published versions of this table exist — the guidance-plugin doc omits row 5; the plugin doc includes it. The six-row version above is the fuller one.

---

## 3. Layer 1 — security guidance plugin (in session)

**Install** `[H]`:

```bash
/plugin install security-guidance@claude-plugins-official
```

**What it does.** Makes Claude review its *own* code changes for common vulnerabilities while it works, and fix what it finds in the same session — injection, unsafe deserialization, unsafe DOM APIs — before the code reaches a pull request `[H]`.

**The workflow — three checkpoints at three depths, wired as hooks** `[H]`:

| Hook event | Purpose |
|---|---|
| `SessionStart` | Bootstrap the plugin's Python environment |
| `UserPromptSubmit` | Capture the working-tree baseline the end-of-turn review diffs against |
| `PostToolUse` on `Edit`, `Write`, `NotebookEdit` | Per-edit **string/pattern match** — fast, deterministic |
| `Stop` | **End-of-turn diff review** — a separate security-focused Claude review of everything that changed during the turn (including Bash and subagent changes), run in the background so your reply isn't delayed. Findings re-prompt Claude to fix them |
| `PostToolUse` on `Bash`, filtered to `git commit` / `git push` | **Commit and push review**, background |

**Customization.** Two additive extension points: `claude-security-guidance.md` (Markdown guidance for the model-backed reviews) and `security-patterns.yaml` / `.json` (patterns for the per-edit match). **You can add checks; you cannot disable built-in ones from these files** `[H]`.

**The failure mode that matters: guidance is not enforcement.** The rules are guidance for a reviewer, not deterministic guardrails. The plugin **does not block writes** and does not guarantee every violation is caught; a guidance rule saying to ignore a vulnerability class does *not* suppress those findings. For hard enforcement, pair it with a hook that blocks the edit, or a CI check `[H]`. This is the same enforce-vs-guide line drawn in [claude-code-enterprise-config.md](claude-code-enterprise-config.md) — managed settings enforce, managed `CLAUDE.md` only guides.

**Other gaps to know** `[H]`:
- The commit/push layer fires **only on commits Claude makes through its Bash tool**. Commits you run in your own shell — including the `!` shell escape inside a session — are **not reviewed**.
- Commit and push reviews are capped at **20 per rolling hour**.
- First run creates a venv under `~/.claude/security/` and installs the Claude Agent SDK — needs `pip` and network access. If that fails, or Python is older than 3.10, the commit review falls back to a single-shot review. **On Amazon Bedrock or Google Cloud's Agent Platform the model-backed reviews need the SDK themselves, so they skip** — you keep the per-edit pattern match and lose the reasoning layers.

**Press figure, correctly attributed:** the widely-quoted **30–40% reduction in security-related comments on PRs** belongs to *this* plugin `[M]` — not to the deep-scan plugin in §5. Don't move it.

---

## 4. Layer 2 — `/security-review` (on demand, single pass)

Built into Claude Code — no install, no plan gate, no marketplace. One-time security pass over the current branch, run when you ask `[H]`. The model can also discover and invoke it via the Skill tool `[H]`.

**When to reach for it.** The cheap "did I just do something stupid" check before opening a PR. Single pass, single agent, no report file, no patch flow — it answers in the session and it's gone.

**When it isn't enough.** No independent verification of its own findings, no durable artifact, no revision stamp tying a verdict to a commit. If you need any of those, that's §5.

---

## 5. Layer 3 — Claude Security plugin (on demand, deep scan)

The newest layer, in **beta**. Announced via [@claudeai on X](https://x.com/claudeai/status/2079990597973057691) ~2026-07-21 `[M]` — no dated blog post found. Docs: [code.claude.com/docs/en/claude-security](https://code.claude.com/docs/en/claude-security) `[H]`.

**What it does.** A multi-agent vulnerability scan inside a Claude Code session: a team of agents **maps your architecture, builds a threat model, hunts for vulnerabilities, and independently reviews every finding** before the report is written `[H]`. The managed product describes the same shape as an adversarial verification pass — Claude challenges its own results before surfacing them `[M — product page]`.

**One command, three jobs** `[H]`:

1. **Scan the codebase** — whole repository or a focused area. The plugin reads the repo first and shows each option's file count and **relative cost** before you commit to a run. Answer "I don't know" and it picks a default sized to the repo.
2. **Scan a set of changes** — a branch's diff against its base, an open PR's diff, or a single commit (`scan commit abc1234`). **Only committed changes are scanned** — commit or stash work-in-progress first, or run a full scan, which reads the working tree.
3. **Suggest patches** — pick findings from the report; each patch is drafted **in a scratch copy of your repository**, so source files stay untouched until you apply one yourself.

You can skip the menu: `/claude-security scan my branch`, or plain language. It works best in **auto mode**, so the scan's agents aren't stopped by a permission prompt at every step `[H]`.

**The gate** `[H]`:

- **Claude Code v2.1.154 or later**, on a **paid plan** — the scan orchestrates its agents with [dynamic workflows](https://code.claude.com/docs/en/workflows). On **Pro**, turn them on from the *Dynamic workflows* row in `/config`.
- **Python 3.9.6+** on `PATH` as `python3`. Stdlib only — nothing is installed.
- Linux, macOS, or Windows.
- **Git** — required for change scans and for patching. A full scan works in any directory, with or without version control.

Install, in a session:

```bash
/plugin marketplace add anthropics/claude-plugins-official
```

Then install `claude-security` from the official Anthropic marketplace and activate with `/reload-plugins`. Remove with `claude plugin uninstall claude-security`.

**What you get back.** A **timestamped directory in your repository** `[H]`:

| File | Contents |
|---|---|
| `CLAUDE-SECURITY-RESULTS.md` | The report. Each finding carries an ID (`F1`…), impact, **exploit scenario**, severity, **confidence**, recommendation |
| `CLAUDE-SECURITY-RESULTS.jsonl` | Same findings, one JSON object per line — the machine-readable path into your tracker |
| `CLAUDE-SECURITY-REVISION-<commit>.json` | Revision stamp: which commit was scanned, at what effort, whether uncommitted changes were in the scanned tree, how thoroughly the run was verified. Outside version control it stamps `UNVERSIONED` |

That directory is the **only** change a scan makes to your checkout, and it ships **its own `.gitignore`**, so a stray `git add` can't sweep a report into a commit. To keep a report in history as an audit trail, delete that one `.gitignore` and commit the directory `[H]`.

The revision stamp is the quietly important part: a report is always **tied to the code it describes**. When you later ask for patches, findings whose code has since changed are skipped with a note, and the plugin offers a fresh scan rather than patching from a stale report `[H]`.

**Cost posture.** "May take a while, may use a significant number of tokens" is Anthropic's own wording `[H]`, and Claude Code has to stay open for the run to finish. Budget it as a campaign, not a command.

---

## 6. Layer 4 — Code Review, and `/code-review ultra` (on pull request)

**Code Review** is the PR-time layer: automated multi-agent reviews that catch logic errors, security vulnerabilities, and regressions using analysis of your **full codebase**, posted as inline PR comments `[H]`.

**The workflow** `[H]`: an Owner enables it for the org → GitHub App installation flow → per-repository **Review Behavior** dropdown sets when reviews run (PR open, every push, or manual only). Commenting `@claude review` starts a review in any mode; unlike automatic triggers, **manual triggers run on draft PRs**. Reviews read your repo's `CLAUDE.md` and treat newly-introduced violations as nit-level findings — bidirectionally, so a PR that makes a `CLAUDE.md` statement outdated gets flagged too. Tune via `CLAUDE.md` and `REVIEW.md` (e.g. capping nit volume).

**The gates — read these before planning around it** `[H]`:

| Gate | Detail |
|---|---|
| Status | **Research preview** |
| Plans | **Team and Enterprise** only |
| Cost | **~$15–25 per review**, scaling with PR size, codebase complexity, and how many issues need verification |
| Billing | Charged through **usage credits** — **does not** count against your plan's included usage |
| **ZDR** | **Not available** to organizations with Zero Data Retention enabled |

On other plans, and under ZDR, you can still review a diff locally with the `/code-review` command in any session `[H]`.

**`/code-review ultra` (ultrareview)** is the deeper sub-mode, also a **research preview** `[H]`. It launches a fleet of reviewer agents in a **remote sandbox** on Claude Code on the web infrastructure. Default scope: your current branch against the default branch, **plus uncommitted and staged changes**; pass a base branch (`/code-review ultra develop`) to compare against something else. `--fix` applies findings to your working tree when they return. Where available, `/ultrareview` is an alias.

Ultrareview's own gates `[H]`:

| Plan | Included free runs | After that |
|---|---|---|
| Pro | 3 | Billed as usage credits |
| Max | 3 | Billed as usage credits |
| Team, Enterprise | **none** | Billed as usage credits |

It requires claude.ai authentication and usage credits turned on (Claude Code blocks the launch otherwise), and is **not available on Amazon Bedrock, Google Cloud's Agent Platform, or Microsoft Foundry, or to organizations with ZDR** — in those cases `/code-review ultra` silently runs a local review instead `[H]`.

**The governance read.** Two of the strongest layers — Code Review and ultrareview — are **off the table under ZDR**, and ultrareview is off the table on all three hyperscaler routes. If your deployment posture is ZDR-on or Bedrock/Vertex/Foundry-only, your realistic stack is layers 1, 2, 3 and 6. Decide that deliberately rather than discovering it at rollout. See [governance-overlay.md](governance-overlay.md) for the ZDR scope itself.

---

## 7. Layer 5 — Claude Security (the managed product)

Public beta since 2026-04-30, for Claude **Enterprise** `[H]`. Hosted scanning that monitors connected repositories — no session to keep open, no developer who has to remember to run it.

**Setup, in order** `[H]`:

1. **Enable Extra Usage** in Organization Billing — the product uses **consumption billing**. Set a spend limit that matches expected usage; a separate limit can be set for the feature after enabling.
2. **Verify the Anthropic GitHub App** is installed on your GitHub org and granted access to the repositories you want scanned.
3. **Confirm premium seats** — each user running scans needs an active **premium** seat. **Standard seats do not include Claude Code on the Web**, which is where the scan UI lives.
4. **Enable the feature** in the admin console at `claude.ai/admin-settings/claude-security`.

**Running a scan** `[H]`: `claude.ai/security` (or the Security icon in the sidebar) → select a repository → optionally scope to a **directory or branch** → start. Findings come back with vulnerability type, severity, affected file and line, and a description; scan history lives in the same place.

**Two operational notes worth planning around** `[H]`: a scan may take **several minutes to several hours** depending on repository size, and Anthropic explicitly recommends **scoping large repositories to a directory to increase the success rate**. Treat whole-monorepo scanning as unproven rather than assumed.

---

## 8. Layer 6 — your own CI scanners

Keep them. Claude reasons about *your* code; it does not replace language-specific rule packs, dependency/supply-chain scanning, or policy enforcement `[H]`. The layers above are additive to SAST/SCA, not a migration path off them. Treat any plan that retires CI scanning because "Claude reviews it now" as a finding in its own right.

---

## 9. Adjacent — different axis, often confused

Two more things get filed under "Claude security" that are not code-scanning layers:

**Runtime containment (Claude Code).** The sandboxed Bash tool (`/sandbox`) gives filesystem and network isolation; the working-directory boundary limits writes to the start folder and its children; `denyRead` rules restrict read-only Bash reach when sandboxing is on; Accept Edits mode auto-approves a fixed set of filesystem commands `[H]`. This constrains *what the agent can do*, not *what the code contains* — a different question from every layer above. Full treatment: [agentic-threat-model.md](agentic-threat-model.md) and [claude-code-enterprise-config.md](claude-code-enterprise-config.md).

**Usage governance (Compliance API + partners).** Programmatic access to Claude Enterprise conversation content and activity events, wired into 60+ DLP / SIEM / eDiscovery / identity platforms `[H]`. It governs *how people use Claude*, and scans no code at all. Full treatment: [usage-compliance-monitoring.md](usage-compliance-monitoring.md) and [legal-hold-ediscovery-runbook.md](legal-hold-ediscovery-runbook.md).

---

## 10. Choosing — what to turn on

| If you are… | Turn on | Skip for now |
|---|---|---|
| A solo dev or small team on Pro/Max | Guidance plugin (free) + `/security-review`. Add the Claude Security plugin for pre-release sweeps; you get 3 free ultrareview runs | Code Review (Team/Enterprise only), managed product |
| A Team/Enterprise eng org, ZDR **off** | Guidance plugin everywhere + Code Review as the PR gate + the deep-scan plugin for risky branches and inherited code | Managed product until repo coverage, not developer prompting, is the gap |
| Team/Enterprise with **ZDR on**, or Bedrock/Vertex/Foundry-only | Guidance plugin (pattern layer at minimum) + `/security-review` + the deep-scan plugin + your CI | Code Review and ultrareview — **not available to you** |
| An Enterprise security org wanting coverage you don't have to prompt for | Managed Claude Security product, scoped per-directory, with a spend limit | Assuming it replaces the in-session layers — it doesn't catch anything before commit |
| Auditing an inherited or acquired codebase | Deep-scan plugin (full scan) or the managed product on the connected repo | PR-time layers — there are no PRs yet |

**Ordering heuristic.** Turn on the cheapest layer that catches the bug earliest, then add layers outward until the marginal find stops justifying the marginal spend. Layer 1 is free and catches the most volume; layer 4 is the only one that runs whether the author remembered or not; layer 5 is the only one that runs without a developer at all.

---

## 11. Gates in one table

| Layer | Status | Plan | Billing | ZDR? | Hyperscaler? |
|---|---|---|---|---|---|
| 1 · Guidance plugin | GA | All Claude Code users | Included | Works | Model-backed reviews **skip** on Bedrock / GCP Agent Platform; pattern match still runs |
| 2 · `/security-review` | GA | All | Included | Works | Works |
| 3 · Claude Security plugin | **Beta** | **Paid plan** (v2.1.154+) | Plan usage; scans can be token-heavy | Not stated — verify | Not stated — verify |
| 4 · Code Review | **Research preview** | **Team, Enterprise** | **Usage credits, ~$15–25/review** | **Unavailable** | — |
| 4b · Ultrareview | **Research preview** | Pro/Max: 3 free, then credits; Team/Ent: credits | Usage credits | **Unavailable** | **Unavailable** on Bedrock, GCP Agent Platform, Foundry |
| 5 · Managed product | Public beta | **Enterprise**, premium seats | **Consumption (Extra Usage)** | Not stated — verify | — |
| 6 · Your CI | — | — | Yours | — | — |

Cells marked *verify* are not asserted in the docs reviewed on 2026-07-23; confirm with Anthropic before designing around them.

---

## 12. Failure modes across the stack

- **Cost is real and un-fixed at three layers.** Deep scans "may use a significant number of tokens"; Code Review averages **$15–25 a review**; the managed product bills consumption. Route the spend question to [token-budget-governance.md](token-budget-governance.md) and set limits before enabling, not after the first invoice.
- **Guidance ≠ enforcement.** Layer 1 never blocks a write. If you need a hard stop, that's a hook or a CI gate — see [hooks-starter-pack.md](hooks-starter-pack.md).
- **Your own commits are invisible to layer 1.** Commits made in your shell, or via `!`, skip the commit review entirely.
- **ZDR removes two layers.** Code Review and ultrareview are both unavailable with ZDR on. Discover this at design time.
- **Hyperscaler routes are thinner.** Bedrock / GCP Agent Platform lose layer 1's model-backed reviews; Bedrock / GCP / Foundry lose ultrareview.
- **Session-bound tools don't scale to coverage.** Layers 1–3 need a developer in a session. Only layers 4–6 run without one.
- **Beta and research-preview status is load-bearing.** Three of six layers are pre-GA. Feature, pricing, and availability may change; don't build a compliance control on a research preview.
- **Patch review is still yours.** Patches are drafted for you to review and apply. An LLM-authored security fix is a change to security-critical code — same review a human's would get. See [agentic-threat-model.md](agentic-threat-model.md).
- **Findings are a new sensitive artifact.** A `CLAUDE-SECURITY-RESULTS.md` is a list of live, exploitable weaknesses in your product with exploit scenarios attached. The default `.gitignore` protects you; the moment someone deletes it "for the audit trail," that file inherits your repo's access model. Decide that deliberately.
- **Don't move the 30–40% figure.** It belongs to the guidance plugin (§3), not the deep-scan plugin (§5). No published precision/recall exists for the deep-scan plugin.

---

## 13. What this artifact does *not* assert

No claim here about BAA coverage, data residency, or retention for any layer, and no ZDR claim beyond the two explicit availability exclusions the docs state. Those are per-surface and per-plan, and this repo's rule is to quote the source table rather than infer. See [governance-overlay.md](governance-overlay.md) and [enterprise-data-boundaries.html](enterprise-data-boundaries.html).

For the org-config layer — whether developers may install plugins at all, from which marketplaces — see [claude-code-enterprise-config.md](claude-code-enterprise-config.md). A plugin that spawns agent fleets against your source tree is a supply-chain and spend decision as much as a security one.

---

## Sources

Grades: `[H]` primary (Anthropic docs/blog) · `[M]` reputable secondary · `[?]` uncertain.

- `[H]` [Scan your codebase for vulnerabilities — Claude Security plugin](https://code.claude.com/docs/en/claude-security) — §5, §2.
- `[H]` [Catch security issues as Claude writes code — security guidance plugin](https://code.claude.com/docs/en/security-guidance) — §3.
- `[H]` [Code Review](https://code.claude.com/docs/en/code-review) — §6 (research preview, Team/Enterprise, $15–25, usage credits, ZDR exclusion, triggers, `CLAUDE.md`/`REVIEW.md`).
- `[H]` [Find bugs with ultrareview](https://code.claude.com/docs/en/ultrareview) — §6 (free-run table, scope, provider and ZDR exclusions).
- `[H]` [Claude Code security](https://code.claude.com/docs/en/security) and [Configure the sandboxed Bash tool](https://code.claude.com/docs/en/sandboxing) — §9.
- `[H]` [Getting started with Claude Security](https://claude.com/resources/tutorials/getting-started-with-claude-security) — §7 setup and scan flow.
- `[H]` [Claude Security is now in public beta](https://claude.com/blog/claude-security-public-beta) — 2026-04-30, Enterprise, Opus 4.7.
- `[H]` [Claude now works with more security and compliance tools](https://claude.com/blog/compliance-api-security-partners) — 2026-05-21, updated to 60+ partners.
- `[M]` [Claude Security product page](https://claude.com/product/claude-security) — adversarial verification, data-flow tracing (vendor copy).
- `[M]` [@claudeai — plugin available in beta](https://x.com/claudeai/status/2079990597973057691) — the beta announcement; date inferred, no dated blog post located.
- `[M]` [SecurityWeek](https://www.securityweek.com/anthropic-releases-new-claude-sandbox-security-guidance-plugin/) and [Help Net Security](https://www.helpnetsecurity.com/2026/05/27/anthropic-claude-code-security-guidance-plugin/) — the *guidance* plugin, 2026-05-26/27, and the 30–40% figure.

---

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.
