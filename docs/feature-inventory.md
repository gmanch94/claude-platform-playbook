# Claude Platform Feature Inventory

**Single source of truth.** All artifacts in this repo reference this file. Update this first, propagate second.

**Last verified:** 2026-06-01 against [platform.claude.com/docs](https://platform.claude.com/docs) and [anthropic.com/pricing](https://www.anthropic.com/pricing). Opus 4.8 remains current top tier. Memory tool confirmed GA. Claude Managed Agents, Structured outputs, Compaction API, and Advisor tool added.

> **Doc URL migration (2025-11-19):** `docs.claude.com` permanently redirects (301) to `platform.claude.com/docs`. Rows updated during this refresh use the canonical `platform.claude.com/docs` base. Rows not yet verified against the new path still show the `docs.claude.com` form — all redirects are functional.

**Refresh cadence:** weekly. Bump status, as-of dates, and pricing rows. Cross-check `Used in` column to find every artifact that needs a touch.

> ⚠ **Verification posture.** Status (GA / beta / preview) and surface details drift. Anything below older than 14 days from "Last verified" should be re-checked before publishing changes downstream.

---

## Models

| Model | Tier | Status | As-of | Notes |
|---|---|---|---|---|
| Opus 4.8 | Top | GA | 2026-05 | `claude-opus-4-8`. Most capable GA model. Builds on 4.7: better long-horizon agentic coding, fewer compactions + better compaction recovery, effort-calibrated reasoning. 1M context default. Adaptive thinking only (`budget_tokens` → 400); use `effort` param. Rejects `temperature`/`top_p`/`top_k` (400). Fast mode in research preview. Min cacheable prompt 1,024 tokens. |
| Opus 4.7 | Top (prev) | GA | 2026-05 | `claude-opus-4-7`. Previous top tier, still available. Same adaptive-thinking + no-sampling-params constraints as 4.8. Min cacheable prompt 4,096 tokens. |
| Opus 4.6 | Top (prev) | GA | 2026-05 | Older top tier. Still available; adaptive thinking recommended, manual deprecated. |
| Sonnet 4.6 | Mid | GA | 2026-05 | Workhorse. Default for production copilots + agentic loops. |
| Haiku 4.5 | Fast | GA | 2026-05 | Triage, batch, high-volume. ~5–15× cheaper than Sonnet. |

**Pricing (per million tokens, USD, as-of 2026-05-29 — verified against anthropic.com/pricing):**

| Model | Input | Output | Cache read | Cache write 5m | Cache write 1h |
|---|---|---|---|---|---|
| Opus 4.8 | $5.00 | $25.00 | $0.50 | $6.25 | $10.00 |
| Opus 4.7 | $5.00 | $25.00 | $0.50 | $6.25 | $10.00 |
| Opus 4.6 | $5.00 | $25.00 | $0.50 | $6.25 | $10.00 |
| Sonnet 4.6 | $3.00 | $15.00 | $0.30 | $3.75 | $6.00 |
| Haiku 4.5 | $1.00 | $5.00 | $0.10 | $1.25 | $2.00 |

**Opus 4.8 pricing is identical to 4.7** — the model upgrade does not move cost. Cost-calculator headline Opus tier relabelled 4.7 → 4.8; numbers unchanged. Batch (50%): Opus $2.50/$12.50, Sonnet $1.50/$7.50, Haiku $0.50/$2.50. See [`../artifacts/cost-calculator.html`](../artifacts/cost-calculator.html).

---

## Platform features (Anthropic API)

| Feature | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Prompt caching | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/prompt-caching | calculator, matrix, briefing, arch, eval-pack, misconceptions, data-advisory |
| Extended thinking | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/extended-thinking | matrix, arch |
| Tool use | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/tool-use | matrix, arch, eval-pack |
| Computer use 2.0 | beta | 2026-05 | docs.claude.com/en/docs/agents-and-tools/computer-use | matrix, arch, misconceptions |
| Files API | beta | 2026-05 | docs.claude.com/en/docs/build-with-claude/files | matrix, arch, eval-pack |
| Citations | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/citations | matrix, arch, eval-pack |
| Batch API | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/batch-processing | calculator, matrix, arch, eval-pack, misconceptions, data-advisory |
| Memory tool | GA | 2026-06 | platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool | matrix, arch |
| Web search tool (server-side) | GA | 2026-06 | platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool | arch:rag, claude-code-guide |
| Code execution tool (server-side) | GA | 2026-06 | platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool | arch:agent, claude-code-guide, eval-pack |
| Structured outputs | GA | 2026-06 | platform.claude.com/docs/en/build-with-claude/structured-outputs | matrix |
| Compaction API | beta | 2026-06 | platform.claude.com/docs/en/build-with-claude/compaction | arch |
| Advisor tool | beta | 2026-06 | platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool | matrix, arch |

**Token economics** — see [`../artifacts/cost-calculator.html`](../artifacts/cost-calculator.html). Cache read ≈ 10% of input. Cache write 5m ≈ 125% of input. Cache write 1h ≈ 200% of input. Batch ≈ 50% of all rates.

**Minimum cacheable prompt** — Opus 4.8 lowered to **1,024 tokens** (was 4,096 on Opus 4.7 / 4.6). Sonnet 4.6 + Haiku 4.5 are 1,024. Prompts shorter than the floor are processed uncached with no error. Lower floor on 4.8 = more small prompts become cache-eligible. See [`../artifacts/data-advisory.md`](../artifacts/data-advisory.md) cache-eligibility shape.

**Extended thinking note** — Opus 4.7 and 4.8 support **adaptive thinking only**: `thinking: {"type": "adaptive"}` plus the `effort` parameter to control depth. Setting `thinking: {"type": "enabled", "budget_tokens": N}` returns HTTP 400. They also reject non-default `temperature` / `top_p` / `top_k` (400). Opus 4.6 and earlier: manual `budget_tokens` still works but adaptive is recommended.

**Fast mode (Opus 4.8)** — research preview on the Claude API. Lower-latency response path. Preview status — do not pin production SLAs to it. Doc anchor: docs.claude.com/en/docs/about-claude/models/whats-new-claude-4-8.

---

## Higher-level abstractions

| Capability | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Skills | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/skills | matrix, playbook, arch, claude-code-guide, starter-skills, eval-pack, misconceptions |
| MCP (Model Context Protocol) | GA | 2026-05 | modelcontextprotocol.io | matrix, playbook, arch, claude-code-guide, starter-skills, mcp-pack |
| Agent SDK | GA | 2026-05 | docs.claude.com/en/api/agent-sdk | matrix, arch, claude-code-guide, multi-agent-patterns |
| Plugins (bundled commands + skills + hooks + MCP servers) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/plugins | matrix, arch, claude-code-guide, starter-skills, eval-pack |
| Sub-agents (Task tool / parallel agents in Claude Code) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/sub-agents | claude-code-guide, arch:code, multi-agent-patterns |
| Claude Managed Agents | beta | 2026-06 | platform.claude.com/docs/en/managed-agents/overview | governance-overlay |

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
| Workflows (multi-step agentic plans) | research preview | 2026-06 | code.claude.com/docs | claude-code-guide |

---

## Procurement paths

| Path | Status | As-of | Notes |
|---|---|---|---|
| Direct API (`console.anthropic.com`) | GA | 2026-05 | Fastest model availability. Default. |
| Amazon Bedrock | GA | 2026-05 | Hyperscaler procurement. Model version lag possible. |
| Google Vertex AI | GA | 2026-05 | Hyperscaler procurement. Model version lag possible. |
| Microsoft Azure AI Foundry | GA | 2026-05 | Claude models via Azure marketplace. Enterprise procurement path for Microsoft shops. |
| Claude Platform on AWS | GA | 2026-05 | Native AWS marketplace listing. Separate from Bedrock; direct billing via AWS. |

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

`© gmanch94 · CC-BY-4.0 · As of 2026-06.`
