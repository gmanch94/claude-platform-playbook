# Claude Code Hooks Starter Pack

> 10 team-grade hook templates for Claude Code. Each framed by **when-to-use / failure-mode / owner / hook body** before the body itself. Pinned to the current Claude Code surface (Opus 4.7 / Sonnet 4.6 / Haiku 4.5, hooks GA as of 2026-05).

---

## Why this pack exists

The [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) names three Phase 1 hooks (`block-secrets`, `run-linter`, `log-cost`) but stops there. The same guide names "Hooks enforce destructive-op blocking" and "Audit log: all tool calls in headless mode" as Phase 3 governance requirements without showing the hook body. Most teams either (a) ship with only the 3 starter hooks and discover gaps in incident review, or (b) attempt 12 hooks at once and end up with a brittle pre-tool layer that throttles the agent.

This pack closes the gap with a curated set of 10 hooks — the 3 from the adoption guide, fleshed out with decision context and richer bodies, plus 7 more that address governance, cost, and audit failure modes named elsewhere in the playbook. Each is decision-framed first: **before** copy-pasting a hook, an engineering lead should be able to say *whether their team needs it* and *what it costs to keep running*.

**Failure mode this pack prevents:** "we have 14 hooks and the agent feels broken." Hooks compound — each one is a silent veto on the agent's loop. Teams that ship hooks without a per-hook decision frame end up with brittle pre-tool layers nobody owns. The structure here forces a written owner per hook.

---

## How to use this pack

1. **Don't ship all 10 on day 1.** Ship the Phase 1 set (1, 2, 3), prove value, then graduate hooks 4–6 as governance asks land. Hooks 7–10 are situational.
2. **Replace placeholders.** `<TEAM>`, `<COST_THRESHOLD>`, `<PROTECTED_BRANCHES>`, `<AUDIT_BUCKET>` etc. are placeholders, not literal config. The structure is portable; the values are team-specific.
3. **Each hook needs a named owner.** A hook with no owner gets disabled the first time it false-positives at 2am. The owner is the person who will fix it within 24h, not "the team."
4. **Hooks are silent vetoes.** Test the failure path — what happens when the hook returns non-zero? Does the engineer get a useful error? Log every block reason.
5. **Cross-link to evals.** Hook bodies that depend on prompt or model output (e.g., `pii-scrub-prompt`) should themselves be evaluated — see the `refusal-calibration` and `adversarial` evals in [`eval-starter-pack.md`](eval-starter-pack.md).

---

## Hook event surface (quick reference)

| Event | Fires when | Best for |
|---|---|---|
| `PreToolUse` | Before any tool call | Block destructive ops, gate writes, scrub args |
| `PostToolUse` | After a tool call succeeds | Lint, format, audit log, cost tracking |
| `UserPromptSubmit` | User submits a prompt | PII scrub, prompt-injection sanitize, context-load |
| `SessionStart` | Session begins | Load `CLAUDE.md`, warn on stale branch, set env |
| `Stop` | Session ends | Cost log, eval trigger, commit-msg gen |
| `SubagentStop` | Sub-agent ends | Per-sub-agent cost attribution |
| `PreCompact` | Before compaction | Persist in-flight artifacts |
| `Notification` | Agent notifies user | Slack/email bridge, on-call paging |

Verify event surface at [docs.claude.com/en/docs/claude-code/hooks](https://docs.claude.com/en/docs/claude-code/hooks).

---

## The 10 hooks

### 1. `block-secrets` — PreToolUse / Bash + Read

**When-to-use:** Always. This is non-optional for any team with credentials, API tokens, or `.env` files anywhere on engineer machines. Ship in Phase 1 (week 1).

**Failure mode without it:** Agent reads `.env.production` while debugging an env var, then quotes the contents in chat — token now in conversation transcript, possibly in logs, possibly in a future training corpus if no-train terms ever lapse. One incident permanently damages trust.

**Failure mode of the hook itself:** Over-broad path patterns block legitimate work (e.g., blocking *all* files matching `*key*` blocks `keymap.ts`). False-positive rate must be measured — log every block, review weekly for the first month.

**Owner archetype:** Security engineering lead. Reviews the path/pattern list quarterly and after every "why did Claude just block me" Slack thread.

**Hook body:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Read",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/block-secrets.sh" }
        ]
      }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
# .claude/hooks/block-secrets.sh
set -euo pipefail
INPUT=$(cat)
# Extract command/file_path from JSON stdin
TARGET=$(echo "$INPUT" | jq -r '.tool_input.command // .tool_input.file_path // ""')

# Tune for your team — these are starting patterns, not exhaustive
BLOCKED_PATTERNS=(
  "\.env(\.|$)"
  "\.env\.production"
  "credentials\.(json|yaml|yml)"
  "id_rsa($|\.pub$)"
  "\.aws/credentials"
  "\.kube/config"
  "service-account.*\.json"
)

for pat in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$TARGET" | grep -Eq "$pat"; then
    echo "BLOCKED by block-secrets: pattern '$pat' matched in '$TARGET'" >&2
    echo "If this is a false positive, ping #<TEAM>-claude-hooks." >&2
    # Append to audit log for review
    echo "$(date -u +%FT%TZ) BLOCKED $pat $TARGET" >> .claude/audit/blocked-secrets.log
    exit 2
  fi
done
exit 0
```

---

### 2. `run-linter` — PostToolUse / Edit + Write

**When-to-use:** Any team with an enforced lint/format standard. If your CI fails on lint, your local agent should too — otherwise the agent ships PRs that get bounced 30 minutes later.

**Failure mode without it:** Agent generates code that's locally valid but CI-broken. PR loop wastes 15+ min per round-trip. Engineers stop trusting agent output and start hand-editing every change.

**Failure mode of the hook itself:** Slow linters (eslint on a large repo) make every Edit feel like 4-second latency. If linter takes > 2s, scope it to changed files only or move to pre-commit instead.

**Owner archetype:** Whoever owns the team's linter config (usually a senior engineer or platform lead).

**Hook body:**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/run-linter.sh" }
        ]
      }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
# .claude/hooks/run-linter.sh — auto-format changed files only
set -euo pipefail
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

[ -z "$FILE" ] && exit 0
[ ! -f "$FILE" ] && exit 0

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx) npx --no-install prettier --write "$FILE" 2>/dev/null || true ;;
  *.py)                  ruff format "$FILE" 2>/dev/null || true ;;
  *.go)                  gofmt -w "$FILE" 2>/dev/null || true ;;
  *.rs)                  rustfmt "$FILE" 2>/dev/null || true ;;
  *.tf)                  terraform fmt "$FILE" 2>/dev/null || true ;;
esac
exit 0
```

Note: this hook *formats* — it doesn't block. Blocking on lint errors creates a bad UX; format-then-let-CI-block is the right balance.

---

### 3. `log-cost` — Stop

**When-to-use:** Always once you have > 5 active Claude Code users. Without this you cannot answer "what does Claude Code cost us per engineer per month" and finance will block expansion.

**Failure mode without it:** Per-engineer cost is invisible. Quarterly bill arrives, finance asks for a breakdown by team, you have nothing. Renewal at risk.

**Failure mode of the hook itself:** Dropped events on session crash — log appends should be `>>` not `>`. Don't write to a network mount; write local then sync nightly.

**Owner archetype:** Engineering ops or platform lead. Owns the dashboard that consumes the CSV.

**Hook body:**

```json
{
  "hooks": {
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

```bash
#!/usr/bin/env bash
# .claude/hooks/log-cost.sh — append session cost row to team CSV
set -euo pipefail
INPUT=$(cat)
COST=$(echo "$INPUT" | jq -r '.session.total_cost_usd // 0')
TOKENS_IN=$(echo "$INPUT" | jq -r '.session.input_tokens // 0')
TOKENS_OUT=$(echo "$INPUT" | jq -r '.session.output_tokens // 0')
DURATION=$(echo "$INPUT" | jq -r '.session.duration_seconds // 0')
USER="${USER:-unknown}"
REPO=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || echo unknown)")

LOG="${CLAUDE_COST_LOG:-$HOME/.claude/cost.csv}"
mkdir -p "$(dirname "$LOG")"
[ ! -f "$LOG" ] && echo "ts,user,repo,cost_usd,in,out,duration_s" > "$LOG"
echo "$(date -u +%FT%TZ),$USER,$REPO,$COST,$TOKENS_IN,$TOKENS_OUT,$DURATION" >> "$LOG"
exit 0
```

---

### 4. `pii-scrub-prompt` — UserPromptSubmit

**When-to-use:** Regulated workloads (healthcare, finance, education, EU consumer data). Skip if your team only edits open-source or non-PII code — the false-positive cost outweighs the benefit.

**Failure mode without it:** Engineer pastes a prod log line that contains a customer email or SSN into the prompt while debugging. Now PII is in the conversation, possibly in agent context windows for the rest of the session, possibly in logs your team retains.

**Failure mode of the hook itself:** Regex-based scrubbing has both false positives (blocks legitimate test data) and false negatives (misses obfuscated PII). Treat as defense-in-depth, not as a complete control. Pair with policy + training.

**Owner archetype:** Privacy engineering or compliance partner. Tunes patterns to match the org's PII taxonomy.

**Hook body:**

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": ".claude/hooks/pii-scrub.sh" }
        ]
      }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
# .claude/hooks/pii-scrub.sh — redact obvious PII patterns from prompt
# Returns the (possibly modified) prompt on stdout. Exit 0 = pass through, 2 = block.
set -euo pipefail
INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // ""')

# Patterns are starting points — extend per org's PII taxonomy
SCRUBBED=$(echo "$PROMPT" \
  | sed -E 's/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/<EMAIL>/g' \
  | sed -E 's/\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b/<SSN>/g' \
  | sed -E 's/\b(4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\b/<CC>/g' \
  | sed -E 's/\b\+?[0-9]{1,2}[ .-]?\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-]?[0-9]{4}\b/<PHONE>/g')

if [ "$SCRUBBED" != "$PROMPT" ]; then
  echo "$(date -u +%FT%TZ) SCRUBBED ${USER:-unknown}" >> .claude/audit/pii-scrubs.log
  # Emit modified prompt back to Claude Code (per hook contract)
  echo "$INPUT" | jq --arg p "$SCRUBBED" '.prompt = $p'
else
  echo "$INPUT"
fi
exit 0
```

Verify the exact UserPromptSubmit hook contract for prompt rewriting at [docs.claude.com/en/docs/claude-code/hooks](https://docs.claude.com/en/docs/claude-code/hooks) — the field name and rewrite mechanism is the contract that drifts most.

---

### 5. `branch-guard` — PreToolUse / Bash + Edit + Write

**When-to-use:** Any team with protected branches (`main`, `release/*`, `prod`). High value for teams running Claude Code in headless / CI mode where the agent could push directly.

**Failure mode without it:** Agent commits and pushes to `main` because it inferred the branch from git output. Reverting a Claude commit on main has the same cost as reverting any human commit — but the trust hit is bigger because "the AI did it" amplifies the political fallout.

**Failure mode of the hook itself:** Over-broad blocks (denying all writes when on `main` even for docs) train engineers to disable the hook. Scope to `git push` and to write operations on lock files / CI configs.

**Owner archetype:** Release management or platform engineering. Owns the protected-branch list.

**Hook body:**

```bash
#!/usr/bin/env bash
# .claude/hooks/branch-guard.sh
set -euo pipefail
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

PROTECTED='^(main|master|release/.*|prod|production)$'

if echo "$BRANCH" | grep -Eq "$PROTECTED"; then
  # Block any push, force-push, or rebase on protected branches
  if echo "$COMMAND" | grep -Eq "git +(push|reset --hard|rebase|commit --amend)"; then
    echo "BLOCKED: '$COMMAND' on protected branch '$BRANCH'" >&2
    echo "Create a feature branch first: git checkout -b <feature>" >&2
    exit 2
  fi
fi
exit 0
```

---

### 6. `dependency-license-check` — PreToolUse / Edit + Write

**When-to-use:** Teams with a license whitelist (most enterprise teams: MIT/Apache/BSD only, no GPL/AGPL). Skip if you have no license policy or you're on a permissive open-source project.

**Failure mode without it:** Agent adds `some-package` (AGPL) to `package.json` because it was the first search result. Legal review catches it 3 weeks later in pre-release scan; now you have to rip it out and re-test, and the engineer who "just wanted Claude to fix the bug" gets blamed.

**Failure mode of the hook itself:** License metadata is unreliable for many ecosystems (npm packages with no license field, Python packages whose declared license differs from actual). Hook should warn loudly on unknown, not just block-or-pass.

**Owner archetype:** Open-source program office (OSPO) or legal partner. Owns the allow-list.

**Hook body:**

```bash
#!/usr/bin/env bash
# .claude/hooks/dep-license.sh — guard package.json / pyproject.toml / go.mod additions
set -euo pipefail
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

case "$FILE" in
  */package.json|*/requirements*.txt|*/pyproject.toml|*/go.mod|*/Cargo.toml) ;;
  *) exit 0 ;;
esac

# Diff staged content against HEAD; for any new dep, query a license oracle
# Implementation depends on org's license-tooling (FOSSA, Snyk, Black Duck, license-checker)
NEW_DEPS=$(git diff --cached "$FILE" 2>/dev/null | grep -E '^\+' | grep -v '^+++' || true)

if [ -n "$NEW_DEPS" ]; then
  echo "WARN: dependency change detected in $FILE — running license check..." >&2
  # Plug in your org's tool here. Example with license-checker for npm:
  # npx license-checker --production --excludePackages "$EXISTING" --failOn 'GPL;AGPL' || exit 2
  # For now, log + warn:
  echo "$(date -u +%FT%TZ) DEP_CHANGE $FILE" >> .claude/audit/dep-changes.log
  echo "Action required: have OSPO review before merge." >&2
fi
exit 0
```

This hook ships as warn-only by default. Switch to blocking once your license oracle is wired up — never block before then.

---

### 7. `audit-log-append` — PostToolUse (all matchers)

**When-to-use:** Regulated workloads, headless / CI mode, or any team needing tool-call evidence for SOC 2 / HIPAA audits. The [`governance-overlay.md`](governance-overlay.md) names "audit trail patterns" as a core control — this is the hook that makes that control real.

**Failure mode without it:** "Show me everything Claude did in this repo last quarter" has no answer. During an audit, you cannot prove negative controls (e.g., "Claude never read the prod database directly").

**Failure mode of the hook itself:** Naive append to local file is unreviewable evidence — anyone can edit it. Real audit needs append-only storage (S3 with object-lock, or a write-only logging endpoint). Local file is acceptable for pilot, not for compliance sign-off.

**Owner archetype:** Compliance engineering or security. Owns the audit storage and the retention policy.

**Hook body:**

```bash
#!/usr/bin/env bash
# .claude/hooks/audit-log.sh — append every tool call to an audit log
set -euo pipefail
INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""')
ARGS=$(echo "$INPUT" | jq -c '.tool_input // {}')
RESULT_OK=$(echo "$INPUT" | jq -r '.tool_response.success // true')

LINE=$(jq -nc \
  --arg ts "$(date -u +%FT%TZ)" \
  --arg user "${USER:-unknown}" \
  --arg session "${CLAUDE_SESSION_ID:-unknown}" \
  --arg tool "$TOOL" \
  --arg ok "$RESULT_OK" \
  --argjson args "$ARGS" \
  '{ts:$ts,user:$user,session:$session,tool:$tool,ok:$ok,args:$args}')

# Local write — replace with append-only storage for compliance use
echo "$LINE" >> "$HOME/.claude/audit/$(date -u +%Y-%m-%d).jsonl"

# Optional: sync to <AUDIT_BUCKET> via aws s3 cp / gsutil cp on Stop
exit 0
```

For compliance-grade audit, redirect to a write-only endpoint with object-lock retention. Local-file mode is for pilot only.

---

### 8. `commit-msg-conventional` — Stop

**When-to-use:** Teams using Conventional Commits, semantic-release, or any commit-message convention enforced in CI. Skip if your team has no commit format standard.

**Failure mode without it:** Agent generates `Updated stuff` commits. Semantic-release skips them, changelog generation breaks, version bumps don't fire. PR-merge automation that depends on commit format silently degrades.

**Failure mode of the hook itself:** Generates plausible-but-wrong type tags (`feat:` for what's actually a `fix:`). The hook is a starting point; the engineer must still review.

**Owner archetype:** Release engineering. Owns the convention spec.

**Hook body:**

```bash
#!/usr/bin/env bash
# .claude/hooks/commit-msg-suggest.sh — suggest a conventional commit message at session end
# Reads the diff, prints a suggested message to stderr (visible to user, doesn't auto-commit)
set -euo pipefail
DIFF=$(git diff --cached --stat 2>/dev/null || true)
[ -z "$DIFF" ] && exit 0

# Heuristic — replace with a structured prompt to Haiku 4.5 for richer suggestion
TYPE="chore"
echo "$DIFF" | grep -q "test" && TYPE="test"
echo "$DIFF" | grep -q "fix\|bug"    && TYPE="fix"
echo "$DIFF" | grep -q "feat\|add"   && TYPE="feat"
echo "$DIFF" | grep -q "docs\|README"  && TYPE="docs"

SCOPE=$(echo "$DIFF" | awk 'NR==1 {print $1}' | xargs dirname 2>/dev/null | head -1)

echo "" >&2
echo "Suggested commit message (review before using):" >&2
echo "  $TYPE($SCOPE): <one-line summary>" >&2
echo "" >&2
exit 0
```

For richer suggestions, swap the heuristic for a structured Haiku 4.5 call against the diff — but keep the hook advisory-only, never auto-commit.

---

### 9. `session-context-loader` — SessionStart

**When-to-use:** Any team with a `CLAUDE.md` whose freshness matters (i.e., most). Especially valuable when engineers context-switch between repos.

**Failure mode without it:** Engineer starts a session on a repo they haven't touched in 6 weeks. `CLAUDE.md` references frameworks the team has since migrated off. Agent follows stale guidance, generates code that doesn't compile against current deps. 30 min wasted before someone catches it.

**Failure mode of the hook itself:** Aggressive freshness checks ("CLAUDE.md is 3 days old") create alert fatigue. Tune the staleness threshold to the repo's pace — weekly for fast-moving repos, monthly for stable ones.

**Owner archetype:** Whoever owns `CLAUDE.md` for the repo (usually team lead).

**Hook body:**

```bash
#!/usr/bin/env bash
# .claude/hooks/session-context.sh — warn on stale CLAUDE.md and uncommitted state
set -euo pipefail
CLAUDE_MD="CLAUDE.md"
STALE_DAYS="${CLAUDE_MD_STALE_DAYS:-30}"

if [ -f "$CLAUDE_MD" ]; then
  AGE_DAYS=$(( ($(date +%s) - $(date -r "$CLAUDE_MD" +%s)) / 86400 ))
  if [ "$AGE_DAYS" -gt "$STALE_DAYS" ]; then
    echo "⚠ CLAUDE.md is ${AGE_DAYS} days old (threshold: ${STALE_DAYS}). Worth a refresh pass?" >&2
  fi
fi

# Warn on uncommitted changes left from a prior session
DIRTY=$(git status --porcelain 2>/dev/null | wc -l | xargs)
if [ "$DIRTY" -gt 0 ]; then
  echo "ℹ ${DIRTY} uncommitted file(s) from prior session — review with 'git status' before starting new work." >&2
fi
exit 0
```

This hook is informational only (writes to stderr, never blocks). Keep it that way — a SessionStart hook that fails breaks every session start, not just one.

---

### 10. `eval-trigger` — Stop (conditional)

**When-to-use:** Teams that have shipped at least 2 of the [`eval-starter-pack.md`](eval-starter-pack.md) eval categories. Without evals, this hook has nothing to fire and just adds noise.

**Failure mode without it:** Engineer modifies a Skill prompt body, ships the change, and the regression eval doesn't run until the next nightly. By then the change is in 3 PRs and rolling back is expensive. Hook-driven eval triggering shrinks the feedback loop from hours to minutes.

**Failure mode of the hook itself:** Triggers eval on every Stop and floods the eval runner. Scope to changes in `.claude/skills/`, `.claude/commands/`, or known prompt files only.

**Owner archetype:** ML / platform lead who owns the eval suite.

**Hook body:**

```bash
#!/usr/bin/env bash
# .claude/hooks/eval-trigger.sh — fire regression evals when prompts/skills change
set -euo pipefail

# Only trigger when prompt-bearing files changed in this session
CHANGED=$(git diff --name-only HEAD 2>/dev/null || true)
if echo "$CHANGED" | grep -Eq '^\.claude/(skills|commands)/|^prompts/|^evals/'; then
  echo "Detected prompt/skill change — triggering regression eval suite..." >&2
  # Replace with your eval runner. Examples:
  #   make eval-regression
  #   uv run python -m evals.run --suite regression --batch
  # The Batch API path keeps eval cost ~50% of interactive — see eval-starter-pack.md
  ./scripts/run-evals.sh regression || {
    echo "⚠ Regression eval failed — review before merging." >&2
    exit 0  # advisory, not blocking — see eval-starter-pack.md blocking matrix
  }
fi
exit 0
```

This hook should fire evals via the **Batch API** for cost (50% of interactive rates) and via the **Code execution tool** if your evals run as Python. See [`eval-starter-pack.md`](eval-starter-pack.md) "Where to run evals" matrix.

---

## Phase rollout — which hooks, when

| Phase | Hooks to ship | Why |
|---|---|---|
| **Phase 1** (week 1, pilot) | 1, 2, 3 | Safety + quality + visibility. Non-negotiable. |
| **Phase 2** (week 5, guardrails) | 4 (if regulated), 5, 7 | Privacy + branch protection + audit foundation. |
| **Phase 3** (week 9, scale) | 6, 8, 9 | License governance + commit hygiene + session ergonomics. |
| **Phase 4** (post-eval-suite) | 10 | Only after eval pack is in place. |

This sequencing matches the 90-day arc in [`adoption-playbook.md`](adoption-playbook.md). Don't ship Phase 4 hooks before the prerequisites — they break in confusing ways.

---

## Blocking vs advisory — the same principle as evals

A hook is either **blocking** (exit 2 stops the agent) or **advisory** (exit 0, message to stderr). Mismatched choices erode trust:

| Hook | Default mode | Why |
|---|---|---|
| `block-secrets` | Blocking | Cost of a leak >> cost of false positive |
| `branch-guard` | Blocking | Same — irreversible damage on main |
| `pii-scrub-prompt` | Advisory (rewrites, doesn't block) | False positives common; rewrite-and-warn keeps flow |
| `dependency-license-check` | Advisory until oracle wired | Blocking on bad metadata trains people to bypass |
| `run-linter` | Advisory (formats, never blocks) | Lint errors belong in CI, not in the agent loop |
| `audit-log-append` | Advisory (never blocks) | Audit logging that breaks sessions is worse than no audit logging |
| `log-cost`, `commit-msg-conventional`, `session-context-loader`, `eval-trigger` | Advisory | All informational by design |

Default to advisory unless the failure mode is irreversible. The matrix above mirrors the blocking-vs-advisory discipline in [`eval-starter-pack.md`](eval-starter-pack.md).

---

## What this pack does NOT include

- **Hooks for specific MCP servers** — those belong with the MCP server pack. See [`mcp-starter-pack.md`](mcp-starter-pack.md) for the read-only-by-design server templates; MCP-server-specific guards (e.g., "block writes to the production Snowflake MCP") are out of scope here because the MCP pack ships read-only servers without write paths to guard.
- **Hooks that depend on org-specific tooling** (Snyk, FOSSA, Vault) — the `dep-license` and `audit-log` hooks reference these as plug-points, not as ship-ready integrations.
- **PreCompact and SubagentStop hooks** — useful for niche cases (artifact persistence, sub-agent cost attribution) but rare enough that templating them adds noise. Add as your team identifies the failure mode.
- **Notification routing hooks** — Slack/email/PagerDuty integration is org-specific enough that a template harms more than helps.

If your team needs any of the above, the structure here (when-to-use / failure-mode / owner / body) is portable — fork the file and add your own.

---

## Companion artifacts

- [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) — Phase 1 names hooks 1–3; this pack is the deeper version.
- [`claude-code-starter-skills.md`](claude-code-starter-skills.md) — Skills and hooks compose: a Skill says *what* to do, a hook says *what to never do*.
- [`eval-starter-pack.md`](eval-starter-pack.md) — Hook 10 (`eval-trigger`) only earns its keep once eval pack is in place.
- [`mcp-starter-pack.md`](mcp-starter-pack.md) — Hooks defend the agent's loop; MCP servers extend its reach. The `block-secrets` and `pii-scrub-prompt` hooks complement the redaction logic in MCP servers 1–6 — defense in depth.
- [`governance-overlay.md`](governance-overlay.md) — names audit trail and prompt-versioning patterns; hooks 7 and 9 are how those land in practice.
- [`feature-decision-matrix.html`](feature-decision-matrix.html) — when each Claude feature is right; this pack is the operational layer underneath.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify hook event surface at docs.claude.com/en/docs/claude-code/hooks.`
