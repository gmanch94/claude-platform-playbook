# Claude Product 101 — driving the surfaces well

**You have Claude seats. This is how the product actually behaves — Projects, thinking, attachments, web search, Artifacts, Tag, connectors — and the gotcha on each.**

Audience: a knowledge worker with a Claude seat (Team / Enterprise / Max), working in the product — chat, Projects, Cowork, Claude in Slack. Not the Claude Code guide (that's [`claude-code-101.md`](claude-code-101.md)), not a rollout plan (that's [`surface-rollout-matrix.md`](surface-rollout-matrix.md)), not the buy decision (that's [`subscription-selection-guide.md`](subscription-selection-guide.md)). This is the individual-fluency layer for the product surface — the mechanics that separate casual use from fluent use.

**Read the mindset primer first:** [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) carries the seven mindset shifts, the which-surface-for-which-task table, and the always-verify list. This guide is the layer under it — not *how your work changes* but *how each surface behaves so you drive it well*. It does not repeat the cheatsheet's surface table or reflexes; it points at them.

**Sourcing:** surface facts (status, plan gate, governance) come from [`../docs/feature-inventory.md`](../docs/feature-inventory.md), the repo's single source of truth, each row citing its `support.claude.com` / `docs.claude.com` anchor `[H]`. Behavioral notes (how retrieval or staleness *feels* in practice) are labeled as such and kept judgment-level — volatile UI specifics (exact size limits, current toggles) live in the linked docs, which are canonical. Model pricing/tiers are **not** restated — see the inventory.

---

## 0. What this adds over the cheatsheet

The cheatsheet answers *how does my work change* — direct-and-check, verify, the data boundary. It also tells you *which* surface fits a task. This guide answers the next question: *how does each surface actually behave* — what a Project does at retrieval time, when extended thinking earns its latency, what web search will and won't cite, who sees what in a Slack channel. The one line that still governs everything: **Claude drafts; you direct, check, and own what ships.** Everything below is a mechanic in service of that.

---

## 1. The surfaces — by the distinction that bites

The cheatsheet's table says which surface for which task. Here's the distinction that actually trips people, because it's about consequence, not task type:

- **Chat** — *ephemeral.* Fast, one-off, nothing persists past the conversation unless you save it. The floor.
- **Projects** — *persistent + shareable.* Knowledge and instructions carry across chats and, if shared, across people. Persistence is the feature and the risk.
- **Cowork** — *acts on your files.* A desktop agent that reads and writes real files and runs commands. Highest privilege, highest blast radius.
- **Claude in Slack (Tag)** — *team-visible.* Runs where your colleagues can see it, sometimes under the org's identity, not yours.
- **Claude Code** — *the coding surface.* Same drive-and-verify work, aimed at code, repos, and your shell — and it runs wherever you want it: a terminal, the desktop app, your IDE, or the web, not just a command line. If that's your work, it's [`claude-code-101.md`](claude-code-101.md); covered there, not here.
- **Claude Design / Claude Science** — specialized surfaces; see [`surface-rollout-matrix.md`](surface-rollout-matrix.md).

**The gotcha:** people pick a surface by task ("I need to summarize this") and miss the axis that matters — *persistence, visibility, privilege*. Summarizing a confidential doc in a shared Project, or tagging Claude on a sensitive thread in a public channel, is a data-exposure decision disguised as a convenience choice. Which surface is *cleared for your data* is a separate question — [`surface-rollout-matrix.md`](surface-rollout-matrix.md), and §8 below.

---

## 2. Chat mechanics — the daily loop, done well

Chat is the floor, and most people leave value on it. The mechanics worth knowing:

- **Context is a window, not a memory.** A conversation carries everything said so far — and a long thread pushes early content toward the edge while you pay for all of it on every turn. **Start a fresh chat for a new task** instead of continuing one endless thread. *Gotcha:* piling a new, unrelated ask onto a 40-message thread — Claude is still dragging (and billing) the whole history, and the output drifts toward the old topic.
- **Extended thinking — spend it where reasoning is the work.** On hard analysis, multi-step reasoning, or tricky trade-offs, ask Claude to think it through; the extra deliberation shows up in quality. On lookups, drafts, and reformatting it just adds latency for no gain. (Availability + behavior: [`../docs/feature-inventory.md`](../docs/feature-inventory.md) → *Extended thinking*.) *Gotcha:* leaving heavy thinking on for trivial asks — slower, not better.
- **Attachments — it reads what you attach, not what you didn't.** Upload documents and images and Claude works from them directly. There's a size and count ceiling (current numbers: the linked docs). For a long document, **point at the section that matters** rather than trusting perfect recall of page 147 of a 200-page PDF. *Gotcha:* attaching everything and assuming total recall; retrieval over a huge attachment is good, not photographic.
- **Web search — current, but verify the citation.** When web search is enabled, Claude pulls in current information *with sources*. Treat the sources as the claim, not Claude's summary of them — **open the citation before you trust a number, quote, or date.** (See [`../docs/feature-inventory.md`](../docs/feature-inventory.md) → *Web search tool*.) *Gotcha:* pasting a web-search summary into your work as if it were sourced — you inherited a claim you didn't check.
- **Artifacts — the live editing pane.** When the output is a *thing you'll keep working on* — a document, a table, a small app, a chart — Claude renders it in a side panel you iterate on directly, instead of re-reading a wall of chat. Reach for it when you're building an object, not asking a question. *Gotcha:* iterating in the chat body on something that belongs in the Artifact — you lose the live view.

---

## 3. Projects — how the context multiplier behaves

A **Project** bundles *knowledge files* + *custom instructions* + a *shared scope*, reused across every chat inside it. It's the single biggest fluency lever on the product surface — and the one with the most non-obvious behavior.

**When a Project earns its place:** recurring context (the same standards, style guide, or reference docs every time) or team reuse (everyone works from one briefed setup). A genuine one-off is just a chat.

Three behaviors that aren't obvious from the UI:

- **Knowledge is *retrieved*, not fully in-context (RAG).** Project knowledge scales to large sets (roughly an order of magnitude more on paid plans) precisely because Claude retrieves the relevant slices per question rather than holding it all at once. Upside: you can load a lot. Downside: a specific, load-bearing detail can be missed on a given answer. **If one fact must not be missed, paste it into the message too** — don't rely on retrieval alone for the thing you can't get wrong. (Behavior per [`../docs/feature-inventory.md`](../docs/feature-inventory.md) → *Projects*; see also [`data-advisory.md`](data-advisory.md) for how much to load.)
- **Knowledge files are snapshots — they go stale silently.** An uploaded file doesn't track its source. When the real document changes, the Project keeps answering confidently from the old copy. **Refresh knowledge when the source moves**, and be suspicious of a Project that's been "set up" for months. *Gotcha:* a stale policy doc producing wrong-but-confident answers under your name.
- **Sharing is a data-boundary decision.** A shared Project's knowledge and instructions are visible to everyone it's shared with — org-wide sharing is a real data-leak vector. Use *can-use* vs *can-edit* permissions deliberately, keep public/org-wide projects off unless intended, and **don't put in a shared Project what its viewers shouldn't see.** (Per [`../docs/feature-inventory.md`](../docs/feature-inventory.md) → *Projects*; boundary depth → §8.)

---

## 4. Cowork — when Claude acts, not just answers

Cowork is an **agent that acts on your files**: it reads and writes the real files in folders you connect and runs commands, folder-scoped and egress-controlled, with a **review-before-act** gate. (Its session runs remotely on Anthropic's servers; the desktop app is what bridges it to your local folders — web/mobile are in beta.) It earns its extra privilege when the task *is* the file work — reorganizing a folder, running a multi-step transform across documents, driving a tool. When you just need an answer or a draft, chat or a Project is the right, lower-privilege choice.

This guide stays thin here on purpose — the operator's how-to is [`cowork-101.md`](cowork-101.md), and the full rollout and governance treatment is [`cowork-adoption-guide.md`](cowork-adoption-guide.md). The three gotchas to carry:

- **It's BAA-excluded as of 2026-07 — no PHI, no regulated data in Cowork** (coverage expands over time; confirm current scope with your admin / Anthropic rep before relying on it). (Per [`../docs/feature-inventory.md`](../docs/feature-inventory.md); boundary → §8.)
- **Scope the folder tightly.** The agent can touch what's in scope; a broad scope is a broad blast radius.
- **Review before you approve.** The gate only works if you actually read what it's about to do. Rubber-stamping the action is the same failure as rubber-stamping a draft, with write access.

---

## 5. Claude in Slack (Tag) — mechanics and visibility

Tag (a Team / Enterprise surface) is Slack-native: you `@`-tag Claude in a channel, DM it, or use the assistant panel. The mechanics that matter are about *identity* and *visibility*, not prompting.

- **Who Claude is depends on how you invoke it.** Channel-tagging runs under the **organization's Claude identity** — admin-scoped tools, data, and billing. DM and the assistant panel run under **your own account** — your access, billed to you. So what Claude can see and do genuinely differs between `@Claude` in a channel and a DM. (Per [`../docs/feature-inventory.md`](../docs/feature-inventory.md) → *Claude Tag*.)
- **Channel use is team-visible.** Everyone in the channel sees the exchange. Don't surface in a channel — via your prompt or Claude's answer — what shouldn't be seen there.
- **Memory and retention have a shape worth knowing.** Memory persists per-channel (admins can review and delete it). Conversations **auto-delete from Claude within 30 days of disconnecting the integration or uninstalling the app** — that's a disconnect trigger, *not* a rolling 30-day window while connected. Slack keeps its own copy under your org's Slack retention policy, separate from Anthropic's. (Per [`../docs/feature-inventory.md`](../docs/feature-inventory.md) → *Claude Tag*.)
- **Governance is unstated — verify, don't assume.** BAA / ZDR / residency are *not* stated for Tag in Anthropic's materials. Treat it as not-covered-until-confirmed for regulated data. (§8.)

---

## 6. Connectors — what they actually expose

Org-approved **connectors** bring your systems (drive, tickets, docs, and the like) into a chat so Claude can pull from them. They're admin-approved, and their **scope varies** — some are read-oriented, others can take actions — so confirm what a given connector is actually allowed to do (its docs, or your admin) before routing sensitive data through it.

- **Wired ≠ cleared for your data.** A connector being available doesn't mean it's approved for the specific data you're about to route through it. Third-party connector data flows sit *outside* the Enterprise BAA coverage even where the core surface is covered. (Per [`../docs/feature-inventory.md`](../docs/feature-inventory.md) BAA row; §8.)
- The deep MCP/connector-building story is the Claude Code cluster's job ([`mcp-starter-pack.md`](mcp-starter-pack.md)) — here, the only reflex you need is: *what does this connector let leave the boundary, and is that OK for this data?*

---

## 7. Getting good output — the reflexes (pointer, not repeat)

The reflexes that produce good output are the cheatsheet's, not this guide's — [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) covers them: **describe what "good" looks like** (goal, audience, format, one example), **decompose** a big ask into steps, and **bring the context** (paste it, or put it in a Project). Read them there; they're canonical.

The one product-specific add: **the product defaults the model** — you can override in the model picker, but you rarely need to the way an API caller tunes a tier by hand. When you *would* override (a hard reasoning task worth the top tier, or a bulk task where a cheaper tier is fine), the decision framework is [`model-selection-guide.md`](model-selection-guide.md). *Gotcha unchanged from the cheatsheet:* a vague ask gets you a confident answer of the wrong shape, and you can't say why it's wrong.

---

## 8. The data boundary — the one governance must-have

A user-facing guide carries exactly one governance rule, and it's this: **confirm your surface is cleared for your data before you use it for real work.** You can *open* a surface that isn't approved for the data you're about to put in it — the app doesn't stop you.

- **No PHI or regulated data in Cowork or Claude Design** — both are BAA-excluded as of 2026-07 (coverage expands; confirm current scope with your rep before relying on it).
- **Tag / Science governance is unstated** — verify before regulated use, don't assume coverage.
- **On Enterprise commercial, your inputs aren't used to train models** — but consumer plans are a separate policy surface, and BAA coverage on Enterprise is per-feature and admin-activated, not automatic.

This guide **asserts no coverage of its own.** The actual posture — what's BAA-covered, ZDR-eligible, residency-controlled, per surface — lives in [`governance-overlay.md`](governance-overlay.md) (the reference) and [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) (the per-feature trust-zone diagrams). When in doubt about a surface, that's the map. *Not legal advice.*

---

## 9. When Claude acts, you approve the irreversible ones

The mechanics above are Claude *answering*. On the action surfaces — Cowork writing files, a connector that can change a record, posting via Tag — Claude also *does*. That flips one thing: **a general instruction is consent to the task, not to every irreversible step inside it.** Claude pauses at the steps you can't take back and asks; you approve those, one at a time.

Two tiers worth holding in your head, because good agent oversight runs on them:

- **Ask-first — outward-facing or hard to undo.** Sending an email or message, posting in a channel, deleting or overwriting files, spending, sharing or changing permissions, changing settings. A prior "go ahead" on the *task* does **not** carry to these — consent is per-action, and it doesn't roll forward to the next one.
- **Hard-stop — never on autopilot, even if you told it to "just handle it."** The irreversible-and-costly set: moving money, permanently deleting data, changing who can access something, publishing externally. You approve each of these every time. If you're unsure whether something belongs here, treat it as if it does.

The test for which tier: ***can this be undone quietly if it's wrong?*** Yes → let it run. No → it's yours to approve, explicitly.

**The example.** You tell Cowork *"sort last quarter's invoices into folders."* That authorizes the sorting. It does **not** authorize deleting a file it judges a duplicate, or emailing a vendor about a mismatch it spotted — those are irreversible or outward-facing, so it should stop and ask. You gave consent to the *sort*, once; the *delete* and the *send* each need their own yes. A blanket "go ahead" treated as consent to everything downstream is the rubber-stamp with a blast radius.

*The security-architect version of this — bounding an agent's authority so a hijacked or over-eager agent can't even reach the irreversible action — is [`agentic-threat-model.md`](agentic-threat-model.md) (excessive agency). For Cowork's own review-before-act controls, [`cowork-adoption-guide.md`](cowork-adoption-guide.md).*

---

## 10. Approach with extreme caution — the house failure modes

- **Rubber-stamping a Cowork action.** The review gate is only protection if you read it. Approving without looking is write access on autopilot.
- **Pasting regulated data into an uncleared surface.** Being able to open Cowork/Tag/Design doesn't mean it's approved for that data. Confirm first (§8).
- **Treating web-search or model output as sourced fact.** Open the citation. A confident summary of a source you didn't read is a claim you're now vouching for.
- **Over-stuffing a Project.** More knowledge isn't better — past a point it *degrades RAG retrieval precision* (the slice you needed gets crowded out) and runs up cost. Load what's relevant, not everything. (§3.)
- **Stale Project knowledge.** A months-old "set-up" Project answers confidently from files the world has moved past. Refresh on source change.
- **Shadow AI.** Using a personal Claude account (or another tool) for work data because the sanctioned surface felt slower — it moves regulated data off every control the org built. If the approved surface is the friction, that's a rollout problem to raise, not to route around. (See [`workforce-change-guide.md`](workforce-change-guide.md).)

---

*See also: [`user-mindset-cheatsheet.md`](user-mindset-cheatsheet.md) (the mindset primer + surface table) · [`cowork-adoption-guide.md`](cowork-adoption-guide.md) (Cowork depth) · [`claude-code-101.md`](claude-code-101.md) (the Claude Code version) · [`surface-rollout-matrix.md`](surface-rollout-matrix.md) (what's cleared for you) · [`subscription-selection-guide.md`](subscription-selection-guide.md) (choosing a plan) · [`model-selection-guide.md`](model-selection-guide.md) · [`governance-overlay.md`](governance-overlay.md) + [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) (the boundary).*

---

© gmanch94 · CC-BY-4.0 · As of 2026-07. Verify pricing/models at anthropic.com.
