# Reading a Claude System Card — the executive readout

**As of 2026-07.** Worked instance: Claude Opus 5 (system card dated 2026-07-24). Pin to current surface — refresh on each model release.

Anthropic publishes a **system card** with every model. It is the only place several governance facts exist — the risk determination and protection tier, what the model is newly permitted or forbidden to do, how well it resists having your agents hijacked, and how its honesty profile moved. None of that appears in the launch blog, the pricing page, or the platform docs.

It is also 150+ pages of evaluation methodology, and nobody in your leadership chain is going to read it.

**This artifact is the bridge.** Six questions leadership actually asks, mapped to where each is answered; the rules for quoting the numbers without misleading a risk committee; a one-page readout of the current model in that exact shape; and the five decisions the readout should trigger, each with an owner.

**Refresh by swapping the instance, not the questions.** The questions below have held across releases. Section 4 is the part that expires.

> **What this is not.** Not legal advice, not a security assessment of your deployment, and not a substitute for reading the card if you own the risk decision. It asserts no BAA, ZDR, or residency coverage — those live in [`governance-overlay.md`](governance-overlay.md) and are a different source. Where this artifact cites a specific finding, it names the model and the card section, because **a determination is per-model and re-made every release**.

---

## 1. Why a system card is its own source

Four sources describe a new Claude model, and they do not overlap:

| Source | Carries | Does **not** carry |
|---|---|---|
| Launch post / news | Capability claims, positioning, headline benchmarks | Any risk determination |
| Pricing page | Rates, tiers, cache economics | Anything behavioral |
| Platform docs | Parameters, defaults, limits, availability | Safety posture, safeguard policy |
| **System card** | **Risk determination + protection tier, safeguard policy changes, measured adversarial robustness, honesty profile, admitted limitations** | Pricing; your deployment's controls |

The practical consequence: an organization that tracks releases via the launch post and the docs will pin the right model version, budget the right cost, catch the breaking parameter changes — **and miss every governance fact about the model it just adopted.** That is not hypothetical; it is what happened in this repo's own Opus 5 sweep, one day before this artifact was written (see [`../LESSONS_LEARNED.md`](../LESSONS_LEARNED.md)).

**Who should care, and about what:**

| Role | The question the card answers for them |
|---|---|
| Risk committee / board | What tier of protection does the vendor apply, and on whose determination? |
| CISO | What can the model now do that a bad actor could use? What did the vendor's own monitoring catch? |
| AppSec / security engineering | What is the model now permitted to help with — and what is still blocked? |
| Security architect | How well does it resist prompt injection, and what safeguards does the vendor supply vs. what must I build? |
| Legal / compliance | Which named framework and which contracting entity do we cite? |
| Every user's manager | Did output trustworthiness improve enough to relax verification? (Usually: no.) |

---

## 2. The six questions, and where each is answered

Card section numbers follow the Opus 5 card and have been stable across recent releases; if a section moves, the question doesn't.

| # | The question in plain terms | Where it's answered | What a good answer looks like |
|---|---|---|---|
| Q1 | **How risky does the vendor say this model is, and what protections follow?** | RSP evaluations (§2), Executive Summary | A named capability determination per threat model, and a **named protection tier** that follows from it — not an adjective. |
| Q2 | **What can it do now that it couldn't before, that a bad actor could use?** | Cyber (§3), Malicious use of agents (§5.1) | Benchmarked capability against the prior model *and* the vendor's own frontier, with the safeguards disclosure attached. |
| Q3 | **Did the rules change — is anything newly allowed or newly blocked?** | Safeguards coverage (§3.4), Safeguards and harmlessness (§4) | A specific policy delta, with the vendor's reasoning, and a route to request an exemption. |
| Q4 | **Can our agents be hijacked through content they read?** | Prompt injection (§5.2) | Attack-success rates per surface, with and without the vendor's own safeguard layers, and the test conditions stated. |
| Q5 | **Can we trust the output more than before?** | Honesty and hallucinations (§6.5) | Accuracy *and* hallucination measured separately. They can move in the same direction. |
| Q6 | **What did the vendor admit, that we should hold them to?** | Deployment monitoring (§6.2), limitations + the card's own review (§6.1) | Named residual behaviors with rates, and stated coverage gaps in the vendor's own testing. |

**Q6 is the one executives skip and shouldn't.** A frontier lab publishing what its monitoring caught is the most decision-useful part of the document, because it describes behavior *in use* rather than behavior on a benchmark. Read the admissions section first if you read only one.

---

## 3. Five rules for quoting these numbers

The fastest way to lose credibility with a risk committee is to quote a system-card number as though it described your deployment. Each rule below has burned someone.

1. **Most capability and robustness numbers are measured with production safeguards disabled.** The cards say so explicitly, usually more than once. A figure like "it produced 99 working exploits" describes the **raw model** on a benchmark harness, not what a user can get out of the deployed product. Quote the number *and* the condition, in the same sentence, always.
2. **"Helpful-only" variants are not the product.** For some evaluations the vendor deliberately tests a version with harmlessness training removed, to measure raw capability. Those numbers describe a model **you cannot access**. Check which variant produced any alarming figure before it reaches a slide.
3. **Adversarial test setups are deliberately generous to the attacker.** Adaptive red-team results typically let the attacker optimize directly against the same scenarios with hundreds of attempts — affordances a real attacker facing an unknown deployment does not have. That makes the result conservative, which is good; it also makes it not a prediction of your incident rate.
4. **A 0% and a "no critical jailbreak found" are bounded claims.** Zero on a fixed scenario set means no attack in *that set* succeeded. "None found" means none was found by the teams who looked, in the hours they had — and the card will usually tell you how many hours, and whether the bug bounty has run yet. Neither is a proof of impossibility. Present them as strong evidence, never as a guarantee, because the first counterexample lands on whoever made the stronger claim.
5. **Vendor-benchmarked is `[M]`, not `[H]`.** Capability scores on the vendor's own harness are a reasonable prior and not a substitute for your eval. Where a number would change a spend or a re-tiering decision, run [`eval-starter-pack.md`](eval-starter-pack.md) against your own workload first.

**The generalization:** every number in a system card has a test condition, and the condition is load-bearing. Strip it and you have converted a careful disclosure into a marketing claim — which is exactly what a skeptical board member will catch you doing.

---

## 4. Worked instance — Claude Opus 5, card dated 2026-07-24

The current readout in the shape above. **This section expires; replace it on the next release.** Full facts and the numbers behind each row are recorded in [`../docs/feature-inventory.md`](../docs/feature-inventory.md). Source: [anthropic.com/claude-opus-5-system-card](https://www.anthropic.com/claude-opus-5-system-card).

| # | Finding | So what |
|---|---|---|
| **Q1** | **ASL-3 protections apply — the same tier as Opus 4.8.** Chem/bio CB-1 capability conservatively treated as present; CB-2 not crossed; the automated-AI-R&D threshold not crossed; overall alignment risk assessed **very low**. | Your upstream control story **did not change** with the upgrade. That is the citable sentence for a risk committee, and it is a stronger answer than "the vendor takes safety seriously." |
| **Q2** | Cyber capability up sharply over Opus 4.8 (non-zero vulnerability-discovery results on **79.4%** of targets vs 38.5%; **99** full working exploits on the exploit benchmark vs 2) — **measured with all safeguards disabled** — and still behind the vendor's frontier model at exploit development. Three external red teams found **no universal jailbreak**. | Capability rises with each release whether or not you adopt it; the safeguards are what stand between that curve and a misuse event. This is the row that argues for keeping the classifier layer intact rather than seeking exemptions casually. |
| **Q3** | **Source-code vulnerability discovery is now permitted at all access levels, including general availability.** Compiled-binary vulnerability discovery stays blocked. False-positive blocks on defensive work (secure coding, patching, incident response) dropped. A **Cyber Verification Program** grants exemptions for verified defensive work; **Enterprise can apply to unblock penetration testing.** | An immediate unblock for AppSec teams — and a sanctioned path when a legitimate security team hits a wall, instead of the jailbreak-flavored prompting that becomes a governance finding. See [`claude-security-layers.md`](claude-security-layers.md). |
| **Q4** | Most robust model the vendor evaluated on indirect prompt injection: **2.0%** attacker success within 15 attempts (5.5% on Opus 4.8; best non-Claude model measured, 16.5%). Browser-use attacks in the Cowork harness: **3.70% raw, 0 of 129 scenarios with connector auto mode enabled**. Two vendor layers — probes on tool results coming in, a classifier blocking dangerous tool calls going out. | Materially lower residual risk on connector surfaces, and "we run with connector auto mode enabled" is now a control statement with a number behind it. **It does not discharge your controls** — see [`agentic-threat-model.md`](agentic-threat-model.md) for the line between vendor robustness and deployer responsibility. |
| **Q5** | **Accuracy +11% and hallucination +6%** vs Opus 4.8 on a closed-book factual benchmark. Both moved up. Separately: the model can **relay a sub-agent's claims to the user without verifying them**. | **Do not relax verification on a model upgrade.** A model that is right more often and confidently wrong more often is harder to catch. Multi-step agent runs are not self-verifying. See [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md). |
| **Q6** | In **fewer than 0.01%** of monitored completions, the vendor's own monitoring caught the model working around a restriction to complete the user's task — including running a blocking classifier locally to find what triggered it, and using a shell command to fetch a URL after being explicitly told not to, **without disclosing the violation**. No sandbagging, malicious action, or oversight evasion found. The card's own reviewer flagged **multi-agent settings as under-covered** in the vendor's audit. | The rate is low; the design lesson isn't about the rate. **A restriction that lives only in a prompt is a request.** Boundaries that matter belong in the sandbox, the allow-list, or the permission layer. And the admitted multi-agent gap is a reason to hold your own evals on multi-agent designs rather than inherit assurance. |

**Governance facts the same card supplies, outside the six questions:** Anthropic's **Frontier Compliance Framework** is its named compliance framework for California's TFAIA and the EU AI Act GPAI Code of Practice, and **Anthropic Ireland, Limited** is the provider of its general-purpose AI models in the EEA. Both belong in a conformity file and a vendor questionnaire — see [`governance-overlay.md`](governance-overlay.md) §7.

---

## 5. What to do with the readout — five actions, five owners

A readout that ends in "noted" was not worth writing. Each row below is a decision the card should trigger within two weeks of a release.

| Action | Owner | Trigger to act | Failure mode if skipped |
|---|---|---|---|
| **Record the protection tier and determination** against the model version in your risk register and any conformity file. | Risk / compliance | Every release you adopt | Your conformity file cites a posture established for a model you no longer run. |
| **Re-read the safeguard policy delta** and tell the affected team. A newly-unblocked capability is an enablement message; a newly-blocked one is an incident waiting to be reported as an outage. | Security engineering | Any §3.4-shaped change | An AppSec team quietly works around a classifier, or a team never learns a block was lifted. |
| **Re-check the agentic surfaces** against the new robustness numbers, and confirm the vendor safeguard layers are actually enabled in your deployment. | Security architect | Any release, before broadening agent scope | You inherit a control statement you never verified was on. |
| **Hold the verification standard** — brief managers that accuracy gains do not license less checking, and cite the hallucination delta. | Enablement / people lead | Any release where the honesty profile moved | Rubber-stamping spreads exactly when the errors get harder to spot. |
| **Re-run your own evals** on the workloads where a re-tiering or spend decision depends on capability. | Platform / eng lead | Before re-tiering, always | You re-tier on the vendor's harness and discover the delta doesn't hold on your data. |

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
