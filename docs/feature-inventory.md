# Claude Platform Feature Inventory

**Single source of truth.** All artifacts in this repo reference this file. Update this first, propagate second.

**Last verified:** 2026-07-06 against [platform.claude.com](https://platform.claude.com/docs/en) and [anthropic.com/pricing](https://www.anthropic.com/pricing). **Fable 5 access restored 2026-07-01** — status flipped from Unavailable to GA (launched June 9; temporarily suspended; restored July 1 per [anthropic.com/news/redeploying-fable-5-mythos-5](https://www.anthropic.com/news/redeploying-fable-5-mythos-5)); see Models table. **Sonnet 5 `inference_geo` confirmed** — platform pricing doc explicitly covers "Sonnet 4.6 and later models," which includes Sonnet 5. **Sonnet 5 introductory cache rates corrected** — pricing page lists 5m write $2.50, 1h write $4.00, cache read $0.20 per MTok (previously marked n/a in this file). **docs.claude.com redirects to platform.claude.com** — existing doc anchors still resolve via redirect; source URL updated in this header. Opus/Haiku pricing unchanged. **2026-07-06 (ops-pack addition):** five new rows added for the run-state artifacts — Admin Usage/Cost API, Console workspaces + spend limits, service tiers, Claude Code OTel monitoring, model-deprecation lifecycle. These doc anchors were NOT part of the live verification pass above — flagged verify-live in-row; confirm at the next monthly refresh.

**Refresh cadence:** monthly (first Monday — scheduled routine). Bump status, as-of dates, and pricing rows. Cross-check `Used in` column to find every artifact that needs a touch.

> ⚠ **Verification posture.** Status (GA / beta / preview) and surface details drift. Anything below older than 14 days from "Last verified" should be re-checked before publishing changes downstream.

---

## Models

| Model | Tier | Status | As-of | Notes |
|---|---|---|---|---|
| Fable 5 | Next-gen | **GA** | 2026-07 | `claude-fable-5`. Anthropic's most capable *widely released* model (most demanding reasoning + long-horizon agentic work). **GA on all platforms** — launched June 9 2026; access temporarily suspended; **restored July 1 2026** ([anthropic.com/news/redeploying-fable-5-mythos-5](https://www.anthropic.com/news/redeploying-fable-5-mythos-5)). 1M context; adaptive thinking always-on (no extended thinking). **Deployable** — validate quality delta vs Opus 4.8 in eval before paying ~2× Opus pricing ($10/$50 per MTok). Cost-calculator now includes Fable 5 as a selectable model-mix tier (defaults to 0% — hardest-task subset only). Requires 30-day data retention — **not ZDR-eligible**. |
| Mythos 5 | Next-gen | **Invite-only** | 2026-06 | `claude-mythos-5`. Successor to Mythos Preview; available only through invite-only [Project Glasswing](https://anthropic.com/glasswing). Limited availability on Bedrock/Vertex. Not generally usable — informational only. |
| Opus 4.8 | Top GA | GA | 2026-06 | `claude-opus-4-8`. Most capable GA / **deployable** model; top Opus-tier. Builds on 4.7: better long-horizon agentic coding, fewer compactions + better compaction recovery, effort-calibrated reasoning. 1M context default. Adaptive thinking only (`budget_tokens` → 400); use `effort` param. Rejects `temperature`/`top_p`/`top_k` (400). Fast mode in research preview. Min cacheable prompt 1,024 tokens. |
| Opus 4.7 | Top (prev) | GA | 2026-05 | `claude-opus-4-7`. Previous top tier, still available. Same adaptive-thinking + no-sampling-params constraints as 4.8. Min cacheable prompt 4,096 tokens. |
| Opus 4.6 | Top (prev) | GA | 2026-05 | Older top tier. Still available; adaptive thinking recommended, manual deprecated. |
| Sonnet 5 | Mid | GA | 2026-07 | `claude-sonnet-5`. Workhorse successor to Sonnet 4.6 — performance close to Opus 4.8 at lower price, substantial gains in reasoning/tool-use/coding/knowledge work. Default model for Free + Pro plans; available Max/Team/Enterprise, Claude Code, Claude Platform. Default for production copilots + agentic loops. Updated tokenizer (like Opus 4.7's): same input maps to ~1.0–1.35× more tokens. **`inference_geo` confirmed** — platform pricing doc (verified 2026-07-06) explicitly covers "Sonnet 4.6 and later models"; 1.1× multiplier applies when `inference_geo: "us"`. Source: [anthropic.com/news/claude-sonnet-5](https://www.anthropic.com/news/claude-sonnet-5). |
| Sonnet 4.6 | Mid (prev) | GA | 2026-05 | Previous mid tier, still available. No deprecation announced. `inference_geo`-eligible (confirmed). |
| Haiku 4.5 | Fast | GA | 2026-05 | Triage, batch, high-volume. ~3× cheaper than Sonnet (5× vs Opus). |

**Pricing (per million tokens, USD, as-of 2026-07-06 — verified against platform.claude.com/docs/en/about-claude/pricing):**

| Model | Input | Output | Cache read | Cache write 5m | Cache write 1h |
|---|---|---|---|---|---|
| Fable 5 | $10.00 | $50.00 | $1.00 | $12.50 | $20.00 |
| Opus 4.8 | $5.00 | $25.00 | $0.50 | $6.25 | $10.00 |
| Opus 4.7 | $5.00 | $25.00 | $0.50 | $6.25 | $10.00 |
| Opus 4.6 | $5.00 | $25.00 | $0.50 | $6.25 | $10.00 |
| Sonnet 5 (standard, from 2026-09-01) | $3.00 | $15.00 | $0.30 | $3.75 | $6.00 |
| Sonnet 5 (introductory, through 2026-08-31) | $2.00 | $10.00 | $0.20 | $2.50 | $4.00 |
| Sonnet 4.6 | $3.00 | $15.00 | $0.30 | $3.75 | $6.00 |
| Haiku 4.5 | $1.00 | $5.00 | $0.10 | $1.25 | $2.00 |

**Opus 4.8 pricing is identical to 4.7** — the model upgrade does not move cost. Cost-calculator headline Opus tier relabelled 4.7 → 4.8; numbers unchanged. Batch (50%): Opus $2.50/$12.50, Sonnet $1.50/$7.50, Haiku $0.50/$2.50. See [`../artifacts/cost-calculator.html`](../artifacts/cost-calculator.html).

**Sonnet 5's standard sticker price is identical to Sonnet 4.6** — same $3/$15 per MTok from 2026-09-01. Introductory pricing ($2/$10 per MTok) runs through 2026-08-31 and is calibrated to be roughly cost-neutral against the tokenizer change. That tokenizer change means the same input now maps to ~1.0–1.35× more tokens than under 4.6 — budget the effective cost, not just the sticker price, especially right after the introductory window ends.

**Fable 5 is now GA** (restored 2026-07-01) at $10/$50 per MTok. The cost-calculator now includes Fable 5 as a selectable model-mix tier plus a "Frontier reasoning" preset (defaults to 0% of the mix — route only the hardest-task subset, and validate the quality delta vs Opus 4.8 in eval before you do). Note: Fable 5 requires 30-day data retention and is not ZDR-eligible.

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
| Prompt caching | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/prompt-caching | calculator, matrix, briefing, arch, eval-pack, misconceptions, data-advisory, roi-worksheet, enterprise-data-boundaries, token-budget, exit-portability |
| Extended thinking | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/extended-thinking | matrix, arch, claude-product-101 |
| Tool use | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/tool-use | matrix, arch, eval-pack, agentic-threat-model |
| Computer use 2.0 | beta | 2026-05 | docs.claude.com/en/docs/agents-and-tools/computer-use | matrix, arch, misconceptions, agentic-threat-model, enterprise-data-boundaries, enterprise-architecture |
| Files API | beta | 2026-05 | docs.claude.com/en/docs/build-with-claude/files | matrix, arch, eval-pack, enterprise-data-boundaries, enterprise-architecture |
| Citations | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/citations | matrix, arch, eval-pack |
| Batch API | GA | 2026-05 | docs.claude.com/en/docs/build-with-claude/batch-processing | calculator, matrix, arch, eval-pack, misconceptions, data-advisory, roi-worksheet, enterprise-data-boundaries, token-budget |
| Memory tool | beta | 2026-05 | docs.claude.com/en/docs/agents-and-tools/memory | matrix, arch, enterprise-data-boundaries, enterprise-architecture |
| Web search tool (server-side) | GA | 2026-07 | docs.claude.com/en/docs/build-with-claude/tool-use/web-search-tool | arch:rag, claude-code-guide, enterprise-data-boundaries, claude-product-101 |
| Code execution tool (server-side) | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/code-execution | arch:agent, claude-code-guide, eval-pack, enterprise-data-boundaries |
| Admin API — Usage & Cost reports | GA | 2026-07 | platform.claude.com/docs/en/api/usage-cost-api | token-budget, observability, value-realization |
| Console workspaces + spend limits | GA | 2026-07 | platform.claude.com/docs/en/api/administration-api | token-budget, observability, enterprise-deployment-guide |
| Service tiers (priority / standard / batch) | GA | 2026-07 | platform.claude.com/docs/en/api/service-tiers | token-budget |

**Ops rows (added 2026-07-06)** — Usage & Cost Admin API returns org-level token/cost rollups by workspace, API key, and model; it requires an **Admin API key** (org role), not a workspace key. Workspaces are the natural budget boundary (per-workspace keys, rate limits, spend caps — verify cap granularity in Console). Priority tier = committed-capacity purchase for latency-sensitive prod; verify current terms before citing in a budget. All three doc anchors sourced from platform docs knowledge, **not yet re-verified live — check at next monthly refresh.**

**Token economics** — see [`../artifacts/cost-calculator.html`](../artifacts/cost-calculator.html). Cache read ≈ 10% of input. Cache write 5m ≈ 125% of input. Cache write 1h ≈ 200% of input. Batch ≈ 50% of all rates.

**Minimum cacheable prompt** — Opus 4.8 lowered to **1,024 tokens** (was 4,096 on Opus 4.7 / 4.6). Sonnet 4.6 + Haiku 4.5 are 1,024. **Sonnet 5's floor isn't stated in launch materials — verify rather than assuming 1,024 carries over**, especially given its tokenizer change (same input maps to more tokens). Prompts shorter than the floor are processed uncached with no error. Lower floor on 4.8 = more small prompts become cache-eligible. See [`../artifacts/data-advisory.md`](../artifacts/data-advisory.md) cache-eligibility shape.

**Extended thinking note** — Opus 4.7 and 4.8 support **adaptive thinking only**: `thinking: {"type": "adaptive"}` plus the `effort` parameter to control depth. Setting `thinking: {"type": "enabled", "budget_tokens": N}` returns HTTP 400. They also reject non-default `temperature` / `top_p` / `top_k` (400). Opus 4.6 and earlier: manual `budget_tokens` still works but adaptive is recommended.

**Fast mode (Opus 4.8)** — research preview on the Claude API. Lower-latency response path. Preview status — do not pin production SLAs to it. Doc anchor: docs.claude.com/en/docs/about-claude/models/whats-new-claude-4-8.

---

## Higher-level abstractions

| Capability | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Skills | GA | 2026-05 | docs.claude.com/en/docs/agents-and-tools/skills | matrix, playbook, arch, claude-code-guide, starter-skills, eval-pack, misconceptions, operating-model, maturity-model, exit-portability, claude-code-101 |
| MCP (Model Context Protocol) | GA | 2026-05 | modelcontextprotocol.io | matrix, playbook, arch, claude-code-guide, starter-skills, mcp-pack, agentic-threat-model, operating-model, enterprise-data-boundaries, exit-portability, claude-code-101, claude-code-enterprise-config |
| Agent SDK | GA | 2026-05 | docs.claude.com/en/api/agent-sdk | matrix, arch, claude-code-guide, multi-agent-patterns, maturity-model, enterprise-data-boundaries |
| Plugins (bundled commands + skills + hooks + MCP servers) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/plugins | matrix, arch, claude-code-guide, starter-skills, eval-pack |
| Sub-agents (Task tool / parallel agents in Claude Code) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/sub-agents | claude-code-guide, arch:code, multi-agent-patterns, claude-code-101 |

---

## Claude Code surface

| Surface | Status | As-of | Doc anchor | Used in artifacts |
|---|---|---|---|---|
| Claude Code (CLI / terminal) | GA | 2026-05 | docs.claude.com/en/docs/claude-code | claude-code-guide, misconceptions, workforce-change, rollout-kickoff-kit, enterprise-data-boundaries, claude-code-101, claude-code-enterprise-config |
| Desktop app (Mac / Windows) | GA | 2026-07 | docs.claude.com/en/docs/claude-code | claude-code-101, claude-product-101, claude-enterprise-architecture, surface-rollout-matrix |
| Web (claude.ai/code, runs in Anthropic cloud) | GA | 2026-07 | docs.claude.com/en/docs/claude-code | claude-code-101, claude-product-101, surface-rollout-matrix |
| Slash commands | GA | 2026-05 | docs.claude.com/en/docs/claude-code/slash-commands | claude-code-guide, misconceptions, claude-code-101 |
| Hooks (PreToolUse / PostToolUse / SessionStart / Stop / UserPromptSubmit) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/hooks | claude-code-guide, starter-skills, hooks-pack, misconceptions, agentic-threat-model, claude-code-101, claude-code-enterprise-config |
| Settings hierarchy (user / project / local) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/settings | claude-code-guide, hooks-pack, claude-code-101, claude-code-enterprise-config |
| Output styles | GA | 2026-05 | docs.claude.com/en/docs/claude-code/output-styles | claude-code-guide |
| Background tasks / scheduled routines | GA | 2026-05 | docs.claude.com/en/docs/claude-code/background-tasks | claude-code-guide, starter-skills, claude-code-101 |
| IDE integrations (VS Code, JetBrains) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/ide-integrations | claude-code-guide |
| Headless mode (CI / non-interactive) | GA | 2026-05 | docs.claude.com/en/docs/claude-code/headless | claude-code-guide, hooks-pack, claude-code-101 |
| Monitoring / OpenTelemetry export (`CLAUDE_CODE_ENABLE_TELEMETRY`; OTLP metrics + events; cardinality/privacy dials `OTEL_METRICS_INCLUDE_ACCOUNT_UUID`, `OTEL_LOG_USER_PROMPTS`; `otelHeadersHelper`) | GA | 2026-07 | platform.claude.com/docs/en/claude-code/monitoring-usage | observability, token-budget, claude-code-guide, claude-code-enterprise-config |
| Enterprise network config (corporate proxy, custom CA / mTLS, egress allowlist, `skipWebFetchPreflight`) | GA | 2026-07 | docs.claude.com/en/docs/claude-code/corporate-proxy | claude-code-enterprise-config |
| Cloud-provider auth + routing (`awsAuthRefresh` / `awsCredentialExport`, model-version pinning, `modelOverrides` inference-profile ARNs) | GA | 2026-07 | docs.claude.com/en/docs/claude-code/amazon-bedrock | claude-code-enterprise-config, claude-code-guide |
| Team analytics dashboards (claude.ai/analytics + Console usage/spend, role-gated) | GA | 2026-07 | docs.claude.com/en/docs/claude-code/analytics | claude-code-enterprise-config |
| Remote Control (drive a local session from claude.ai/code or the Claude mobile app) | Research preview | 2026-06 | code.claude.com/docs/en/remote-control | Execution + filesystem stay on the originating machine; the phone/browser is a control surface relayed through claude.ai — not a copy of your files. **claude.ai OAuth only** (no API keys). Team/Enterprise: off by default, an Owner must enable it; the admin toggle greys out if the org's data-retention/compliance config is incompatible (Anthropic's own words, not further specified). Per-device disable available via managed settings. | agentic-threat-model, enterprise-data-boundaries, claude-code-adoption-guide |

---

## Product surfaces (Claude.ai apps)

Seat-plan product surfaces beyond chat. Plan gating + governance flags drive the rollout decision — see [`../artifacts/surface-rollout-matrix.md`](../artifacts/surface-rollout-matrix.md) and (for Cowork) [`../artifacts/cowork-adoption-guide.md`](../artifacts/cowork-adoption-guide.md).

| Surface | Status | Plan gate | As-of | Doc anchor | Governance flag | Used in artifacts |
|---|---|---|---|---|---|---|
| Cowork (desktop agent) | GA (paid plans) | Pro / Max / Team / Enterprise; desktop app (mac/Win), not web/mobile | 2026-06 | support.claude.com/en/articles/13345190-get-started-with-claude-cowork | Takes real actions on local files; folder-scoped + egress-controlled + review-before-act; isolated VM for code; enterprise admin controls (feature access, spend, usage, private plugin marketplace). **Not BAA-covered as of 2026-07** ("Cowork is not yet available for any HIPAA-ready Enterprise plans" — support.claude.com; the HIPAA-ready covered set expands over time, so confirm current scope with your Anthropic rep at signing). | cowork-adoption-guide, surface-rollout-matrix, workforce-change, rollout-kickoff-kit, user-mindset-cheatsheet, user-mindset-mindmap, user-mindset-cheatsheet-color, enterprise-data-boundaries, token-budget, claude-product-101 |
| Claude Design | Beta (Anthropic Labs) | Team / Enterprise (org toggle, custom-role gated) | 2026-06 | support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans | Uploaded assets stored persistently; **no data residency support**; **not BAA-covered as of 2026-07 (beta)** — the covered set expands over time; confirm current scope with your Anthropic rep at signing; Anthropic publishes recommended rollout phases. | surface-rollout-matrix, enterprise-data-boundaries |
| Projects | GA | All plans (Free capped at 5 projects); RAG + sharing + org instructions on paid / Team+ | 2026-06 | support.claude.com/en/articles/9517075-what-are-projects | RAG auto-scales knowledge ~10× on paid; org-wide sharing is a data-leak vector (use can-use/can-edit perms, disable public projects); **BAA-covered on Enterprise** (w/ admin HIPAA activation). | surface-rollout-matrix, user-mindset-cheatsheet, user-mindset-cheatsheet-color, enterprise-data-boundaries, claude-product-101 |
| Claude Tag | Beta | Team / Enterprise; Slack-native (channel tagging, DM, AI assistant panel) | 2026-06 | support.claude.com/en/articles/15594475-what-is-claude-tag | Replaces "Claude in Slack" (cutover 2026-08-03). Channel tagging runs under the **org's Claude identity** (admin-scoped tools/data/repos, billed to org); DM + assistant panel run under the **user's own account** (billed to individual). Permission inheritance: org-wide → workspace → private channel. Memory persists per-channel (admin review/delete); the support article separately states conversations **auto-delete from Claude within 30 days of disconnecting the integration or uninstalling the app** (not a rolling window while connected). Slack's own copy of the conversation follows the org's own Slack retention policy, not Anthropic's. Org + per-channel spend caps. **BAA/ZDR/`inference_geo` not stated** in the announcement or support docs — verify separately, do not assume coverage. | surface-rollout-matrix, governance-overlay, agentic-threat-model, enterprise-data-boundaries, token-budget, claude-product-101 |
| Claude Science | Beta | Pro / Max / Team / Enterprise; **desktop app — macOS 13+ / Linux x64 (not Windows)**, runs locally or on a remote machine over SSH / HPC login node / cloud VM; Team & Enterprise require an Owner to enable it org-wide | 2026-07 | claude.com/docs/claude-science (+ anthropic.com/news/claude-science-ai-workbench, claude.com/product/claude-science) | AI research workbench for life sciences (genomics, proteomics, structural biology, cheminformatics). **Raw datasets + compute stay local; code runs in a sandbox; you approve each new folder, network host, and remote job.** Prompt/response content is processed by Anthropic under **standard retention** (per the product-page FAQ — not a special persistent store). Multi-agent (generalist coordinator + sub-agents + a reviewer agent that checks citations/calculations against the execution record). 60+ curated skills/connectors reach external scientific DBs (UniProt, PDB, ClinVar, ChEMBL, GEO, PubMed) + your proprietary tools. **Anthropic states it is NOT intended for clinical or diagnostic use.** **BAA / ZDR / `inference_geo` residency are not stated** across the announcement, product page, or docs — "contact sales for specific needs"; consumer plans (Pro/Max) carry no BAA. Verify before any regulated / PHI-adjacent use. | surface-rollout-matrix, enterprise-data-boundaries |

**Surface drift caught 2026-06-29:** **Cowork graduated** from the beta it was previously logged as — now GA on all paid plans, with enterprise admin controls shipped (Apr 2026); still **BAA-excluded as of 2026-07** (coverage expands over time — re-verify with an Anthropic rep at signing). **Claude Design** is a real Team/Enterprise surface (beta, under Anthropic Labs), also BAA-excluded with no residency (same as-of / expanding caveat). Verified against support.claude.com + privacy.claude.com (BAA + HIPAA-ready Enterprise articles, both current 2026-07).

**Surface added 2026-06-30:** **Claude Tag** launched 2026-06-23 (beta, Team/Enterprise) — a Slack-native agentic surface, not a graduation of an existing repo row. Sourced from [anthropic.com/news/introducing-claude-tag](https://www.anthropic.com/news/introducing-claude-tag) and the linked support article; BAA/ZDR/residency are genuinely unstated in both, not an omission on this repo's part.

**Surface added 2026-07-06:** **Claude Science** launched 2026-06-30 (beta, Pro/Max/Team/Enterprise) — a desktop/HPC AI research workbench for life sciences, not a graduation of an existing repo row. Sourced from [anthropic.com/news/claude-science-ai-workbench](https://www.anthropic.com/news/claude-science-ai-workbench) + [claude.com/product/claude-science](https://claude.com/product/claude-science) + [claude.com/docs/claude-science](https://claude.com/docs/claude-science). **Raw data staying local + per-folder/host/job approval are sourced controls** (a genuinely stronger local-data story than Files API or Claude Design). **BAA / ZDR / `inference_geo` residency are genuinely unstated** across all three sources — the product page says "contact sales for specific needs," and Anthropic itself states the tool is **not intended for clinical or diagnostic use.** Because it spans consumer plans (Pro/Max, no BAA), treat governance as not-covered-until-confirmed — same posture as Cowork/Design/Tag, not a guess in either direction.

---

## Procurement paths

| Path | Status | As-of | Notes |
|---|---|---|---|
| Direct API (`console.anthropic.com`) | GA | 2026-05 | Fastest model availability. Default. |
| Amazon Bedrock | GA | 2026-07 | Hyperscaler procurement. AWS-native platform layer around Claude: Guardrails, Knowledge Bases (managed RAG), AgentCore (agent runtime, GA 2026-06), Flows, cross-region inference, batch (~50% off). **Fine-tuning Claude (Claude 3 Haiku SFT, us-west-2) is Bedrock-only — not on the first-party API — and requires Provisioned Throughput to serve.** Those are AWS features (AWS lock-in), not Claude features. Model version + lifecycle lag vs first-party — availability and retirement dates can differ; verify per catalog. |
| Google Vertex AI | GA | 2026-07 | Hyperscaler procurement. Global vs regional endpoints — regional carries ~+10% over global; multi-region GA 2026-05-15. GCP IAM / VPC-SC. Model version + lifecycle lag vs first-party — availability and retirement dates can differ; verify per catalog. |
| Microsoft Azure AI Foundry | GA | 2026-07 | **GA 2026-06-29, hosted on Azure.** Claude via Messages API (prompt caching, extended thinking, tool streaming); Opus 4.8 + Haiku 4.5 at GA. Global or **US data zone**; **ZDR** available. Billed in Claude Consumption Units (CCU) on the Azure invoice with **MACC drawdown**; Entra ID + Azure RBAC. **Anthropic operates inference and is the data processor & SLA provider.** A hosted-on-Anthropic mode also exists for the full feature set / not-yet-on-Azure models (per MS Learn deploy doc — verify). Feature/version lag vs first-party; verify per catalog. |
| Claude Platform on AWS | GA | 2026-07 | Native AWS marketplace listing (GA ~2026-05-11). Separate from Bedrock; **direct-API feature set (no hyperscaler feature lag) with AWS billing / marketplace drawdown**. |

---

## Compliance + governance posture

| Item | Status | As-of | Doc anchor | Notes | Used in artifacts |
|---|---|---|---|---|---|
| No-train (commercial API + Console default) | Confirmed | 2026-05 | privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training | Verify policy version when signing. Re-check quarterly. Consumer plans (Free/Pro/Max) are a separate policy surface. | governance-overlay, anti-use-cases, briefing, misconceptions, enterprise-data-boundaries, procurement-pack |
| Standard retention (commercial API) | Confirmed | 2026-05 | privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data | 30-day backend deletion default. AUP-flagged: inputs/outputs up to 2 years, T&S classifier scores up to 7 years. Feedback: 5 years. | governance-overlay, enterprise-data-boundaries |
| Zero Data Retention (ZDR) | Available (enterprise, approval required) | 2026-05 | platform.claude.com/docs/en/build-with-claude/api-and-data-retention | Covers Messages + Token Counting APIs, Claude Code (Commercial org key, or Enterprise w/ ZDR). T&S classifier results still retained. Consumer plans + Teams/Enterprise UI not eligible. | governance-overlay, anti-use-cases, build-vs-buy, enterprise-data-boundaries, procurement-pack |
| HIPAA-ready API access | GA | 2026-05 | platform.claude.com/docs/en/build-with-claude/api-and-data-retention#hipaa-readiness | Separate from BAA. HIPAA-enabled orgs get 400 error on non-eligible features. ZDR no longer prerequisite. | governance-overlay, anti-use-cases, build-vs-buy |
| BAA (HIPAA workloads) | Available | 2026-06 | privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers | Covers first-party API + Enterprise plans. **Enterprise is not automatic — an admin must activate HIPAA compliance (admin settings → Data & Privacy) and sign the BAA.** Covered Enterprise features: Chat, Projects, Artifacts, file creation & code execution (excl. network/external sites), Voice, Web search, Research (eligible list grows — verify at signing; Skills was flagged as possibly added 2026-06-29 but is unconfirmed first-hand — treat as verify-at-signing, not asserted covered). 3rd-party integrations (MCPs/Connectors/Enterprise Search/Claude in Chrome) available but their 3rd-party data flows are not covered. **Excludes: Workbench/Console, Free/Pro/Max/Team, Cowork, and beta features (Claude in Office, Claude Design).** Per-feature eligibility — verify Implementation Guide. Re-verified 2026-06-29 (source updated this week). | governance-overlay, anti-use-cases, build-vs-buy, surface-rollout-matrix, cowork-adoption-guide, enterprise-data-boundaries, procurement-pack, agentic-threat-model |
| Data residency — `inference_geo` | GA | 2026-07 | platform.claude.com/docs/en/manage-claude/data-residency | Per-request inference geo (`global` default, or `us`). Confirmed on Opus 4.6+ and Sonnet 4.6+ (Haiku 4.5 and earlier-tier models return 400). **Sonnet 5 now confirmed** — platform pricing doc (verified 2026-07-06) explicitly covers "Claude Sonnet 4.6, and later models"; 1.1× multiplier applies when `inference_geo: "us"`. First-party API + Claude Platform on AWS only — Bedrock/Vertex/Azure AI Foundry use their own region selection. | governance-overlay, anti-use-cases, build-vs-buy, enterprise-data-boundaries |
| Data residency — Workspace geo | GA | 2026-06 | platform.claude.com/docs/en/manage-claude/data-residency | Controls at-rest storage and endpoint processing (image transcoding, code execution). Set in Console at workspace level. | governance-overlay, enterprise-data-boundaries |
| SOC 2 Type I & Type II | Held | 2026-05 | trust.anthropic.com | Refresh annual. Request current report from Trust Portal. | governance-overlay, procurement-pack |
| ISO 27001:2022 | Held | 2026-05 | trust.anthropic.com | Information Security Management. | governance-overlay |
| ISO/IEC 42001:2023 | Held | 2026-05 | trust.anthropic.com | AI Management Systems — AI-specific certification. | governance-overlay |
| Model deprecation lifecycle (active → deprecated → retired) | Policy | 2026-07 | platform.claude.com/docs/en/about-claude/model-deprecations | Deprecated models keep working until retirement; retired IDs return errors. Notice emailed to org admins + posted on the docs page. Historical deprecation→retirement windows have run ~6 months, **but the window is per-model — verify the page, don't assume**. | deprecation-runbook, incident-runbook |

---

## Monthly refresh checklist

1. Open [docs.claude.com](https://docs.claude.com) — check changelog / what's new
2. Open [anthropic.com/pricing](https://www.anthropic.com/pricing) — diff against calculator pricing table
3. For each row: status changed? as-of stamp older than 14 days? doc URL still valid?
4. For each *changed* row, grep `Used in artifacts` column → patch those files only
5. Update **Last verified** date at top of this file
6. Update README + artifact footers' as-of stamp if any model / pricing changed
7. **Any feature status flip (beta→GA, GA→deprecated) or surface added/removed → also update [`../artifacts/claude-enterprise-architecture.html`](../artifacts/claude-enterprise-architecture.html)** — it's a full-surface status map, so a stale GA/beta/preview tag there is a factual error, not just drift

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07.`
