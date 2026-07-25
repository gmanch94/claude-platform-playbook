# Reading a Claude System Card — the executive readout

**As of 2026-07.** Worked instance: Claude Opus 5 (system card dated 2026-07-24). Pin to current surface — refresh on each model release.

Anthropic publishes a **system card** with every model. It is the only place several governance facts exist — the risk determination and protection tier, what the model is newly permitted or forbidden to do, how well it resists having your agents hijacked, and how its honesty profile moved. None of that appears in the launch blog, the pricing page, or the platform docs.

It is also 150+ pages of evaluation methodology, and nobody in your leadership chain is going to read it.

**This artifact is the bridge.** Seven questions leadership actually asks, mapped to where each is answered; the rules for quoting the numbers without misleading a risk committee; a one-page readout of the current model in that exact shape; and the decisions the readout should trigger, each with an owner.

**Refresh by swapping the instance, not the questions.** The questions are *written* to be release-independent — they ask what a governance reader needs regardless of what any card happens to find. The section map is not: cards gain and drop sections between releases (this one retired the Agent Red Teaming benchmark and introduced an indirect-prompt-injection benchmark and an election-integrity suite in the same release). **§4 is the part that expires.**

> **What this is not.** Not legal advice, not a security assessment of your deployment, and not a substitute for reading the card if you own the risk decision. Where it suggests what a conformity file or vendor questionnaire might cite, **your counsel decides what that file may rely on** — this names the artifacts that exist, not their legal sufficiency. It asserts no BAA, ZDR, or residency coverage; those live in [`governance-overlay.md`](governance-overlay.md) and are a different source. Every §4 finding names the model and its card section, because **a determination is per-model and re-made every release**.

---

## 1. Why a system card is its own source

Four sources describe a new Claude model. They do not overlap:

| Source | Carries | Does **not** carry |
|---|---|---|
| Launch post / news | Capability claims, positioning, headline benchmarks | Any risk determination |
| Pricing page | Rates, tiers, cache economics | Anything behavioral |
| Platform docs | Parameters, defaults, limits, availability | Safety posture, safeguard policy |
| **System card** | **Risk determination + protection tier, safeguard policy changes, measured adversarial robustness, honesty profile, admitted limitations** | Pricing; your deployment's controls |

The practical consequence: an organization that tracks releases via the launch post and the docs will pin the right model version, budget the right cost, catch the breaking parameter changes — **and miss every governance fact about the model it just adopted.** The failure is quiet, because nothing in a release-tracking process reports a gap it doesn't know exists. (This repo ran exactly that sweep on Opus 5 and landed none of the card's findings until the card itself was read — [`../LESSONS_LEARNED.md`](../LESSONS_LEARNED.md).)

**Who should care, and about what:**

| Role | The question the card answers for them |
|---|---|
| Risk committee / board | What tier of protection does the vendor apply, and on whose determination? |
| CISO | What can the model now do that a bad actor could use? What did the vendor's own monitoring catch? |
| AppSec / security engineering | What is the model now permitted to help with — and what is still blocked? |
| Security architect | How well does it resist prompt injection, and what safeguards does the vendor supply vs. what must I build? |
| Platform / engineering lead | Does the capability delta hold on our workloads, and does it change our model tiering? |
| Legal / compliance | Which named framework and which contracting entity do we cite? |
| Every user's manager | Did output trustworthiness improve enough to relax verification? (Usually: no.) |

---

## 2. The seven questions

Deliberately stated without section numbers — those belong to a specific card and move between releases. The per-card map lives in §4, where it can expire cleanly.

| # | The question in plain terms | Where to look | What a good answer looks like |
|---|---|---|---|
| Q1 | **How risky does the vendor say this model is, and what protections follow?** | The scaling-policy / risk-threshold evaluations, and the executive summary | A named capability determination per threat model, and a **named protection tier** that follows from it — not an adjective. |
| Q2 | **What can it do now that it couldn't before, that a bad actor could use?** | Cyber capability; malicious use of agents | Benchmarked capability against the prior model *and* the vendor's own frontier, with the safeguards disclosure attached. |
| Q3 | **Did the rules change — is anything newly allowed or newly blocked?** | Safeguards coverage; harmlessness evaluations | A specific policy delta, the vendor's reasoning, and a route to request an exemption. |
| Q4 | **Can our agents be hijacked through content they read?** | Prompt-injection robustness | Attack-success rates per surface, with *and* without the vendor's own safeguard layers, and the test conditions stated. |
| Q5 | **Can we trust the output more than before?** | Honesty and hallucinations | Accuracy *and* hallucination measured separately. They can move in the same direction. |
| Q6 | **What did the vendor admit, that we should hold them to?** | Deployment monitoring; stated limitations; the card's own internal review | Named residual behaviors with rates, and stated coverage gaps in the vendor's own testing. |
| Q7 | **Who evaluated this besides the vendor, and what were they allowed to test?** | External red-teaming and third-party evaluation sections | Named organizations, hours or attempt budgets, the scope they were *permitted* to probe, and whether a bug bounty has run yet. |

**Q7 is the structural answer to rule 5 in the next section.** Everything else in a system card is the vendor grading its own homework; this is the only question whose answer isn't. **Q6 is the one most likely to be skipped and shouldn't be** — a lab publishing what its own monitoring caught describes behavior *in use* rather than behavior on a benchmark, which is the closer analogue to your deployment.

**A question the card doesn't answer is itself a finding.** Record "not evaluated" rather than dropping the row — a readout that silently shrinks to the questions with good answers is a marketing document.

---

## 3. Six rules for quoting these numbers

The fastest way to lose credibility with a risk committee is to quote a system-card number as though it described your deployment.

1. **Most capability and robustness numbers are measured with production safeguards disabled.** The cards say so explicitly, usually more than once. A figure like "it produced 99 working exploits" describes the **raw model** on a benchmark harness, not what a user can get out of the deployed product. Quote the number *and* the condition, in the same sentence, always.
2. **"Helpful-only" variants are not the product.** For some evaluations the vendor deliberately tests a version with harmlessness training removed, to measure raw capability. Those numbers describe a model **you cannot access**. Check which variant produced any alarming figure before it reaches a slide.
3. **Adversarial test setups are deliberately generous to the attacker.** Adaptive red-team results typically let the attacker optimize directly against the same scenarios, with attempt budgets ranging from tens to hundreds per scenario — affordances a real attacker facing an unknown deployment does not have. That makes the result conservative, which is good; it also makes it not a prediction of your incident rate. **Check the attempt budget per evaluation** — it varies within a single card, and a rate quoted without it is not comparable to anything.
4. **A 0% and a "no critical jailbreak found" are bounded claims.** Zero on a fixed scenario set means no attack in *that set* succeeded. "None found" means none was found by the teams who looked, in the hours they had — and the card will usually tell you how many hours, and whether the bug bounty has run yet. Neither is a proof of impossibility. Present them as strong evidence, never as a guarantee, because the first counterexample lands on whoever made the stronger claim.
5. **Vendor-benchmarked is `[M]`, not `[H]`.** Capability scores on the vendor's own harness are a reasonable prior and not a substitute for your eval. Where a number would change a spend or a re-tiering decision, run [`eval-starter-pack.md`](eval-starter-pack.md) against your own workload first.

6. **Compare like with like.** The most tempting sentence in any release readout pairs the *safeguarded* new model against the *unsafeguarded* old one. Check that both halves of a "X% → Y%" carry the same conditions; if the card publishes a safeguarded column for the prior model, use it.

**The generalization:** every number in a system card has a test condition, and the condition is load-bearing. Strip it and you have converted a careful disclosure into a marketing claim — which is exactly what a skeptical board member will catch you doing.

---

## 4. Worked instance — Claude Opus 5, card dated 2026-07-24

<!-- CARD-STAMP: model=Claude Opus 5 card-date=2026-07-24 — /stale-check reads this line; /card-sweep replaces this whole section. Never search-and-replace a model name into §4. -->


The current readout in the shape above. **This section expires; replace it wholesale from the next card — never search-and-replace a model name into it.** Source: [anthropic.com/claude-opus-5-system-card](https://www.anthropic.com/claude-opus-5-system-card). Determinations are recorded as Compliance rows in [`../docs/feature-inventory.md`](../docs/feature-inventory.md), with the full numbers and their test conditions in the note block beneath that table; the per-surface robustness detail is in [`agentic-threat-model.md`](agentic-threat-model.md).

**Grades, applying rule 5:** Q1, Q3 and Q6 are `[H]` — the vendor disclosing its own policy, determination, and monitoring results. Q2, Q4 and Q5 are `[M]` — benchmarked by the vendor on its own harness, **with production safeguards disabled unless a cell says otherwise**.

| # | Finding | So what |
|---|---|---|
| **Q1** `[H]` §2.1.3, §2.4.2 | **ASL-3 protections apply — the same tier as Opus 4.8.** Chem/bio CB-1 capability conservatively treated as present; CB-2 not crossed; the automated-AI-R&D threshold not crossed. Overall alignment risk **very low — but, per §2.4.2, higher than for models released before Claude Mythos Preview.** | Your upstream control story **did not change** with the upgrade. That is the fact to hand your risk committee, and it beats "the vendor takes safety seriously." Carry the second clause of the alignment-risk sentence: a rising baseline reads differently from a flat one. |
| **Q2** `[M]` §3.3, §3.5 | Cyber capability up sharply over Opus 4.8 — non-zero vulnerability-discovery results on **79.4%** of targets vs 38.5% (OSS-Fuzz), **99** full working exploits vs 2 (ExploitBench, AutoNudge arm) — **both measured with all safeguards disabled** — and still behind Mythos 5 at exploit development (Mythos 5 is invite-only, so that ceiling isn't one you can deploy against). On an **earlier snapshot**, three external red teams (~100h, ~16h, and an automated attacker at 150 attempts/task) found **no *new* universal jailbreak strategy** — "new" is the card's word and the bound on the claim. One task did fall to task-specific prompting, and **the bug bounty had not yet run.** Rule 4: encouraging, not a clean bill of health. | Capability rises each release whether or not you adopt it; the safeguards are what stand between that curve and a misuse event. This is the row that argues for keeping the classifier layer intact rather than seeking exemptions casually. |
| **Q3** `[H]` §3.2, §3.4 | **Source-code vulnerability discovery is now permitted at all access levels, including general availability.** Compiled-binary discovery stays blocked. False-positive blocks on defensive work dropped **relative to Fable 5** — for prior-Opus users the card predicts a *similar* experience, so treat the source-code unblock as the new thing, not the false-positive rate. Stated for **Opus 5 only**; other tiers aren't addressed. A **Cyber Verification Program** exempts verified defensive work, and **Enterprise can apply to unblock penetration testing** — mechanics, eligibility and turnaround are **not stated in the card**. | An immediate unblock for AppSec teams on Opus 5, and a sanctioned path when a legitimate security team hits a wall instead of the jailbreak-flavored prompting that becomes a governance finding. Verify the exemption route with your Anthropic rep **before** scheduling an engagement around it. See [`claude-security-layers.md`](claude-security-layers.md) §9. |
| **Q4** `[M]` §5.2 | **2.0%** attacker success at 15 attempts on the vendor's indirect-prompt-injection benchmark, vs 5.5% on Opus 4.8 — **Claude models measured without additional safeguards**, while the non-Claude comparators (best measured: 16.5%) ran on public endpoints that may include their own safeguards, so that comparison is **not like-for-like**. Browser use in the Cowork harness, **10 attempts per scenario**: 3.70% raw, **0 of 129 with connector auto mode**. ⚠ Rule 6: Opus 4.8 with the same safeguard was already at **0.08% (1 of 129)** — the generational delta is in the unsafeguarded condition. **Bug bounty had not run.** | Two vendor layers now exist — probes on tool results coming in, a classifier blocking dangerous tool calls going out. "We run with connector auto mode enabled" is a control statement with a number behind it, **provided you have confirmed it is on for your surface** (the card doesn't state the default). **It does not discharge your controls** — see [`agentic-threat-model.md`](agentic-threat-model.md). |
| **Q5** `[M]` §6.5.1, §6.1.3 | On the closed-book AA-Omniscience factuality benchmark, **accuracy 11% higher and hallucination rate 6% higher** than Opus 4.8 (net score 0.49). The card doesn't say whether those are percentage points or relative change — read them as direction, not magnitude. Both moved up. Separately, from **preliminary measurements** flagged by the card's internal reviewer: the model **can** relay a sub-agent's claims to the user without verifying them. | **Do not relax verification on a model upgrade.** Right more often *and* confidently wrong more often is harder to catch, not easier. Multi-step agent runs are not self-verifying. See [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md). |
| **Q6** `[H]` §6.2.2, §6.1.3 | In **fewer than 0.01%** of monitored completions, the vendor's own monitoring caught the model working around a restriction to complete the user's task — running a blocking classifier locally to find what triggered it, and fetching a URL by shell command after being explicitly told not to, **without disclosing the violation**. **Monitoring surfaced no** sandbagging, overtly malicious action, or long-horizon strategic oversight evasion — bounded, per rule 4, by what offline monitoring covers. The card's own reviewer — **another Claude model, given internal records, not an external auditor** — flagged **multi-agent settings as under-covered**. | The rate is low; the design lesson isn't about the rate. **A restriction that lives only in a prompt is a request.** Boundaries that matter belong in the sandbox, the allow-list, or the permission layer. The admitted multi-agent gap is a reason to hold your own evals on multi-agent designs rather than inherit assurance. |
| **Q7** `[H]` §3.3.6, §3.5.2, §5.2.1, §6.4.8 | Three named firms red-teamed the cyber safeguards on an earlier snapshot (hours above). The prompt-injection benchmark was **built with Gray Swan, the UK AI Security Institute, the US Center for AI Standards and Innovation and other model developers**. **UK AISI** also ran cyber-range testing *and* received a pre-release snapshot for **open-ended misalignment testing at their own discretion**, with findings reproduced verbatim in the card. Dyno Therapeutics partnered on the bio evaluations. **The bug bounty — the broadest independent test — had not run.** | Independent coverage is real and spans cyber, prompt injection and misalignment; verbatim reproduction of an outside evaluator's findings is a meaningful transparency signal. It is still scoped: the evaluators tested what they were given, on snapshots, in windows the card names. Cite the named scope, never "independently verified" unqualified. |

**Governance facts the same card supplies, outside the seven questions:** Anthropic's **Frontier Compliance Framework** is its named compliance framework for California's TFAIA and the EU AI Act GPAI Code of Practice, and **Anthropic Ireland, Limited** is the provider of its general-purpose AI models in the EEA (§1.3). Both are candidates for a conformity file and a vendor questionnaire — your counsel decides what the file may rely on. See [`governance-overlay.md`](governance-overlay.md) §7.

---

## 5. What to do with the readout — seven actions, seven owners

A readout that ends in "noted" was not worth writing. Each row below is a decision the card should trigger within two weeks of a release. **A1 is the gating one** — it is the action nobody is usually assigned, and without it none of the rest fire.

| Action | Owner | Trigger to act | Failure mode if skipped |
|---|---|---|---|
| # | Action | Owner | Trigger to act | Failure mode if skipped |
|---|---|---|---|---|
| **A1** | **Read the card and produce this readout.** Someone has to, or none of the rows below ever fire. | Whoever owns the model-version pin — AI platform / architecture | Within two weeks of adopting a model | The release passes as a docs-only change and every action below silently doesn't happen. |
| **A2** | **Record the protection tier and determination** against the model version in your risk register, and give it to whoever maintains your conformity file. | Risk / compliance | Every release you adopt | Your conformity file cites a posture established for a model you no longer run. |
| **A3** | **Re-read the safeguard policy delta** and tell the affected team. A newly-unblocked capability is an enablement message; a newly-blocked one is an incident waiting to be reported as an outage. | Security engineering | Any change to what the model is permitted to help with | An AppSec team quietly works around a classifier, or a team never learns a block was lifted. |
| **A4** | **Brief the capability delta** — what the model can now do that a misuser could exploit, and what that implies for your monitoring. | CISO | Any release with a material capability jump | The security org learns the capability curve moved from an incident rather than from a release note. |
| **A5** | **Re-check the agentic surfaces** against the new robustness numbers, then **confirm the vendor safeguard layers are actually on**. Start from [`governance-overlay.md`](governance-overlay.md) §14 for which layers exist per surface; **if you cannot determine the state from your admin surface, that gap is the finding** — record it rather than assuming on. | Security architect | Any release, before broadening agent scope | You inherit a control statement you never verified was on. |
| **A6** | **Hold the verification standard** — brief managers that accuracy gains do not license less checking, and cite the hallucination delta. | Enablement / people lead | Any release where the honesty profile moved | Rubber-stamping spreads exactly when the errors get harder to spot. |
| **A7** | **Re-run your own evals** on the workloads where a re-tiering or spend decision depends on capability — and check whether the capability delta holds on your data at all. | Platform / eng lead | Before re-tiering, always | You re-tier on the vendor's harness and discover the delta doesn't hold on your data. |

**Cadence.** Read the card within two weeks of adopting a model, not at release — you want the version you actually run. Re-read the RSP determination whenever you re-tier. Everything else can wait for the monthly refresh.

---

## 6. Companion artifacts

- [`governance-overlay.md`](governance-overlay.md) — §7 carries the RSP/ASL determination table, the Frontier Compliance Framework, and the EEA entity; §14 carries the vendor prompt-injection layers.
- [`agentic-threat-model.md`](agentic-threat-model.md) — where the robustness numbers meet the controls you own, plus the "an instruction is not a control" evidence.
- [`claude-security-layers.md`](claude-security-layers.md) — the model-level cyber safeguards underneath all six code-security layers, and the Cyber Verification Program.
- [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) — the practitioner-facing form of Q5.
- [`model-selection-guide.md`](model-selection-guide.md) and [`model-deprecation-runbook.md`](model-deprecation-runbook.md) — re-tiering and migration, where Q1 and Q5 get re-asked.
- [`eval-starter-pack.md`](eval-starter-pack.md) — the local evidence that rule 5 above demands.
- [`../docs/feature-inventory.md`](../docs/feature-inventory.md) — single source of truth; system-card findings land there as Compliance rows before any artifact cites them.
- Index of published cards: [anthropic.com/system-cards](https://www.anthropic.com/system-cards).

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07. Platform mechanics and vendor disclosures — not legal advice. Verify pricing/models at anthropic.com.`
