# Agentic Threat Model — Claude Deployments

**As of 2026-06.** Pin to current surface (Opus 4.8 / Sonnet 4.6 / Haiku 4.5, MCP, Claude Code, Cowork) — refresh monthly.

[`governance-overlay.md`](governance-overlay.md) and [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) answer *where does the data go* — the **compliance** surface. [`incident-response-runbook.md`](incident-response-runbook.md) answers *what do we do when it breaks* — the **reactive** layer. Neither answers the question a security architect is asked when defending an agentic deployment to a risk committee: **how does an attacker turn this agent against us, and what stops them?** This is that register — the **preventive** attack surface, framed on the OWASP LLM / agentic risk taxonomy and mapped, threat by threat, to a control that already exists in this repo.

> **Scope: agentic, not chat.** A chat copilot reads and writes text a human then acts on. An *agent* takes actions — runs tools, calls MCP servers, executes code, touches files (Claude Code, Cowork), browses. The blast radius is the difference between "wrote a wrong sentence" and "ran a wrong command." This model is for the agentic surface; a pure-chat deployment can downgrade most rows. The single most important fact: **an agent treats fetched/returned content as instructions unless you stop it.** Most rows below are a corollary of that.

> ⚠ **What this is not.** Not a Claude penetration test, not a claim about Anthropic's internal security (that's the Trust Portal — see [`procurement-pack.md`](procurement-pack.md)). This is the **deployer-control** model: the threats that live in *how you wire the agent*, and the mitigations you own.

---

## The register

Ten threats. **Blast radius** is the worst realistic outcome if the control is absent, graded for an agent with real tool access. **Primary control** names the repo artifact that already carries the mitigation — this model is a router into existing controls, not a new pile.

| # | Threat | What it looks like | Blast radius | Primary control |
|---|---|---|---|---|
| T1 | **Prompt injection (indirect)** | A fetched web page, email, PDF, or MCP-returned record contains "ignore prior instructions, do X." The agent obeys content as if it were the user. | **Critical** | `[gov §14]` + tool least-privilege (T2). [`anti-use-cases.md`](anti-use-cases.md) — keep agents off untrusted-input loops with real authority. |
| T2 | **Excessive agency** | The agent has tools (delete, send, pay, deploy) broader than the task needs. Injection (T1) becomes catastrophic because the tool exists to abuse. | **Critical** | [`mcp-starter-pack.md`](mcp-starter-pack.md) read-only-by-default scope; mutate tools deferred + gated. Least-privilege is the ceiling on every other row. |
| T3 | **Data exfiltration via the agent** | Agent reads sensitive data, then writes it to an external sink — web fetch to an attacker URL, an MCP server's egress, a file synced out. | **Critical** | [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) egress paths; [`hooks-starter-pack.md`](hooks-starter-pack.md) PII-scrub + block-secrets; Cowork egress-control + folder-scope ([`cowork-adoption-guide.md`](cowork-adoption-guide.md)). |
| T4 | **Supply chain (MCP / plugin / skill)** | A third-party MCP server, plugin, or shared skill is malicious or compromised — it sees every prompt routed to it and can return injected instructions (feeds T1). | **High** | [`mcp-starter-pack.md`](mcp-starter-pack.md) allow-listed + scoped servers; [`hooks-starter-pack.md`](hooks-starter-pack.md) dependency-license + audit-log; vet before wiring. |
| T5 | **Insecure output handling** | Model output is executed or rendered without validation — generated SQL run on prod, shell command executed, HTML reflected into a page (XSS), code-exec without a sandbox. | **High** | Output validation layer ([`adoption-playbook.md`](adoption-playbook.md) production safety nets); code-exec sandboxing; never auto-run un-reviewed output. |
| T6 | **Credential / secret abuse** | API keys or service tokens leak — pasted into a prompt, logged, committed, or handed to an over-scoped agent. A leaked service-role key bypasses app-layer checks entirely. | **High** | [`hooks-starter-pack.md`](hooks-starter-pack.md) block-secrets (pre-tool + pre-commit); short-lived least-scope tokens; secrets never in prompts/logs. |
| T7 | **Unbounded consumption** | An agent loop runs away — recursive tool calls, retry storms, a fan-out that doesn't terminate. Cost spike and/or self-inflicted DoS. | **Med** | [`governance-overlay.md`](governance-overlay.md#15-cost-as-a-governance-constraint) §15 four numeric gates ($/task, $/day caps); turn/step limits; [`incident-response-runbook.md`](incident-response-runbook.md) agent-loop-runaway class. |
| T8 | **Confused-deputy / broken access control** | The agent runs with *its own* (broad) privilege, not the requesting user's. User A asks it for data only User B should see; the agent, holding a service identity, complies. | **High** | Enforce the *caller's* authorization at the data layer, not just app-side (`[gov §9]` audit; least-privilege identity per T2). Mirrors the multi-surface invariant: every check must exist on the path the data is actually reached on. |
| T9 | **Memory / context poisoning** | Persistent memory (memory tool) or Project knowledge is seeded with malicious content that steers later sessions — injection with a long fuse. | **Med** | Treat memory + Project knowledge as untrusted input on read (T1 controls); review what gets written; scope memory per workload. `[gov §14]` |
| T10 | **Automation bias (review defeated)** | The human approval gate exists but is rubber-stamped — operators approve agent actions without reading them, so "review-before-act" is theater. | **High** | [`cowork-adoption-guide.md`](cowork-adoption-guide.md) review-before-act done for real; high-stakes human-in-the-loop ([`adoption-playbook.md`](adoption-playbook.md)); make the diff legible so review is cheap. The control is only as strong as the attention behind it. |

---

## Defense in depth — four layers

No single control holds. Each threat is caught at the layer it's cheapest to stop, and again at the next layer in case the first fails. If a column is empty for a threat you care about, that's your gap.

| Layer | What it controls | Catches | Repo control |
|---|---|---|---|
| **Prompt / input** | Distrust fetched + returned content; mark provenance; don't blend untrusted text into the instruction channel. | T1, T9 | `[gov §14]` |
| **Tool / capability** | Least privilege. Read-only by default. Mutate tools gated, allow-listed, scoped. Per-user identity. | T2, T4, T6, T8 | [`mcp-starter-pack.md`](mcp-starter-pack.md), [`hooks-starter-pack.md`](hooks-starter-pack.md) |
| **Data / egress** | What can leave, and to where. PII scrub, secret block, egress allow-list, folder scope, residency. | T3, T6 | [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html), `[gov §5]` |
| **Human / process** | Real review on high-stakes actions; audit log; cost gates; kill switch. | T5, T7, T10 | [`adoption-playbook.md`](adoption-playbook.md), `[gov §9]` `[gov §15]` |

---

## Before you ship an agent — five design questions

The think-first gate, specialized for the agentic surface. If any answer is hand-wavy, the design isn't ready.

1. **What's the worst single tool call?** Enumerate the agent's tools; for each, name the worst thing it does if invoked with attacker-chosen arguments. If any is irreversible (pay, delete, send-external, deploy), that tool needs a human gate or it comes out of the agent's hands.
2. **What untrusted content reaches the model?** Web pages, emails, tickets, MCP records, uploaded files, memory. *All of it is a T1 injection vector.* If untrusted content and a high-authority tool are in the same loop, you have a critical exposure — re-scope.
3. **Whose identity does the agent act as?** If it holds a service identity broader than the requesting user, you have a confused-deputy (T8). Enforce the *caller's* authorization at the data layer.
4. **What can leave, and to where?** List every egress path (T3). If a sensitive-data tool and an external-write tool coexist, that's the exfiltration channel — break it or monitor it.
5. **What stops a runaway?** Name the turn limit, the $/day gate, and the kill switch (T7). "We'll watch the bill" is not an answer — see [`governance-overlay.md`](governance-overlay.md#15-cost-as-a-governance-constraint) §15.3.

Each answer should name the control *and* its failure mode — a control whose failure mode you can't state isn't load-bearing yet.

---

## How this differs from the runbook

| | This threat model | [`incident-response-runbook.md`](incident-response-runbook.md) |
|---|---|---|
| Stance | Preventive — wire it right before launch | Reactive — contain it after it fires |
| Question | "How is this attacked?" | "It broke — what now?" |
| Output | Controls + design gates | Symptoms → immediate actions → post-mortem |

Use this **before** the agent ships (design + review gate); reach for the runbook **when** T7 (cost spike, loop runaway) or T4 (MCP compromise) actually lands — both are incident classes there.

---

## Companion artifacts

- [`governance-overlay.md`](governance-overlay.md) — §14 prompt injection + content safety, §9 audit, §15 cost gates, §5 residency.
- [`enterprise-data-boundaries.html`](enterprise-data-boundaries.html) — egress paths per feature (T3).
- [`hooks-starter-pack.md`](hooks-starter-pack.md) — block-secrets, PII scrub, branch guard, audit log (T3, T4, T6).
- [`mcp-starter-pack.md`](mcp-starter-pack.md) — read-only-by-default server scope (T2, T4).
- [`anti-use-cases.md`](anti-use-cases.md) — workloads to keep agents off entirely (T1).
- [`cowork-adoption-guide.md`](cowork-adoption-guide.md) — folder-scope, egress, review-before-act, isolated VM (T3, T10).
- [`incident-response-runbook.md`](incident-response-runbook.md) — the reactive counterpart.
- Framework anchor: OWASP LLM / agentic-AI risk taxonomy ([genai.owasp.org](https://genai.owasp.org)).

---

`© gmanch94 · CC-BY-4.0 · As of 2026-06. Deployer-control model — not a Claude pentest. Verify Anthropic's own security posture at trust.anthropic.com.`
