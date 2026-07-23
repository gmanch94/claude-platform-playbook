# The Claude Security plugin for Claude Code

**What it is:** an on-demand, multi-agent vulnerability scanner that runs *inside* a Claude Code session, writes a reviewed findings report to your repo, and turns findings you pick into patches you apply yourself.

**Status:** public **beta**. Announced via [@claudeai on X](https://x.com/claudeai/status/2079990597973057691) ~2026-07-21 `[M]` â€” no dated blog post found. Docs live and verified 2026-07-23: [code.claude.com/docs/en/claude-security](https://code.claude.com/docs/en/claude-security) `[H]`.

Visual companion: [claude-security-plugin-stack.html](claude-security-plugin-stack.html) â€” where this sits in the six-layer stack.

---

## 1. First: which "Claude security" thing is this?

Four differently-named things shipped in five months. Mixing them up is the main way this gets mis-budgeted.

| Thing | What it actually is | When | Who gets it |
|---|---|---|---|
| **Claude Security plugin** (this writeup) | Claude Code plugin. `/claude-security`. On-demand **deep scan** of a repo or diff â†’ reviewed report â†’ optional patches. Beta. | ~2026-07-21 `[M]` | Claude Code, **paid plan** `[H]` |
| Security **guidance** plugin | Different plugin. Real-time pattern match as Claude *writes* code (~25 dangerous constructs: `eval()`, `os.system()`, pickle, DOM injection). Free. | 2026-05-26 `[M]` | All Claude Code users `[M]` |
| **Claude Security** (the product) | Managed, hosted service that monitors *connected repositories*. Public beta, ran on Opus 4.7 at launch. | 2026-04-30 `[H]` | Claude **Enterprise** `[H]` |
| **Compliance API** + security partners | Not code scanning at all. DLP/SIEM/eDiscovery governance of Claude *usage*. 28 partners at launch, now 60+. | 2026-05-21 `[H]` | Enterprise + Platform `[H]` |

Same word, four price points and four buyers. The plugin in this writeup is the developer-workflow one â€” it does not replace the managed product, and the managed product does not replace it.

---

## 2. What it does

The plugin adds **one command**, `/claude-security`, which opens a menu of **three jobs** `[H]`:

1. **Scan the codebase** â€” whole repository, or a focused area. The plugin reads the repo first and shows each option's file count and **relative cost** before you commit to a run. Answer "I don't know" and it picks a default sized to the repo.
2. **Scan a set of changes** â€” a branch's diff against its base, an open PR's diff, or a single commit (`scan commit abc1234`). **Only committed changes are scanned** â€” commit or stash work-in-progress first, or run a full scan, which reads the working tree.
3. **Suggest patches** â€” pick findings from the report; each patch is drafted **in a scratch copy of your repository**, so source files stay untouched until you apply one yourself.

Under the hood it is a multi-agent run, not a linter: a team of agents **maps the architecture, builds a threat model, hunts for vulnerabilities, and independently reviews every finding** before the report is written `[H]`. The managed product describes the same shape as an adversarial verification pass â€” Claude challenges its own results before surfacing them `[M â€” product page]`.

You can skip the menu: `/claude-security scan my branch`, or plain language. It works best in **auto mode**, so the scan's agents aren't stopped by a permission prompt at every step `[H]`.

---

## 3. The gate â€” read this before promising anyone a scan

Exact requirements `[H]`:

- **Claude Code v2.1.154 or later**, on a **paid plan** â€” the scan orchestrates its agents with [dynamic workflows](https://code.claude.com/docs/en/workflows). On **Pro**, turn them on from the *Dynamic workflows* row in `/config`.
- **Python 3.9.6+** on `PATH` as `python3`. The plugin's tooling uses only the standard library, so nothing is installed.
- Linux, macOS, or Windows.
- **Git** â€” required for change scans and for patching. Those two jobs don't support other version control systems. A full scan works in any directory, with or without version control.

Install, in a session:

```bash
/plugin marketplace add anthropics/claude-plugins-official
```

Then install `claude-security` from the official Anthropic marketplace and activate it in the current session:

```bash
/reload-plugins
```

Remove it with `claude plugin uninstall claude-security`.

---

## 4. What you get back

Results land in a **timestamped directory in your repository** `[H]`:

| File | Contents |
|---|---|
| `CLAUDE-SECURITY-RESULTS.md` | The report. Each finding carries an ID (`F1`â€¦), impact, **exploit scenario**, severity, **confidence**, recommendation |
| `CLAUDE-SECURITY-RESULTS.jsonl` | Same findings, one JSON object per line â€” the machine-readable path into your tracker |
| `CLAUDE-SECURITY-REVISION-<commit>.json` | Revision stamp: which commit was scanned, at what effort, whether uncommitted changes were in the scanned tree, how thoroughly the run was verified. Outside version control it stamps `UNVERSIONED` |

That directory is the **only** change a scan makes to your checkout, and it ships **its own `.gitignore`**, so a stray `git add` can't sweep a report into a commit. Want the report in history as an audit trail? Delete that one `.gitignore` and commit the directory `[H]`.

The revision stamp is the quietly important part: a report is always **tied to the code it describes**. When you later ask for patches, findings whose code has since changed are skipped with a note, and the plugin offers a fresh scan rather than patching from a stale report `[H]`.

---

## 5. Where it fits

Anthropic's own framing puts it as the **on-demand deep-scan layer** in a defense-in-depth stack `[H]`:

| Stage | Tool | What it covers |
|---|---|---|
| In session | Security **guidance** plugin | Common vulnerabilities in code Claude writes, fixed in the same session |
| On demand, single pass | `/security-review` | One-time security pass on the current branch |
| **On demand, deep scan** | **Claude Security plugin** | **Multi-agent scan of a repo or diff, independently reviewed findings and patches** |
| On pull request | Code Review (Team, Enterprise) | Multi-agent correctness + security review with full codebase context |
| Managed | Claude Security product (Enterprise) | Hosted scanning that monitors connected repositories |
| In CI | Your existing SAST + dependency scanners | Language-specific rules, supply-chain checks, policy enforcement |

Reach for it when: pre-merge on a risky branch; before a release; onboarding an inherited or acquired codebase; after an audit finding, to sweep for the same class elsewhere. Don't reach for it as your per-commit gate â€” that's the guidance plugin and CI. And don't retire your SAST/SCA: the plugin reasons about *your* code, not your dependency graph or your policy rules.

---

## 6. Failure modes to name up front

Every recommendation in this repo names its downside. Here are this one's:

- **Cost is real and un-fixed.** "May take a while, may use a significant number of tokens" is Anthropic's own wording `[H]`. Multi-agent + adversarial review means many model calls. Budget it as a *campaign*, not a command. Route the spend question to [token-budget-governance.md](token-budget-governance.md).
- **Session-bound.** Claude Code has to stay open for the run to finish `[H]`. This is a developer-workstation tool, not a nightly job. If you want unattended, monitored scanning, that's the managed product or CI.
- **Committed-only for the useful jobs.** Change scans and patches read committed code. Uncommitted work is invisible to them.
- **Git-only for two of three jobs.** No SVN/Perforce path for change scans or patching.
- **It's beta.** No published precision/recall numbers for *this* plugin. The 30â€“40% reduction in security comments on PRs that gets quoted around belongs to the **guidance** plugin `[M]`, not this one. Don't put that number in a business case for this.
- **Patch review is still yours.** Patches land for you to review and apply. An LLM-authored security fix is a change to security-critical code â€” it gets the same review a human's would. See [agentic-threat-model.md](agentic-threat-model.md).
- **Findings are a new sensitive artifact.** A `CLAUDE-SECURITY-RESULTS.md` is a list of live, exploitable weaknesses in your product with exploit scenarios attached. The default `.gitignore` protects you; the moment someone deletes it "for the audit trail," that file inherits your repo's access model. Decide that deliberately.

---

## 7. What this writeup does *not* assert

No claim here about BAA coverage, ZDR, data residency, or retention for the plugin or its scan traffic. Those are per-surface and per-plan, and this repo's rule is to quote the source table rather than infer. See [governance-overlay.md](governance-overlay.md) and [enterprise-data-boundaries.md](enterprise-data-boundaries.html).

For the org-config layer â€” whether developers may install plugins at all, from which marketplaces â€” see [claude-code-enterprise-config.md](claude-code-enterprise-config.md). A plugin that spawns agent fleets against your source tree is a supply-chain and spend decision as much as a security one.

---

## Sources

Grades: `[H]` primary (Anthropic docs/blog) Â· `[M]` reputable secondary Â· `[?]` uncertain.

- `[H]` [Scan your codebase for vulnerabilities â€” Claude Security plugin docs](https://code.claude.com/docs/en/claude-security) â€” fetched 2026-07-23. Source for Â§2, Â§3, Â§4, Â§5.
- `[H]` [Claude Security is now in public beta](https://claude.com/blog/claude-security-public-beta) â€” 2026-04-30. Managed product, Enterprise, Opus 4.7.
- `[H]` [Claude now works with more security and compliance tools](https://claude.com/blog/compliance-api-security-partners) â€” 2026-05-21, updated to 60+ partners.
- `[M]` [Claude Security product page](https://claude.com/product/claude-security) â€” adversarial verification, data-flow tracing (vendor copy).
- `[M]` [@claudeai â€” plugin available in beta](https://x.com/claudeai/status/2079990597973057691) â€” the beta announcement; date inferred, no dated blog post located.
- `[M]` [SecurityWeek â€” Anthropic releases Claude sandbox, security guidance plugin](https://www.securityweek.com/anthropic-releases-new-claude-sandbox-security-guidance-plugin/) and [Help Net Security](https://www.helpnetsecurity.com/2026/05/27/anthropic-claude-code-security-guidance-plugin/) â€” the *guidance* plugin, 2026-05-26/27, and the 30â€“40% figure.

---

Â© gmanch94 Â· CC-BY-4.0 Â· As of 2026-07. Verify pricing/models at anthropic.com.
