# Usage, Compliance & Monitoring — the enterprise admin's operational layer

*How a CISO / compliance officer / IT admin actually watches Claude usage across the org, proves it to an auditor, and feeds it to the SOC — without letting it drift into staff surveillance.*

> `© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.` Facts graded **[H]** primary-doc / **[M]** reputable-secondary / **[?]** uncertain. This is not legal advice.

---

## What this is — and the four artifacts it does *not* repeat

This is the **operational monitoring-and-proof layer for employees' Claude *product* usage**: which admin planes exist, what each exposes, where the data goes, and the one line you must not cross. It is deliberately narrow so it doesn't restate its neighbors:

| If your question is… | Go to | Not here because |
|---|---|---|
| "What will we *spend*, and how do I cap it?" | [`token-budget-governance.md`](token-budget-governance.md) | That's the FinOps lens on the same Usage & Cost API. |
| "How do I instrument *the agents/apps we built* on Claude?" | [`agent-observability-guide.md`](agent-observability-guide.md) | That's app telemetry (OTel, golden signals) for *your* workloads — not org-wide product usage. |
| "What's the *return*?" | [`value-realization-guide.md`](value-realization-guide.md) | That's ROI measurement. |
| "What's our compliance *posture* — no-train, BAA, residency, retention policy?" | [`governance-overlay.md`](governance-overlay.md) | That's the policy reference. This is how you *operationalize and prove* it. |

**This artifact answers the fifth question the other four leave open:** *now that people are using Claude, how do I actually watch it, prove to an auditor that policy is being followed, feed the events to my SOC, and support eDiscovery — and how do I do that without building a surveillance machine my works council will kill?*

---

## 1. The three admin planes (the load-bearing distinction)

The single most common mistake here is treating "the admin API" as one thing. There are **three separate planes, three separate keys, three separate purposes.** Conflating them is why teams conclude a capability is "missing" when they were just holding the wrong key.

| Plane | Where it lives | Credential | What it's for |
|---|---|---|---|
| **Admin API** | Claude Console / Platform (API org) — `platform.claude.com` | Admin API key `sk-ant-admin…`, or OAuth `org:admin` | Org management: members, workspaces, workspace-members, invites, existing API keys — **plus** the Usage & Cost reports. **[H]** |
| **Analytics API** + native dashboard | Analytics **API is Enterprise-only**; **dashboard on Team + Enterprise** (claude.ai) | API key / OAuth with `read:analytics` scope | Adoption & usage analytics: active members, seats, feature adoption, per-product usage, per-user **token** usage, and **org-wide** cost (per-user *spend* is a dashboard CSV, not the API — §2.1). **[H]** |
| **Compliance API** | Enterprise **and** Platform (excl. Public Sector orgs) | **Compliance Access Key**, scoped (`read:compliance_activities`, content scopes) | Audit activity feed + (Enterprise only) conversation content; retrieve **or delete** content; feed eDiscovery / DLP / SIEM tooling. **[H]** |

Sources: Admin API — [platform.claude.com/docs/en/manage-claude/admin-api](https://platform.claude.com/docs/en/manage-claude/admin-api) · Analytics — [platform.claude.com/docs/en/api/admin/analytics](https://platform.claude.com/docs/en/api/admin/analytics) · Compliance — [platform.claude.com/docs/en/manage-claude/compliance-api](https://platform.claude.com/docs/en/manage-claude/compliance-api). All **[H]**, live 2026-07; platform docs carry no visible date stamp — re-verify at the monthly refresh.

**Two caveats that bite at the plane level:**

- **New API keys can only be created in the Console** — the Admin API can *manage* existing keys but not mint them (Anthropic's stated security control). **[H]**
- **Claude Platform on AWS strips most Admin API endpoints** (members, keys, usage/cost/rate-limit reports are gone; only workspace endpoints remain) — per the Admin API doc. Note this is the *Claude-Platform-on-AWS* deployment path specifically, **not** a generic Amazon Bedrock integration (on Bedrock the cloud provider is the processor and you manage access via AWS IAM, not Anthropic's Admin API) — confirm which applies to you, and factor it into the deployment-path choice in [`enterprise-deployment-guide.md`](enterprise-deployment-guide.md). **[H]**

---

## 2. What each monitoring source actually exposes

### 2.1 Usage & adoption analytics — Analytics API + native dashboard
- **Tier:** dashboard on **Team + Enterprise**; the **Analytics API is Enterprise-only** (`read:analytics`). **[H]**
- **Exposes:** "who's using Claude" — active members, assigned seats, groups, feature adoption, and **spend**, with product-specific views for **Claude.ai, Claude Code, Cowork**, plus a natural-language "analytics chat." The **Analytics API** (`read:analytics`) endpoints (verified verbatim against the doc 2026-07-12):
  - `GET /v1/organizations/analytics/summaries` — org-wide daily activity.
  - `GET /v1/organizations/analytics/users` — **per-user token usage, one row per user, ranked by a token metric** (default `order_by=total_tokens`), cursor-paginated, carries email. *This is the per-individual activity surface.*
  - `GET /v1/organizations/analytics/cost_report` — **cost in USD over time, org-wide**, bucketed `1m`/`1h`/`1d`, group by product / model / context-window / inference-region / speed / cost-type.
  - per-feature breakdowns — `/analytics/artifacts`, `/analytics/connectors`, `/analytics/plugins`, `/analytics/skills`, `/analytics/apps/chat/projects`.
  Range must sit within the last 365 days and **no earlier than `2026-01-01`**; ~1-day lag. **Important correction:** the API gives **org-wide cost** and **per-user *token* usage** — it does **not** expose *per-user cost*; **per-user spend** is the **dashboard CSV export** (Analytics settings, "each row = one person"), not an API endpoint. The per-user grain is Owner/role-gated. **[H]**, live-verified 2026-07-12 ([platform.claude.com/docs/en/api/admin/analytics](https://platform.claude.com/docs/en/api/admin/analytics) · [support.claude.com/en/articles/12883420](https://support.claude.com/en/articles/12883420-view-usage-analytics-for-team-and-enterprise-plans) for the dashboard/CSV).
- **⚠ What actually changed 2026-07-11 (correct the common misread):** the **Member analytics** toggle (Org settings → Usage) controls whether **members can see their *own* usage** — it moved from off- to **on-by-default on 2026-07-11**. That is a *self-visibility / transparency* default, **not** an admin-surveillance switch. The **admin-side per-individual surfaces** (the Analytics API's per-user **token-usage** endpoint `analytics/users`, and the **per-user spend CSV export** in Analytics settings) are a **separate, Owner/role-gated** capability that already existed — *those* are the surveillance surface, governed by who holds analytics access, not by this toggle. See §6. **[H]**

### 2.2 Audit logs — the who-did-what record
- **Tier:** **Enterprise organizations only.** **[H]**
- **Exposes:** admin / user / identity / org-config / project / conversation / file-upload **events** — `created_at`, `actor_info`, `event` type, entity ids (`invite`, `chat_project`, `chat_conversation`, …). **Critical limit: the title and content of chats/projects are *not* in audit logs — only their ids.** Chat content is a separate Primary-Owner data export. **[H]**
- **Access:** Console download — Org settings → Data & Privacy → **Export logs**; aggregates the past **180 days**; **Owner / Primary Owner** requests it; an emailed link is live **24 hours**. **[H]**
- **⚠ CMEK gotcha:** if the org uses **customer-managed encryption keys**, the Export-logs button **does not work** — those (typically your most regulated) orgs must pull audit events via the **Compliance API** instead. **[H]** ([support.claude.com/en/articles/9970975](https://support.claude.com/en/articles/9970975-access-audit-logs))

### 2.3 Compliance API — content, eDiscovery, and the SIEM feed
- **Tier:** Enterprise + Platform, **excluding Public Sector orgs.** Enable in Org settings (Enterprise); Platform access is via **Anthropic sales**. **[H]**
- **Exposes — and this split matters:**
  - **Enterprise (claude.ai):** **conversation content** (chats, uploaded files, projects) **and** the activity feed (logins, admin actions, config changes), plus the user/role/group directory. **[H]**
  - **Platform (API org):** **activity-feed events only** — conversation content (prompts and model responses) is **not** retrievable via the Compliance API on the Claude Platform; the content endpoints serve claude.ai data only. **[H]**
- **Shape:** pull-based REST (`GET /v1/compliance/activities` for the feed; content endpoints need scoped Compliance Access Keys). Purpose, verbatim from the doc: "audit activity, **retrieve or delete content**, and feed events into downstream tooling" — note the **delete** lever (erasure / right-to-be-forgotten / preservation). **[H]**
- **Ecosystem:** built for BYO tooling — Anthropic cites **60+ partners** across DLP, SASE, SIEM, identity, and eDiscovery **[H]**. Named integrations **[M]** (partner rosters drift — verify the current list): Microsoft Purview, Netskope, Forcepoint, Nightfall AI, IBM Guardium, Fortinet, Elastic, Okta, Island, Mimecast, Cribl. The "28 integrations" figure was the **May 2026 launch** number, since superseded by "60+." ([claude.com/blog/compliance-api-security-partners](https://claude.com/blog/compliance-api-security-partners) · [support.claude.com/en/articles/13015708](https://support.claude.com/en/articles/13015708-access-the-compliance-api))

### 2.4 Cost & rate-limit — Usage & Cost Admin API
Org-level token/cost rollups bucketed by **API key, workspace, model, service tier, context window, `inference_geo`** (`1m`/`1h`/`1d` granularity; no per-request rows). It's the **cost** plane — governed in [`token-budget-governance.md`](token-budget-governance.md); named here only so the monitoring picture is complete. Same data as the Console Usage/Cost pages. **[H]** ([platform.claude.com/docs/en/manage-claude/usage-cost-api](https://platform.claude.com/docs/en/manage-claude/usage-cost-api))

---

## 3. The monitoring decision matrix

*What to watch × which plane × who owns it × where it goes. Cadence assumes a live enterprise rollout; scale it to your stage.*

| Signal | Source plane | Owner | Cadence | Routes to |
|---|---|---|---|---|
| **Identity & access** — SSO/SCIM changes, admin actions, key creation | Audit log / Compliance activity feed | Security / IAM | Streamed or daily | SIEM / SOC |
| **Config drift** — retention-policy change, SSO change, Compliance-API enablement | Audit log | Security | Streamed | SIEM + change-review |
| **Adoption & usage** — seats, active users, feature mix | Analytics dashboard/API | Enablement + FinOps | Weekly | Enablement review — **team-level (§6)** |
| **Content / DLP** — what's being sent to Claude | Compliance API + partner DLP | Security (DLP team) | Streamed (partner) | DLP / CASB / Purview etc. |
| **Cost anomaly as a security signal** — sudden key/workspace spend spike | Usage & Cost API | FinOps + Security | Daily | Budget alert + SOC triage ([`token-budget-governance.md`](token-budget-governance.md)) |
| **Content retrieval / deletion** — eDiscovery, legal hold, RTBF | Compliance API (content scope) | Legal / Compliance | On demand | eDiscovery / legal-hold system |

The **empty cells for your org are your gaps.** A signal with no owner and no destination is not being monitored, however many logs you export.

---

## 4. Wiring it to the SOC / SIEM

- **The feed is pull-based.** There is no native push/webhook stream — SIEM "near-real-time" is a **partner or DIY poller** on `GET /v1/compliance/activities`. Budget a scheduled job (or a partner connector) and a cursor. **[H]**
- **Two retrieval modes, different jobs:** the **audit-log Console export** is a point-in-time, 180-day, human-initiated pull (good for a periodic compliance snapshot); the **Compliance API** is the programmatic, continuous, CMEK-compatible feed (good for the SOC). Don't try to run a SOC off the export button.
- **Least privilege is a first-class control here.** The activity feed is broadly readable (`read:compliance_activities`); **content** needs separately-scoped Compliance Access Keys. Hand the SOC the feed scope; gate content-read keys behind the legal/DLP function. Over-scoping the content key is the §7 failure mode. **[H]**
- **Partner vs DIY:** if you already run Purview / Netskope / Nightfall etc., use the built integration — it's the supported path and carries the DLP policy engine you lack natively (§5). DIY only where no partner covers your stack; then you own the poller, the schema mapping, and the retention.

---

## 5. Compliance proof, DLP & eDiscovery — what's native vs BYO

- **There is no native content-DLP product.** Anthropic's explicit design is bring-your-own: the Compliance API exposes content "so admin teams can apply the same security, monitoring and DLP policies to Claude that they already use for other applications." Native controls are the *governance plane* (keys, members, workspaces, managed settings) and model-level safety — **not** an admin-configurable content-scanning dashboard. Treat "monitor what users paste" as a partner/edge-DLP problem, not a checkbox. **[H]** (reasoned-absence for the negative — no primary doc describes a native content-DLP product.)
- **eDiscovery / legal hold** runs on the Compliance API's retrieve + delete plus retention config — there is **no distinct legal-hold primitive**: preservation = *extend* retention so content isn't auto-deleted; production and erasure = the Compliance API (content on Enterprise only — see §2.3). The three retention clocks that decide what's still producible — see the runbook's **§2 scope-reality table** — and the full step-by-step response protocol live in the dedicated **[`legal-hold-ediscovery-runbook.md`](legal-hold-ediscovery-runbook.md)**. Retention facts **[H]** ([platform.claude.com/docs/en/manage-claude/api-and-data-retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) · [support.claude.com/en/articles/10440198](https://support.claude.com/en/articles/10440198-configure-custom-data-retention-controls-for-enterprise-plans)); the hold-primitive gap is **[inf]/[?]** — confirm exact semantics with Anthropic.
- **⚠ ZDR ↔ eDiscovery tradeoff (decide it up front):** Zero Data Retention removes prompts/responses at rest after the response returns — activity *events* still flow, but **content you chose not to retain cannot later be produced for eDiscovery.** Decide it with legal before a hold, not during one. The operational consequence — including ZDR's stateful-feature carve-out (Batch / Files / code-exec still retain) — is worked in [`legal-hold-ediscovery-runbook.md`](legal-hold-ediscovery-runbook.md) §5; ZDR policy depth (per-org, via sales, eligibility) in [`governance-overlay.md`](governance-overlay.md) — don't infer coverage, **verify at signing.** **[H]/[?]**

---

## 6. The purpose-limitation line — the spine of this artifact

The monitoring surfaces above can expose **individual-level data**: the Analytics API's per-user **token usage** (`analytics/users`) and the per-user **spend CSV export** (Owner/role-gated), and — via the Compliance API — individual conversation content. (The thing that changed on 2026-07-11 is *unrelated* to this risk: it let employees see their *own* stats — see §2.1.) All of this data is **legitimate and necessary for security, compliance, and eDiscovery.** *None* of it is a license for **productivity surveillance** — and the repo draws that line hard in [`workforce-change-guide.md`](workforce-change-guide.md) §4 and [`value-realization-guide.md`](value-realization-guide.md).

The reconciliation is **purpose limitation — two consumers, two rule sets:**

| | Security / compliance consumer | Enablement / FinOps / people consumer |
|---|---|---|
| **Legitimate data grain** | Individual — that's the point of an audit | **Team-level and above only** |
| **How individual data is reached** | Compliance API + audit logs — **separately-scoped Compliance Access Keys**, held by security | Team aggregates only; **do not provision the per-user Analytics endpoints or the per-user cost export** to this consumer |
| **Legal basis** | Security / legal obligation / eDiscovery | Aggregate improvement — never performance management |
| **The bright line** | Access logged, scoped, purpose-bound | No individual leaderboards, no per-person data in reviews |

**Concrete decisions this forces:**
1. **Keep the per-user *admin* Analytics surfaces restricted.** Per-user token usage (`analytics/users`) and per-user spend (the Analytics-settings CSV export) are Owner/role-gated — keep them with the security/compliance function; **do not wire them into enablement, FinOps, or performance management**, which consume team aggregates. (The 2026-07-11 member-*self*-view default is fine — that's transparency, not the surveillance surface; §2.1.) **[H]**
2. **Route individual-grain security monitoring through the separately-scoped surfaces, not the analytics toggle.** The **Compliance API** (scoped Compliance Access Keys) and **audit logs** are what let security see individuals *without enablement inheriting it* — they carry per-consumer scope. The Analytics plane has no such per-consumer scope, so for everyone outside the gated admin/security role it stays **team-level**. Don't reach for an org-wide analytics switch to do a job the scoped compliance surfaces are built for.
3. **Gate on employment law.** Employee monitoring, purpose limitation, and (in EU / works-council jurisdictions) **co-determination** obligations may apply *before* you stand this up. This is jurisdiction-specific — **get employment counsel and employee-relations sign-off**, exactly as [`workforce-change-guide.md`](workforce-change-guide.md) requires; don't infer the obligation from this file.

Cross the line and you get the workforce-change failure mode: usage driven underground onto personal accounts (worse governance), a works-council dispute, and worse data — in exchange for a vanity dashboard.

---

## 7. Failure modes

| Failure mode | What it looks like | Guard |
|---|---|---|
| **Monitoring theater** | Logs exported, feed wired — nobody reviews them, no alert fires | Every signal in §3 needs a named owner + a destination + a review cadence, or it isn't monitored |
| **Surveillance drift** | Security-collected individual data quietly reused for performance management | The §6 two-consumer split, enforced by *separate scoped keys*, not policy prose |
| **Audit-log blind spot** | Assuming chat *content* is in the audit log | Audit logs carry **ids, not content**; content is Compliance-API (Enterprise) or the Primary-Owner export |
| **Export ≠ monitoring** | Running a SOC off the 180-day Console export button | Export is point-in-time; use the **Compliance API** for the continuous feed (and it's the only path under **CMEK**) |
| **Content-key over-scoping** | Broad content-read Compliance Access Keys handed to the SOC | Least-privilege: feed scope to the SOC, content scope gated behind legal/DLP |
| **ZDR eDiscovery gap** | Legal hold issued for content the org configured **not** to retain | Decide ZDR vs eDiscovery *with legal* up front (§5) |
| **Plane confusion** | "Feature X is missing" — while holding the wrong key | The §1 three-plane table: Admin ≠ Analytics ≠ Compliance |
| **Shadow-AI blind spot** | Org monitoring sees only the sanctioned org; personal-account use is invisible | Pair org monitoring with the sanctioned-alternative + comms in [`workforce-change-guide.md`](workforce-change-guide.md); size plans in [`subscription-selection-guide.md`](subscription-selection-guide.md) |

---

## 8. Maturity ladder

| Rung | You have | Next move |
|---|---|---|
| **L0 — blind** | No audit export, no dashboard review | Turn on the analytics dashboard; run one **audit-log export** and read it |
| **L1 — periodic** | Monthly audit-log export reviewed; **team-level** adoption dashboard; member analytics decided (usually off for enablement) | Stand up the **Compliance API**; scope keys least-privilege |
| **L2 — streaming** | Compliance API polled into the SIEM; a **DLP/eDiscovery partner** (Purview/Netskope/…) live; content keys gated to legal | Adopt the [`legal-hold-ediscovery-runbook.md`](legal-hold-ediscovery-runbook.md); test a retrieval and a deletion |
| **L3 — proven** | Automated compliance reporting; retention/legal-hold exercised on a real (or drill) request; ZDR↔eDiscovery posture signed off by legal | Fold into the [`incident-response-runbook.md`](incident-response-runbook.md) + quarterly access recert |

Grade yourself by the **weakest** rung you fully occupy — same rule as [`maturity-model.md`](maturity-model.md).

---

## 9. Pre-ship / operating gate — five questions

Before you call org monitoring "in place," answer these in writing:

1. **Planes:** do we hold the right credential for each need — Admin (`sk-ant-admin`), Analytics (`read:analytics`), Compliance (scoped Compliance Access Key) — and is each key least-privilege?
2. **Destinations:** does every signal in §3 have a named owner, a destination, and a review cadence — or is it theater?
3. **The line:** are the per-user *admin* Analytics surfaces (per-user token usage + the per-user spend CSV export) restricted to security/compliance and kept **out of** enablement / FinOps / performance, with individual-grain security monitoring routed through the separately-scoped **Compliance API + audit logs** (not an org-wide analytics toggle)? Has employment counsel / ER signed off (§6)?
4. **eDiscovery:** can we actually retrieve *and* delete content, is our **retention configured** to preserve content under a hold, and have we reconciled that with our **ZDR** posture — before a real hold lands?
5. **CMEK / deployment path:** if we use customer-managed keys or the AWS platform route, have we confirmed which monitoring surfaces still work (export button disabled → Compliance API; Admin endpoints stripped on AWS)?

An unanswered question here is a known gap, not a detail.

---

## Sources & cross-references

**Primary sources** (all live 2026-07; grade [H] unless noted): Admin API — [platform.claude.com/docs/en/manage-claude/admin-api](https://platform.claude.com/docs/en/manage-claude/admin-api) · Usage & Cost API — [platform.claude.com/docs/en/manage-claude/usage-cost-api](https://platform.claude.com/docs/en/manage-claude/usage-cost-api) · Analytics — [platform.claude.com/docs/en/api/admin/analytics](https://platform.claude.com/docs/en/api/admin/analytics), [support.claude.com/en/articles/12883420](https://support.claude.com/en/articles/12883420-view-usage-analytics-for-team-and-enterprise-plans) · Audit logs — [support.claude.com/en/articles/9970975](https://support.claude.com/en/articles/9970975-access-audit-logs) · Compliance API — [platform.claude.com/docs/en/manage-claude/compliance-api](https://platform.claude.com/docs/en/manage-claude/compliance-api), [support.claude.com/en/articles/13015708](https://support.claude.com/en/articles/13015708-access-the-compliance-api), partners [claude.com/blog/compliance-api-security-partners](https://claude.com/blog/compliance-api-security-partners) · Retention — [support.claude.com/en/articles/10440198](https://support.claude.com/en/articles/10440198-configure-custom-data-retention-controls-for-enterprise-plans) · SSO/SCIM — [support.claude.com/en/articles/13133195](https://support.claude.com/en/articles/13133195-set-up-jit-or-scim-provisioning). Support articles carry only relative timestamps ("updated this week/over a month ago"); platform docs are undated — all flagged for the monthly refresh. Facts trace to [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

**Claim-verified 2026-07-13** (`/doc-verify`): 28 atomic claims checked against these 11 live docs — **0 mismatches**. The only drift was cosmetic (the analytics doc dropped its pre-transition "off by default" phrasing after the 2026-07-11 default flip; the operative on-by-default fact is unchanged). Re-run on any material edit or at the monthly refresh.

**Cross-references:** [`legal-hold-ediscovery-runbook.md`](legal-hold-ediscovery-runbook.md) (the eDiscovery / legal-hold operational deep-dive — §5 here routes into it) · [`governance-overlay.md`](governance-overlay.md) (compliance posture — the policy this operationalizes) · [`token-budget-governance.md`](token-budget-governance.md) (the cost plane) · [`agent-observability-guide.md`](agent-observability-guide.md) (your-apps telemetry, the sibling monitoring artifact) · [`workforce-change-guide.md`](workforce-change-guide.md) + [`value-realization-guide.md`](value-realization-guide.md) (the surveillance boundary this must honor) · [`incident-response-runbook.md`](incident-response-runbook.md) (where alerts route) · [`enterprise-deployment-guide.md`](enterprise-deployment-guide.md) (the AWS-route plane caveat) · [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) (what crosses the boundary per feature).

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.`
