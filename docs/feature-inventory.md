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
| Prompt caching | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/prompt-caching | calculator, matrix, briefing, arch, eval-pack, misconceptions |
| Extended thinking | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/extended-thinking | matrix, arch |
| Tool use | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/tool-use | matrix, arch, eval-pack |
| Computer use 2.0 | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/computer-use | matrix, arch, misconceptions |
| Files API | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/files | matrix, arch, eval-pack |
| Citations | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/citations | matrix, arch, eval-pack |
| Batch API | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/batch-processing | calculator, matrix, arch, eval-pack, misconceptions |
| Memory tool | beta | 2026-05 | docs.claude.com/en/docs/agents-and-tools/memory-tool | matrix, arch |
| Web search tool (server-side) | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/web-search | arch:rag, claude-code-guide |
| Code execution tool (server-side) | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/code-execution | arch:agent, claude-code-guide, eval-pack |

**Token economics** — see [`../artifacts/cost-calculator.html`](../artifacts/cost-calculator.html). Cache read ≈ 10% of input. Cache write 5m ≈ 125% of input. Batch ≈ 50% of all rates.

---

## Higher-level abstractions

| Capability | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Skills | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/skills | matrix, playbook, arch, claude-code-guide, starter-skills, eval-pack, misconceptions |
| MCP (Model Context Protocol) | GA | 2026-05 | modelcontextprotocol.io | matrix, playbook, arch, claude-code-guide, starter-skills, mcp-pack |
| Agent SDK | GA | 2026-05 | docs.claude.com/en/api/agent-sdk | matrix, arch, claude-code-guide |
| Plugins (bundled commands + skills + hooks + MCP servers) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/plugins | matrix, arch, claude-code-guide, starter-skills, eval-pack |
| Sub-agents (Task tool / parallel agents in Claude Code) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/sub-agents | claude-code-guide, arch:code |

---

## Claude Code (CLI) surface

| Surface | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Claude Code CLI | GA | 2026-05 | docs.claude.com/en/docs/claude-code | claude-code-guide, misconceptions |
| Slash commands | GA | 2026-05 | docs.claude.com/en/docs/claude-code/slash-commands | claude-code-guide, misconceptions |
| Hooks (PreToolUse / PostToolUse / SessionStart / Stop / UserPromptSubmit) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/hooks | claude-code-guide, starter-skills, hooks-pack, misconceptions |
| Settings hierarchy (user / project / local) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/settings | claude-code-guide, hooks-pack |
| Output styles | GA | 2026-05 | docs.claude.com/en/docs/claude-code/output-styles | claude-code-guide |
| Background tasks / scheduled routines | GA | 2026-05 | docs.claude.com/en/docs/claude-code/background-tasks | claude-code-guide, starter-skills |
| IDE integrations (VS Code, JetBrains) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/ide-integrations | claude-code-guide |
| Headless mode (CI / non-interactive) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/headless | claude-code-guide, hooks-pack |

---

## Procurement paths

| Path | Status | As-of | Notes |
|---|---|---|---|
| Direct API (`console.anthropic.com`) | GA | 2026-05 | Fastest model availability. Default. |
| Amazon Bedrock | GA | 2026-05 | Hyperscaler procurement. Model version lag possible. |
| Google Vertex AI | GA | 2026-05 | Hyperscaler procurement. Model version lag possible. |

---

## Compliance + governance posture

| Item | Status | As-of | Doc anchor | Notes | Used in artifacts |
|---|---|---|---|---|---|
| No-train (commercial API + Console default) | Confirmed | 2026-05 | privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training | Verify policy version when signing. Re-check quarterly. Consumer plans (Free/Pro/Max) are a separate policy surface. | governance-overlay, anti-use-cases, briefing, misconceptions |
| Standard retention (commercial API) | Confirmed | 2026-05 | privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data | 30-day backend deletion default. AUP-flagged: inputs/outputs up to 2 years, T&S classifier scores up to 7 years. Feedback: 5 years. | governance-overlay |
| Zero Data Retention (ZDR) | Available (enterprise, approval required) | 2026-05 | platform.claude.com/docs/en/build-with-claude/api-and-data-retention | Covers Messages + Token Counting APIs, Claude Code (Commercial org key, or Enterprise w/ ZDR). T&S classifier results still retained. Consumer plans + Teams/Enterprise UI not eligible. | governance-overlay, anti-use-cases, build-vs-buy |
| HIPAA-ready API access | GA | 2026-05 | platform.claude.com/docs/en/build-with-claude/api-and-data-retention#hipaa-readiness | Separate from BAA. HIPAA-enabled orgs get 400 error on non-eligible features. ZDR no longer prerequisite. | governance-overlay, anti-use-cases, build-vs-buy |
| BAA (HIPAA workloads) | Available | 2026-05 | privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers | Covers first-party API + Enterprise plans (chat, projects, artifacts, file creation w/o network, voice). Excludes: Workbench, Console, Free/Pro/Max/Team, beta (Cowork, Claude for Office). Per-feature eligibility — verify Implementation Guide. | governance-overlay, anti-use-cases, build-vs-buy |
| Data residency — `inference_geo` | GA | 2026-05 | platform.claude.com/docs/en/build-with-claude/data-residency | Per-request inference geo (`global` default, or `us`). Opus 4.6+. First-party API only — Bedrock/Vertex use their own region selection. | governance-overlay, anti-use-cases, build-vs-buy |
| Data residency — Workspace geo | GA | 2026-05 | platform.claude.com/docs/en/build-with-claude/data-residency | Controls at-rest storage and endpoint processing (image transcoding, code execution). Set in Console at workspace level. | governance-overlay |
| SOC 2 Type I & Type II | Held | 2026-05 | trust.anthropic.com | Refresh annual. Request current report from Trust Portal. | governance-overlay |
| ISO 27001:2022 | Held | 2026-05 | trust.anthropic.com | Information Security Management. | governance-overlay |
| ISO/IEC 42001:2023 | Held | 2026-05 | trust.anthropic.com | AI Management Systems — AI-specific certification. | governance-overlay |

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
