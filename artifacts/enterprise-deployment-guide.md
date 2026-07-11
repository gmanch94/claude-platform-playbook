# Enterprise Deployment Guide — Tenancy, Environments & Workspace Topology

**As of 2026-07.** Pin to current surface — refresh monthly.

[`operating-model-guide.md`](operating-model-guide.md) decides *who owns* Claude; [`procurement-pack.md`](procurement-pack.md) decides *how you buy* it. This guide is the third enterprise-setup decision: *how you lay it out* — the tenancy reality, the prod/non-prod environment split, and the workspace topology underneath both. It doesn't invent new controls; it assembles the ones already scattered across the token-budget, eval, deprecation, governance, and procurement artifacts into the deployment-topology decision an architect actually makes.

**Read §5 before you design anything.** The single most expensive mistake here isn't a topology choice — it's pointing a non-prod environment at real regulated data under a looser governance posture.

---

## 1. Two surfaces, two meanings of "environment"

"Claude Enterprise" spans two surfaces, and "prod/non-prod" means different things on each:

- **Build / API surface** (you ship apps and agents on Claude) — this is where prod/non-prod is a real engineering discipline. Most of this guide.
- **Seat product** (chat / Projects / Cowork for humans) — there's no "staging clone" of a SaaS chat product. "Non-prod" here is a **pilot cohort or sandbox workspace**, then phased GA. That's rollout sequencing ([`adoption-playbook.md`](adoption-playbook.md), [`surface-rollout-matrix.md`](surface-rollout-matrix.md)), not environment separation.

If a client only ever consumes seats, they don't need environments — they need a pilot workspace and a rollout plan. The rest of this guide is for the build surface.

---

## 2. Tenancy reality — what "single vs multi-tenant" actually maps to

Claude's commercial platform is **multi-tenant SaaS**; inference runs on Anthropic's shared infrastructure. We're aware of no publicly-advertised single-tenant / dedicated-instance SKU in the standard Enterprise plan — but treat that as a verify-with-Anthropic question (§7), not a settled fact. What Anthropic offers is **logical isolation, not physical single-tenancy** — and those levers already exist:

| Isolation you might be after | What Claude actually gives you | Where |
|---|---|---|
| "Our data never trains the model" | No-train default (commercial API + Console) | [`governance-overlay.md`](governance-overlay.md) |
| "Data isn't retained / deleted fast" | 30-day default; **ZDR** (enterprise, approval-gated) | [`governance-overlay.md`](governance-overlay.md) |
| "Data stays in our geography" | `inference_geo` + Workspace geo; Azure US data zone | [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) |
| "Runs inside *our* cloud boundary" | Hyperscaler path (Bedrock/Vertex/Azure) — inference within the cloud's boundary + VPC/PrivateLink; the data-processor party differs per path (verify) | [`procurement-pack.md`](procurement-pack.md) §4 |
| "Segmented from other teams in our org" | **Console workspaces** — per-workspace keys, caps, members | [`token-budget-governance.md`](token-budget-governance.md) |
| "A dedicated single-tenant Claude instance" | **Not an advertised commercial default.** Whether one exists for very large enterprises is a **verify-with-Anthropic** question — don't architect around an assumption. | verify at signing |

The honest headline: on the first-party platform you get strong *logical* isolation, not a dedicated cluster. The closest thing to "keep it in our tenant" is the **hyperscaler path** — inference runs inside your AWS/GCP/Azure boundary (VPC/PrivateLink). But the data-processor party differs by path: on **Azure Foundry**, Anthropic operates the inference and is the data processor (per the Azure GA post); on **Bedrock/Vertex**, the hyperscaler runs it within its own boundary — verify per catalog/DPA. And on every path it's still the same Anthropic models, so a hyperscaler path is procurement/governance isolation, **not model-vendor diversification** ([`procurement-pack.md`](procurement-pack.md) §4, [`exit-portability-memo.md`](exit-portability-memo.md)).

---

## 3. The primitive — one Console workspace per environment

Claude's native isolation unit on the build surface is the **workspace**. Map environments to workspaces (`dev` / `staging` / `prod`), each carrying its own keys, budget, tier, and access. What differs per environment:

| Dimension | Non-prod (dev / staging) | Prod |
|---|---|---|
| **API keys** | separate, workspace-scoped | separate, tightly held — **never share a prod key into dev** |
| **Model pin** | test latest / preview freely | **pinned, eval-certified version only** |
| **Budget** | **hard cap** (browns out, no harm done) | **alert thresholds (50/80/100%) + escalation, no cliff** |
| **Rate / service tier** | standard | priority / committed capacity |
| **Data** | **synthetic / anonymized only** (see §5) | real data under full governance |
| **Governance (ZDR / BAA / residency)** | match prod *if* it touches real data; else looser | full |
| **Observability** | tagged `env=nonprod` | tagged `env=prod`, alerting live |

Making workspace boundaries match environment *and* budget boundaries means cost attribution falls out for free ([`token-budget-governance.md`](token-budget-governance.md) ladder). The budget row is that guide's existing rule: **cap experiments, alert prod.**

**Verify-in-Console:** exact workspace-level cap granularity and whether ZDR/BAA enable per-workspace is a Console/contract detail — confirm it, don't assume it.

---

## 4. The promotion flow is the spine

`dev → staging → prod` is three copies of nothing until you add the gates that make it a pipeline:

1. **Eval-suite pass** — the regression suite ([`eval-starter-pack.md`](eval-starter-pack.md)) is the promotion gate. No promote without green evals; this is the [`maturity-model.md`](maturity-model.md) L2 discipline.
2. **Staged cutover** for any model or prompt change — 5% → 50% → 100% with a rollback pin, per [`model-deprecation-runbook.md`](model-deprecation-runbook.md). Keep the prior pin live as your rollback budget.
3. **Prompts/config versioned in the repo** and promoted as artifacts ([`exit-portability-memo.md`](exit-portability-memo.md) week-1 discipline) — never hand-edited live in the prod console.

Observability tags every request with its workspace — hence its environment — and prompt version ([`agent-observability-guide.md`](agent-observability-guide.md)), so a regression's blast radius is scoped to the stage that shipped it.

---

## 5. The landmine — non-prod is not a home for real regulated data

**Non-prod must not carry real regulated data unless it holds prod's full governance posture.** The common failure: pointing staging at prod data (PHI, PII, customer records) for "realistic testing" — but non-prod usually runs looser ZDR/BAA/retention, so real regulated data in a non-prod workspace is a **compliance breach**, not a convenience.

Two clean paths:
- **Synthetic / anonymized data in non-prod** (default). Cheapest, safest, and it forces you to build representative fixtures anyway.
- **Apply prod governance to the non-prod workspace** if it *must* use real data — same ZDR + BAA-covered-features-only + residency posture as prod.

**ZDR and BAA are enabled at the org/enterprise + surface level** (ZDR is approval-gated; BAA is admin-activated on Enterprise) — whether that scope maps cleanly onto a single non-prod workspace is a Console/contract detail to **verify, not assume** ([`governance-overlay.md`](governance-overlay.md), [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html)). Confirm coverage before real data touches a non-prod workspace. This is the same "prod ≠ local, don't leak prod data downstream" discipline every other environment split enforces.

---

## 6. How far to separate — three structural options

| Option | Isolation | Overhead | When it's right |
|---|---|---|---|
| **Separate workspaces, one org** | keys · budget · rate · members | Low — single contract, one bill | **Default for most.** Contained blast radius, clean attribution. |
| **Separate orgs / accounts** | full access + billing separation | High — duplicate admin + contract | A regulatory or hard org boundary demands it (e.g. a ring-fenced regulated subsidiary). Usually overkill. |
| **Hyperscaler environments** | cloud account/project/subscription + IAM | Inherits your landing zone | You already run multi-account cloud — prod/non-prod maps to AWS prod-vs-dev accounts, GCP projects, or Azure subscriptions ([`procurement-pack.md`](procurement-pack.md) §4). |

Default to separate workspaces in one org; escalate to separate orgs only when access/billing separation is a hard requirement, not a preference.

---

## 7. Verify-at-signing / verify-in-Console

Stated as questions to confirm directly — never asserted here:

- **Single-tenant / dedicated deployment** for very large enterprises — exists? terms? → verify with Anthropic at signing.
- **Workspace cap granularity** (per-workspace spend limits, rate limits) → verify in Console.
- **Per-workspace ZDR / BAA enablement** — can a non-prod workspace carry the same posture as prod? → verify at signing.
- **How many workspaces / sub-orgs** the Enterprise contract supports → verify at signing.

---

## 8. Failure modes

| Failure | What it looks like | Counter |
|---|---|---|
| **Real data in non-prod** | staging pointed at prod PHI for "realistic tests" under looser ZDR/BAA | synthetic data, or apply prod governance to the non-prod workspace (§5) |
| **Shared prod key in dev** | one key across environments; a dev leak = prod exposure + blended attribution | one key set per workspace; rotate independently |
| **No promotion gate** | a prompt or model change lands in prod with no eval run | eval-suite pass is the gate; staged cutover for model swaps (§4) |
| **Blanket org hard cap** | the month's last week browns out prod because an experiment ate the ceiling | cap experiments, alert prod ([`token-budget-governance.md`](token-budget-governance.md)) |
| **Assumed single-tenant** | architecture built on a "dedicated instance" that isn't the commercial default | confirm the deployment model at signing before designing around it |
| **Model-pin drift across envs** | dev on latest, prod on a pin, evals run against the wrong one | eval against the exact prod pin; keep a pin manifest per environment |

---

**Cross-references:** [`operating-model-guide.md`](operating-model-guide.md) (who owns it) · [`procurement-pack.md`](procurement-pack.md) (how you buy it + §4 hyperscaler paths) · [`token-budget-governance.md`](token-budget-governance.md) (the workspace/budget ladder + caps) · [`eval-starter-pack.md`](eval-starter-pack.md) (the promotion gate) · [`model-deprecation-runbook.md`](model-deprecation-runbook.md) (staged cutover) · [`governance-overlay.md`](governance-overlay.md) + [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) (per-environment governance posture) · [`agent-observability-guide.md`](agent-observability-guide.md) (env-tagged telemetry) · [`maturity-model.md`](maturity-model.md) (the L2 gate) · [`docs/feature-inventory.md`](../docs/feature-inventory.md) (Console workspaces row).

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.
