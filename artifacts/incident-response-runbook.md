# Claude Incident Response Runbook

**As of 2026-05.** Pinned to Opus 4.8 / Sonnet 4.6 / Haiku 4.5. Companion to [`governance-overlay.md`](governance-overlay.md) (§10 rollback, §15 cost gates) and [`adoption-playbook.md`](adoption-playbook.md) (failure modes). See [`hooks-starter-pack.md`](hooks-starter-pack.md) for the hook bodies that generate the signals this runbook acts on.

> **This is the reactive layer.** `governance-overlay.md` tells you how to design controls. `adoption-playbook.md` names the failure modes. This file tells you what to do *right now* when something breaks in production. Five incident classes, each self-contained.

---

## Triage decision tree

```
Incident detected
  ├── Cost spike (daily spend >2× baseline or $/day cap breached)
  │     → Class 3: Cost spike
  ├── Agent looping / not terminating / runaway tool calls
  │     → Class 4: Agent loop runaway
  ├── Output quality regression (eval pass rate drop, user complaints spike)
  │     → Class 1: Prompt regression
  ├── Model returns 404 / deprecated model error / Anthropic deprecation notice
  │     → Class 2: Model deprecation
  └── MCP server behaving unexpectedly / returning injected content / unauthorized access
        → Class 5: MCP server compromise
```

---

## Class 1 — Prompt regression

**Symptoms:**
- Eval pass rate drops >5% vs last known-good baseline
- User accept rate drops or re-prompt rate spikes
- Output format violations increase
- Specific task category starts failing (narrow regression, not wholesale)

**Immediate actions (within 30 min):**
1. Check recent prompt or Skill changes in git — `git log --oneline -10 -- artifacts/ .claude/`
2. Check recent model version bump — did the model ID in code change?
3. If a prompt change is the likely cause: **roll back the prompt** to last tagged version. Do not fix-forward under pressure.
4. If model version changed: pin back to the prior version explicitly in the API call.
5. Notify use-case owner and on-call reviewer.

**Root cause investigation:**
- Run the regression eval set against last-known-good prompt vs current prompt. See [`eval-starter-pack.md`](eval-starter-pack.md) regression eval template.
- Diff the prompt versions. Look for: new instructions that conflict with existing ones, removed context the model was relying on, changed examples that shift output distribution.
- If model version is the same and prompt is unchanged: check if retrieved context changed (RAG corpus update, MCP server returning different data).

**Remediation:**
- Fix the prompt in a branch; run full eval suite before merging.
- If the root cause is a model behavior change (same prompt, new model revision): file a detailed report with Anthropic, pin the model explicitly, and track the issue in your risk register.
- Tag the fixed prompt version before deploying.

**Post-mortem template:**
```
Date:
Incident duration:
Root cause (prompt change / model change / context change / unknown):
Eval pass rate at incident: X% (baseline: Y%)
Rollback time (detection → rollback live):
Fix time (rollback → fix deployed):
Prevention: (eval gate added / prompt review process updated / model pin added)
```

---

## Class 2 — Model deprecation

**Symptoms:**
- API returns `model_not_found` or `deprecated_model` error
- Anthropic email/dashboard deprecation notice
- Model version returns lower quality than documented

**Immediate actions (within 2 hours):**
1. Identify every code path that hardcodes the deprecated model ID — `grep -r "claude-" . --include="*.py" --include="*.ts" --include="*.json"`
2. Check Anthropic's model deprecation timeline at [docs.claude.com/en/docs/about-claude/models/overview](https://docs.claude.com/en/docs/about-claude/models/overview) for the migration window.
3. Do NOT use a floating `latest` alias as the fix. Pin to a specific successor model ID.
4. Run the full eval suite against the successor model before deploying. Model revisions can change output distribution even when the task name is the same.

**Root cause investigation:**
- Was the deprecation in the scheduled monthly review? If not: add Anthropic changelog monitoring to the team's alert channels.
- Did the model bump break any specific eval category? Identify which task types are most affected.

**Remediation:**
- Update all hardcoded model IDs to the successor.
- Re-run cascade thresholds — a new model tier may require different escalation calibration.
- Update [`../docs/feature-inventory.md`](../docs/feature-inventory.md) Models table.
- Run `/bump-as-of` to update artifact stamps.

**Prevention:**
- Subscribe to [Anthropic status / changelog](https://status.anthropic.com/) for deprecation notices.
- Monthly refresh routine (first Monday) audits model versions — verify it runs.
- Maintain explicit model version in every API call; never use `latest`.

---

## Class 3 — Cost spike

**Symptoms:**
- `log-cost` hook alerts firing at 80% or 100% of $/day cap (see [`hooks-starter-pack.md`](hooks-starter-pack.md))
- Daily spend 2× or more above rolling average
- Single use case or agent consuming disproportionate quota
- Unusual token counts in audit log (output tokens >> input tokens ratio)

**Immediate actions (within 15 min):**
1. **Auto-throttle should already be firing** at 80% of $/day cap. Verify it engaged. If not, engage manually — disable the use case or rate-limit the API key.
2. Identify the offending workload: check audit log for which use case / model / prompt contributed to the spike.
3. Check for runaway agent loops (Class 4 crossover — see below).
4. Check for prompt injection attack: did an external input dramatically inflate output tokens?

**Root cause patterns:**
| Pattern | Signal | Fix |
|---|---|---|
| Agent loop runaway | output tokens >> expected; same tool call repeating | See Class 4 |
| Prompt injection inflating output | single request with 10× normal output tokens | Add output token cap; filter inputs; see Class 5 |
| Cache invalidation | cache hit rate dropped to near 0% | Diagnose what invalidated the cache prefix (prompt change, system prompt rotation) |
| Traffic spike (legitimate) | request volume spike, normal token ratios | Raise $/day cap deliberately; add auto-scale throttle |
| Misconfigured extended thinking | thinking tokens inflating output cost | Audit extended thinking configuration; ensure it's scoped to tasks that need it |

**Remediation:**
- Fix the root cause before re-enabling the use case.
- Verify the four governance gates are set (§15.1 in [`governance-overlay.md`](governance-overlay.md)): $/task ceiling, $/day cap, cache hit-rate floor, batch eligibility floor.
- Post-incident: update the $/task ceiling based on observed real traffic (set at 1.5× 95th-percentile actual cost).

**Post-mortem template:**
```
Date:
Spike duration:
Peak $/day: (vs cap: )
Root cause:
Auto-throttle engaged: Y/N (if N: why not?)
Detection lag (actual spike → alert):
Total overspend:
Prevention: (cap tightened / hook fixed / injection filter added)
```

---

## Class 4 — Agent loop runaway

**Symptoms:**
- Single task consuming hundreds of tool calls
- Agent not terminating after reasonable turn count
- Same tool call repeating with same arguments (infinite loop)
- Output tokens per task 10× normal
- Cost spike (Class 3 crossover)

**Immediate actions (within 5 min):**
1. **Kill the session immediately.** Cancel the in-flight API request if possible; revoke the API key scoped to that agent if the session can't be cancelled.
2. If using Claude Code: use `/stop` or kill the process.
3. Check for collateral damage: did the agent make any write tool calls before the loop? Review audit log for tool calls to DB, filesystem, external APIs.
4. Assess blast radius: read-only tools = no damage; write tools = investigate each write.

**Root cause patterns:**
| Pattern | Signal | Fix |
|---|---|---|
| Missing termination condition | agent keeps calling tools "to be thorough" | Add explicit stop condition to system prompt; add `max_turns` cap |
| Tool call returns error the agent retries forever | same tool + same args, alternating with error response | Add retry backoff + max-retry cap in tool implementation |
| Prompt injection driving the loop | unusual tool call sequence that doesn't match the original task | See Class 5; add input sanitization |
| Orchestrator-worker misconfiguration | workers spawning sub-workers recursively | Add max-depth limit to sub-agent spawning |

**Remediation:**
- Add `max_turns` limit to every agent definition. Set 10–20 for most tasks; up to 50 for complex workflows with explicit checkpoints.
- Add a circuit-breaker: if the same tool is called with the same arguments 3× in one session, halt and return a hard error.
- Review every write tool call made during the runaway. Reverse any unintended writes.
- Add output-token-per-task alert alongside the $/task ceiling.

---

## Class 5 — MCP server compromise or injection

**Symptoms:**
- MCP server returning unexpected content that instructs the agent to take new actions
- Agent making tool calls not related to the original task
- MCP server returning data from unexpected sources
- Suspicious patterns in audit log: tool calls to endpoints not in the original task scope

**Immediate actions (within 15 min):**
1. Isolate the affected MCP server — disable it in `.claude/settings.json` or revoke its credentials.
2. Review the last N audit log entries for the affected session: what tool calls did the agent make after the suspected injection? Were any write tools invoked?
3. If write tools were invoked: treat as a potential breach — escalate to security team, preserve audit log, do not delete evidence.
4. Rotate credentials for any service the MCP server had access to.

**Root cause investigation:**
- Identify the injection vector: what content did the MCP server return that caused the behaviour change? Common vectors: database records with embedded instructions, web pages fetched by a search tool, uploaded files processed by the agent.
- Review the MCP server's allow-list and redaction configuration. See [`mcp-starter-pack.md`](mcp-starter-pack.md) for read-only-by-design templates and redaction patterns.

**Remediation:**
- Add content sanitization at the MCP server layer before returning results to the agent — strip or redact content that matches instruction-like patterns.
- Separate untrusted-content tools from privileged-action tools: no shared session between a tool that reads external content and a tool that writes to internal systems.
- Add an adversarial eval set covering prompt injection inputs. See [`eval-starter-pack.md`](eval-starter-pack.md) adversarial eval template.
- Re-read [`governance-overlay.md §14`](governance-overlay.md#14-prompt-injection--content-safety) and verify all controls are in place.

**Prevention:**
- All MCP servers should be read-only by default. Mutate variants require explicit approval per [`mcp-starter-pack.md`](mcp-starter-pack.md).
- Computer use agents must run against trusted targets only, in isolated environments.
- Review OWASP LLM Top 10 (LLM01 — Prompt Injection) annually.

---

## Post-incident checklist (all classes)

- [ ] Incident duration documented
- [ ] Root cause identified and written up (not just "Claude did X")
- [ ] Blast radius assessed (what data was touched, what actions were taken)
- [ ] Rollback or fix deployed and verified in eval
- [ ] Prevention measure identified and assigned an owner + deadline
- [ ] [`governance-overlay.md`](governance-overlay.md) controls reviewed — did a missing control enable this?
- [ ] Incident added to risk register with severity + recurrence probability
- [ ] If severity is High/Critical: notify stakeholders per your org's incident policy

---

## How this artifact connects to the rest

- [`governance-overlay.md`](governance-overlay.md) — §10 (prompt versioning + rollback), §15 (cost gates), §9 (audit trail), §14 (prompt injection)
- [`hooks-starter-pack.md`](hooks-starter-pack.md) — `log-cost` (Class 3 signal), `block-secrets` (Class 5 mitigation), `audit-log-append` (evidence for all classes)
- [`mcp-starter-pack.md`](mcp-starter-pack.md) — read-only server templates (Class 5 prevention)
- [`eval-starter-pack.md`](eval-starter-pack.md) — regression eval (Class 1), adversarial eval (Class 5), cost-per-task eval (Class 3 detection)
- [`adoption-playbook.md`](adoption-playbook.md) — failure modes section names the same classes; this runbook is the reactive complement to the playbook's preventive framing
- [`anti-use-cases.md`](anti-use-cases.md) — "Autonomous action with irreversible consequences" (Class 4 prevention), "Pilot with no kill-switch" (Class 3 prevention)

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify Claude Code + Agent SDK surface at docs.claude.com.`
