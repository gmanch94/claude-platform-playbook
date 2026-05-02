# Claude Platform Feature Inventory

**Single source of truth.** All artifacts in this repo reference this file. Update this first, propagate second.

**Last verified:** 2026-05-01 against [docs.claude.com](https://docs.claude.com) and [anthropic.com/pricing](https://www.anthropic.com/pricing).

**Refresh cadence:** weekly. Bump status, as-of dates, and pricing rows. Cross-check `Used in` column to find every artifact that needs a touch.

> ⚠ **Verification posture.** Status (GA / beta / preview) and surface details drift. Anything below older than 14 days from "Last verified" should be re-checked before publishing changes downstream.

---

## Models

| Model | Tier | Status | As-of | Notes |
|---|---|---|---|---|
| Opus 4.7 | Top | GA | 2026-05 | Deepest reasoning. Default for hard agentic + code refactor. |
| Sonnet 4.6 | Mid | GA | 2026-05 | Workhorse. Default for production copilots + agentic loops. |
| Haiku 4.5 | Fast | GA | 2026-05 | Triage, batch, high-volume. ~5–15× cheaper than Opus. |

**Pricing (per million tokens, USD, as-of 2026-05):** see [`../artifacts/cost-calculator.html`](../artifacts/cost-calculator.html) — pricing table embedded with same as-of stamp.

---

## Platform features (Anthropic API)

| Feature | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Prompt caching | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/prompt-caching | calculator, matrix, briefing, arch |
| Extended thinking | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/extended-thinking | matrix, arch |
| Tool use | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/tool-use | matrix, arch |
| Computer use 2.0 | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/computer-use | matrix, arch |
| Files API | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/files | matrix, arch |
| Citations | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/citations | matrix, arch |
| Batch API | GA | 2026-05 | docs.claude.com/en/api/messages-batch | calculator, matrix, arch |
| Memory tool | beta | 2026-05 | docs.claude.com/en/docs/agents-and-tools/memory-tool | matrix, arch |
| Web search tool (server-side) | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/web-search | arch:rag, claude-code-guide |
| Code execution tool (server-side) | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/code-execution | arch:agent, claude-code-guide |

**Token economics** — see [`../artifacts/cost-calculator.html`](../artifacts/cost-calculator.html). Cache read ≈ 10% of input. Cache write 5m ≈ 125% of input. Batch ≈ 50% of all rates.

---

## Higher-level abstractions

| Capability | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Skills | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/skills | matrix, playbook, arch, claude-code-guide |
| MCP (Model Context Protocol) | GA | 2026-05 | modelcontextprotocol.io | matrix, playbook, arch, claude-code-guide |
| Agent SDK | GA | 2026-05 | docs.claude.com/en/api/agent-sdk | matrix, arch, claude-code-guide |
| Plugins (bundled commands + skills + hooks + MCP servers) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/plugins | matrix, arch, claude-code-guide |
| Sub-agents (Task tool / parallel agents in Claude Code) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/sub-agents | claude-code-guide, arch:code |

---

## Claude Code (CLI) surface

| Surface | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Claude Code CLI | GA | 2026-05 | docs.claude.com/en/docs/claude-code | claude-code-guide |
| Slash commands | GA | 2026-05 | docs.claude.com/en/docs/claude-code/slash-commands | claude-code-guide |
| Hooks (PreToolUse / PostToolUse / SessionStart / Stop / UserPromptSubmit) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/hooks | claude-code-guide |
| Settings hierarchy (user / project / local) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/settings | claude-code-guide |
| Output styles | GA | 2026-05 | docs.claude.com/en/docs/claude-code/output-styles | claude-code-guide |
| Background tasks / scheduled routines | GA | 2026-05 | docs.claude.com/en/docs/claude-code/background-tasks | claude-code-guide |
| IDE integrations (VS Code, JetBrains) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/ide-integrations | claude-code-guide |
| Headless mode (CI / non-interactive) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/headless | claude-code-guide |

---

## Procurement paths

| Path | Status | As-of | Notes |
|---|---|---|---|
| Direct API (`console.anthropic.com`) | GA | 2026-05 | Fastest model availability. Default. |
| Amazon Bedrock | GA | 2026-05 | Hyperscaler procurement. Model version lag possible. |
| Google Vertex AI | GA | 2026-05 | Hyperscaler procurement. Model version lag possible. |

---

## Compliance + governance posture

| Item | Status | As-of | Notes |
|---|---|---|---|
| No-train (API + Console default) | Confirmed | 2026-05 | Verify policy version when signing. Re-check quarterly. |
| BAA (HIPAA workloads) | Available | 2026-05 | Direct procurement path. Verify scope per workload. |
| Data residency (regions) | Multiple | 2026-05 | Region availability differs across direct / Bedrock / Vertex. |
| SOC 2 Type II | Held | 2026-05 | Refresh cycle annual. Request current report before audit. |
| ISO 27001 | Held | 2026-05 | Same as SOC 2. |

---

## Weekly refresh checklist

1. Open [docs.claude.com](https://docs.claude.com) — check changelog / what's new
2. Open [anthropic.com/pricing](https://www.anthropic.com/pricing) — diff against calculator pricing table
3. For each row: status changed? as-of stamp older than 14 days? doc URL still valid?
4. For each *changed* row, grep `Used in artifacts` column → patch those files only
5. Update **Last verified** date at top of this file
6. Update README + artifact footers' as-of stamp if any model / pricing changed

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05.`
