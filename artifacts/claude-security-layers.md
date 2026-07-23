# Claude security layers — which one do you actually turn on?

Anthropic ships **five** distinct code-security layers; a sixth — your own CI scanners — sits under them and isn't going away. Two further controls get called "Claude security" in the same breath and are a different axis entirely. The five differ by plan, billing model, what they scan, which repo hosts they reach, and whether they work at all under Zero Data Retention. This artifact is the chooser.

Visual companion: [claude-security-workflows.html](claude-security-workflows.html) — the stack at a glance plus one workflow diagram per layer.

**Sourcing:** every mechanic `[H]` against `code.claude.com` docs, live-fetched **2026-07-23**. Dates and press figures graded inline.

---

## 1. First: four things called "Claude security"

Four differently-named offerings shipped in under three months. Mixing them up is the main way this gets mis-budgeted.

| Thing | What it actually is | When | Who gets it |
|---|---|---|---|
| **Claude Security plugin** | Claude Code plugin. `/claude-security`. On-demand **deep scan** of a repo or diff → reviewed report → optional patches. Beta `[H]`. | ~2026-07-21 `[M]` | Claude Code, **paid plan** `[H]` |
| Security **guidance** plugin | Different plugin. Reviews Claude's own edits **as it writes**, three checkpoints, fixes in-session. Free to install; the model-backed layers spend plan usage. | 2026-05-26/27 `[?]` | All Claude Code users `[H]` |
| **Claude Security** (the product) | Managed, hosted service that scans **connected repositories** from `claude.ai/security`. **GitHub.com only.** Public beta, ran on Opus 4.7 at launch. | 2026-04-30 `[H]` | Claude **Enterprise**, premium seats `[H]` |
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
| 4 | On pull request | **Code Review** (Team, Enterprise) · **`/code-review ultra`** (all paid plans) | Multi-agent correctness + security review with full codebase context |
| 5 | Managed | **Claude Security** product (Enterprise, GitHub.com) | Hosted scanning that monitors connected repositories |
| 6 | In CI | Your existing SAST + SCA — **yours, not Anthropic's** | Language-specific rules, supply-chain checks, policy enforcement |

Each layer catches what the one above it missed. None replaces another. Two published versions of this table exist — the guidance-plugin doc omits row 5; the plugin doc includes it. The six-row version above is the fuller one.

**Row 4 holds two products with different gates.** Code Review is Team/Enterprise; `/code-review ultra` runs on any paid plan. Read the row as one stage, not one purchase — §6 splits them.

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

**It is free to install, not free to run** `[H]`. The per-edit pattern check "makes no model call and adds no cost." The end-of-turn and commit reviews "each spend additional model usage that counts toward your usage like any other Claude request" — both default to **Opus 4.7**, and the commit review is agentic, so it may take several model turns per commit. Budget roughly one review call per file-changing turn plus one deeper review per commit, inside the caps below. Cheap relative to the other layers, but not zero, and this is the layer you deploy to every developer.

**Other gaps to know** `[H]`:
- The commit/push layer fires **only on commits Claude makes through its Bash tool**. Commits you run in your own shell — including the `!` shell escape inside a session — are **not reviewed**.
- Commit and push reviews are capped at **20 per rolling hour**. The end-of-turn review covers **up to 30 changed files per turn** and fires **at most three times in a row** before yielding back to you — a large turn is silently under-reviewed.
- **A developer can switch it off with one environment variable.** Built-in checks can't be removed individually, but each layer can be disabled independently: `ENABLE_PATTERN_RULES=0`, `ENABLE_STOP_REVIEW=0`, `ENABLE_COMMIT_REVIEW=0`, `ENABLE_CODE_SECURITY_REVIEW=0` (all model-backed reviews at once), or `SECURITY_GUIDANCE_DISABLE=1` to disable the plugin entirely without uninstalling. If you are mandating this layer org-wide, the enforcement point is managed settings (`enabledPlugins`), not the plugin — see [claude-code-enterprise-config.md](claude-code-enterprise-config.md).
- First run creates a venv under `~/.claude/security/` and installs the Claude Agent SDK — needs `pip` and network access. If that fails, or Python is older than 3.10, the commit review falls back to a single-shot review. **On Amazon Bedrock or Google Cloud's Agent Platform the model-backed reviews need the SDK themselves, so they skip** — you keep the per-edit pattern match and lose the reasoning layers. The model-backed reviews also skip outside a git repository, and when the session has no Anthropic authentication and no third-party provider configured.

**Press figure, correctly attributed:** the widely-quoted **30–40% reduction in security-related comments on PRs** belongs to *this* plugin `[M]` — not to the deep-scan plugin in §5. Don't move it.

---

## 4. Layer 2 — `/security-review` (on demand, single pass)

Built into Claude Code — no install, no plan gate, no marketplace. One-time security pass over the current branch, run when you ask `[H]`. The model can also discover and invoke it via the Skill tool `[H]`.

**When to reach for it.** The cheap "did I just do something stupid" check before opening a PR. Single pass, single agent, no report file, no patch flow — it answers in the session and it's gone.

**When it isn't enough.** No *independent* verifier agents, no durable artifact, no revision stamp tying a verdict to a commit. (It does verify its own findings before reporting `[H]` — self-verification, not a second opinion.) If you need any of those, that's §5.

---

## 5. Layer 3 — Claude Security plugin (on demand, deep scan)

The newest layer, in **beta**. Announced via [@claudeai on X](https://x.com/claudeai/status/2079990597973057691) ~2026-07-21 `[M]` — no dated blog post found. Docs: [code.claude.com/docs/en/claude-security](https://code.claude.com/docs/en/claude-security) `[H]`.

**What it does.** A multi-agent vulnerability scan inside a Claude Code session: a team of agents **maps your architecture, builds a threat model, hunts for vulnerabilities, and independently reviews every finding** before the report is written — "findings only appear in the report after independent verifier agents analyze them" `[H]`. The managed product describes the same shape as an adversarial verification pass — Claude challenges its own results before surfacing them `[M — product page]`.

**It runs locally, and it reaches where layer 5 can't.** The plugin runs in your session and each scan counts against your plan's usage limits. Crucially, it "reaches code the managed product can't reach, such as repositories hosted on **GitLab or Bitbucket**, or on **networks that don't allow inbound connections**" `[H]`. If you are not on GitHub.com, this layer — not the managed product in §7 — is your deep-scan option.

**Scans are nondeterministic** `[H]`. "Two scans of the same code can surface different findings." Anthropic's own guidance is to run scans regularly and use the revision stamps to attribute each report to the code and settings it covered. A single clean scan is not a certificate; treat this as sampling, not proof, when you are tempted to use it as a compliance control.

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
/plugin install claude-security@claude-plugins-official
```

Then activate with `/reload-plugins`. If Claude Code reports the marketplace isn't found, run `/plugin marketplace add anthropics/claude-plugins-official` first and retry. Remove with `claude plugin uninstall claude-security`.

**One network step, and a reviewer on the patches.** Finding your open pull requests is the only step that reaches the network, and it's offered only when the session already has permission to run the GitHub CLI and `gh` is signed in `[H]`. On the fix side, each patch goes through its own independent reviewer that runs project tests and must vouch that the patch addresses the one finding, introduces no new vulnerability, and leaves behavior otherwise unchanged `[H]` — that raises the floor but does not move the decision: see §12.

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
| Billing | Charged through **usage credits** — **does not** count against your plan's included usage. Cap it at `claude.ai/admin-settings/usage` |
| **ZDR** | **Not available** to organizations with Zero Data Retention enabled |
| Hyperscaler | **No exclusion stated.** The docs note costs "appear on your Anthropic bill regardless of whether your organization uses Amazon Bedrock or Google Cloud's Agent Platform for other Claude Code features" `[H]` — which only parses if Code Review runs for those orgs. Microsoft Foundry is not named either way; verify before planning on it |

On other plans, and under ZDR, you can still review a diff locally with the `/code-review` command in any session `[H]`.

**`/code-review ultra` (ultrareview)** is the deeper sub-mode, also a **research preview** `[H]`. It launches a fleet of reviewer agents in a **remote sandbox** on Claude Code on the web infrastructure. Default scope: your current branch against the default branch, **plus uncommitted and staged changes**; pass a base branch (`/code-review ultra develop`) to compare against something else. `--fix` applies findings to your working tree when they return. Where available, `/ultrareview` is an alias.

**Ultrareview runs on any paid plan** — it is not Team/Enterprise-gated the way Code Review is. Its own gates `[H]`:

| Plan | Included free runs | After that |
|---|---|---|
| Pro | 3 (**one-time allotment per account, does not refresh**) | **~$5–25 per review** in usage credits, by size of change |
| Max | 3 (**one-time, does not refresh**) | ~$5–25 in usage credits |
| Team, Enterprise | **none** | ~$5–25 in usage credits |

Note the two prices are different: **$15–25 is Code Review's** average; **$5–25 is ultrareview's**. The launch dialog shows an estimate before each run. A run counts once the cloud session starts — one you stop early still consumes a free run; a paid run bills only the portion that ran `[H]`.

Usage credits must be turned on before a **paid** run or Claude Code blocks the launch (free runs don't need them). Ultrareview requires claude.ai authentication and is **not available on Amazon Bedrock, Google Cloud's Agent Platform, or Microsoft Foundry, or to organizations with ZDR** — in those cases `/code-review ultra` silently runs a local review instead `[H]`.

**The governance read — the two constraints are not the same.** They remove different things:

| Posture | You lose | You keep |
|---|---|---|
| **ZDR on** | Code Review **and** ultrareview | Layers 1, 2, 3, 6 |
| **Bedrock / Google Cloud's Agent Platform / Foundry only**, ZDR off | Ultrareview only | Layers 1, 2, 3, **4 (Code Review)**, 6 — though layer 1's model-backed reviews skip on Bedrock and GCP |

Conflating them costs you Code Review — the only layer that runs whether the author remembered or not — on the strength of a constraint that doesn't apply. Decide this at design time rather than discovering it at rollout. See [governance-overlay.md](governance-overlay.md) for the ZDR scope itself.

---

## 7. Layer 5 — Claude Security (the managed product)

Public beta since 2026-04-30, for Claude **Enterprise** `[H]`; access for **Team and Max is "coming soon"** `[H]`. Hosted scanning that monitors connected repositories — no session to keep open, no developer who has to remember to run it.

**The hard constraint, first: GitHub.com only.** "Claude Security currently supports repositories hosted on GitHub.com" `[H]`. GitLab, Bitbucket, and self-hosted shops cannot use this layer at all — their deep-scan option is the plugin in §5, which explicitly reaches those hosts. Budget accordingly; this is the exclusion most likely to be discovered after the purchase conversation.

**Setup, in order** `[H]`:

1. **Enable Extra Usage** in Organization Billing — the product uses **consumption billing**. Set a spend limit that matches expected usage; a separate limit can be set for the feature after enabling.
2. **Verify the Anthropic GitHub App** is installed on your GitHub org and granted access to the repositories you want scanned.
3. **Confirm premium seats** — each user running scans needs an active **premium** seat. **Standard seats do not include Claude Code on the Web**, which is where the scan UI lives.
4. **Enable the feature** in the admin console at `claude.ai/admin-settings/claude-security`.

**Running a scan** `[H]`: `claude.ai/security` (or the Security icon in the sidebar) → select a repository → optionally scope to a **directory or branch** → start. Findings come back with vulnerability type, severity, affected file and line, and a description; scan history lives in the same place.

**Scheduled scans are what make this layer worth buying** `[H]`. You can "configure scheduled scans for ongoing coverage without manual kickoffs," and scan effort is selectable per run — **Regular** or **Extended** (use Extended on a first scan or after material changes). Anthropic's own operating advice: pick a cadence tied to something you already do (a Monday triage, a sprint boundary, a pre-release checkpoint) and **give the queue a named owner** — otherwise findings accumulate and the backlog becomes the thing people avoid. Scans can run in parallel, scoped per Project (one per repo, service, or team) so findings stay attributable.

**The operational surface a security team actually buys** `[H]`: findings push to **Slack, Jira, or any ticketing system via webhooks**; results **export as CSV or Markdown** for tracking and audit; and **documented dismissals carry forward**, so a triage decision made once stays visible downstream. That last one is the difference between a scanner and a program.

**Two notes worth planning around** `[H]`: a scan may take **several minutes to several hours** depending on repository size, and Anthropic explicitly recommends **scoping large repositories to a directory to increase the success rate**. Treat whole-monorepo scanning as unproven rather than assumed.

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
| A solo dev or small team on Pro/Max | Guidance plugin + `/security-review`. Add the Claude Security plugin for pre-release sweeps. **`/code-review ultra` is available to you** — 3 free runs, one-time, then ~$5–25 each | Code Review (Team/Enterprise only), managed product |
| A Team/Enterprise eng org, ZDR **off** | Guidance plugin everywhere + Code Review as the PR gate + the deep-scan plugin for risky branches and inherited code | Managed product until repo coverage, not developer prompting, is the gap |
| Team/Enterprise with **ZDR on** | Guidance plugin (pattern layer at minimum) + `/security-review` + the deep-scan plugin (**ZDR availability not stated — confirm before you plan on it**) + your CI | Code Review **and** ultrareview — neither is available to you |
| On **Bedrock / Google Cloud's Agent Platform / Foundry**, ZDR **off** | Guidance plugin (expect the **pattern layer only** on Bedrock and GCP) + `/security-review` + the deep-scan plugin + **Code Review — no exclusion is stated for it** | Ultrareview — unavailable on all three; `/code-review ultra` quietly downgrades to a local review |
| Not on GitHub.com (GitLab, Bitbucket, self-hosted) | The **deep-scan plugin** — it explicitly reaches those hosts and networks with no inbound connections | The managed product — **GitHub.com only**, it cannot scan you |
| An Enterprise security org wanting coverage you don't have to prompt for | Managed Claude Security product on a **scheduled** cadence, scoped per-directory, with a named owner and a spend limit | Assuming it replaces the in-session layers — it doesn't catch anything before commit |
| Auditing an inherited or acquired codebase | Deep-scan plugin (full scan, **Extended** effort if using the managed product) — run it more than once, scans are nondeterministic | PR-time layers — there are no PRs yet |

**Ordering heuristic.** Turn on the cheapest layer that catches the bug earliest, then add layers outward until the marginal find stops justifying the marginal spend. Layer 1 is near-free and catches the most volume; layer 4 is the only one that runs whether the *author* remembered or not; layer 5 is the only one that runs without a developer at all — and once it's on a schedule, it and layer 4 are both unprompted.

---

## 11. Gates in one table

| Layer | Status | Plan | Billing | Repo hosts | ZDR? | Hyperscaler? |
|---|---|---|---|---|---|---|
| 1 · Guidance plugin | GA | All Claude Code users | Free to install; **model-backed reviews spend plan usage** (Opus 4.7) | Any (local) | Not stated — verify | Model-backed reviews **skip** on Bedrock / GCP Agent Platform; pattern match still runs |
| 2 · `/security-review` | GA | All | Plan usage | Any (local) | Not stated — verify | Not stated — verify |
| 3 · Claude Security plugin | **Beta** | **Paid plan** (v2.1.154+) | Plan usage; scans can be token-heavy | **Any** — incl. GitLab, Bitbucket, no-inbound networks | Not stated — verify | Not stated — verify |
| 4 · Code Review | **Research preview** | **Team, Enterprise** | **Usage credits, ~$15–25/review** | GitHub (App); self-hosted via GH Enterprise Server | **Unavailable** | **No exclusion stated** — billing note implies it runs on Bedrock + GCP; Foundry unstated |
| 4b · Ultrareview | **Research preview** | **Any paid plan.** Pro/Max: 3 free one-time, then credits; Team/Ent: credits | **Usage credits, ~$5–25/review** | Local bundle; PR mode needs github.com or GH Enterprise Server | **Unavailable** | **Unavailable** on Bedrock, GCP Agent Platform, Foundry |
| 5 · Managed product | Public beta | **Enterprise**, premium seats (Team/Max "coming soon") | **Consumption (Extra Usage)** | **GitHub.com only** | Not stated — verify | n/a |
| 6 · Your CI | n/a | n/a | Yours | Yours | n/a | n/a |

Legend: cells marked **verify** are not asserted in the docs reviewed on 2026-07-23 — confirm with Anthropic before designing around them, and note that an absent exclusion is not a stated guarantee. **n/a** means the question doesn't apply to that layer (it doesn't route through a model provider you select, or it isn't Anthropic's).

---

## 12. Failure modes across the stack

- **Cost is real, and only two of the four paid layers carry a published number.** Code Review averages **$15–25 a review**; ultrareview **~$5–25**. For layers 3 and 5 **Anthropic publishes no per-scan price** — deep scans "may use a significant number of tokens," the managed product bills consumption. Don't read that silence as cheap. The only bounding controls are (a) the plugin's pre-run file-count and relative-cost estimate, (b) scoping a scan to a directory, (c) an Extra Usage spend limit on the managed product, and (d) the Code Review spend cap at `claude.ai/admin-settings/usage`. Set them before enabling, not after the first invoice. Route the spend question to [token-budget-governance.md](token-budget-governance.md).
- **Layer 1 is free to install, not free to run.** The per-edit pattern match costs nothing; the end-of-turn and commit reviews spend plan usage on Opus 4.7. Small per developer, multiplied by every developer.
- **Guidance ≠ enforcement, and it has an off switch.** Layer 1 never blocks a write, and any developer can disable it — per-layer or entirely — with an environment variable. If you need a hard stop, that's a hook or a CI gate ([hooks-starter-pack.md](hooks-starter-pack.md)); if you need it *on*, that's managed settings, not the plugin.
- **Scans are nondeterministic.** Two runs over the same code can surface different findings. One clean scan is a sample, not a certificate — a real problem if you were planning to cite it as a compliance control.
- **Your own commits are invisible to layer 1.** Commits made in your shell, or via `!`, skip the commit review entirely.
- **ZDR removes two layers.** Code Review and ultrareview are both unavailable with ZDR on. Discover this at design time.
- **Hyperscaler routes are thinner — but not as thin as ZDR.** Bedrock / GCP Agent Platform lose layer 1's model-backed reviews; Bedrock / GCP / Foundry lose ultrareview. **Code Review carries no stated hyperscaler exclusion** — don't drop it by mistakenly treating "hyperscaler-only" and "ZDR-on" as the same posture.
- **Repo host is a hard gate on layer 5.** The managed product is **GitHub.com only**. If you're on GitLab, Bitbucket, or self-hosted, the deep-scan plugin is your option — it's the one that explicitly reaches those.
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
- `[H]` [How Anthropic secures its AI-native SDLC](https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle) — 2026-07-21. `/security-review` verifies its own findings (§4).
- `[M]` [Claude Security product page](https://claude.com/product/claude-security) — adversarial verification, data-flow tracing, scheduled scans, webhook/export/dismissal surface (§7, vendor copy). Its FAQ says the plugin is available "for all Claude Code users," which conflicts with the docs' paid-plan gate; this artifact follows the docs.
- `[M]` [@claudeai — plugin available in beta](https://x.com/claudeai/status/2079990597973057691) — the beta announcement; date inferred, no dated blog post located.
- `[M]` [SecurityWeek](https://www.securityweek.com/anthropic-releases-new-claude-sandbox-security-guidance-plugin/) and [Help Net Security](https://www.helpnetsecurity.com/2026/05/27/anthropic-claude-code-security-guidance-plugin/) — the *guidance* plugin, 2026-05-26/27, and the 30–40% figure.

---

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.
