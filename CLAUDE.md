# CLAUDE.md

Guidance for Claude Code (and any other AI agent) working in this repo.

## What this repo is

**`claude-platform-playbook`** — executive-grade decision tools for AI transformation **on the Claude platform**. Audience: CIOs, CDOs, CTOs, CHROs sizing Claude adoption + architects defending the choice to leadership.

Public, CC-BY-4.0, vendor-explicit, decision-oriented. **Not** Anthropic marketing recap. Pin to current Claude model surface (Opus 4.8 / Sonnet 5 / Haiku 4.5 as of 2026-07) — refresh monthly.

There is no build system or test suite. This is a content repo of static HTML + Markdown.

## Session-start protocol

**Before any tool calls beyond orientation:**

1. Read [`scratch/NEXT_SESSION.md`](scratch/NEXT_SESSION.md) — resume bookmark (HEAD, recent landings, backlog with triggers, "things to NOT do without explicit instruction"). `scratch/` is gitignored; this is the user's personal aid.
2. Read [`LESSONS_LEARNED.md`](LESSONS_LEARNED.md) — process lessons compound; re-reading prevents repeat misses.
3. Read this file (CLAUDE.md) — repo posture, tone, things to avoid.
4. `git status` + `git log --oneline -5` — confirm state matches the bookmark's HEAD.
5. Only then ask the user what they want to work on.

This protocol is repeated in `LESSONS_LEARNED.md` as the canonical reference.

## Single source of truth

**`docs/feature-inventory.md`** is the canonical list of every Claude platform feature, model, status, pricing, and doc URL. The `Used in artifacts` column maps each row to the downstream artifacts that cite it.

**Refresh ritual:** edit `feature-inventory.md` first. Then grep `Used in artifacts` to find every file that needs to follow. Then bump as-of stamps. The monthly refresh routine (first Monday of each month) automates this — see `https://claude.ai/code/routines/trig_019PnZmQxwkS5r9iLU9aWthe`.

**Never** edit an artifact's feature claim without updating `feature-inventory.md` in the same change.

## Repo structure

```
claude-platform-playbook/
├── LICENSE                              CC-BY-4.0
├── index.html                           Visual Pages landing page · decision-stage journey (evaluate→decide→pilot→scale→operate) · persona/type/search filters · thin router into artifacts (README = full reference index; serves at Pages root, takes precedence over README.md)
├── README.md                            Audience map + artifact list + as-of stamp
├── CLAUDE.md                            This file
├── .claude/commands/                    Slash commands (bump-as-of, etc.)
├── docs/
│   ├── scope.md                         Original scope doc — do not delete
│   ├── feature-inventory.md             Single source of truth (edit first; refresh monthly)
│   └── backlog.md                       Deferred enhancements with trigger-to-revisit conditions
└── artifacts/
    ├── decision-spine.html              Front-door flowchart · 7 branches · routes reader to right artifact at each decision
    ├── decision-memes.html              8 ice-breaker memes · CSS-drawn · each points at a real decision artifact (slide-1 opener, skeptic disarmer)
    ├── anti-use-cases.md                Where NOT to use Claude · 5 categories · explicit reject filter (runs before pilot-selection)
    ├── executive-briefing.html          10-slide deck (arrow-key nav, print-PDF)
    ├── cost-calculator.html             Live $/mo · Chart.js · 5 presets
    ├── feature-decision-matrix.html     8 patterns × 12 features · hover tooltips
    ├── build-vs-buy-worksheet.html      5-axis score → ranked 6-option rec
    ├── reference-architectures.html     6 hand-drawn SVG patterns (Caveat font)
    ├── adoption-playbook.md             90-day rollout · 8 failure modes
    ├── surface-rollout-matrix.md        Which surface (chat/Projects/Claude Code/Cowork/Design/Tag/Science) for whom, in what order · governance flag + failure mode per surface · sequenced by blast radius
    ├── pilot-selection-worksheet.html   Week 0 use-case scorer · 5 axes · ranked verdicts + blocker flags
    ├── governance-overlay.md            Data flow · No-train · ZDR · HIPAA/BAA · Residency · Retention · Certs · NIST · EU AI Act
    ├── enterprise-data-boundaries.html  Per-feature trust-zone diagrams (Enterprise) · 20 features · what crosses the prompt boundary · surface-tagged (product/API/procurement/seat-plan) · per-feature BAA/ZDR/residency/retention cells · coverage table · visual companion to governance-overlay
    ├── claude-code-adoption-guide.md    Engineering CLI rollout · carries the distinguished-engineer operating posture to instill (plan→solve→verify · adversarial review · ground/anti-hallucination · token-frugal)
    ├── claude-code-101.md               Practitioner field guide · newcomer→power-user · opens with a plan→solve→verify distinguished-engineer operating posture (mandate adversarial review, ground-it/anti-hallucination, stay token-frugal) · the daily loop, 6 permission modes, model aliases (opusplan default nobody uses), CLAUDE.md craft (imports don't save context; guides≠enforces), context mgmt, subagents, headless, worktrees, a trick list + an "approach with extreme caution" failure-mode list · curated judgment OVER the docs (not a reference mirror; volatile version-specifics linked to docs.claude.com) · models referenced to feature-inventory, not restated · engineer analog of user-mindset-cheatsheet · verified [H] against docs.claude.com 2026-07-11
    ├── claude-code-enterprise-config.md Admin config layer · three reference templates (org instructions + managed-settings.json + enterprise CLAUDE.md) on the enforce-vs-guide spine (managed settings enforce client-side; managed CLAUDE.md only guides) · verbatim managed-settings paths per OS (legacy ProgramData removed v2.1.75) + 5-source delivery precedence (only one source wins) + deny-beats-allow + forceLoginOrgUUID org lock + sandbox/egress OS-level perimeter + MCP/hook/plugin supply-chain governance (managed security fields fail closed) · every managed-settings field carries failure-mode-if-omitted · delivery framed as a choice (not "drop the file here") · CLAUDE.md + org-instructions templates carry a plan→solve→verify distinguished-engineer operating posture (respond-don't-react, ground-it/anti-hallucination, token-frugal) · §5 wires the client into enterprise fabric (identity/cred-storage · cloud routing + model pinning · egress allowlist/proxy/CA/mTLS · OTel observability+privacy dial · Console workspace rate-limit) · does NOT assert BAA/ZDR/residency (routes to governance-overlay)
    ├── cowork-adoption-guide.md         Cowork (desktop agent) rollout for non-engineers · 3 gates · 4-phase arc · folder-scope/egress/review-before-act governance · instills the operating posture (plan→act→verify · adversarial check · ground-it/anti-hallucination · mind-the-plan-burn) as the non-engineer form of the Claude Code guides' distinguished-engineer posture · BAA-excluded (no PHI)
    ├── cowork-101.md                    Cowork practitioner field guide · operator twin of claude-product-101/claude-code-101 · the task lifecycle (brief→plan→review-gate→work→deliverable→verify) · daily loop done well · folder-as-privilege-dial · review-before-act in practice (ask-first vs hard-stop · "can it be undone quietly?" test) · sub-agents · long-running/scheduled tasks · 4 worked examples (analyst reconcile · ops deck · finance de-dup · research extract-w/-citations) each w/ brief+plan-shape+where-to-check+failure-mode · one governance boundary line (no PHI in a connected folder; BAA-excluded) routed to governance-overlay · rollout depth routed to cowork-adoption-guide · pointer-not-repeat vs product-101 §4 + user-mindset-cheatsheet · every mechanic traced to the feature-inventory Cowork row
    ├── cowork-101-workflow.html         Visual companion to cowork-101.md · 3 inline-SVG workflow diagrams (task lifecycle w/ the 2 checkpoints · review-gate "undone quietly?" → ask-first/hard-stop + invoice example · folder privilege dial: tight-scope vs drive-root blast radius + remote-isolation-protects-your-computer-not-connected-folders note) · literal-hex fills (no var() in SVG attrs) · no JS · prints clean · NOT new content · named -workflow to dodge the .md→.html Jekyll collision · structurally render-verified (3 SVGs · 60 texts · 0 overflow · 0 unresolved var())
    ├── claude-product-101.md            Product-surface practitioner fluency · the non-CLI twin of claude-code-101 · center of gravity is the MECHANICS the cheatsheet omits (Project RAG-retrieval/staleness/share-scope · extended-thinking cost-benefit · attachments · web-search cite-check · Artifacts · Tag org-vs-user identity + team-visibility + 30-day-post-disconnect delete · connector read-scope) · §9 surfaces the explicit-consent / autonomy-hard-stop reflex for action surfaces (a general instruction ≠ consent to every irreversible step; ask-first vs hard-stop tiers; "can it be undone quietly?" test; Cowork-invoice example; routes to agentic-threat-model excessive-agency) · surface-choice/reflexes/always-verify are POINTERS into user-mindset-cheatsheet (canonical there), not re-derived · every mechanic traced to a feature-inventory row · asserts no BAA/ZDR/residency (routes to governance-overlay + enterprise-data-boundaries) · curated judgment OVER the docs, not a help-center mirror
    ├── claude-code-starter-skills.md    8 team-grade Skill templates (when-to-use / failure-mode / owner / prompt body)
    ├── hooks-starter-pack.md            10 hook templates (block-secrets, PII scrub, branch guard, license, audit log, etc.) — phased 1→4 rollout
    ├── mcp-starter-pack.md              7 read-only MCP server templates (issue tracker, docs, CI logs, DB read, observability, API catalog, code search)
    ├── eval-starter-pack.md             8 eval templates (regression, format, tool-call, grounding, adversarial, cost, latency, refusal)
    ├── claude-misconceptions.md         19 myths that drive mis-budget / mis-architect / mis-staff calls — text-form skeptic disarmer · §6 = five-meanings-of-"tier" disambiguation matrix
    ├── data-advisory.md                 Pre-pilot data sizing — context window vs RAG, eval corpus counts, distillation trigger, cache eligibility, source taxonomy + governance flags
    ├── model-selection-guide.md         Opus / Sonnet / Haiku decision guide — 4-question framework, cascade pattern, tier-swap cost impact
    ├── subscription-selection-guide.md  Which Claude plan to buy — three-gate framework (compliance → size → build) across Free/Pro/Max/Team/Enterprise, plan-comparison table, seat-vs-API "need both" pattern
    ├── multi-agent-patterns.md          6 multi-agent patterns (incl. #6 dynamic workflows) · error-compounding math · sub-agent config · pattern decision table
    ├── incident-response-runbook.md     5 incident classes · symptoms → immediate actions → remediation → post-mortem template
    ├── roi-worksheet.html               Value side of cost-calculator · net ROI vs spend · payback · value/cost ratio · realized-capture discount · "five ways this number lies"
    ├── procurement-pack.md              Vendor-risk Q&A · security-questionnaire answers · DPA/BAA pre-sign checklist · SLA terms · direct-vs-hyperscaler path choice · surface-split · every row cites a governance § or "verify at signing"
    ├── workforce-change-guide.md        CHRO/people rollout · role-impact map · augmentation-vs-replacement comms · tiered reskilling · measure-without-surveillance · works-council gate
    ├── agentic-threat-model.md          Preventive attack surface · 10 OWASP-LLM-shape threats mapped to existing repo controls · 4-layer defense · 5-question pre-ship gate (vs incident-runbook's reactive)
    ├── maturity-model.md                L0→L4 self-locator · weakest-link self-assessment · one next-move per rung · routes by capability (spine routes by question)
    ├── operating-model-guide.md         Who owns Claude · shape choice (centralized/federated/hub-spoke CoE/CoP) + decision×role RACI + paved-road boundary · cross-refs playbook 3-function (not re-derived)
    ├── enterprise-deployment-guide.md   How to lay Claude out · tenancy reality (multi-tenant SaaS + logical-isolation levers; single-tenant=verify-with-Anthropic) · prod/non-prod via Console workspaces + per-env config matrix · eval-gated promotion flow · non-prod≠real-regulated-data landmine · workspaces/orgs/hyperscaler structural options · §4 workspace lifecycle summary (routes to enterprise-workspaces-guide) · router into token-budget/eval-pack/deprecation/governance
    ├── enterprise-workspaces-guide.html What/why/how of Console Workspaces end-to-end · visual deep-dive the deployment-guide §4 routes into · create→manage→archive lifecycle (NO hard-delete; archive irreversible + cascades to all keys) · 5 roles + least-priv (Limited Developer keeps traces/file-exfil out of reach) · limits stacking (ws cap < org; both evaluated) · env×team topology + workspaces-vs-orgs decision tree · day-2 attribution (Default=null workspace_id leak) · archive≠delete decommission ritual (delete=retention/ZDR/Compliance-API) · org-structure model (org roles→inheritance→workspaces) + team connect-&-use runbook (5 steps: added→workspace-scoped key→ANTHROPIC_API_KEY→call→workspace_id attribution) · credential-axis matrix (which credential authenticates which programmatic surface — Messages-API key / Admin key+OAuth / WIF / Claude-Code / hyperscaler-outside-workspace; SSO+SCIM footnote = the human-auth axis) · Mixed hand-drawn hero + structured lifecycle/RACI/topology/decision-tree/org-structure diagrams · Hybrid what/why/how + threaded Karekal Health scenario (illustrative) · all mechanics [H] live-verified 2026-07-14 · BAA/ZDR/residency routed to governance-overlay (never asserted)
    ├── claude-security-layers.md        The CHOOSER across Anthropic's FIVE code-security layers (+ your own CI beneath them = 6 rows) + 2 adjacent controls · §1 four-way disambiguation (deep-scan **plugin** vs security-**guidance** plugin vs managed **Claude Security** product vs **Compliance API** partner network — four price points, four buyers) · then layer-by-layer with mechanics + gate + failure mode: [1] guidance plugin (free, all users; 3 hook checkpoints SessionStart/UserPromptSubmit/PostToolUse-edit/Stop/Bash-commit; additive `claude-security-guidance.md` + `security-patterns.yaml`; **guidance ≠ enforcement — never blocks a write**; own-shell commits unreviewed; 20/hr cap; model-backed reviews SKIP on Bedrock/GCP) · [2] `/security-review` (built in, no gate, nothing durable) · [3] `/claude-security` deep scan (beta, paid plan, CC v2.1.154+, python3 3.9.6+, git; 3 jobs; `CLAUDE-SECURITY-RESULTS.md`/`.jsonl` + revision stamp; patches in a scratch repo copy) · [4] Code Review (**research preview · Team/Ent · ~$15–25 per review on usage credits, NOT plan usage · UNAVAILABLE under ZDR**) + `/code-review ultra` (free runs Pro 3 · Max 3 · Team/Ent none; **unavailable under ZDR and on Bedrock/GCP/Foundry** → silently downgrades to a local review) · [5] managed product (Enterprise, **premium seats**, consumption billing, 4 setup gates, scans minutes→hours, scope-to-a-directory advised) · [6] your own SAST/SCA (keep) · §9 adjacent axes: runtime containment (`/sandbox`) → agentic-threat-model; usage governance (Compliance API) → usage-compliance-monitoring · §10 turn-it-on decision table · §11 gates matrix · load-bearing correction: the 30–40%-fewer-PR-security-comments figure belongs to the GUIDANCE plugin, not the deep-scan one · deep-scan date [M] (X announcement, no dated blog post); all mechanics [H] vs code.claude.com verified 2026-07-23 · BAA/residency/retention routed to governance-overlay (only the 2 stated ZDR exclusions asserted)
    ├── claude-security-workflows.html   Visual companion to claude-security-layers.md · the six-layer ladder + **one workflow diagram per ACTIVE layer** (5 diagrams; layer 6 = your own CI, not Anthropic's) + the gates matrix (guidance-plugin hook lifecycle w/ blind-spot strip · `/security-review` single pass · deep-scan scan→report→patches · Code Review PR track + ultrareview remote-sandbox track w/ the silent-downgrade box · managed-product 4 gates + scan flow) + adjacent-axis cards + the four-way table · 6 structured inline SVGs (literal-hex fills), no JS, prints clean · NOT new content · named -workflows to dodge the .md→.html Jekyll collision · structurally render-verified (6 SVGs, 174 texts, 0 viewBox overflow, 0 clipped nodes, 0 unresolved var() in SVG attrs)
    ├── service-accounts-guide.md        Service-account / non-human-identity concept anchor · the concept 4 artifacts (config §5.1 · workspaces credential-axis · agentic-threat-model · token-budget) reference but none defines · Claude credential taxonomy (workspace key · WIF svac_ · Admin key · Claude Code setup-token · hyperscaler IAM) = who/what each surface authenticates as · person-vs-machine governance decision (attribution · least-priv · offboarding · blast radius) · load-bearing trap: Claude Code setup-token is subscriber-bound, NOT a service account · no new feature claims (re-anchors WIF/workspace/Admin inventory rows) · BAA/ZDR routed to governance-overlay
    ├── service-accounts-architecture.html  Visual companion to service-accounts-guide · credential taxonomy (§3) + 3 focal decisions (setup-token trap · hyperscaler attribution gap · least-priv) as ONE identity-architecture diagram over a complex deployment (Karekal Health, reused from workspaces-guide) · every node annotated credential + person-vs-machine · identity LENS not topology (routes layout to enterprise-deployment-guide/enterprise-architecture) · structured inline SVG (deviation from hand-drawn, like enterprise-architecture) person=warm/machine=teal/trap=red/hyperscaler=slate · no JS, prints clean · NOT new content (re-renders guide §3–§6, no new claims) · render-verified (literal-hex fills, no clip)
    ├── claude-enterprise-architecture.html  Full Enterprise feature surface in one layered view · access→human/dev surfaces→capabilities→models→deployment paths + cross-cutting governance spine · every box status-tagged (GA/beta/preview) + grounded in feature-inventory · hover any box for a one-line blurb (native title attr) · structured layered style (deviates from hand-drawn by design) · each box routes to its decision artifact · full-surface status map (refresh checklist item #7 keeps tags honest)
    ├── rollout-kickoff-kit.md           Who acts, in what order, first 30 days · persona × time swimlane (Week 0→4) + role quick-start (first artifact·deliverable·gate·failure mode) + between-lane handoff seams · persona-lensed first 30d of playbook (hands off Week 5)
    ├── user-mindset-cheatsheet.md       End-user week-1 handout · 7 before→after mindset shifts (direct-and-check · verify what it gets wrong · reach-first) each w/ its over-correction · daily task patterns by surface · always-verify list · data boundary · the practitioner-tier handout workforce-change names
    ├── user-mindset-cheatsheet-color.html  Colour-coded / print form of the cheatsheet (green=shift · amber=trap · red=boundary) · same content, HTML so it can carry colour (markdown can't on GitHub) · named -color to avoid Jekyll .md→.html collision
    ├── user-mindset-mindmap.html        Visual companion to the cheatsheet · 7 shifts as a one-glance radial mindmap (center: you direct & check, you own what ships) · reassurance banner + data-boundary strip · inline SVG, no JS, prints clean
    ├── value-realization-guide.md       Receives the playbook Day-90 handoff · actuals vs ROI projection · 5 metric families each w/ Goodhart counter-metric · per-surface leading indicators · quarterly renew/expand/kill table · team-level only (surveillance boundary held)
    ├── token-budget-governance.md       FinOps layer between cost-calculator estimate and maturity L2 gate · 4-level budget ladder mapped to platform controls (workspaces/spend caps) · caps-on-experiments alerts-on-prod · showback→chargeback graduation · monthly variance triage
    ├── agent-observability-guide.md     Day-2 telemetry between eval-pack (pre-ship) and incident-runbook (post-burn) · minimum telemetry schema · 6 golden signals · alert table routed to incident classes · PII-in-logs = top failure mode · judge sampling costed
    ├── usage-compliance-monitoring.md   CISO/admin operational monitoring of employees' Claude PRODUCT usage (org-usage counterpart to agent-observability's app telemetry) · three admin planes (Admin API sk-ant-admin org-mgmt · Analytics API read:analytics usage · Compliance API scoped-keys activity-feed+content+delete) · audit logs (Enterprise · 180-day Console export · ids-not-content · CMEK-disables-export) · monitoring decision matrix · SOC/SIEM wiring (pull-based · 60+ DLP/eDiscovery partners) · eDiscovery+retention (Activity Feed 6yr · ZDR↔eDiscovery tradeoff) · SPINE = purpose-limitation line (per-user analytics on-by-default 2026-07-11; legit for security, forbidden for productivity surveillance; two-consumers/two-rule-sets; works-council gate — holds workforce-change §4 + value-realization boundary) · every platform fact [H]+primary URL, live-verified 2026-07-12/13 · BAA/ZDR routed to governance-overlay (never asserted) · adds 4 feature-inventory rows
    ├── legal-hold-ediscovery-runbook.md eDiscovery/legal-hold operational runbook (Legal/Compliance + executing admin) · the deep-dive usage-compliance-monitoring §5 routes into · load-bearing honest fact up front: NO named legal-hold primitive (preservation = extend retention [H] + Compliance-API retrieve/delete) · standing prep · scope-reality table (retrievable-per-surface × retention horizon: chat=config · ActivityFeed=6yr · audit-export=180d-window) · request-type matrix (preserve vs delete) · 7-step protocol (freeze delete-clock FIRST) · two traps (ZDR=can't-produce · delete-under-hold=spoliation) · CMEK/Public-Sector/AWS caveats · confirm-with-Anthropic open items ([inf]/[?]) · reuses 4 inventory rows (no new feature claims) · platform-mechanics-not-legal-advice up top + footer · BAA/ZDR routed to governance-overlay
    ├── legal-hold-ediscovery-flow.html  Visual companion to the legal-hold runbook · colour-coded flow (green=preserve/produce · red=delete/trap) · preserve-vs-delete fork + 7-step response spine (preserve BEFORE scope) · ZDR-can't-produce + spoliation traps called out · inline SVG · no JS · print-clean · NOT new content (re-render of the runbook fork+protocol) · named -flow to dodge .md→.html Jekyll collision
    ├── model-deprecation-runbook.md     Planned migration path for incident class #2 · standing prep (pins, manifest, evals, cost baseline) · 6-step protocol (pin audit → parity → eval cert → cost re-forecast → staged cutover → decommission) · hyperscaler-lag caveat
    └── exit-portability-memo.md         What leaving Claude costs, component by component · portability ledger · hedges graded honestly (Bedrock≠model diversification, gateway=feature tax) · 5 week-1 actions · exit-theater named as its own failure mode
```

## Working in this repo

### When adding/updating content

1. **Check `docs/feature-inventory.md` first.** If the change touches a Claude feature/model/pricing, edit the inventory row first.
2. **Cite primary sources.** All technical claims link to `docs.claude.com` or `anthropic.com/pricing` with the as-of date stamped. Never paraphrase Anthropic marketing copy verbatim.
3. **Pin specific versions** in current-state references (Opus 4.8, Sonnet 5, Haiku 4.5) but **structurally pin to family** ("current Sonnet tier") in the few places that document long-term posture (governance overlay, adoption playbook). Specific versions = current; family pins = stable interface.
4. **Bump as-of stamps** on every file you touch. Use the `/bump-as-of` slash command for sweeps.
5. **Cross-link** between artifacts using relative paths (`adoption-playbook.md` → `governance-overlay.md`). Don't break the audience map in `README.md`.

### When adding a new artifact

Don't, without updating `docs/scope.md` first. The original scope agreed 8 artifacts; the repo currently ships 55 (all post-v1 additions are justified in `scope.md`). New artifacts need a written justification block in `scope.md` and a row in `feature-inventory.md`'s `Used in artifacts` column.

### When the model surface changes

A new model release (e.g., Opus 4.9) is **not** a routine inventory edit — it's a breaking change to every artifact's "current model" reference. Process:
1. Update `feature-inventory.md` model table
2. Search-replace old version → new in every artifact (use `Grep -l` to enumerate)
3. Update README footer
4. Run `/bump-as-of` for the as-of stamps
5. PR with diff list — sponsor reviews

### When pricing changes

Edit both `feature-inventory.md` Models table **and** `artifacts/cost-calculator.html` `PRICING` const + visible pricing table. Both must match. The `As of` stamp on the calculator is load-bearing — users decide budgets from this number.

## Tone constraints

- **Decision frame first, features second.** Every artifact answers a decision an executive is making, not "here's a Claude feature."
- **Numeric where possible.** Cost bands, percent reductions, time-to-value windows. No adjectives doing numeric work ("massive cost savings" is a fail).
- **Pros + cons for every recommendation.** No tool, model, or pattern is universally best. Always name the failure mode.
- **No Anthropic-marketing register.** "Claude is the most advanced AI" — not in this repo. "Sonnet 5 with prompt caching cuts steady-state cost 60–80% vs. naive use" — yes.
- **Footer pattern (consistent across all artifacts):** `© gmanch94 · CC-BY-4.0 · As of YYYY-MM. Verify pricing/models at anthropic.com.`

## Hand-drawn SVG style (reference-architectures.html only)

Diagrams use Caveat + Patrick Hand fonts and slightly imperfect path geometry to feel hand-drawn rather than corporate-clean. When adding diagrams: keep the same color taxonomy (user=orange, claude=brown, tool=blue, store=green, output=dark-orange) and the legend at top. Don't switch to Mermaid or other generators without scope-doc update.

## Companion repos (referenced from README)

- `ai-architect-showcase` — vendor-neutral AI strategy artifacts
- `ai-enablement-ws` — architect-grade operational reference

These exist; don't duplicate their content here. This repo's job is **Claude-specific** decision tooling.

## Automation

- **Monthly refresh routine** (`trig_019PnZmQxwkS5r9iLU9aWthe`): first Monday of each month, audits `feature-inventory.md` against `docs.claude.com` + `anthropic.com/pricing` **and, for the product surfaces, `support.claude.com` + `claude.com/product/*`** (docs.claude.com doesn't cover them); opens a PR if drift detected. Diffs not just status/pricing/URL but **availability surfaces, execution/hosting model, plan gate, and governance flags** per row, and re-audits the product surfaces (Cowork/Design/Tag/Science) every run — surface dimensions added 2026-07-23 after the Cowork remote-execution + web/mobile-beta drift slipped a status/pricing-only check (see [`LESSONS_LEARNED.md`](LESSONS_LEARNED.md)). Manage at https://claude.ai/code/routines.
- **`/bump-as-of` slash command:** sweeps `As of YYYY-MM` stamps across all artifacts. Use for the monthly refresh sweep.
- **`/stale-check` slash command:** read-only audit of as-of stamps, model pins, product-surface status, URL health, and feature-inventory cross-refs. Step 7 runs **`scripts/check-counts.mjs`** — a deterministic artifact-count guard (no deps): asserts `artifacts/` file count **==** README `## Artifacts` catalog rows **==** every stated count in `scope.md`/`CLAUDE.md`. Retires the recurring "bumped an artifact, forgot the count" drift (precedent 2026-07-19: docs said 46 while the repo held 51). Run standalone anytime: `node scripts/check-counts.mjs`.
- **`/render-fix` slash command:** thin wrapper over the global `check-md` skill (`~/.claude/skills/check-md/`), which finds + fixes kramdown/GitHub-Pages render gotchas in published `.md` — stray-pipe phantom tables (` | ` between cells mis-parses as a table; invisible in source, only shows on the live HTML), plus table-spacing / 4-space-indent traps — then render-verifies on the live page. Run before/after shipping any `.md` with inline pipes. Full rule: `~/.claude/rules/markdown-render-gotchas.md`.
- **`/doc-verify` slash command:** thin wrapper over the global **`doc-verify`** skill (`~/.claude/skills/doc-verify/`) — read-only **claim-level** fact-check of a config/claim-dense artifact against the live doc it cites (`curl <url>.md` → diff). Catches the class `/stale-check` misses — a wrong *value* behind a healthy URL + current stamp (precedent 2026-07-12: `disableBypassPermissionsMode: true` vs the doc's `"disable"`). Extracts atomic claims (config keys+values, env defaults, version pins, exact paths, enum/string sentinels), fetches the `.md` doc variant, emits MATCH / MISMATCH / UNVERIFIED — **every verdict carries a verbatim live-doc quote; UNVERIFIED ≠ wrong, never auto-edited** (guards against the stale-snapshot false-negatives a free-floating doc-agent produces; presence-checked with `grep -o` before the quote to dodge long-line collisions). The wrapper supplies this repo's claim-dense target set + `docs.claude.com` host; the global skill owns the procedure. Run when a claim-dense artifact changes or before a release. Complements `/stale-check` (metadata), monthly refresh (inventory), `/render-fix` (render).

## Things to avoid

- Adding OpenAI/Gemini cost comparisons to `cost-calculator.html` — explicit decision: Claude-only.
- Replacing hand-drawn SVG with Mermaid in `reference-architectures.html` — explicit decision: hand-drawn.
- Using floating model aliases ("latest Claude") in production-facing copy — pin specific versions or family.
- Editing `LICENSE`.
- Adding emojis to artifacts unless explicitly requested.
