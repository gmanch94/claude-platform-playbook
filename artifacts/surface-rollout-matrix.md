# Claude Surface Rollout Matrix — which surface, for whom, in what order

**As of 2026-07.** Pinned to the current Claude surface set. Refresh monthly with [`../docs/feature-inventory.md`](../docs/feature-inventory.md). Product facts cite primary sources — verify at [support.claude.com](https://support.claude.com) and [anthropic.com/pricing](https://www.anthropic.com/pricing) before committing budget or policy.

The [`adoption-playbook.md`](adoption-playbook.md) answers *how* to run a 90-day Claude rollout. This answers the question one level up: **which Claude surface(s) do we roll out, to whom, and in what order — and what governs each.** Most orgs are not adopting "Claude"; they're adopting Claude Code for engineers, Cowork for analysts, Projects for knowledge teams, Design for product/UX, and now Claude Tag for whole-team Slack workflows — each a different audience, plan gate, and blast radius.

> **The point of this matrix:** the surfaces are *not* interchangeable, and the most useful one is rarely the safest to enable first. Claude Code, Cowork, and Claude Tag take real actions; Projects and Design persist your data; chat is the floor. Sequence by blast radius, not by enthusiasm. The governance column is the one Anthropic's own product docs won't assemble for you.

---

## The surfaces at a glance

| Surface | Who it's for | Plan gate | Where it runs | Governance flag (the differentiator) | Deep guide |
|---|---|---|---|---|---|
| **Chat** | Everyone | Free → Enterprise | Web / desktop / mobile | Lowest blast radius. Consumer tiers (Free/Pro/Max) are a separate policy surface — no no-train-default, no BAA. [H] | [`adoption-playbook.md`](adoption-playbook.md) |
| **Projects** | Knowledge teams | All plans (Free capped at **5**); RAG + sharing on paid | Inside chat | **Org-wide sharing is a data-leak vector**; sharing + org instructions are Team/Enterprise only. BAA-covered on Enterprise (Chat/Projects/Artifacts) with admin HIPAA activation. [H] | This matrix |
| **Claude Code** | Software & technical teams | Pro+ (seat) or API key | Terminal · IDE · desktop · web | Highest agency for code work — hooks, MCP, sub-agents. Full guard stack already authored. | [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) |
| **Cowork** | Non-technical knowledge workers (analysts, ops, legal, finance) | **Paid only** (Pro/Max/Team/Ent) | **Desktop app**, local files | **Takes real actions on the user's machine.** Folder-scoped + egress-controlled + review-before-act; isolated VM for code. **Not BAA-covered — no PHI.** [H] | [`cowork-adoption-guide.md`](cowork-adoption-guide.md) |
| **Claude Design** | Product, UX, design | **Team / Enterprise** (Labs toggle) | Inside chat | **Beta.** Assets stored persistently; **no data residency**; not BAA-covered. Org-wide enable without a design system → generic output. [H] | This matrix |
| **Claude Tag** | Whole team, via Slack | **Team / Enterprise** | **Slack** (channel tag, DM, assistant panel) | **Beta.** Channel tagging acts under the **org's** Claude identity with admin-scoped tools/data/repos, billed to the org; anyone in the channel can steer it. **BAA/ZDR/residency not stated** — verify before any regulated use. Replaces "Claude in Slack" (cutover 2026-08-03). [H] | This matrix |
| **Claude Science** | Research / life-sciences teams | **Pro / Max / Team / Enterprise** (Team/Ent admin-enabled) | **Desktop app** (macOS/Linux), local or HPC over SSH | **Beta.** Raw data + compute stay local; you approve each folder / network host / remote job (sourced controls — a stronger local-data story than Design or Files API). But it spans consumer plans with **no BAA**, **BAA/ZDR/residency are unpublished** ("contact sales"), and Anthropic states it's **not for clinical or diagnostic use.** A vertical surface — not part of the default enable order below. [H] | This matrix |

Plan-gate detail lives in [`subscription-selection-guide.md`](subscription-selection-guide.md); per-token cost in [`cost-calculator.html`](cost-calculator.html).

---

## Governance flag, expanded (sequence by blast radius)

Ordered low → high blast radius — a defensible enablement order for most orgs:

1. **Chat — enable first, govern the tier.** The floor surface. The real decision is *which plan*: consumer tiers (Free/Pro/Max) carry no no-train-default and no BAA; Team/Enterprise and the commercial API do. Don't let a consumer-tier pilot set the data-handling precedent for the org. → *Failure mode:* treating a Pro chat pilot's data posture as the enterprise posture. [H — [`governance-overlay.md`](governance-overlay.md)]

2. **Projects — enable with sharing discipline.** Available everywhere (Free capped at 5 projects); RAG auto-scales knowledge up to 10× on paid plans. The blast radius is **sharing**: org-wide project sharing exposes curated knowledge to everyone in the org. Use per-member permissions (*can use* / *can edit*), and let an Owner disable public projects where knowledge is sensitive. BAA-covered on Enterprise. → *Failure mode:* org-wide-sharing a project full of sensitive source docs. [H — [support.claude.com projects](https://support.claude.com/en/articles/9517075-what-are-projects)]

3. **Claude Design — Team/Enterprise, gate before you broaden.** Enabled via a toggle under *Anthropic Labs* in Org settings, controllable with custom roles. Two flags: (a) **org-wide enable without a design system produces functional-but-generic output** — Anthropic says so in its own rollout phases; (b) uploaded assets (brand guidelines, screenshots) are **stored persistently** and there's **no data-residency support yet**, and it's beta so **not BAA-covered**. Follow Anthropic's published phases; add the asset-governance check. → *Failure mode:* a residency-bound or brand-sensitive org enabling Design org-wide in beta. [H — [support.claude.com Design admin](https://support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans)]

4. **Claude Code — software teams, existing guard stack.** Highest agency for code work. The rollout and its guardrails (hooks, MCP scoping, sub-agents, evals) are fully covered in [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) and the starter packs ([hooks](hooks-starter-pack.md), [mcp](mcp-starter-pack.md), [skills](claude-code-starter-skills.md), [eval](eval-starter-pack.md)). → *Failure mode:* enabling Claude Code without the hooks pack (secret-scan, branch guard). 

5. **Cowork — last and most deliberate.** An agent that reads/writes local files and takes real actions on the user's machine. Govern with folder-scoping, egress settings, review-before-act, and (Team/Enterprise) admin controls for feature access, spend, usage, and a private plugin marketplace. **Not BAA-covered — no PHI in connected folders.** Full treatment in [`cowork-adoption-guide.md`](cowork-adoption-guide.md). → *Failure mode:* broad enablement with no admin owner and a drive-root folder connection. [H]

6. **Claude Tag — newest, sequence with at least Cowork's caution.** Launched 2026-06-23 as a Team/Enterprise beta; blast radius is comparable to or higher than Cowork's — channel tagging grants org-identity access to admin-configured tools, data, **and codebases**, and (unlike Cowork's single-user desktop scope) *anyone in the channel* can steer or redirect the same agent identity. Govern with the three-tier permission model (org-wide → workspace → private channel), org + per-channel spend caps, and role-based Member Access (Enterprise). **BAA/ZDR/`inference_geo` are not stated in Anthropic's announcement or support docs** — treat as unconfirmed, not as excluded-by-omission; verify directly before any regulated use. As beta + days-old, it has the least field track record of any surface in this matrix — pilot in a low-sensitivity channel first. → *Failure mode:* granting org-wide tool/repo access to a channel before confirming who can tag it and what it's billed against. [H — [support.claude.com Claude Tag](https://support.claude.com/en/articles/15594475-what-is-claude-tag)]

---

## Picking an order for *your* org

The 1→6 list above is the default. Deviate on these signals:

| If your org… | Lead with | Defer |
|---|---|---|
| Is engineering-led, adopting Claude to ship software | Claude Code | Cowork / Design / Tag until non-eng demand is real |
| Is analyst/ops/finance-heavy, little code | Projects, then Cowork | Claude Code |
| Has product/design as the pilot function | Claude Design (Team/Ent) | Cowork until file-governance is owned |
| Is a research / life-sciences org | Claude Science (per-folder/host/job approval on) | Any regulated or PHI-adjacent workload until BAA + residency are confirmed with sales — Anthropic itself says it's not for clinical/diagnostic use |
| Is regulated (PHI, residency) | Chat/Projects on **Enterprise + signed BAA** | **Cowork, Design, Tag, and Claude Science entirely** — none has confirmed BAA coverage [H] |
| Is a startup of 2–4 (no Team plan) | Chat + individual Pro/Max seats | Anything needing SSO / central admin (starts at Team) |
| Already runs "Claude in Slack" | Migrate to Claude Tag before **2026-08-03** | — cutover is mandatory, not optional, on that date |

The regulated row is the one that flips the default: compliance decides surface eligibility *before* usefulness. A 50-person hospital can run Projects under an Enterprise BAA (admin must activate HIPAA + sign — not automatic) but **cannot** put PHI through Cowork or Design at all (Cowork is excluded as a non-API product surface; Design as a beta feature — re-verify both at GA). [H — [privacy.claude.com BAA](https://privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers); enumerated in [`governance-overlay.md`](governance-overlay.md) §4]. **Claude Tag isn't enumerated in that BAA list at all yet** (too new) — treat it the same as Cowork/Design until Anthropic states otherwise, not as a silent third BAA-covered surface. **Claude Science** is the sharpest version of this trap: it's aimed squarely at genomics / clinical / proteomics data yet ships on consumer Pro/Max plans with no BAA, its BAA/ZDR/residency are unpublished ("contact sales for specific needs"), and Anthropic's own docs state it's **not intended for clinical or diagnostic use.** Raw data does stay local and every folder/host/job is approval-gated — real, sourced controls — but those bound blast radius, not the training/retention/BAA answer for whatever content enters a prompt. Confirm coverage with sales before pointing it at regulated data.

---

## How this connects to the rest

- One level above [`adoption-playbook.md`](adoption-playbook.md): that's *how* to roll out; this is *which surface, in what order.*
- Deep per-surface guides: [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) (engineers) and [`cowork-adoption-guide.md`](cowork-adoption-guide.md) (knowledge workers).
- Plan + seat decision: [`subscription-selection-guide.md`](subscription-selection-guide.md). Cost: [`cost-calculator.html`](cost-calculator.html).
- Compliance depth (no-train, BAA, residency): [`governance-overlay.md`](governance-overlay.md).
- Surface status + source-of-truth: [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify surface availability + governance at support.claude.com and anthropic.com/pricing.`
