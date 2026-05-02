# Claude Code Adoption Guide — engineering team rollout

**As of 2026-05.** Pin to current model surface (Opus 4.7 / Sonnet 4.6 / Haiku 4.5). See [`../docs/feature-inventory.md`](../docs/feature-inventory.md) for canonical Claude Code surface inventory.

For engineering managers and platform leads rolling out **Claude Code** (the CLI/IDE harness) across a team. This is a tactical companion to [`adoption-playbook.md`](adoption-playbook.md) — that doc covers business adoption; this one covers the engineering surface.

---

## What Claude Code is, in one paragraph

A CLI tool (also runnable in VS Code / JetBrains / desktop / web) that runs an agentic loop in a developer's repo. It has built-in tools (file edit, bash, grep, web fetch, git, sub-agents) and extensible surfaces (slash commands, hooks, Skills, MCP servers, plugins). Default model is Sonnet 4.6; escalate to Opus 4.7 for hard problems; Haiku 4.5 for triage. Settings hierarchy is user → project → local (each shadows the previous). Headless mode runs the same loop in CI.

---

## Phase 0 — Pre-rollout (1 week)

### Decide before anyone installs

| Decision | Default | When to deviate |
|---|---|---|
| **Procurement** | Direct API or per-seat plan via `console.anthropic.com` | Bedrock / Vertex when the org demands it. Note: model lag possible. |
| **Default model** | Sonnet 4.6 | Use Haiku 4.5 default for cost-sensitive teams; rare. |
| **Permission posture** | `acceptEdits` mode in safe sandboxes; `default` for production-adjacent repos | Never `bypassPermissions` (--dangerously-skip-permissions) outside a throwaway container. |
| **Hooks-first or skills-first** | Hooks for safety (block destructive ops); Skills for repeatability | If team has zero shared conventions, start with Skills. |
| **Plugin distribution** | One team plugin, source-controlled in a dedicated repo | Multiple plugins only after 2–3 teams adopt. |
| **MCP servers** | One per system worth automating (issue tracker, internal docs, secrets-aware DB read-only) | Wait on MCP until a real reach-out is needed. Don't pre-build. |
| **Headless / CI usage** | Optional, after Phase 2 | Skip for week 1. |

### Risks to surface in the kickoff

- **Secrets exfiltration** — agent has bash + file read. Hooks must block reads of `.env*` / credential paths.
- **Production reach** — in default mode the agent can `git push`, run migrations, hit prod APIs. Sandbox or restrict.
- **License / IP exposure** — agent fetches web content. Decide what's allowed.
- **Cost surprise** — long agentic sessions w/ Opus can spike. Set per-engineer budget alerts.
- **Skill / plugin sprawl** — left unchecked, every engineer ships their own duplicate Skill within a month.

---

## Phase 1 — Pilot (weeks 1–2): 3–5 engineers, one repo

### Install

```bash
npm install -g @anthropic-ai/claude-code   # or yarn / pnpm equivalent
claude  # first run — auth + setup
```

Add VS Code or JetBrains extension if the team uses an IDE.

### Minimum viable team config

In the pilot repo, add `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(git diff:*)",
      "Bash(git status:*)",
      "Bash(npm test:*)",
      "Bash(pytest:*)",
      "WebFetch(domain:docs.claude.com)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(git commit:*)",
      "Bash(rm:*)"
    ],
    "deny": [
      "Read(./.env*)",
      "Read(**/credentials*)",
      "Bash(rm -rf:*)"
    ]
  },
  "model": "claude-sonnet-4-6"
}
```

This single file is the most important Phase 1 artifact. Source-control it. Add `.claude/settings.local.json` to `.gitignore`.

### First 3 hooks worth adding

In `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/block-secrets.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/run-linter.sh" }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": ".claude/hooks/log-cost.sh" }
        ]
      }
    ]
  }
}
```

| Hook | Purpose |
|---|---|
| `PreToolUse / Bash → block-secrets.sh` | Inspect command for credential paths, env reads. Exit non-zero to block. |
| `PostToolUse / Edit\|Write → run-linter.sh` | Auto-format / lint changed files. Cheap quality gate. |
| `Stop → log-cost.sh` | Append session cost + duration to a team CSV for cost dashboards. |

> See [`hooks-starter-pack.md`](hooks-starter-pack.md) for richer bodies of these three plus 7 more (PII scrub, branch guard, dependency license, audit log, commit-msg, session-context, eval-trigger), each with when-to-use / failure-mode / owner before the body. Don't ship more than these 3 in Phase 1 — graduate the rest as governance asks land in Phase 2 and 3.

### Pilot success signals (end of week 2)

- Engineers complete real tasks with Claude Code in normal workflow (PR merges with `Generated with Claude Code` badge are fine, not required)
- No secrets-exfil incidents
- At least one shared Skill or slash command emerged from real use
- Per-engineer monthly cost projection within team budget envelope

---

## Phase 2 — Plugin shape (weeks 3–6): codify what's working

### When to start a team plugin

After 2 weeks of pilot. Triggers:
- 2+ engineers want the same slash command
- A Skill is referenced verbally as "the team's X playbook"
- A hook proves valuable in pilot — graduate to plugin distribution

### What goes in the plugin

```
team-plugin/
├── plugin.json                  # name, version, description
├── commands/
│   ├── review.md                # /review — your team's PR review style
│   ├── migrate.md               # /migrate — DB migration dance
│   └── ship-it.md               # /ship-it — your release dance
├── skills/
│   ├── repo-conventions/SKILL.md   # naming, layout, where things live
│   ├── testing/SKILL.md            # test framework + patterns
│   └── language-patterns/SKILL.md  # idiomatic foo for your stack
├── hooks/
│   └── (the three from Phase 1, packaged)
└── mcp-servers/
    └── internal-docs/            # MCP server config for internal wiki/docs
```

For a starter set of 8 team-grade Skill templates (PR review, test generation, migration guard, bug triage, doc refresh, release notes, on-call investigation, refactor scout) — each framed by when-to-use / failure-mode / owner before the prompt body — see [`claude-code-starter-skills.md`](claude-code-starter-skills.md). Pick 2–3 to seed Phase 2; do not ship all eight at once.

Source-control in a dedicated repo. Tag releases. Engineers install:

```bash
claude plugins add github.com/<your-org>/<team-plugin>
```

### Skill design rules (worth being firm about)

1. **One responsibility per Skill** — "testing" or "deployment", not "engineering".
2. **Trigger logic in description** — Claude Code uses the description to decide when to load. Vague descriptions = poor triggering.
3. **Reference, don't duplicate** — link to source code or existing docs rather than re-stating what's already in the repo.
4. **Versioned with the plugin** — Skill changes go through PR review + eval (yes, eval — see Phase 3).
5. **Owner per Skill** — name in metadata. Without an owner, Skills rot.

### MCP servers worth wiring early

| System | Why | Risk |
|---|---|---|
| Issue tracker (Jira / Linear / GitHub Issues) | Agent reads tickets, comments PRs | Read-only first; comment posting later |
| Internal docs / wiki | Agent answers "what's our convention for X?" | None if read-only |
| CI logs | Agent investigates flaky tests | Read-only |
| Secrets-aware DB **read-only** replica | Agent investigates data shapes | Replica only — never primary |

Hold off on MCP servers that **mutate** state until governance is comfortable (Phase 3+).

> See [`mcp-starter-pack.md`](mcp-starter-pack.md) for decision-framed config bodies of these four plus three more (observability, API catalog, code search). Each server framed by when-to-use / failure-mode / owner / scope, with explicit read-only design and Phase 4 deferral for mutate variants.

### Sub-agents (Task tool)

Use sub-agents when:
- The work has 3+ independent searches or investigations
- Main agent is at risk of context bloat from raw output
- Reviewing PR changes across many files

Don't use sub-agents for:
- Single-file edits (overhead wins)
- Sequentially-dependent steps (sub-agents can't share intermediate state cheaply)

---

## Phase 3 — Scale + governance (weeks 7+)

### Eval — yes, for prompts and Skills too

Just like the API patterns, prompts and Skills regress silently. Set up a regression suite:
- 20–80 representative tasks (extract bug, refactor function, write test, review PR, run migration dry-run)
- Expected behaviors codified (touched files, commands run, outcome shape)
- Runs in CI on plugin changes
- Anthropic-hosted Code execution tool can run the eval suite cheaply if you don't want to host the runner

Without eval: a Skill change that breaks 30% of cases ships unnoticed and erodes trust in the tooling.

For the 8-category eval scaffolding (regression, format compliance, tool-call accuracy, grounding, adversarial, cost-per-task, latency, refusal calibration) — each framed by what it catches / failure-mode / owner — see [`eval-starter-pack.md`](eval-starter-pack.md). Skills in this pack should pass the regression + format-compliance evals before promotion past pilot.

### Cost controls

- Per-engineer monthly dashboard (use the `Stop` hook from Phase 1)
- Alert at 80% of cap; hard limit at 100%
- Encourage Sonnet default; require justification for sustained Opus use
- Encourage `/clear` between unrelated tasks (resets context, regrows cache)

### Headless mode in CI

Once engineers trust the loop, headless mode opens new doors:

| Workflow | Pattern |
|---|---|
| Nightly review of open PRs | Cron → `claude --headless` w/ a review prompt → comment via MCP |
| Refactor sweep | Schedule across many repos via Agent SDK orchestration + headless Claude Code per repo |
| Bug triage | Issue created → headless agent reproduces, drafts root cause, attaches to issue |
| Doc freshness | Walk repo, find stale doc references, propose patches |

For headless mode:
- Service account, not a personal token
- Restricted permissions in headless `.claude/settings.json` — narrower than interactive
- All tool calls audited
- Cost cap per run

### Background tasks / scheduled routines

For recurring work (weekly sweep, on-cadence reports), use scheduled tasks rather than letting an engineer remember to run it. Useful patterns:
- Stale-flag cleanup (find feature flags whose graduation date passed; open removal PRs)
- Dependency bump audit
- Test flakiness report
- Documentation drift report

### Governance pass

| Control | Where |
|---|---|
| Settings.json source-controlled | Repo |
| Hooks enforce destructive-op blocking | Plugin |
| Audit log: all tool calls in headless mode | Plugin's Stop hook + central log |
| Plugin changes require eval pass | CI |
| Quarterly review of allow/deny lists | Platform team |
| Quarterly model surface refresh | Platform team — bumps model version, runs eval, ships if green |

---

## Common adoption mistakes

| # | Mistake | Symptom | Fix |
|---|---------|---------|-----|
| 1 | **No settings.json baseline** | Every engineer's setup differs; some leak secrets | Phase 1 deliverable. Source-controlled. |
| 2 | **`bypassPermissions` everywhere** | Auto-accept mode catches a footgun | Bypass only in throwaway containers; default mode otherwise |
| 3 | **Skills as essays** | Long, vague Skills don't trigger reliably | One responsibility, sharp description, link don't duplicate |
| 4 | **MCP for everything immediately** | 7 half-built MCP servers, none documented | Wait for real reach-out demand; ship one well |
| 5 | **No eval on prompts/skills** | Quality regresses silently in month 3 | Phase 3 — invest now, save later |
| 6 | **Per-engineer plugins** | 5 engineers, 5 plugins, 0 reuse | One team plugin, source-controlled, owned |
| 7 | **Hidden Opus usage** | Cost spike nobody understands | Default to Sonnet; require justification + `/cost` reviews |
| 8 | **Headless without governance** | Agent runs unattended w/ broad perms | Service account, narrow perms, audit log, cost cap |

---

## What "good" looks like at month 6

- Every engineer's repo has `.claude/settings.json` source-controlled
- One team plugin, versioned, evalled, ~10 commands + ~5 Skills + 3–5 hooks + 2–3 MCP servers
- Per-engineer cost in budget; reviewed monthly
- Headless mode running ≥ 1 scheduled routine in CI (e.g., nightly PR review)
- Sub-agents used for parallel investigation tasks
- Skill ownership and quarterly review cadence in place
- New engineer onboards by installing the plugin; productive day 1

---

## Companion artifacts

- [`claude-code-starter-skills.md`](claude-code-starter-skills.md) — 8 team-grade Skill templates with when-to-use / failure-mode / owner framing
- [`hooks-starter-pack.md`](hooks-starter-pack.md) — 10 hook templates extending the 3 named here (PII scrub, branch guard, audit log, license check, etc.)
- [`mcp-starter-pack.md`](mcp-starter-pack.md) — 7 read-only MCP server templates extending the 4 named in Phase 2 (observability, API catalog, code search). Each gated by read-only scope.
- [`eval-starter-pack.md`](eval-starter-pack.md) — 8 evaluation templates (regression, format, tool-call, grounding, adversarial, cost, latency, refusal)
- [`adoption-playbook.md`](adoption-playbook.md) — business + transformation lens (Claude broadly, not just Claude Code)
- [`feature-decision-matrix.html`](feature-decision-matrix.html) — code-automation row maps directly here
- [`reference-architectures.html`](reference-architectures.html) — Pattern 5 is the architecture diagram for this guide
- [`governance-overlay.md`](governance-overlay.md) — audit trail, retention, IP — applies to Claude Code use too
- [`../docs/feature-inventory.md`](../docs/feature-inventory.md) — Claude Code surface canonical list

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify Claude Code surface at docs.claude.com/en/docs/claude-code.`
