# Backlog — deferred enhancements

Ideas surfaced during work but explicitly deferred. Each entry: what · why deferred · trigger to revisit · effort.

> Convention: items here are *not commitments*. They earn their place when a trigger condition fires (see "Trigger to revisit"). If a trigger fires and the item still doesn't earn its place, drop it.

---

## #2-deeper — unit-economics gate banner in `cost-calculator.html`

**What.** Extend `cost-calculator.html` with a live unit-economics gate banner: user enters their $/task ceiling + $/day cap, the calculator surfaces a red banner when computed values exceed thresholds. Companion: tighten the `anti-use-cases.md` Wrong-economics row "Pilot with no defined volume cap or kill-switch" to cite the four numeric gates from `governance-overlay.md §12` directly (instead of pointing at the governance overlay generically).

**Why deferred.** The lean version of #2 (governance-overlay §12 + cost-calculator subtitle cross-link) covers the conceptual move — cost is a constraint, not a curiosity — without bloating cost-calculator UX. The banner adds visceral feedback but expands the calculator's scope from *modeling* to *gating*, which is a different artifact contract. Hold until evidence the conceptual move alone isn't enough.

**Trigger to revisit.**
- A reader asks "where do I see if my projected $/task is too high?" — the conceptual move didn't land
- A pilot fails because the calculator showed a number that should have been a kill signal
- Monthly refresh detects new pricing and the calculator needs updating — bundle the banner work with the touch

**Effort.** ~45 min. Add 2 number inputs (ceiling + cap), 2 conditional banner divs, ~30 lines JS to compare computed values against inputs.

**Files affected.** `artifacts/cost-calculator.html`, `artifacts/anti-use-cases.md`, possibly `docs/scope.md`.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05.`
