# Claude Platform Feature Inventory

**Single source of truth.** All artifacts in this repo reference this file. Update this first, propagate second.

**Last verified:** 2026-06-29 against [docs.claude.com](https://docs.claude.com) and [anthropic.com/pricing](https://www.anthropic.com/pricing). **Opus 4.8 is the current top GA / deployable tier. A next-gen line — Claude Fable 5 + Mythos 5 — now exists above the 4.x family but is not GA-deployable (Fable 5 unavailable, Mythos 5 invite-only); operational recs stay on Opus 4.8.** Opus/Sonnet/Haiku pricing + IDs re-verified unchanged this cycle.

**Refresh cadence:** weekly. Bump status, as-of dates, and pricing rows. Cross-check `Used in` column to find every artifact that needs a touch.

> ⚠ **Verification posture.** Status (GA / beta / preview) and surface details drift. Anything below older than 14 days from "Last verified" should be re-checked before publishing changes downstream.

---

## Models

| Model | Tier | Status | As-of | Notes |
|---|---|---|---|---|
| Fable 5 | Next-gen | **Unavailable** | 2026-06 | `claude-fable-5`. Anthropic's most capable *widely released* model (most demanding reasoning + long-horizon agentic work). **Currently unavailable** — gated access ([anthropic.com/news/fable-mythos-access](https://www.anthropic.com/news/fable-mythos-access)). 1M context; adaptive thinking always-on (no extended thinking). **Not deployable for enterprise pilots yet — this repo's operational recs stay on Opus 4.8.** Acknowledged so buyers aren't blindsided; revisit when GA. |
| Mythos 5 | Next-gen | **Invite-only** | 2026-06 | `claude-mythos-5`. Successor to Mythos Preview; available only through invite-only [Project Glasswing](https://anthropic.com/glasswing). Limited availability on Bedrock/Vertex. Not generally usable — informational only. |
| Opus 4.8 | Top GA | GA | 2026-06 | `claude-opus-4-8`. Most capable GA / **deployable** model; top Opus-tier. Builds on 4.7: better long-horizon agentic coding, fewer compactions + better compaction recovery, effort-calibrated reasoning. 1M context default. Adaptive thinking only (`budget_tokens` → 400); use `effort` param. Rejects `temperature`/`top_p`/`top_k` (400). Fast mode in research preview. Min cacheable prompt 1,024 tokens. |
| Opus 4.7 | Top (prev) | GA | 2026-05 | `claude-opus-4-7`. Previous top tier, still available. Same adaptive-thinking + no-sampling-params constraints as 4.8. Min cacheable prompt 4,096 tokens. |
| Opus 4.6 | Top (prev) | GA | 2026-05 | Older top tier. Still available; adaptive thinking recommended, manual deprecated. |
| Sonnet 4.6 | Mid | GA | 2026-05 | Workhorse. Default for production copilots + agentic loops. |
| Haiku 4.5 | Fast | GA | 2026-05 | Triage, batch, high-volume. ~3× cheaper than Sonnet (5× vs Opus). |

**Pricing (per million tokens, USD, as-of 2026-05-29 — verified against anthropic.com/pricing):**

| Model | Input | Output | Cache read | Cache write 5m | Cache write 1h |
|---|---|---|---|---|---|
| Fable 5 (unavailable) | $10.00 | $50.00 | $1.00 | $12.50 | n/a |
| Opus 4.8 | $5.00 | $25.00 | $0.50 | $6.25 | $10.00 |
| Opus 4.7 | $5.00 | $25.00 | $0.50 | $6.25 | $10.00 |
| Opus 4.6 | $5.00 | $25.00 | $0.50 | $6.25 | $10.00 |
| Sonnet 4.6 | $3.00 | $15.00 | $0.30 | $3.75 | $6.00 |
| Haiku 4.5 | $1.00 | $5.00 | $0.10 | $1.25 | $2.00 |

**Opus 4.8 pricing is identical to 4.7** — the model upgrade does not move cost. Cost-calculator headline Opus tier relabelled 4.7 → 4.8; numbers unchanged. Batch (50%): Opus $2.50/$12.50, Sonnet $1.50/$7.50, Haiku $0.50/$2.50. See [`../artifacts/cost-calculator.html`](../artifacts/cost-calculator.html).

**Fable 5 is listed for awareness, not modelled.** At ~2× Opus input / output it would change cost sizing materially, but it is currently unavailable — the cost-calculator deliberately omits it until GA so estimates reflect what an enterprise can actually deploy. Re-evaluate adding a Fable 5 preset when status flips to GA.

---

## Claude.ai subscription plans (seat surface — distinct from the API)

The seat surface is billed per user, separate from per-token API usage. **A subscription never unlocks API quota.** Prices list/USD, exclude tax, "subject to change at Anthropic's discretion" — verify at [anthropic.com/pricing](https://www.anthropic.com/pricing).

| Plan | Price (list) | Seats | Claude Code | SSO / SCIM | No-train default | BAA | As-of | Used in artifacts |
|---|---|---|---|---|---|---|---|---|
| Free | $0 | 1 | ✗ | ✗ / ✗ | ✗ (consumer surface) | ✗ | 2026-06 | subscription-selection, cost-calculator |
| Pro | $17/mo annual ($20 monthly) | 1 | ✓ | ✗ / ✗ | ✗ (consumer) | ✗ | 2026-06 | subscription-selection, cost-calculator, misconceptions |
| Max | from $100/mo (5× or 20× Pro) | 1 | ✓ | ✗ / ✗ | ✗ (consumer) | ✗ | 2026-06 | subscription-selection, cost-calculator, misconceptions |
| Team | $20 std · $100 premium /seat/mo annual ($25 / $125 monthly) | 5–150 | ✓ | ✓ / ✗ | ✓ | ✗ | 2026-06 | subscription-selection, cost-calculator, governance-overlay |
| Enterprise | Custom (sales + self-serve) | Org-wide | ✓ | ✓ / ✓ | ✓ | ✓ | 2026-06 | subscription-selection, governance-overlay |

**Seat-vs-API:** an engineering team on Claude Code typically needs both a seat plan (interactive) and API credits (production inference) — two invoices. Claude Code requires a paid seat (Pro+) **or** API credits; Free does not include it. BAA covers first-party API + Enterprise only (excludes Free/Pro/Max/Team — see no-train + BAA rows below). SCIM/audit shown as Enterprise-tier [inferred from plan-compare matrix; verify per contract]. Source: [anthropic.com/pricing](https://www.anthropic.com/pricing), verified 2026-06-29. See [`../artifacts/subscription-selection-guide.md`](../artifacts/subscription-selection-guide.md).

---

## Platform features (Anthropic API)

| Feature | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Prompt caching | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/prompt-caching | calculator, matrix, briefing, arch, eval-pack, misconceptions, data-advisory, roi-worksheet |
| Extended thinking | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/extended-thinking | matrix, arch |
| Tool use | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/tool-use | matrix, arch, eval-pack, agentic-threat-model |
| Computer use 2.0 | beta | 2026-05 | docs.claude.com/en/docs/agents-and-tools/computer-use | matrix, arch, misconceptions, agentic-threat-model |
| Files API | beta | 2026-05 | docs.claude.com/en/docs/build-with-claude/files | matrix, arch, eval-pack |
| Citations | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/citations | matrix, arch, eval-pack |
| Batch API | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/batch-processing | calculator, matrix, arch, eval-pack, misconceptions, data-advisory, roi-worksheet |
| Memory tool | beta | 2026-05 | docs.claude.com/en/docs/agents-and-tools/memory | matrix, arch |
| Web search tool (server-side) | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/web-search-tool | arch:rag, claude-code-guide |
| Code execution tool (server-side) | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/code-execution | arch:agent, claude-code-guide, eval-pack |

**Token economics** — see [`../artifacts/cost-calculator.html`](../artifacts/cost-calculator.html). Cache read ≈ 10% of input. Cache write 5m ≈ 125% of input. Cache write 1h ≈ 200% of input. Batch ≈ 50% of all rates.

**Minimum cacheable prompt** — Opus 4.8 lowered to **1,024 tokens** (was 4,096 on Opus 4.7 / 4.6). Sonnet 4.6 + Haiku 4.5 are 1,024. Prompts shorter than the floor are processed uncached with no error. Lower floor on 4.8 = more small prompts become cache-eligible. See [`../artifacts/data-advisory.md`](../artifacts/data-advisory.md) cache-eligibility shape.

**Extended thinking note** — Opus 4.7 and 4.8 support **adaptive thinking only**: `thinking: {"type": "adaptive"}` plus the `effort` parameter to control depth. Setting `thinking: {"type": "enabled", "budget_tokens": N}` returns HTTP 400. They also reject non-default `temperature` / `top_p` / `top_k` (400). Opus 4.6 and earlier: manual `budget_tokens` still works but adaptive is recommended.

**Fast mode (Opus 4.8)** — research preview on the Claude API. Lower-latency response path. Preview status — do not pin production SLAs to it. Doc anchor: docs.claude.com/en/docs/about-claude/models/whats-new-claude-4-8.

---

## Higher-level abstractions

| Capability | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Skills | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/skills | matrix, playbook, arch, claude-code-guide, starter-skills, eval-pack, misconceptions, operating-model, maturity-model |
| MCP (Model Context Protocol) | GA | 2026-05 | modelcontextprotocol.io | matrix, playbook, arch, claude-code-guide, starter-skills, mcp-pack, agentic-threat-model, operating-model |
| Agent SDK | GA | 2026-05 | docs.claude.com/en/api/agent-sdk | matrix, arch, claude-code-guide, multi-agent-patterns, maturity-model |
| Plugins (bundled commands + skills + hooks + MCP servers) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/plugins | matrix, arch, claude-code-guide, starter-skills, eval-pack |
| Sub-agents (Task tool / parallel agents in Claude Code) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/sub-agents | claude-code-guide, arch:code, multi-agent-patterns |

---

## Claude Code (CLI) surface

| Surface | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Claude Code CLI | GA | 2026-05 | docs.claude.com/en/docs/claude-code | claude-code-guide, misconceptions, workforce-change, rollout-kickoff-kit |
| Slash commands | GA | 2026-05 | docs.claude.com/en/docs/claude-code/slash-commands | claude-code-guide, misconceptions |
| Hooks (PreToolUse / PostToolUse / SessionStart / Stop / UserPromptSubmit) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/hooks | claude-code-guide, starter-skills, hooks-pack, misconceptions, agentic-threat-model |
| Settings hierarchy (user / project / local) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/settings | claude-code-guide, hooks-pack |
| Output styles | GA | 2026-05 | docs.claude.com/en/docs/claude-code/output-styles | claude-code-guide |
| Background tasks / scheduled routines | GA | 2026-05 | docs.claude.com/en/docs/claude-code/background-tasks | claude-code-guide, starter-skills |
| IDE integrations (VS Code, JetBrains) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/ide-integrations | claude-code-guide |
| Headless mode (CI / non-interactive) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/headless | claude-code-guide, hooks-pack |

---

## Product surfaces (Claude.ai apps)

Seat-plan product surfaces beyond chat. Plan gating + governance flags drive the rollout decision — see [`../artifacts/surface-rollout-matrix.md`](../artifacts/surface-rollout-matrix.md) and (for Cowork) [`../artifacts/cowork-adoption-guide.md`](../artifacts/cowork-adoption-guide.md).

| Surface | Status | Plan gate | As-of | Doc anchor | Governance flag | Used in artifacts |
|---|---|---|---|---|---|---|
| Cowork (desktop agent) | GA (paid plans) | Pro / Max / Team / Enterprise; desktop app (mac/Win), not web/mobile | 2026-06 | support.claude.com/en/articles/13345190-get-started-with-claude-cowork | Takes real actions on local files; folder-scoped + egress-controlled + review-before-act; isolated VM for code; enterprise admin controls (feature access, spend, usage, private plugin marketplace). **Not BAA-covered.** | cowork-adoption-guide, surface-rollout-matrix, workforce-change, rollout-kickoff-kit, user-mindset-cheatsheet, user-mindset-mindmap, user-mindset-cheatsheet-color |
| Claude Design | Beta (Anthropic Labs) | Team / Enterprise (org toggle, custom-role gated) | 2026-06 | support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans | Uploaded assets stored persistently; **no data residency support**; **not BAA-covered (beta)**; Anthropic publishes recommended rollout phases. | surface-rollout-matrix |
| Projects | GA | All plans (Free capped at 5 projects); RAG + sharing + org instructions on paid / Team+ | 2026-06 | support.claude.com/en/articles/9517075-what-are-projects | RAG auto-scales knowledge ~10× on paid; org-wide sharing is a data-leak vector (use can-use/can-edit perms, disable public projects); **BAA-covered on Enterprise** (w/ admin HIPAA activation). | surface-rollout-matrix, user-mindset-cheatsheet, user-mindset-cheatsheet-color |

**Surface drift caught 2026-06-29:** **Cowork graduated** from the beta it was previously logged as — now GA on all paid plans, with enterprise admin controls shipped (Apr 2026); still **BAA-excluded**. **Claude Design** is a real Team/Enterprise surface (beta, under Anthropic Labs), also BAA-excluded with no residency. Verified against support.claude.com + privacy.claude.com.

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
| No-train (commercial API + Console default) | Confirmed | 2026-05 | privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training | Verify policy version when signing. Re-check quarterly. Consumer plans (Free/Pro/Max) are a separate policy surface. | governance-overlay, anti-use-cases, briefing, misconceptions, enterprise-data-boundaries, procurement-pack |
| Standard retention (commercial API) | Confirmed | 2026-05 | privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data | 30-day backend deletion default. AUP-flagged: inputs/outputs up to 2 years, T&S classifier scores up to 7 years. Feedback: 5 years. | governance-overlay, enterprise-data-boundaries |
| Zero Data Retention (ZDR) | Available (enterprise, approval required) | 2026-05 | platform.claude.com/docs/en/build-with-claude/api-and-data-retention | Covers Messages + Token Counting APIs, Claude Code (Commercial org key, or Enterprise w/ ZDR). T&S classifier results still retained. Consumer plans + Teams/Enterprise UI not eligible. | governance-overlay, anti-use-cases, build-vs-buy, enterprise-data-boundaries, procurement-pack |
| HIPAA-ready API access | GA | 2026-05 | platform.claude.com/docs/en/build-with-claude/api-and-data-retention#hipaa-readiness | Separate from BAA. HIPAA-enabled orgs get 400 error on non-eligible features. ZDR no longer prerequisite. | governance-overlay, anti-use-cases, build-vs-buy |
| BAA (HIPAA workloads) | Available | 2026-06 | privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers | Covers first-party API + Enterprise plans. **Enterprise is not automatic — an admin must activate HIPAA compliance (admin settings → Data & Privacy) and sign the BAA.** Covered Enterprise features: Chat, Projects, Artifacts, file creation & code execution (excl. network/external sites), Voice, Web search, Research (eligible list grows — verify at signing; Skills was flagged as possibly added 2026-06-29 but is unconfirmed first-hand — treat as verify-at-signing, not asserted covered). 3rd-party integrations (MCPs/Connectors/Enterprise Search/Claude in Chrome) available but their 3rd-party data flows are not covered. **Excludes: Workbench/Console, Free/Pro/Max/Team, Cowork, and beta features (Claude in Office, Claude Design).** Per-feature eligibility — verify Implementation Guide. Re-verified 2026-06-29 (source updated this week). | governance-overlay, anti-use-cases, build-vs-buy, surface-rollout-matrix, cowork-adoption-guide, enterprise-data-boundaries, procurement-pack, agentic-threat-model |
| Data residency — `inference_geo` | GA | 2026-06 | platform.claude.com/docs/en/manage-claude/data-residency | Per-request inference geo (`global` default, or `us`). Opus 4.6+ and Sonnet 4.6+ (Haiku 4.5 and earlier-tier models return 400). First-party API + Claude Platform on AWS only — Bedrock/Vertex/Azure AI Foundry use their own region selection. | governance-overlay, anti-use-cases, build-vs-buy, enterprise-data-boundaries |
| Data residency — Workspace geo | GA | 2026-06 | platform.claude.com/docs/en/manage-claude/data-residency | Controls at-rest storage and endpoint processing (image transcoding, code execution). Set in Console at workspace level. | governance-overlay, enterprise-data-boundaries |
| SOC 2 Type I & Type II | Held | 2026-05 | trust.anthropic.com | Refresh annual. Request current report from Trust Portal. | governance-overlay, procurement-pack |
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
