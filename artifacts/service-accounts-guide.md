# Service Accounts & Non-Human Identity on the Claude Platform

**As of 2026-07.** Pin to current surface — refresh monthly.

The concept "service account" is referenced across four artifacts — [`claude-code-enterprise-config.md`](claude-code-enterprise-config.md) §5.1 wires up Workload Identity Federation, [`enterprise-workspaces-guide.html`](enterprise-workspaces-guide.html) lays out the credential axis, [`agentic-threat-model.md`](agentic-threat-model.md) treats over-scoped agency, [`token-budget-governance.md`](token-budget-governance.md) relies on per-workload attribution — but it's *defined* in none of them. This is the concept anchor. The decision it frames is not "should we use service accounts" but: **for each automated path into Claude, does it authenticate as a person or as a machine — and who can attribute, scope, and revoke that identity.**

**Read §4 first if you read nothing else.** The single most common mistake here is running automation on a Claude Code `setup-token`, which is bound to a *human subscriber*, not a service account — so your CI authenticates as an employee, breaks when they leave, and shows their name in the audit log.

**Visual companion:** [`service-accounts-architecture.html`](service-accounts-architecture.html) draws this whole taxonomy as one enterprise deployment (Karekal Health) — every identity, its credential, and person-vs-machine at a glance.

---

## 1. The decision: person or machine?

Every call into Claude authenticates as *something*. At small scale that "something" is usually a developer's own key or login, and it works — until the workload outlives the person, over-inherits their access, or leaks. A **non-human identity** (an account that represents a *workload*, not an employee) exists to buy four governance properties that a person's credential can't:

| Property | Person credential | Non-human identity |
|---|---|---|
| **Attribution** | audit log shows the employee — automation and their human activity blend | one identity per workload — the log names `ci-deploy`, not a person |
| **Least privilege** | inherits the human's full access | scoped to exactly what the workload needs, nothing more |
| **Offboarding** | employee leaves or rotates → the automation breaks | survives any personnel change — it was never a person |
| **Blast radius** | a leaked personal token = that human's entire access | a leaked scoped key = one workload's narrow scope |

If you take nothing else: **automation should not run on a person's credential.** That is the failure the whole concept exists to prevent.

---

## 2. What a service account actually is (briefly)

A service account is a non-human identity — an account that stands for a service or workload and has its own credential, its own scopes, and its own lifecycle, independent of any employee. "Service account," "machine identity," and "workload identity" are near-synonyms; **Non-Human Identity (NHI)** is the umbrella governance term now used for the whole class (and for the tooling that inventories and rotates them).

That's the whole concept. The value below is not the definition — it's knowing *which Claude credential is which*, because on the Claude platform they are not uniform and one of them is a person wearing a machine's clothes.

---

## 3. The Claude credential taxonomy — who/what each surface authenticates as

This is the part no single Anthropic doc assembles. Each programmatic path into Claude authenticates as a distinct credential, and only some of them are genuine non-human identities.

At a glance — identity → credential → surface ([visual version](service-accounts-architecture.html)):

```text
person   ─▶  Claude Code login / workspace key    ─▶  dev workspace
machine  ─▶  WIF svac_  (keyless, short-lived)     ─▶  prod workspace + Admin API     ✓ preferred
machine  ─▶  workspace key  sk-ant-api…            ─▶  Messages API  (inference)
machine  ─▶  Admin key  sk-ant-admin               ─▶  Admin API  (org management)
TRAP     ─▶  Claude Code setup-token = PERSON       ─▶  automation path                ✗ see §4
machine  ─▶  cloud IAM (AWS / GCP / Azure)         ─▶  Bedrock / Vertex / Foundry — outside the workspace
```

| Surface | Credential | Person or machine? | Scope | Lifecycle |
|---|---|---|---|---|
| **App / agent inference** (Messages API) | Console **workspace API key** `sk-ant-api…` | **Machine** — bound to a workspace, not a person | one workspace | created / revoked in Console `[H]` |
| **Keyless CI / automation** (preferred) | **WIF service account** `svac_` via a federation rule `fdrl_`, exchanged at runtime for a short-lived `sk-ant-oat01-…` | **Machine** — the canonical service account | set on the federation rule (issuer · match · workspace · oauth_scope · lifetime) | no stored secret; token auto-minted + short-lived `[H]` |
| **Org management** (Admin API) | **Admin API key** `sk-ant-admin…` | **Machine, but org-privileged** — not for inference | org-wide admin | created by an org admin `[H]` |
| **Claude Code, interactive** | subscription login (OAuth vs. claude.ai) *or* `ANTHROPIC_API_KEY` | **Person** (the subscriber) *or* **machine** (if pointed at a workspace key) | subscription seat or workspace | login session, or the key's lifecycle `[H]` |
| **Claude Code, headless on a subscription** | `claude setup-token` → `CLAUDE_CODE_OAUTH_TOKEN`, ~1-year | **PERSON — subscriber-bound, *not* a service account** | the subscriber's plan | ~1yr bearer token, self-custodied — see §4 `[H]` |
| **Hyperscaler** (Bedrock / Vertex / Azure) | the cloud's **own IAM**: AWS IAM role · GCP service account · Azure service principal | **Machine, but outside the Anthropic workspace** | your cloud IAM policy | managed in your cloud, not Anthropic's Console `[H]` |

Two facts fall out of this table that catch teams:

- The **hyperscaler path** does use a service account — but it's *your cloud's*, and the identity plus its logs live in AWS/GCP/Azure, not in Anthropic's Console (§6).
- The **Admin key** is a non-human identity, but an org-privileged one. It manages the org; it is not an inference credential. Using it to call the Messages API hands a workload org-admin blast radius (§5).

*(Prefixes and resource IDs — `sk-ant-oat01-`, `svac_`, `fdrl_`, `fdis_`, `sk-ant-admin` — are the current sentinels; verify against [`docs/feature-inventory.md`](../docs/feature-inventory.md) on refresh.)*

---

## 4. The `setup-token` trap — the distinction that earns this page

`claude setup-token` runs an OAuth flow against a **human's** Pro / Max / Team / Enterprise subscription and prints a ~1-year, inference-only token you paste into `CLAUDE_CODE_OAUTH_TOKEN`. It is the easy way to run Claude Code headless in CI — and it is **not a non-human identity.** It is bound to the subscriber, tied to no Console workspace, and self-custodied.

The consequences, all of which read as "mystery outage" or "audit gap" later:

- **Offboarding breaks CI.** The subscriber leaves or their seat is de-provisioned → every pipeline on their `CLAUDE_CODE_OAUTH_TOKEN` stops.
- **Attribution is wrong.** Usage and any audit trail show the employee, not the workload — the automation is invisible as automation.
- **Blast radius is a year wide.** It's a bearer secret with ~12 months of life; a leak is a year of inference on your plan until someone notices and rotates it.

**The fix is to give automation a real non-human credential:** WIF `svac_` (preferred — keyless, short-lived, nothing stored in the runner) or a Console **workspace API key**. Keep humans off the automation path and automation off the subscription path. There is no managed toggle that names `setup-token` directly — the control that actually bites is upstream on the **seat** (provision subscription seats only to humans, via SCIM group-to-tier mapping, so automation never gets a subscription to mint a token against). The full "can you turn it off centrally" answer, and the one documented-but-unverified interaction with `forceLoginMethod`, live in [`claude-code-enterprise-config.md`](claude-code-enterprise-config.md) §5.1 — this page routes there rather than restating it.

---

## 5. Governance decisions per non-human identity

Once a workload has its own machine identity, five decisions govern it. Each has a default and a failure-if-skipped.

| Decision | Set it to | Failure if you don't |
|---|---|---|
| **Scope** | least privilege — a **workspace** key, not an org key; a federation-rule `match` pinned to an **exact** ref, not a trailing `*` | a wildcard `match` like `repo:org/repo:*` also matches fork pull-requests, so anyone who can open a PR can mint a token at that rule's scope (§6) |
| **Attribution** | one identity per workload — never a shared key across services | a shared key produces a blended, un-forensic audit trail; you can't say which workload did what |
| **Custody** | short-lived beats long-lived — prefer WIF (nothing stored) over a static key; if static, keep it in a secrets manager | a long-lived static key in an env file or repo is the classic leak-to-year-of-inference path |
| **Rotation** | rotate on suspected exposure; let WIF auto-rotate; put a calendar clock on any static/long-lived token | a `setup-token`-class secret with no rotation clock is a standing liability |
| **Privilege separation** | inference workloads get an **inference** (workspace) key; org management gets the **Admin** key — never cross them | an Admin key used for inference gives a routine workload org-admin blast radius |

---

## 6. Failure modes

| Failure | What it looks like | Counter |
|---|---|---|
| **Automation on a personal token** | CI runs on a developer's `CLAUDE_CODE_OAUTH_TOKEN` or personal key; breaks on offboarding, attributed to them | give it a `svac_` WIF identity or a workspace key (§4) |
| **Wildcard federation match** | `subject_prefix` ends in `*` → a fork PR mints a token at the rule's scope | pin to an exact ref (`…:ref:refs/heads/main`), especially for an `org:admin`-scoped rule |
| **Shared key across workloads** | one key powers three services; the audit log can't tell them apart | one identity per workload; rotate independently |
| **Admin key used for inference** | an app calls the Messages API with `sk-ant-admin…` | separate credentials — Admin manages the org, workspace keys do inference (§5) |
| **Long-lived static key, no rotation** | a year-old key in an env var; nobody owns rotating it | prefer WIF short-lived tokens; clock-and-rotate anything static |
| **Hyperscaler attribution gap** | "the service account is in Anthropic's Console" — it isn't; the identity + logs are in your cloud (Bedrock/Vertex/Azure) | attribute and audit on the cloud-IAM side; Anthropic's Console won't show that workload (§3) |

---

**Cross-references:** [`claude-code-enterprise-config.md`](claude-code-enterprise-config.md) §5.1 (WIF setup · `setup-token` central-control · identity & credential storage) · [`enterprise-workspaces-guide.html`](enterprise-workspaces-guide.html) (the credential-axis matrix — the map this page is the concept for) · [`enterprise-deployment-guide.md`](enterprise-deployment-guide.md) (one key set per workspace; hyperscaler IAM environments) · [`agentic-threat-model.md`](agentic-threat-model.md) (excessive agency · confused-deputy) · [`token-budget-governance.md`](token-budget-governance.md) (per-workload attribution + caps) · [`usage-compliance-monitoring.md`](usage-compliance-monitoring.md) (Admin / Analytics / Compliance API keys) · [`governance-overlay.md`](governance-overlay.md) (data-flow · no-train · ZDR · never asserted here) · [`docs/feature-inventory.md`](../docs/feature-inventory.md) (Workload Identity Federation · workspace-key · Admin-API rows).

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.
