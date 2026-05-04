# Claude Platform — Common Misconceptions

**As of 2026-05.** A skeptic-disarmer companion to [`decision-memes.html`](decision-memes.html). Every entry below is a misread that drives a *measurable* mis-budget, mis-architecture, or mis-staffing call. If a myth doesn't change a decision, it's not in this list.

> **How to read this.** Format: **Myth** → **Reality** → **What you'd mis-decide** → **Cite**. Pinned to the current model surface (Opus 4.7 / Sonnet 4.6 / Haiku 4.5). Refreshed monthly against [`docs/feature-inventory.md`](../docs/feature-inventory.md) — the single source of truth.

---

## 1. Model + capability misreads

### "Claude's context window is still 200K tokens."
- **Reality.** Opus 4.7, Opus 4.6, and Sonnet 4.6 ship 1M tokens (GA). Sonnet 4.5 and Haiku 4.5 remain at 200K.
- **Mis-decide.** Architecting RAG chunking + retrieval ceilings against 200K when the workhorse model already supports 1M — over-engineered retrieval, under-used cache.
- **Cite.** [docs.claude.com — context windows](https://docs.claude.com/en/docs/build-with-claude/context-windows); [`docs/feature-inventory.md`](../docs/feature-inventory.md) Models table.

### "Bigger context = better answers, so always use 1M."
- **Reality.** Long-context recall quality varies by position and task. Stuffing the window often hurts both latency and answer quality vs. retrieval + caching. Use the window deliberately, not by default.
- **Mis-decide.** Skipping retrieval design entirely; paying for tokens that erode answer quality and inflate latency.
- **Cite.** [docs.claude.com — context windows](https://docs.claude.com/en/docs/build-with-claude/context-windows); [`feature-decision-matrix.html`](feature-decision-matrix.html) RAG row.

---

## 2. Claude Code (CLI) surface

### "Claude Code is just a chat wrapper for the terminal."
- **Reality.** It exposes hooks (PreToolUse / PostToolUse / SessionStart / Stop / UserPromptSubmit), a settings hierarchy (user/project/local), Skills, subagents, plugins, MCP, headless / CI mode, and scheduled background tasks.
- **Mis-decide.** Treating the CLI as a developer toy; under-funding rollout. Engineering managers who skip the platform surface ship per-engineer plugins ("5 engineers, 5 plugins, 0 reuse" — see [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) failure modes).
- **Cite.** [docs.claude.com — Claude Code](https://docs.claude.com/en/docs/claude-code); [`docs/feature-inventory.md`](../docs/feature-inventory.md) Claude Code surface table.

### "Custom slash commands and Skills are different systems."
- **Reality.** In the 2026 line, custom commands were unified into Skills. Existing `.claude/commands/` files keep working, but Skills add frontmatter-based auto-invocation and bundled-file management on top. Treat new work as Skills.
- **Mis-decide.** Building parallel infrastructure for both; missing auto-invocation triggers; team Skills repo splintered across two folder conventions.
- **Cite.** [docs.claude.com — slash commands](https://docs.claude.com/en/docs/claude-code/slash-commands); [`claude-code-starter-skills.md`](claude-code-starter-skills.md).

### "Hooks just run shell scripts."
- **Reality.** Hooks support shell commands, HTTP endpoints, *and* LLM prompts as actions, plus async hooks and MCP-tool-scoped hooks. Configure in `.claude/settings.json`.
- **Mis-decide.** Forcing all governance through bash; missing the HTTP-endpoint pattern that lets central security own the hook body without per-repo bash sprawl.
- **Cite.** [docs.claude.com — hooks](https://docs.claude.com/en/docs/claude-code/hooks); [`hooks-starter-pack.md`](hooks-starter-pack.md).

### "`sandbox.denyRead` blocks the Read tool from seeing my .env."
- **Reality.** `sandbox.denyRead` blocks **bash subprocesses only** at the OS level. It does *not* stop Claude's built-in `Read` tool. Block both layers: `sandbox.denyRead` for shells, plus a permission deny rule like `Read(./.env)` for the tool. Inversely, `Read(./.env)` does not stop `cat .env` from a hook or sub-shell.
- **Mis-decide.** False sense of security on secrets. The most common Week-1 governance gotcha — discovered in audit, not in design.
- **Cite.** [docs.claude.com — sandboxing](https://docs.claude.com/en/docs/claude-code/sandboxing); [`hooks-starter-pack.md`](hooks-starter-pack.md) block-secrets pattern; [`governance-overlay.md`](governance-overlay.md).

### "Claude Code has a free tier."
- **Reality.** Claude Code requires a paid Claude.ai subscription (Pro / Max / Team / Enterprise) or API credits. Usage limits scale by plan; Max plans buy more headroom, not unlimited.
- **Mis-decide.** Procurement assumes individual Pro covers an engineering team. Scale-out blocked when team usage limits hit mid-pilot.
- **Cite.** [docs.claude.com — pricing](https://docs.claude.com/en/about-claude/pricing); [`cost-calculator.html`](cost-calculator.html).

---

## 3. API economics

### "Pro / Max subscriptions include API credits."
- **Reality.** Claude.ai consumer subscriptions (Pro, Max, Team, Enterprise) and Anthropic API credits are separate billing surfaces. Max does not unlock API quota. Buy API credits explicitly.
- **Mis-decide.** Engineering team billed twice — or worse, finance assumes the seat license covers production inference and is surprised by the API invoice.
- **Cite.** [docs.claude.com — pricing](https://docs.claude.com/en/about-claude/pricing).

### "Prompt caching is too complex / not worth it."
- **Reality.** Cache reads bill at ~10% of the input rate; 5-min writes 1.25×, 1-hr writes 2×. For chat copilots and RAG patterns with stable system prompts or shared retrieved context, steady-state cost drops 60–80%.
- **Mis-decide.** Skipping the dominant cost lever; the cost-calculator numbers in [`executive-briefing.html`](executive-briefing.html) cease to apply, and unit economics quietly fail at scale.
- **Cite.** [docs.claude.com — prompt caching](https://docs.claude.com/en/docs/build-with-claude/prompt-caching); [`cost-calculator.html`](cost-calculator.html).

### "Long context costs 2× once you cross 200K tokens."
- **Reality.** The long-context surcharge has been eliminated on Opus 4.7, Opus 4.6, and Sonnet 4.6. A 900K-token request bills the same per-token rate as a 9K request on these models. Older / legacy models still apply the 200K break — verify per model.
- **Mis-decide.** Ruling out long-context patterns on cost grounds that no longer hold for the workhorse models.
- **Cite.** [docs.claude.com — pricing](https://docs.claude.com/en/about-claude/pricing); [`docs/feature-inventory.md`](../docs/feature-inventory.md) Models table.

### "Batch API is just a queue — same price."
- **Reality.** Batch API delivers 50% off all rates with a 24-hour SLA. Stackable with caching. Async by design — fire-and-forget for evals, enrichment, and regression suites.
- **Mis-decide.** Running overnight evals on real-time pricing; forgoing the cheapest path for every workload that does not need synchronous latency.
- **Cite.** [docs.claude.com — batch processing](https://docs.claude.com/en/docs/build-with-claude/batch-processing); [`eval-starter-pack.md`](eval-starter-pack.md).

### "Haiku is too weak for production."
- **Reality.** Haiku 4.5 prices ~5–15× cheaper than Opus and is the right tier for triage, classification, format conversion, and the cheap leg of cascade patterns. Production systems commonly run Haiku-first and escalate to Sonnet or Opus only when triage demands it.
- **Mis-decide.** All-Opus deployment for workloads where Haiku would meet the bar at a fraction of the cost — an Opus tax that compounds at scale.
- **Cite.** [docs.claude.com — pricing](https://docs.claude.com/en/about-claude/pricing); [`feature-decision-matrix.html`](feature-decision-matrix.html) cascade row.

---

## 4. Safety + refusal

### "Claude refuses everything sensitive."
- **Reality.** Anthropic publishes Claude's constitutional principles; refusal is calibrated against actual harm potential, not topic surface. Most reported refusals trace to prompt shape (no role context, no safety frame, no allow-listed scope) rather than the topic.
- **Mis-decide.** Ruling out viable use cases (clinical decision support, security research, content moderation) on a stale "Claude will refuse" prior — when the same workload runs cleanly with proper system-prompt scoping. See [`anti-use-cases.md`](anti-use-cases.md) for use cases that genuinely *should* be ruled out.
- **Cite.** [anthropic.com — Claude's Constitution](https://www.anthropic.com/constitution).

---

## 5. Rate limits + Computer Use

### "Rate limits are just the dashboard percentage."
- **Reality.** Three independent limits apply per organization + tier: requests-per-minute, input-tokens-per-minute, and output-tokens-per-minute. The dashboard surfaces the binding one. Hitting any single limit throttles the whole org for that model.
- **Mis-decide.** Sizing capacity off RPM only; throttled by token-per-minute headroom on a long-context workload that the RPM number didn't predict.
- **Cite.** [docs.claude.com — rate limits](https://docs.claude.com/en/api/rate-limits).

### "Computer Use is a paid product feature on its own SKU."
- **Reality.** Computer Use is an API capability available to API customers, not a separate purchase. Billed by tokens like any other inference. Sandbox + governance posture is the customer's responsibility.
- **Mis-decide.** Procurement waits for a "Computer Use SKU" that doesn't exist; pilot blocked behind a non-existent contract step.
- **Cite.** [docs.claude.com — computer use](https://docs.claude.com/en/docs/agents-and-tools/computer-use); [`governance-overlay.md`](governance-overlay.md) prompt-injection section.

---

## How this artifact connects to the rest

- **Runs before [`decision-spine.html`](decision-spine.html).** Disarms the priors that distort which branch the reader picks. A reader who believes "Claude refuses everything sensitive" exits at the anti-use branch when their use case is actually viable.
- **Companion to [`decision-memes.html`](decision-memes.html).** Same skeptic-disarmer role, text-form for execs and architects who want substance under the joke.
- **Sourced from [`docs/feature-inventory.md`](../docs/feature-inventory.md).** Every numeric claim trails the inventory. When inventory drifts, this artifact follows in the same change.
- **Cross-linked from [`executive-briefing.html`](executive-briefing.html) Slide 9 (Risks + mitigations).** The "I heard X about Claude" objection has its own page.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify pricing/models at anthropic.com.`
