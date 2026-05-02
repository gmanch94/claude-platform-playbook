# CLAUDE.md

Guidance for Claude Code (and any other AI agent) working in this repo.

## What this repo is

**`claude-platform-playbook`** — executive-grade decision tools for AI transformation **on the Claude platform**. Audience: CIOs, CDOs, CTOs, CHROs sizing Claude adoption + architects defending the choice to leadership.

Public, CC-BY-4.0, vendor-explicit, decision-oriented. **Not** Anthropic marketing recap. Pin to current Claude model surface (Opus 4.7 / Sonnet 4.6 / Haiku 4.5 as of 2026-05) — refresh quarterly.

There is no build system or test suite. This is a content repo of static HTML + Markdown.

## Single source of truth

**`docs/feature-inventory.md`** is the canonical list of every Claude platform feature, model, status, pricing, and doc URL. The `Used in artifacts` column maps each row to the downstream artifacts that cite it.

**Refresh ritual:** edit `feature-inventory.md` first. Then grep `Used in artifacts` to find every file that needs to follow. Then bump as-of stamps. The monthly refresh routine (next run May 4, 2026) automates this — see `https://claude.ai/code/routines/trig_019PnZmQxwkS5r9iLU9aWthe`.

**Never** edit an artifact's feature claim without updating `feature-inventory.md` in the same change.

## Repo structure

```
claude-platform-playbook/
├── LICENSE                              CC-BY-4.0
├── README.md                            Audience map + artifact list + as-of stamp
├── CLAUDE.md                            This file
├── .claude/commands/                    Slash commands (bump-as-of, etc.)
├── docs/
│   ├── scope.md                         Original scope doc — do not delete
│   └── feature-inventory.md             Single source of truth (edit weekly)
└── artifacts/
    ├── executive-briefing.html          10-slide deck (arrow-key nav, print-PDF)
    ├── cost-calculator.html             Live $/mo · Chart.js · 4 presets
    ├── feature-decision-matrix.html     8 patterns × 12 features · hover tooltips
    ├── build-vs-buy-worksheet.html      5-axis score → ranked 6-option rec
    ├── reference-architectures.html     5 hand-drawn SVG patterns (Caveat font)
    ├── adoption-playbook.md             90-day rollout · 8 failure modes
    ├── governance-overlay.md            Data flow · BAA · NIST · EU AI Act
    ├── claude-code-adoption-guide.md    Engineering CLI rollout
    ├── claude-code-starter-skills.md    8 team-grade Skill templates (when-to-use / failure-mode / owner / prompt body)
    ├── hooks-starter-pack.md            10 hook templates (block-secrets, PII scrub, branch guard, license, audit log, etc.) — phased 1→4 rollout
    └── eval-starter-pack.md             8 eval templates (regression, format, tool-call, grounding, adversarial, cost, latency, refusal)
```

## Working in this repo

### When adding/updating content

1. **Check `docs/feature-inventory.md` first.** If the change touches a Claude feature/model/pricing, edit the inventory row first.
2. **Cite primary sources.** All technical claims link to `docs.claude.com` or `anthropic.com/pricing` with the as-of date stamped. Never paraphrase Anthropic marketing copy verbatim.
3. **Pin specific versions** in current-state references (Opus 4.7, Sonnet 4.6, Haiku 4.5) but **structurally pin to family** ("Sonnet 4.x") in the few places that document long-term posture (governance overlay, adoption playbook). Specific versions = current; family pins = stable interface.
4. **Bump as-of stamps** on every file you touch. Use the `/bump-as-of` slash command for sweeps.
5. **Cross-link** between artifacts using relative paths (`adoption-playbook.md` → `governance-overlay.md`). Don't break the audience map in `README.md`.

### When adding a new artifact

Don't, without updating `docs/scope.md` first. The 8 artifacts here are the agreed scope. New artifacts need a written justification in `scope.md` and a row in `feature-inventory.md`'s `Used in artifacts` column.

### When the model surface changes

A new model release (e.g., Opus 4.8) is **not** a routine inventory edit — it's a breaking change to every artifact's "current model" reference. Process:
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
- **No Anthropic-marketing register.** "Claude is the most advanced AI" — not in this repo. "Sonnet 4.6 with prompt caching cuts steady-state cost 60–80% vs. naive use" — yes.
- **Footer pattern (consistent across all artifacts):** `© gmanch94 · CC-BY-4.0 · As of YYYY-MM. Verify pricing/models at anthropic.com.`

## Hand-drawn SVG style (reference-architectures.html only)

Diagrams use Caveat + Patrick Hand fonts and slightly imperfect path geometry to feel hand-drawn rather than corporate-clean. When adding diagrams: keep the same color taxonomy (user=orange, claude=brown, tool=blue, store=green, output=dark-orange) and the legend at top. Don't switch to Mermaid or other generators without scope-doc update.

## Companion repos (referenced from README)

- `ai-architect-showcase` — vendor-neutral AI strategy artifacts
- `ai-enablement-ws` — architect-grade operational reference

These exist; don't duplicate their content here. This repo's job is **Claude-specific** decision tooling.

## Automation

- **Monthly refresh routine** (`trig_019PnZmQxwkS5r9iLU9aWthe`): first Monday of each month, audits `feature-inventory.md` against `docs.claude.com` + `anthropic.com/pricing`, opens a PR if drift detected. Manage at https://claude.ai/code/routines.
- **`/bump-as-of` slash command:** sweeps `As of YYYY-MM` stamps across all artifacts. Use for quarterly refresh.

## Things to avoid

- Adding OpenAI/Gemini cost comparisons to `cost-calculator.html` — explicit decision: Claude-only.
- Replacing hand-drawn SVG with Mermaid in `reference-architectures.html` — explicit decision: hand-drawn.
- Using floating model aliases ("latest Claude") in production-facing copy — pin specific versions or family.
- Editing `LICENSE`.
- Adding emojis to artifacts unless explicitly requested.
