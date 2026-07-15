# Multi-Agent Patterns for Claude

**As of 2026-07.** Pinned to Opus 4.8 / Sonnet 5 / Haiku 4.5. Companion to [`reference-architectures.html`](reference-architectures.html) (agentic workflow pattern) and [`eval-starter-pack.md`](eval-starter-pack.md) (tool-call accuracy eval). See [`../docs/feature-inventory.md`](../docs/feature-inventory.md) for canonical sub-agents / Agent SDK status.

> **Read this before decomposing.** Multi-agent architectures are powerful and fragile. Each decomposition choice has a distinct failure mode. This artifact names 6 patterns, the error-compounding math that makes agents less reliable by default, and the mitigations that reverse the math.

---

## The error-compounding problem

A single model call at 95% accuracy passes 95 tasks in 100. A 5-step pipeline where each step is 95% accurate:

```
0.95 × 0.95 × 0.95 × 0.95 × 0.95 = 0.774 = 77% end-to-end accuracy
```

A 10-step pipeline: 0.95^10 = **60%** end-to-end accuracy.

**Implication:** decomposing into agents does not add reliability — it compounds errors unless each step actively catches and handles failures from upstream steps. The 3 mitigations that reverse this:

1. **Output validation at each step** — schema check, grounding check, or a cheap Haiku validator call before passing output downstream
2. **Retry with backoff** — on validation failure, retry the step (not the whole pipeline) with a clarified prompt
3. **Human-in-loop gate on high-stakes branches** — any step whose failure would be invisible and consequential gets a human review checkpoint

Without at least mitigation 1, multi-agent systems will perform worse than a single careful call.

---

## When to decompose (and when not to)

**Decompose when:**
- Task is genuinely parallelizable (independent subtasks with no shared state)
- Task exceeds a single context window
- Different subtasks need different tool access or model tiers
- A step needs human review before the next step can proceed

**Don't decompose when:**
- The full task fits in a single call with room to spare
- Subtasks share complex state that is expensive to serialize
- Latency budget is tight — each agent call adds round-trip latency
- You're hoping decomposition will fix a prompt quality problem (it won't)

---

## 6 patterns

### 1. Orchestrator-worker

```
User → Orchestrator (Sonnet/Opus)
         ├── Worker A (Haiku) — subtask 1
         ├── Worker B (Haiku) — subtask 2
         └── Worker C (Sonnet) — subtask 3
         → Synthesize → User
```

**When to use:** complex tasks with clearly separable subtasks; orchestrator needs to plan and route dynamically.

**Failure mode:** orchestrator over-decomposes (spawns workers for trivial subtasks, adding latency and cost); workers produce inconsistent output formats the orchestrator can't synthesize.

**Mitigation:** define worker output schemas strictly; orchestrator validates each worker output before synthesis; set a max-worker-count limit.

**Token impact:** orchestrator re-reads worker outputs — budget input tokens for synthesis step. Model in [`cost-calculator.html`](cost-calculator.html) using turns slider (orchestrator + N workers ≈ N+1 turns).

---

### 2. Parallel fan-out

```
User → Dispatcher
         ├── Agent A (independent task)
         ├── Agent B (independent task)
         └── Agent C (independent task)
         → Aggregator → User
```

**When to use:** tasks that are genuinely independent (no shared state, no ordering dependency). Example: running the same analysis on 5 documents simultaneously.

**Failure mode:** tasks are not truly independent (hidden shared state causes conflicts); aggregator receives partial results if one agent fails and has no fallback.

**Mitigation:** verify independence before fanning out; aggregator handles partial-result sets gracefully (explicit "agent N failed" path, not silent omission); use Batch API if latency SLA allows — 50% cheaper.

**When not fan-out:** if task B depends on task A's output, this is a sequential pipeline (Pattern 3), not a fan-out.

---

### 3. Sequential pipeline

```
User → Step 1 (extract) → Step 2 (transform) → Step 3 (generate) → Step 4 (validate) → User
```

**When to use:** tasks with strict ordering — each step's output is the next step's input. Example: extract entities → retrieve context → draft response → verify citations.

**Failure mode:** error compounding (see above); a bad extract in Step 1 poisons every downstream step silently.

**Mitigation:** validation gate between each step — either a schema check (free), a Haiku validation call (~$0.001), or a deterministic check (regex/JSON schema). On validation failure: retry Step N with a refined prompt, not the whole pipeline. Log the step number and failure reason for post-mortem.

**Max recommended depth without validation gates:** 3 steps. Beyond that, end-to-end accuracy degrades below the single-call baseline at typical per-step accuracy levels.

---

### 4. Validator-retry loop

```
User → Generator (Sonnet) → Validator (Haiku or deterministic)
                                 ├── Pass → return output
                                 └── Fail → Generator (retry with failure reason)
                                               → Validator (max N retries)
                                               └── Hard fail → escalate or return error
```

**When to use:** tasks where output quality is measurable but generation is non-deterministic. Example: code generation (validator runs tests), structured JSON (validator checks schema), factual claims (validator checks citations).

**Failure mode:** validator is too strict → infinite retry loop; validator is too loose → bad output escapes; no max-retry cap → runaway cost.

**Mitigation:** set max retries (2–3 for most tasks); include the validation failure reason in the retry prompt ("the previous output failed because: X — regenerate addressing this"); hard-fail to a known-bad-output signal after max retries rather than looping forever.

**Cost note:** Haiku-as-validator is cheap (~$0.001/call). Deterministic validators (regex, JSON schema, test runner) are free. Avoid Sonnet-as-validator unless the validation task itself requires complex reasoning.

---

### 5. Human-in-loop gate

```
User → Agent (Sonnet) → Proposed action
                             → Human review UI
                                  ├── Approve → execute action
                                  ├── Edit → execute modified action
                                  └── Reject → return to agent with rejection reason
```

**When to use:** any step where the action is irreversible or high-stakes (file writes, DB mutations, emails sent, money moved, records updated). Required by [`anti-use-cases.md`](anti-use-cases.md) "Autonomous action with irreversible consequences" rule.

**Failure mode:** human review bottleneck kills throughput; reviewers approve without reading (rubber-stamp failure); rejection reason not fed back to agent (same error recurs).

**Mitigation:** scope the review UI to show only what the reviewer needs (proposed action + diff, not the full prompt); make rejection require a one-line reason (feeds back to agent); time-box the review step and escalate if no response within window.

**Governance note:** log every human decision — reviewer ID, timestamp, approve/edit/reject, reason. This is the audit trail required by NIST AI RMF Manage 1.3 and EU AI Act Art. 14. See [`governance-overlay.md §9`](governance-overlay.md#9-audit-trail--what-to-log).

---

### 6. Dynamic workflows (Claude-written orchestration)

```
You describe the task
   → Claude writes a JavaScript orchestration script
        → a runtime runs it in the background:
             ├── fans out tens–hundreds of subagents in parallel
             ├── the script holds the loop / branching / intermediate state
             └── a quality pattern is baked in (adversarial cross-verify · multi-angle plan+judge)
        → only the final, verified answer returns to your context
```

**When to use:** a task too big for one context — repo-wide audits, thousand-file migrations, cross-checked research sweeps — where you'd otherwise hand-build Patterns 1–4. Instead of writing the orchestrator yourself, Claude writes and runs the script. A Claude Code feature (GA, v2.1.154+); trigger with the `ultracode` keyword or "use a workflow to …". Detail: [`../docs/feature-inventory.md`](../docs/feature-inventory.md) dynamic-workflows row + [`claude-code-101.md`](claude-code-101.md) §10.

**Failure mode:** it inherits every failure mode above, at scale — an unvalidated fan-out compounds errors across hundreds of agents; a silent cap (top-N, no-retry, sampling) reads as "covered everything" when it didn't; spawning agents without a budget ceiling runs away on cost.

**Mitigation:** the script is where the mitigations live — have it validate or adversarially cross-verify each finding before it's reported (Pattern 4 at scale), surface what it dropped instead of silently truncating, and bound the fan-out. Opt-in and token-heavy by design; scope it to breadth / verification work, not simple single-context tasks.

**Relation to the other five:** Patterns 1–5 are architectures you implement; a dynamic workflow is the Claude Code runtime that *writes and runs* them for you — most often Orchestrator-worker (#1) + Fan-out (#2) with a Validator-retry (#4) stage encoded as adversarial cross-review.

---

## Sub-agent configuration (Claude Code context)

For Claude Code workloads using the `Task` tool to spawn sub-agents:

```json
{
  "subagent": {
    "model": "claude-haiku-4-5-20251001",
    "max_turns": 5,
    "tools": ["Read", "Glob", "Grep"]
  }
}
```

**Key settings:**
- `model` — default sub-agent model. Override per-task for heavy subtasks.
- `max_turns` — hard cap on sub-agent turn depth. Without this, a sub-agent can recurse indefinitely. Set 3–10 depending on task complexity.
- `tools` — scope to read-only for sub-agents that only need to gather information. Add write tools only to sub-agents whose job is to produce output.

See [`../docs/feature-inventory.md`](../docs/feature-inventory.md) sub-agents row for current GA status and doc anchor. The config key names + schema above are illustrative — verify the exact shape against docs.claude.com/en/docs/claude-code/sub-agents before relying on it.

---

## Choosing a pattern: decision table

| Situation | Pattern |
|---|---|
| Subtasks are independent, can run in parallel | Fan-out (#2) |
| Each step's output feeds the next | Sequential pipeline (#3) |
| Output quality is measurable; generation is non-deterministic | Validator-retry (#4) |
| Action is irreversible or high-stakes | Human-in-loop gate (#5) |
| Task requires dynamic planning and routing | Orchestrator-worker (#1) |
| Task exceeds one context — repo-wide audit, mass migration, cross-checked research | Dynamic workflows (#6) |
| Task fits in one call | Don't decompose |

---

## How this artifact connects to the rest

- [`reference-architectures.html`](reference-architectures.html) — agentic workflow pattern (Pattern 1 + 3 in diagram form)
- [`eval-starter-pack.md`](eval-starter-pack.md) — tool-call accuracy eval catches Pattern 3 pipeline failures; adversarial eval catches Pattern 5 injection risks
- [`cost-calculator.html`](cost-calculator.html) — agent turns multiplier models multi-call cost for fan-out and sequential patterns
- [`hooks-starter-pack.md`](hooks-starter-pack.md) — destructive-op blocking hook enforces Pattern 5 (human gate) at the tool level
- [`mcp-starter-pack.md`](mcp-starter-pack.md) — read-only MCP servers limit blast radius for Patterns 1–3
- [`governance-overlay.md`](governance-overlay.md) — §14 prompt injection (relevant for all patterns reading untrusted content); §9 audit trail (Pattern 5 logging requirement)
- [`anti-use-cases.md`](anti-use-cases.md) — "Autonomous action with irreversible consequences" rule mandates Pattern 5 for write tools

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify Agent SDK + sub-agent surface at docs.claude.com.`
