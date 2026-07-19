# Claude Legal-Hold & eDiscovery Runbook

**As of 2026-07.** Not model-specific — this is a platform-governance runbook. Companion to [`usage-compliance-monitoring.md`](usage-compliance-monitoring.md) (the admin monitoring planes + credential mechanics this relies on) and [`governance-overlay.md`](governance-overlay.md) (retention + ZDR policy depth). **Visual companion:** [`legal-hold-ediscovery-flow.html`](legal-hold-ediscovery-flow.html) — the fork + the 7-step spine at a glance. Facts graded **[H]** primary-doc / **[M]** reputable-secondary / **[inf]** inferred / **[?]** uncertain.

> **⚠ This is platform mechanics, not legal advice.** It tells you what the Claude platform can and cannot *preserve, retrieve, and produce* — not what your duty to preserve is, what counts as responsive, or how to run a matter. Every step below is "what the platform does"; the legal decisions (scope of hold, what's discoverable, spoliation exposure) belong to counsel. Get legal + records sign-off before acting on any of it.

> **The one thing to know first.** Claude has **no button called "legal hold."** Preservation is a *pattern you assemble* from two documented primitives — **retention configuration** (to keep content from auto-deleting) and the **Compliance API** (to retrieve or delete content) — plus one thing you must confirm with Anthropic: whether retention can be *held per-matter* or only *extended org-wide*. If you came looking for a hold toggle, routing around its absence is what this runbook is for.

---

## 0. The decision this runbook is really about

Most of what you can produce when a hold lands was decided **months earlier**, by two configuration choices you may not have framed as eDiscovery decisions:

1. **Your retention policy** — content you let auto-delete is gone; you can only produce what you kept.
2. **Your ZDR posture** — Zero Data Retention removes prompts and responses at rest after the response returns. Under ZDR, the content a hold asks for **was never retained to begin with.**

So the runbook has two halves: **standing prep** (§1–§2, done before any hold — it decides what is even producible) and **the response protocol** (§3–§4, done when a hold lands). If you are reading this reactively and skipped the prep, jump to §4 step 3 first: know whether the content still exists *before* you promise a court you can produce it.

---

## 1. Standing prep — you can only produce what you preserved

Everything here is done *before* a hold. Every gap is content you will not be able to produce later.

| Standing control | Why it decides producibility | Grade |
|---|---|---|
| **Retention configured to preserve, not minimize** | Enterprise chat/file/project content retention is Owner-set, minimum 30 days, and **extendable**. A short window quietly destroys responsive data on a rolling basis. | **[H]** |
| **ZDR ↔ eDiscovery decided with legal, in writing** | ZDR removes content at rest — you cannot later produce what you chose not to retain. Decide the tradeoff before a hold, not during one. | **[H]/[?]** |
| **Compliance API enabled + content-scoped keys pre-provisioned to legal** | Content retrieval needs scoped Compliance Access Keys; standing them up mid-hold burns days. Available on Enterprise + Platform, **excluding Public Sector orgs**. | **[H]** |
| **Surface known: Enterprise (claude.ai) vs API Platform** | Conversation content is retrievable via the Compliance API **only on Enterprise/claude.ai**. On the API Platform the Compliance API returns activity-feed events only — **no content**. This decides whether content eDiscovery is possible at all. | **[H]** |
| **Deployment-path caveats mapped** | CMEK disables the audit-log export button (route to Compliance API); Claude-Platform-on-AWS strips most Admin endpoints. Know yours before you rely on a surface. | **[H]** |
| **Custodian identity mapping** | SSO/SCIM identity to Claude user id, so a per-custodian hold can name the right accounts. | **[inf]** |

---

## 2. What is actually retrievable — the scope-reality table

Before you promise production, know what the platform holds and for how long. Two axes: **surface** (what is retrievable, and where) and **retention horizon** (how long it survives).

| Data type | Enterprise (claude.ai) | API Platform | Retention horizon |
|---|---|---|---|
| Conversation content (chats, prompts, responses) | Compliance API content endpoints (scoped key) | **Not retrievable** (content endpoints serve claude.ai only) | Org-configurable; Enterprise minimum 30 days, extendable |
| Uploaded files / projects | Compliance API content endpoints | Not via Compliance API | Same org retention policy |
| Activity / audit events (logins, admin actions, config changes) | Compliance API activity feed + Console audit-log export | Compliance API activity feed | **Activity Feed retained 6 years**; the audit-log *export* window is 180 days (an export limit, not a retention period) |
| API inputs / outputs (Platform, non-ZDR) | n/a | 30-day backend deletion default; AUP-flagged up to **2 years** (inputs/outputs), T&S classifier scores up to **7 years** | per privacy policy **[H]** |
| Per-user identity / role / group directory | Compliance API | Compliance API | current-state |

**Three retention clocks coexist — do not conflate them:** chat/file/project content follows **your configurable policy**; the Activity Feed is **6 years fixed**; the audit-log Console export is a **180-day export window**, not a retention period. **[H]** (retention doc + support article; traces to `feature-inventory.md` retention rows).

---

## 3. Request-type matrix — which direction, which mechanism

Not every legal request pulls the same lever. Two point in opposite directions — **preserve/produce** vs **delete** — and running the wrong one during a hold is how spoliation happens.

```
                  which legal request?
                          │
           ┌──────────────┴───────────────┐
           ▼                              ▼
    PRESERVE / PRODUCE                 DELETE
    litigation hold · eDiscovery ·     RTBF / DSAR / erasure
    regulatory request                          │
           │                                    ▼
           ▼                            Compliance API delete
    extend retention  +                 ─ under an active hold this MAY
    Compliance API retrieve               be spoliation → reconcile against
           │                              active holds FIRST (§5 Trap B)
           ▼
    TRAP: ZDR / short retention = you can't produce
    what you chose not to retain (§5 Trap A)
```

| Request | Direction | Mechanism | The trap |
|---|---|---|---|
| Litigation hold | Preserve | Extend retention so the auto-delete clock cannot reach responsive data (§4 step 2) | No hold *primitive* — you extend retention; confirm per-matter scoping with Anthropic |
| eDiscovery production | Retrieve | Compliance API content endpoints (Enterprise), scoped key, export to review platform | Content only on Enterprise; API-Platform matters have activity events, not content |
| Regulatory / audit request | Retrieve | Same as production, plus the activity feed for the who-did-what record | The audit log carries **ids, not content** — content is a separate Compliance-API pull |
| RTBF / DSAR / erasure | **Delete** | Compliance API delete lever | Deleting content **subject to an active hold may constitute spoliation** — reconcile erasure against active holds *before* deleting (a legal call, not an admin one) |
| Internal investigation | Retrieve (quietly) | Compliance API content, least-privilege key held by legal | Purpose-limitation + employment-law gate still applies (usage-compliance §6) |

---

## 4. Response protocol — when a hold lands

Time-boxed, like the incident runbook. **Step 1 (preserve) is the one that loses matters if it's late — do it before you scope, not after.**

```
  hold reasonably anticipated
             │
             ▼
  ┌────────────────────────────────┐   extend retention org-wide ·
  │ 1  PRESERVE NOW  (before scope) │─▶ stops the auto-delete clock ·
  └────────────────────────────────┘   no custodian precision needed
             │
             │  on ZDR / short retention?  →  content may already be GONE
             │  →  tell counsel now (§5 Trap A) — a producibility finding, not a delay
             ▼
  2  SCOPE  (with counsel)      custodians · date range · data types · which surface
             │
             ▼
  3  CONFIRM it still exists     Enterprise = content ·  API Platform = events only
             │
             ▼
  4  PROVISION content key       least-privilege · to legal / records, NOT the SOC
             │
             ▼
  5  RETRIEVE                    Compliance API content endpoints (Enterprise)
             │
             ▼
  6  PRODUCE + chain of custody  export to review platform · log who / when / scope
             │
             ▼
  7  RELEASE                     restore normal retention when the hold lifts
```

**Step 1 — Preserve immediately, before you scope.**
- Preservation attaches *first and broad*; scope narrows later. The moment a hold is reasonably anticipated, **extend the org's configured retention conservatively, org-wide.** This stops the auto-delete clock and needs no custodian precision — so it runs *before* counsel has scoped anything. Retention is Owner-set and extendable. **[H]**
- Why first: the auto-delete clock keeps running during a hold. Responsive content inside a short retention window can be destroyed while you are still scoping (which can take days) — spoliation by inaction. Over-preserve now; tighten once scoped (step 2).
- **Not documented — verify with Anthropic before you rely on it:** whether retention can be *suspended* or *held per-matter / per-custodian*, or whether the only lever is org-wide extension. There is no published distinct-hold primitive. **[inf]/[?]** Do not tell a court you "placed a hold" until you have confirmed what the platform actually did.
- If you use **ZDR:** stop. The content may already be gone (§5). Tell counsel immediately — this is a producibility finding, not a delay.

**Step 2 — Scope the hold (with counsel).**
- Custodians (which people/accounts), date range, data types (chats / files / projects / activity), and **which surface** they live on (Enterprise vs API Platform).
- Output: a written scope you can map to platform surfaces. If counsel cannot name custodians + range + surface you cannot scope a retrieval — but the org-wide preserve from step 1 is already holding the data while you work.

**Step 3 — Confirm the content still exists on a retrievable surface.**
- Enterprise/claude.ai: content is retrievable via the Compliance API content endpoints. API Platform: **conversation content is not retrievable** via the Compliance API — you have activity events only. **[H]**
- Check ZDR + retention age against the hold's date range. Report any gap to counsel *before* promising production.

**Step 4 — Provision the least-privilege content key.**
- Content retrieval needs a **content-scoped Compliance Access Key**, distinct from the broadly-readable activity-feed scope. Hand the content key to the **legal / records custodian**, not the SOC (over-scoping it is the standing failure mode — usage-compliance §7). **[H]**

**Step 5 — Retrieve.**
- Pull conversation content via the Compliance API content endpoints (Enterprise). Map results to the scoped custodians + date range.
- **Verify with Anthropic the scoping granularity available** (per-user / per-date-range / per-matter). The docs establish that content retrieval and deletion exist and need scoped keys; they do **not** publish the content query parameters. Do not design a workflow around a filter you have not confirmed. **[?]**

**Step 6 — Produce + record chain of custody.**
- Export to your review / eDiscovery platform (a partner integration if you run one — Anthropic cites 60+ across DLP / SIEM / eDiscovery; the named list drifts, verify current — usage-compliance §2.3).
- Record who pulled what, when, under which key, for which matter. The Compliance-API access is itself an activity event — capture it as part of the custody record.

**Step 7 — Release.**
- When the hold lifts and no other hold covers the same data, restore normal retention and document the release. Do not leave an org-wide retention extension in place indefinitely because nobody tracked which matter set it.

---

## 5. The two traps (they point opposite ways)

**Trap A — ZDR / short retention: the content is already gone.** You configured ZDR or a short retention window for privacy or cost reasons; a hold now asks for content that was removed at rest. You cannot produce what you chose not to retain. **This is a deliberate posture tradeoff — decide it with legal up front, do not discover it during a hold.** ZDR's carve-out cuts *both ways*: it does **not** cover stateful features (Batch, Files, code execution), so those may still retain responsive data even under ZDR — a preservation surface you must check *and* an erasure obligation you must still reach. **[H]/[?]**

**Trap B — deletion during a hold: spoliation.** The Compliance API's delete lever (built for RTBF / erasure) will destroy content that is under an active hold. Reconcile every erasure / DSAR request against the active-holds list **before** executing a delete. An RTBF obligation and a litigation hold on the same custodian is a legal call, not an admin one — escalate to counsel.

The symmetry is the point: **retain too little and you cannot produce; delete too eagerly and you may have spoliated.** Both are decided by policy + counsel, not by the platform.

---

## 6. Deployment-path caveats

| Path | What changes | Do this |
|---|---|---|
| CMEK (customer-managed keys) | Audit-log Console **export button is disabled** | Pull audit events via the Compliance API instead |
| Claude-Platform-on-AWS | Most Admin API endpoints stripped (members / keys / usage) | Confirm which monitoring surfaces survive; workspace endpoints remain |
| Public Sector org | **Compliance API excluded** | No Compliance-API eDiscovery path — confirm your alternative with Anthropic before you need it |
| API Platform (any) | Compliance API returns **activity events, no content** | Content eDiscovery is an Enterprise/claude.ai capability; API-matter production is events-only |

---

## 7. Failure modes

| Failure mode | What it looks like | Guard |
|---|---|---|
| **Nonexistent-button hold** | "We placed a legal hold" when the platform only extended org-wide retention | Say what the platform actually did; confirm per-matter hold semantics with Anthropic (§4 step 2) |
| **ZDR producibility gap** | Hold issued for content ZDR already removed | Decide ZDR ↔ eDiscovery with legal up front (§5 Trap A) |
| **Spoliation by deletion** | RTBF / DSAR delete run against content under an active hold | Reconcile erasure vs active holds before every delete (§5 Trap B) |
| **Spoliation by inaction** | Auto-delete clock destroys responsive data mid-scope | Freeze the delete clock (extend retention) *before* scoping (§4 step 2) |
| **Wrong-surface promise** | Promising content production for an API-Platform matter | Content is Enterprise-only via the Compliance API; API matters are events-only (§2) |
| **Content-key over-scoping** | Content-scoped Compliance key handed to the SOC | Least-privilege: content key to legal / records, activity-feed scope to the SOC |
| **Audit-log content assumption** | Expecting chat content in the audit log | Audit logs carry ids, not content — content is a separate Compliance-API pull |

---

## 8. Pre-hold readiness gate — five questions

Answer in writing *before* a hold lands. An unanswered question is a producibility gap, not a detail.

1. **Preserve:** is retention configured to *keep* responsive content (not minimize it), and do we know whether we can hold per-matter or only extend org-wide?
2. **Producible:** for each matter-relevant surface (Enterprise vs API Platform), can we actually retrieve content — and have we reconciled that with our ZDR posture?
3. **Scoped access:** are content-scoped Compliance Access Keys pre-provisioned to legal / records, least-privilege, and kept out of the SOC?
4. **Erasure vs hold:** is there a written process that reconciles RTBF / DSAR deletes against the active-holds list before executing?
5. **Path:** have we confirmed our deployment-path caveats (CMEK export disabled, Public Sector Compliance-API exclusion, AWS endpoint stripping) and what still works under each?

---

## What to confirm directly with Anthropic (the open items)

These are **not documented** as of the source verification (usage-compliance-monitoring, live-verified 2026-07-13) and must be confirmed with Anthropic for any real matter — do not assert them to a court:

- Whether a **distinct legal-hold primitive** exists, or preservation is only retention-extend + Compliance-API delete. **[inf]/[?]**
- Whether retention can be **suspended or held per-matter / per-custodian**, or only **extended org-wide**. **[?]**
- Whether **extending retention retroactively preserves content already inside the current window**, or applies only prospectively — the preserve step (§4 step 1) assumes retroactive coverage. **[?]**
- The **content query granularity** of the Compliance API (per-user / per-date-range / per-matter). Docs establish retrieve/delete + scoped keys; they do not publish content query params. **[?]**
- The **Public Sector** eDiscovery path, given the Compliance-API exclusion. **[?]**

---

## Sources & cross-references

**Primary sources** (all live 2026-07 via the `usage-compliance-monitoring.md` verification pass; **[H]** unless noted): Compliance API — [platform.claude.com/docs/en/manage-claude/compliance-api](https://platform.claude.com/docs/en/manage-claude/compliance-api), [support.claude.com/en/articles/13015708](https://support.claude.com/en/articles/13015708-access-the-compliance-api) · Retention (three models + 6-year Activity Feed) — [platform.claude.com/docs/en/manage-claude/api-and-data-retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) · Configurable minimum-30-day chat retention — [support.claude.com/en/articles/10440198](https://support.claude.com/en/articles/10440198-configure-custom-data-retention-controls-for-enterprise-plans) · ZDR scope + eligibility — [platform.claude.com/docs/en/build-with-claude/api-and-data-retention](https://platform.claude.com/docs/en/build-with-claude/api-and-data-retention) · Audit logs + CMEK export gotcha — [support.claude.com/en/articles/9970975](https://support.claude.com/en/articles/9970975-access-audit-logs) · AUP / T&S retention (2-year inputs/outputs, 7-year classifier scores) — [privacy.claude.com/en/articles/7996866](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data). Platform docs are undated and support articles carry only relative timestamps — all flagged for the monthly refresh. Facts trace to [`../docs/feature-inventory.md`](../docs/feature-inventory.md).

**Cross-references:** [`usage-compliance-monitoring.md`](usage-compliance-monitoring.md) (the admin planes, credential mechanics, SOC wiring, and purpose-limitation line this runbook relies on — §2.3 Compliance API, §5 DLP/eDiscovery, §6 the surveillance boundary) · [`governance-overlay.md`](governance-overlay.md) (retention + ZDR *policy* depth — the posture this operationalizes) · [`incident-response-runbook.md`](incident-response-runbook.md) (the reactive sibling — this is its legal-request analog) · [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) (what content crosses the boundary per feature) · [`procurement-pack.md`](procurement-pack.md) (DPA/BAA at signing) · [`legal-hold-ediscovery-flow.html`](legal-hold-ediscovery-flow.html) (the one-glance visual companion to this runbook).

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com. Not legal advice.`
