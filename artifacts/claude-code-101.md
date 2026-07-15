# Claude Code 101 — the practitioner field guide

**You installed Claude Code. This is how to drive it well — and the nuances that separate casual use from fluent use.**

Audience: anyone driving Claude Code hands-on, with it already set up — you can run it in a terminal, the desktop app, your IDE, or on the web, so it needn't feel like a command line at all. You don't have to be a software engineer: analysts, data and ops people, and technical PMs drive it well too. The habits the rest of this guide teaches — brief it, gate it, verify it — matter more than any job title. Not a rollout plan (that's [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md)) and not an admin config (that's [`claude-code-enterprise-config.md`](claude-code-enterprise-config.md)). This is the individual-effectiveness layer: the daily loop, the controls worth knowing, and the tricks that aren't obvious on day one.

**Sourcing:** every behavior below is verified against [docs.claude.com/en/docs/claude-code](https://docs.claude.com/en/docs/claude-code) as of 2026-07-11 `[H]`. Version-pinned specifics (feature X "requires v2.1.N") change fast — the linked docs are canonical; treat this guide as the *judgment layer* over them. Model pricing/tiers are **not** restated here — see [`../docs/feature-inventory.md`](../docs/feature-inventory.md), the repo's single source of truth.

---

## 0. The one mental model

Claude Code runs an **edit → verify loop** against your real files and shell. Each session starts with a **fresh context window** — it remembers nothing from last time except what you wrote to disk (`CLAUDE.md`, auto-memory) or what you deliberately bring back with `/resume` or `-c`. You direct; it proposes and acts under a permission gate; **you own what ships.** Everything below is either (a) how to steer that loop, or (b) how to keep the context window working for you instead of against you.

The single most common newcomer failure: treating it like a chatbot ("do the thing") instead of a junior engineer you brief, gate, and verify. The controls exist so you can loosen or tighten that gate per task.

**Work like a distinguished engineer** — optimistic the task is doable, skeptical that it's done. Six habits; the rest of this guide is the tooling that makes them cheap:

- **Plan → solve → verify.** For anything non-trivial, get the plan first (plan mode), make the smallest change, then *verify by running it* — never accept "done", "fixed", or "passing" without exercising the path. A failure you can see beats a green claim you can't.
- **Respond, don't react.** Read the whole request; let Claude understand the existing code before it edits (assume it's there for a reason); when a real ambiguity changes the outcome, ask one sharp question instead of guessing. Match effort to stakes with `/effort`.
- **Mandate an adversarial review.** Before you ship non-trivial work, get a second set of eyes that's *trying to break it* — `/code-review`, `/security-review`, or a subagent told to **refute** the change (not bless it). Never merge on your own confidence alone.
- **Ground it; don't let it guess.** Hallucination climbs when the model answers from memory or a stale context instead of the source. Feed it the real thing — `@`-mention the file, paste the error, point it at the doc — and ask it to cite where a claim comes from. Push wide reads or research into a subagent so the main thread gets a distilled, grounded result (a second subagent can cross-check it). When it can't verify something, it should say so, not invent it.
- **Stay token-frugal.** A bloated context costs on every turn and dulls the output. The habits that move the bill live under *Cost discipline* below — run them.
- **Calibrate confidence.** Separate what you verified from what you assumed, and say which. Treat a fix as a hypothesis until proven — "still broken" can mean the fix was a no-op, not that the cause moved. Name the failure mode of any non-trivial move.

Drop this posture into your own `CLAUDE.md` so every session runs it; the org-wide version lives in [`claude-code-enterprise-config.md`](claude-code-enterprise-config.md).

---

## The architecture behind the loop — where your prompt actually goes

§0 is the mental model; this is its physical counterpart — the same edit → verify loop drawn as the systems it runs on. The one line that governs everything else: **only what you send across the prompt boundary leaves your machine.**

```
  CLIENT SURFACE — you drive one of these
  ├─ CLI (terminal)
  ├─ Desktop app (Mac / Windows)
  ├─ IDE extension (VS Code / JetBrains)
  └─ Web — claude.ai/code (runs in Anthropic's cloud, not on your machine)
        │
        ▼
═══ YOUR MACHINE · customer trust zone — stays local ══════════════════════
  The agent loop (edit → verify) runs here, under your gate:
  ├─ Permission gate + sandbox    — deny beats allow; enforced locally
  ├─ Context: CLAUDE.md · auto-memory · .claude/ config
  ├─ Hooks — your scripts on lifecycle events; PreToolUse can block a call
  ├─ Local tools: file read/write · shell · git
  └─ MCP client ──▶ local (stdio) servers          — inside the boundary
        │
        │   request = prompt + tool results + @file context you chose to send
        ▼
━━━ prompt trust boundary · TLS — only what you send crosses ━━━━━━━━━━━━━━━
        │
        ▼
═══ ANTHROPIC · what your prompt reaches ══════════════════════════════════
  no-train by default (≠ no-store) — retention / BAA / ZDR: see governance
  ├─ Auth + routing fork — which credential answers, and who is billed:
  │  ├─ subscription login (OAuth) ──────▶ plan message limits
  │  ├─ Console API key ─────────────────▶ per-token API spend
  │  │     └ a stray ANTHROPIC_API_KEY overrides your subscription silently
  │  └─ hyperscaler env vars ────────────▶ parallel path (below)
  ├─ Messages / inference API
  │     └─▶ models: Opus 4.8 · Sonnet 5 · Haiku 4.5 · Fable 5
  ├─ Server-side prompt cache — steady-state cost drops on a stable context
  └─ Console + auth: usage · billing · workspaces + spend caps [E]
                     · managed-settings delivery [E]       [E] = Enterprise

═══ PARALLEL MODEL HOSTING · hyperscaler ══════════════════════════════════
  Bypasses api.anthropic.com AND Anthropic Console billing entirely:
  └─ Bedrock (AWS) · Vertex (GCP) · Foundry (Azure)
        inference runs in the provider's region · the provider bills you

═══ OTHER SYSTEMS THE CLIENT TOUCHES · non-Anthropic ══════════════════════
  Which side executes each is not asserted here:
  ├─ remote MCP servers   (stdio MCP = local/inside · remote MCP = crosses)
  ├─ GitHub   (/review, gh)
  └─ web search / fetch
```

**How to read it:** top to bottom is one request. Everything above the heavy `prompt trust boundary` rule runs on your machine (the *customer trust zone*); everything below is reached over TLS. `[E]` marks Enterprise-only nodes.

- **The boundary is the governance hook.** What crosses is the prompt, tool results, and any `@file` context you chose to send — nothing else. Where that data then lives (no-train-by-default, retention window, BAA/ZDR eligibility) is **not** restated here — see [`governance-overlay.md`](governance-overlay.md) and the per-feature trust-zone diagrams in [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html).
- **Three credentials, three bills.** The auth fork mirrors §1: subscription (plan limits), Console key (per-token), or a hyperscaler. A stray `ANTHROPIC_API_KEY` silently wins — the §1 gotcha, drawn.
- **The hyperscaler path is genuinely parallel.** Bedrock / Vertex / Foundry host the model in *their* region and bill through *their* account — `api.anthropic.com` and Anthropic Console billing are bypassed. Residency and eligibility differ on that path; [`governance-overlay.md`](governance-overlay.md) carries the specifics.
- **MCP straddles the line.** A local (stdio) server runs inside your trust zone; a remote MCP server is another network hop outside it — same tool call, different data boundary. Audit both (§12).
- Model tiers and pricing aren't restated — [`../docs/feature-inventory.md`](../docs/feature-inventory.md) is the single source of truth.

---

## 1. Auth — know which credential is actually paying

Three ways in, and they bill differently:

| Path | Who it's for | Bills against |
|---|---|---|
| **Claude subscription** (Pro / Max / Team / Enterprise) | individuals + teams; log in with your claude.ai account | plan message limits, not per-token |
| **Claude Console** (API key) | orgs preferring metered billing | per-token API spend |
| **Cloud provider** (Bedrock / Vertex / Foundry) | orgs already on a hyperscaler | that provider's bill; set env vars, no browser login |

**The gotcha that surprises everyone:** if `ANTHROPIC_API_KEY` is set in your environment, Claude Code uses it and **charges per-token even if you have a subscription**. A stray key in your shell profile silently bypasses your Max plan. Check `/cost` if spend looks wrong.

Second gotcha: subscription logins expire. Recent versions warn `Your login expires in N days · run /login`. It never blocks mid-session, but an **unattended** background or remote session dies when the credential lapses — renew early before long autonomous runs.

Seat vs API is a real budgeting fork for teams — see [`subscription-selection-guide.md`](subscription-selection-guide.md). A team on Claude Code usually needs **both** a seat plan and API credits.

---

## 2. Model + effort — the highest-leverage dial, and the one people leave on the wrong setting

Pick a model by **alias**, not version number, so you never chase model IDs:

- `sonnet` — the workhorse; default for most coding.
- `opus` — architecture, hard bugs, wide-blast refactors.
- `haiku` — triage, scripted/batch, high-volume cheap work.
- `fable` — hardest, longest-horizon agentic tasks (most capable *and* most expensive tier — validate the quality delta before paying for it; see [`model-selection-guide.md`](model-selection-guide.md)).
- `best` — Fable 5 where your org has access, else latest Opus.
- `default` — clears any override, reverts to your account's recommended (or the org-default an admin set).
- `opusplan` — **the trick most people miss:** Opus does the *planning*, Sonnet does the *execution*. You get Opus-grade reasoning on the hard part (the plan) at Sonnet cost on the bulk part (the edits). Switch with `/model` mid-session at no cost.

Independently, `/effort` sets *how hard the model thinks* (`low` → `medium` → `high` → `xhigh` → `max`; `high` is the default on today's models and the available rungs are model-dependent). More effort = more tokens + latency. Reach for `max` only on genuinely hard problems — it can overthink routine work.

**Thinking:** modern models (Fable 5, Sonnet 5, Opus 4.7+) use *adaptive* reasoning — thinking happens automatically where it helps. Nudge it in plain language ("think carefully about edge cases") or toggle with **Option+T** (macOS) / **Alt+T** (Win/Linux). The `ultrathink` keyword forces deep reasoning for one turn.

Don't reflexively run Opus for everything — it costs materially more than Sonnet for cases Sonnet handles fine (exact rates: [`../docs/feature-inventory.md`](../docs/feature-inventory.md)). `opusplan` is usually the better default for a substantial change.

---

## 3. Permission modes — the Shift+Tab cycle you should live in

`Shift+Tab` cycles the three everyday modes — **default → acceptEdits → plan** — and that cycle is where you'll live. The other three aren't in the default rotation: `auto` appears only if your account qualifies, `dontAsk` is set via `/permissions` or `defaultMode` in settings, and `bypassPermissions` joins the cycle only when you explicitly opt in with `--allow-dangerously-skip-permissions`. All six:

| Mode | What it does | Use when |
|---|---|---|
| `default` (aka *Manual*) | prompts on first use of each tool | you want to watch every action |
| `acceptEdits` | auto-accepts file edits + safe fs commands (`mkdir`/`mv`/`cp`) in the working dir | you trust the plan and want flow |
| `plan` | reads + read-only shell only, **no edits** | high-stakes or wide-blast change; review before any write |
| `auto` | auto-approves with background safety checks | routine work you want to move fast on |
| `dontAsk` | auto-**denies** anything not pre-approved via `permissions.allow` | locked-down, allowlist-only runs |
| `bypassPermissions` | skips prompts entirely | **containers/VMs only** |

**`bypassPermissions` is the loaded gun.** It skips writes to `.git`, `.claude`, `.ssh`-adjacent config, etc. It still refuses `rm -rf /` and `rm -rf ~` as a circuit breaker, and explicit `ask` rules still fire — but treat it as "isolated sandbox only." Never on your daily machine.

Nuance most people miss: **`deny` beats `allow` across every scope.** A managed or user-level deny cannot be overridden by a project `allow` or even a `--allowedTools` CLI flag. Precedence, highest first: managed settings → CLI args → project-local → project-shared → user. (Enterprise admins exploit this — see [`claude-code-enterprise-config.md`](claude-code-enterprise-config.md).)

---

## 4. Plan mode — cheap insurance for expensive changes

`/plan` (or the Shift+Tab cycle) puts Claude in read-only explore mode: it greps, reads, runs `git status`, and proposes a **written plan** — no edits yet. You review, push back ("split this into two commits", "add a rollback path"), and only then flip to `acceptEdits` to execute.

When it earns its keep: refactors that touch many files, anything near auth/money/migrations, or when you're not yet sure the change is well-scoped. The failure it prevents is Claude confidently editing 15 files down the wrong path.

Nuance: plan mode still allows **reads** — you can't use it to stop investigation, only to stop writes. Pair it with `opusplan` and you get Opus reasoning on the plan for free-ish.

---

## 5. CLAUDE.md — the file that makes every session smarter, and how to not bloat it

`CLAUDE.md` is auto-loaded context. Four scopes, all concatenated at launch — the more-specific file is read last, so it wins only on *conflicting* guidance:

- **Managed** (org-wide, IT-deployed) — see the enterprise guide.
- **User** — `~/.claude/CLAUDE.md`, all your projects.
- **Project** — `./CLAUDE.md` or `./.claude/CLAUDE.md`, committed, team-shared.
- **Local** — `./CLAUDE.local.md`, gitignored, just you.

Craft rules that actually matter:

- **Keep it under ~200 lines.** Past that, adherence *drops* — rules buried in a wall of text get ignored. Trim to decision rules; move detail to `.claude/rules/` (path-scoped, loads only when relevant) or `@`-imported files.
- **`@path` imports load at launch and cost full context.** Splitting a big `CLAUDE.md` into imports *organizes* it but does **not** save tokens — the imported files are expanded in every session. Max depth 4 hops. To mention a path without importing it, wrap in backticks.
- **Project-root `CLAUDE.md` survives `/compact`** (re-read from disk and re-injected). Nested subdirectory `CLAUDE.md` files do **not** auto-reinject — so if an instruction "disappeared after compact," it lived only in conversation or in a nested file. Put anything load-bearing in the project root.
- **Write specifics, not vibes.** "Run `npm test` before committing" beats "test your changes." "API handlers live in `src/api/handlers/`" beats "keep files organized."
- Fast-add with the `#` prefix mid-session; browse/edit with `/memory`; scaffold a starter with `/init`.

**The critical distinction (carry it to the enterprise guide): `CLAUDE.md` *guides* behavior — it is not an enforcement layer.** If something must be *blocked*, it belongs in `permissions.deny`, not a polite instruction.

---

## 6. Context management — /clear vs /compact vs /context

A fresh, well-fed context window is the difference between sharp and sloppy output.

- **`/context`** — visualize what's filling the window (memory, tool output, conversation). Run it when responses degrade; it shows you where the tokens went.
- **`/compact`** — summarize the conversation to reclaim space *while keeping continuity*. Use it between phases of the same task. Auto-compact fires near the limit on its own.
- **`/clear`** — hard reset for a *new, unrelated* task; keeps project memory (`CLAUDE.md`) but drops the conversation.

Rule of thumb: `/compact` at ~70% full, not 90%. `/clear` when you pivot topics. Start a fresh `claude` if a session hung.

Invisible context bloat, ranked: too many MCP servers left connected, an oversized `CLAUDE.md`, cached tool output (big greps, long logs), and 50-turn conversations without a compact. `/context` surfaces all four.

---

## 7. Auto-memory — Claude's own notebook

Separate from `CLAUDE.md`: Claude keeps notes for itself across sessions in `~/.claude/projects/<project>/memory/`, indexed by `MEMORY.md`. Only the **first 200 lines / 25 KB** of the index load at session start (topic files load on demand). It's **machine-local**, shared across all worktrees of the same repo, not synced across machines. Browse and prune it with `/memory` — it's plain markdown you can edit or delete. Toggle with `autoMemoryEnabled`. Good for build commands and recurring gotchas; it decides what's worth keeping.

---

## 8. Slash commands — the ones worth memorizing, by workflow phase

Type `/` to see all; the full reference is [docs.claude.com/en/docs/claude-code/commands](https://docs.claude.com/en/docs/claude-code/commands). The high-value subset:

- **Set up a repo:** `/init` (scaffold CLAUDE.md) · `/memory` · `/mcp` · `/permissions`
- **During a task:** `/model` · `/effort` · `/plan` · `/context` · `/compact` · `/btw` (a quick aside that *doesn't* pollute conversation history)
- **Parallel work:** `/tasks` (what's running) · `/background` (detach the session to keep running) · `/batch` (decompose a codebase-wide change into per-[worktree](https://docs.claude.com/en/docs/claude-code/worktrees) units)
- **Before you ship:** `/diff` · `/code-review` (correctness pass on the diff; `--fix` applies findings) · `/review` (fast read-only pass on a GitHub PR) · `/security-review`
- **Between sessions:** `/clear` (new task, keep memory) · `/resume` (return to a past session) · `/branch` (fork one)
- **When something's wrong:** `/rewind` (roll code **and** conversation back to a checkpoint — the undo most people don't know exists)

`/rewind` is the safety net: if a change went sideways, you can roll both the files and the conversation to an earlier point instead of manually reverting.

---

## 9. Custom commands + skills — encode the thing you keep re-typing

- **Custom slash command:** drop a markdown file in `.claude/commands/`. `deploy.md` → `/deploy`. Reference `$ARGUMENTS` for trailing text. Great for repo-specific routines.
- **Skills:** richer instruction packs in `.claude/skills/<name>/SKILL.md` (a description + body + optional helper files). Claude loads them when relevant. Add `context: fork` to run a skill in an isolated subagent (the skill body becomes the subagent's prompt). Skills chain — `/skill-a /skill-b do X` loads up to six and passes the trailing text to each.
- Package sets of commands/skills/hooks/MCP as **plugins** from a marketplace.

The repo ships eight team-grade skill templates: [`claude-code-starter-skills.md`](claude-code-starter-skills.md). Don't hand-repeat a workflow you could encode once.

---

## 10. Subagents — delegate to keep your main context clean

Spin up a specialized agent when a side task would bloat your main window (a security review, a broad search, an independent second opinion). Define one in `.claude/agents/<name>.md`, or inline via `--agents '{...}'`, or just ask Claude to create one. `/agents` lists them; `/tasks` shows running ones.

**Built-in subagents** (registered by default in interactive sessions — [full reference](https://docs.claude.com/en/docs/claude-code/sub-agents)):

| Agent | Model | Tools | Claude reaches for it when |
|---|---|---|---|
| **Explore** | inherits, capped at Opus on the Claude API | read-only, Write/Edit denied | it searches or maps a codebase without changing it — *skips `CLAUDE.md` + git status to stay lean* |
| **Plan** | inherits | read-only, Write/Edit denied | it gathers context during plan mode — *also skips `CLAUDE.md` + git status* |
| **General-purpose** | inherits | all tools | a task needs both exploration and edits, or several dependent steps |
| **statusline-setup** | Sonnet | narrow | auto — you run `/statusline` |
| **claude-code-guide** | Haiku | narrow | auto — you ask a question about Claude Code itself |

Anything *else* in an agent list is a **custom** subagent someone defined (`.claude/agents/` for the project, `~/.claude/agents/` for you) — the name carries no authority, and a custom agent named `Explore` overrides the built-in. Set `CLAUDE_CODE_SUBAGENT_MODEL` to run all subagents on a cheaper tier (e.g. Haiku for parallel search). For patterns and the error-compounding math, see [`multi-agent-patterns.md`](multi-agent-patterns.md).

**Dynamic workflows — the orchestration layer *above* subagents.** When a task outgrows one context — a repo-wide audit, a thousand-file migration, a cross-checked research sweep — a *dynamic workflow* has Claude write a **JavaScript orchestration script** ([docs](https://code.claude.com/docs/en/workflows)) that fans out tens-to-hundreds of subagents in the background while your session stays live. The script holds the loop, branching, and intermediate results, so your main window only ever sees the **final** answer. Its real payoff is a **repeatable quality pattern** — independent agents *adversarially* reviewing each other's findings before anything is reported, or drafting a plan from several angles and weighing them — a verified result, not just more agents. Trigger it with the **`ultracode`** keyword or "*use a workflow to …*"; dismiss a stray trigger with `Option/Alt+W` or turn the keyword off in `/config`. Needs **Claude Code v2.1.154+**, on all paid plans (enable on Pro via `/config`), plus the Anthropic API, Bedrock, Google Cloud, and Microsoft Foundry. **Opt-in and token-heavy by design** — reach for it on breadth / scale / verification work, not simple single-context tasks.

---

## 11. Input tricks — stop fighting the terminal

- **`@file` / `@dir`** pulls file/directory content inline. `@src/` includes everything under it — watch the context cost.
- **Paste images** directly (screenshots of errors, diagrams, a failing UI). Claude reads them.
- **Multiline input:** `\` + Enter works in *any* terminal. `Shift+Enter` is native in iTerm2, WezTerm, Ghostty, Kitty, Warp, Apple Terminal, and Windows Terminal. `Ctrl+J` is the universal fallback.
- **Line editing** is emacs-style out of the box (`Ctrl+A/E/K/U/W/Y`). Prefer vim? Enable it in `/config` → Editor mode for full modal editing.
- **`Ctrl+R`** (or `/`) searches your prompt history — faster than retyping a long instruction.
- **`Esc`** interrupts the current response without killing the session — hit it the moment Claude heads down a wrong path; you save tokens and redirect.

---

## 12. Hooks + MCP — automate the guardrails, connect the tools

- **Hooks** run your scripts on lifecycle events (`PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`, `PreCompact`, and many more). A `PreToolUse` hook can **block** a tool call (exit code 2) — e.g. refuse a `Bash(rm *)` or scrub secrets before a write. Ten ready templates: [`hooks-starter-pack.md`](hooks-starter-pack.md).
- **MCP** connects Claude to external systems (issue tracker, docs, read-only DB, CI logs). Add with `claude mcp add`; scope to project (`.mcp.json`, committed) or user. Seven read-only server templates: [`mcp-starter-pack.md`](mcp-starter-pack.md).

MCP hygiene: every connected server loads into context whether you use it or not. Audit with `claude mcp list` and drop unused ones — this is a top invisible-bloat source.

---

## 13. Headless + CI — Claude Code in a pipeline

`claude -p "query"` runs once and exits (SDK mode). Compose it:

- `cat build.log | claude -p "explain the first error"` — pipe input.
- `--output-format json` (or `stream-json`) for machine-parseable output + `session_id` + cost.
- `-c` continues the most recent session; `-r "<id>" "query"` resumes a named one.
- `--append-system-prompt "..."` adds rules without discarding Claude Code's default safety/tool guidance; `--system-prompt` replaces it entirely (you own the consequences).
- In CI, pin `--model haiku` for cheap high-volume checks and pre-auth via env var.

Full surface: [docs.claude.com/en/docs/claude-code/headless](https://docs.claude.com/en/docs/claude-code/headless). For evals around this, [`eval-starter-pack.md`](eval-starter-pack.md).

---

## 14. Git worktrees — real parallelism without conflicts

Run several Claude Code sessions at once, each on its own branch in its own worktree, so they edit different files with zero collision. `/batch` automates this for a large change (decompose → one worktree per unit). Copy gitignored files like `.env` into new worktrees with a `.worktreeinclude` file at the repo root. Details: [docs.claude.com/en/docs/claude-code/worktrees](https://docs.claude.com/en/docs/claude-code/worktrees).

---

## 15. Cost discipline — five habits that actually move the bill

1. **Right-size the model.** Sonnet for routine, `opusplan` for substantial changes, Opus only when it earns it. Pricing: [`../docs/feature-inventory.md`](../docs/feature-inventory.md).
2. **`/compact` proactively.** A bloated window costs tokens on every turn.
3. **Prune MCP servers.** Unused connections are pure overhead.
4. **Keep `CLAUDE.md` lean.** It's re-sent constantly.
5. **Watch it.** `/cost` for spend, `/context` for where tokens live. Prompt caching applies automatically — steady-state cost drops when your context is stable, so churning it needlessly costs twice.

For org-level budgets and alerts, [`token-budget-governance.md`](token-budget-governance.md) and [`cost-calculator.html`](cost-calculator.html).

---

## 16. The trick list — what fluent users know that isn't obvious

- **`opusplan`** — Opus plans, Sonnet executes. Best default for a real change.
- **`ultrathink`** in a prompt or skill forces a deep-reasoning turn.
- **`/rewind`** rolls code *and* conversation back to a checkpoint — the real undo.
- **`/btw`** asks a quick aside without adding to conversation history.
- **`context: fork`** runs a skill in an isolated subagent, keeping your main window clean.
- **`Esc` early** to interrupt a wrong path — cheaper than letting it finish.
- **Project-root `CLAUDE.md` survives `/compact`**; put durable instructions there, not in conversation or nested files.
- **`@`-imports don't save context** — they organize, they don't shrink.
- **`deny` beats `allow` everywhere** — a higher-scope deny can't be re-allowed below it.
- **`ANTHROPIC_API_KEY` overrides your subscription** — a stray key bills you per-token.

---

## 17. Approach with extreme caution — the house failure modes

- **`bypassPermissions` on a real machine.** Containers/VMs only. It's the fastest way to let a model error touch something it shouldn't.
- **Treating `CLAUDE.md` as enforcement.** It's guidance. Anything that must be blocked goes in `permissions.deny` or a `PreToolUse` hook. (This is the #1 confusion the [enterprise config guide](claude-code-enterprise-config.md) exists to fix.)
- **Defaulting to Opus for everything.** You pay well above the Sonnet rate for work Sonnet does fine.
- **A 500-line `CLAUDE.md`.** Adherence drops; you've written instructions the model skims past.
- **Skipping verification.** Claude proposes; the loop only closes when *you* confirm it works. Run the tests, read the diff. You own what ships.

---

*See also: [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) (team rollout) · [`claude-code-enterprise-config.md`](claude-code-enterprise-config.md) (admin templates) · [`model-selection-guide.md`](model-selection-guide.md) · [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) (the product-surface version of "direct and verify").*

---

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.
