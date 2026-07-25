# Backlog — deferred enhancements

Ideas surfaced during work but explicitly deferred. Each entry: what · why deferred · trigger to revisit · effort.

> Convention: items here are *not commitments*. They earn their place when a trigger condition fires (see "Trigger to revisit"). If a trigger fires and the item still doesn't earn its place, drop it.

---

## Opus 5 System Card — second-order propagation (opened 2026-07-24)

The system-card sweep landed the findings that **change a decision** in five files (`feature-inventory` rows first, then `agentic-threat-model`, `governance-overlay`, `claude-security-layers`, `user-mindset-cheatsheet` + `-color`). The six items below are real but second-order — each would add a paragraph, not change a recommendation. Deferred deliberately to keep one PR reviewable rather than re-touching ten files per review round.

| # | Item | Why deferred | Trigger to revisit | Effort |
|---|---|---|---|---|
| B1 | **`claude-misconceptions.md`** — add a myth: *"a newer model hallucinates less."* Opus 5 is 11% more accurate **and** 6% more hallucination-prone than Opus 4.8 on the card's closed-book benchmark; both moved. | The cheatsheet already carries the practitioner-facing version of this. The misconceptions entry is the executive-facing duplicate. | Next misconceptions edit, or the next model launch where the same pattern repeats (two data points make it a trend worth naming). | S |
| B2 | **`model-selection-guide.md`** — a safety/quality column in the tier comparison: hallucination profile, cyber-capability position, refusal behavior per tier. | The guide currently selects on capability + cost. Adding a safety axis is a structural change, not a paragraph. | When a second model's system card gives a comparable per-tier reading, so the column has more than one honest row. | M |
| B3 | **`cowork-adoption-guide.md` + `cowork-101.md`** — cite the 0-of-129 connector-auto-mode result in the governance/review-gate sections. | Both already teach review-before-act; the number strengthens the argument without changing the instruction. Name collision with Claude Code's permission auto mode needs care in an operator-facing doc. | Next Cowork edit, or when connector auto mode's default-on/off state changes. | S |
| B4 | **`procurement-pack.md`** — add the system card + Frontier Compliance Framework to the vendor-risk evidence list, and the Cyber Verification Program as a negotiable line item for orgs doing pentesting. | Procurement pack routes governance questions to `governance-overlay.md`, which now carries the FCF. The pack needs a pointer, not a copy. | Next procurement-pack edit, or first reader question about what to cite in a security questionnaire. | S |
| B5 | **`multi-agent-patterns.md`** — the card's own reviewer flagged that Opus 5 can **relay a sub-agent's claims to the user without verifying them**, and that multi-agent settings are under-covered in Anthropic's audit. That is a direct hit on the error-compounding section. | Recorded in the `feature-inventory` Opus 5 row so it isn't lost. Wiring it into the pattern guidance deserves its own think-through, not a bolt-on sentence. | Next multi-agent-patterns edit, or when Anthropic publishes the multi-agent audit coverage it says is planned. | M |
| B6 | **`eval-starter-pack.md`** — a grounding/adversarial eval template shaped on the card's own methods (adaptive attacker rather than a fixed attack set; the card explicitly warns that static benchmarks give false confidence). | The pack has 8 templates; adding a 9th changes its shape and its counts. | When someone asks how to test their own agent for injection robustness, or on the next eval-pack revision. | M |
| B7 | **`claude-code-101.md`** — the **two-shell** reality for practitioners: a `PowerShell` tool exists alongside `Bash`, is auto-enabled on Windows without Git Bash, canonicalizes cmdlet aliases (so `Get-ChildItem` also matches `gci`/`ls`/`dir`) but not native `.exe` binaries, and splits compound commands on the semicolon, the pipe, and the two boolean operators (7+). Deferred deliberately in the 2026-07-25 egress round: the **enforcement** surface (inventory → `claude-code-enterprise-config.md` §2 → `claude-code-config-builder.html`) was in scope, and shell choice in a practitioner guide is mechanics, not a control. | The 101 is a curated-judgment guide, not a reference mirror, and its permission-mode/daily-loop sections don't currently turn on which shell a command runs in. Adding it needs a judgment call about whether it changes what a practitioner *does*. | On the next `claude-code-101.md` refresh, **or** immediately if the PowerShell tool graduates from preview to GA, **or** if a reader reports a Bash-shaped instruction failing on Windows. | S |

---

`© gmanch94 · CC-BY-4.0 · As of 2026-07.`
