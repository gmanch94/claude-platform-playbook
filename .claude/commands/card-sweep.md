---
description: Read a new Claude system card and land its governance findings — inventory Compliance rows first, then the readout artifact's worked instance, then the dependent artifacts
allowed-tools: Bash, Glob, Grep, Read, Edit, Write
---

Run the global **`system-card-readout`** skill (`~/.claude/skills/system-card-readout/`). It owns the procedure — extract without reading the PDF into context, answer the seven questions, grade every answer, apply the six quoting rules, land facts as rows, replace rather than search-and-replace — and is vendor-agnostic. Nothing here restates it.

This is the step a launch-post sweep does not cover. `docs/feature-inventory.md`'s checklist and `CLAUDE.md`'s model-surface process both now require it, because the Opus 5 sweep (#64/#65) landed every docs-carried fact and **zero** governance facts until the card itself was read a day later (#66/#67). See [`../../LESSONS_LEARNED.md`](../../LESSONS_LEARNED.md) 2026-07-24.

**`$ARGUMENTS`** = the card URL or path. If empty, find the newest card at [anthropic.com/system-cards](https://www.anthropic.com/system-cards) for the model currently pinned in `docs/feature-inventory.md`.

## Repo specifics the skill needs

**1. Inventory first — always.** New or changed facts land as **Compliance + governance posture** rows in `docs/feature-inventory.md`, with measured numbers and their test conditions in the note block beneath that table. One home for the numbers; artifacts cite it. Precedent rows from the Opus 5 card: RSP determination / protection tier · vendor compliance framework + contracting entity · cyber safeguard policy change · exemption program · prompt-injection safeguards.

**2. ⚠ `artifacts/system-card-readout.md` §4 is REPLACED WHOLESALE.** Never search-and-replace a model name into it. `CLAUDE.md` step 3's mechanical sweep would leave the previous release's numbers under the new model's name, and `/bump-as-of`, `/stale-check` and `check-counts.mjs` would all report green. §1–§3 and §5–§6 are release-independent; leave them unless the *method* changed. Date the section by **card date**.

**3. Propagate only where a finding changes a decision.** The Opus 5 pass touched four: `agentic-threat-model.md` (robustness table + vendor-vs-deployer boundary), `governance-overlay.md` §7 and §14, `claude-security-layers.md` §9, `user-mindset-cheatsheet.md` + `-color.html` (they drift as a pair). Everything else goes to `docs/backlog.md` with a trigger. Resist touching ten files — each review round re-touches all of them.

**4. Watch for vendor vocabulary colliding with repo vocabulary.** Connector "auto mode" (a safeguard that *blocks* tool calls) vs Claude Code's permission "auto mode" (which *relaxes* prompts) had to be disambiguated in both files that mention either — the same shape as the five meanings of "tier" in `claude-misconceptions.md` §6.

**5. Never assert BAA / ZDR / residency from a card.** Route to `governance-overlay.md`. A card is not a contract or a policy page.

## Before you commit

- `node scripts/check-counts.mjs` → must PASS
- **Grep in-prose counts by hand** if any counted list grew — the guard covers artifact counts, not sentences ([`../../LESSONS_LEARNED.md`](../../LESSONS_LEARNED.md) 2026-07-25)
- Relative links resolve; `/render-fix` if any `.md` gained inline pipes
- Blind review: 2 reviewers, factual + decision-utility lenses. Hit rate in this repo is 4/4 non-trivial — the pairing error in #66 was caught by review, not by any guard.

Complements `/stale-check` (metadata + URL health), `/doc-verify` (claim-vs-live-doc values), the monthly refresh routine (inventory drift), and `/render-fix` (kramdown render). Run on every model release you adopt.
