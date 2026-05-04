# Claude MCP Starter Pack

> 7 read-only MCP server patterns for Claude Code + Agent SDK rollouts. Each framed by **when-to-use / failure-mode / owner / config body** before the config itself. Pinned to current Claude surface (Opus 4.7 / Sonnet 4.6 / Haiku 4.5, MCP GA as of 2026-05).

---

## Why this pack exists

The [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) Phase 2 names four MCP servers worth wiring early (issue tracker, internal docs, CI logs, DB read replica) and stops at the headers — no config bodies, no decision context, no read-vs-mutate framing. The [`feature-decision-matrix.html`](feature-decision-matrix.html) and [`reference-architectures.html`](reference-architectures.html) cite MCP as load-bearing across five patterns (RAG, agentic, domain expert, code automation, embedded copilot) without showing the server shape.

Teams without scaffolding fall into one of two failure modes the adoption guide already names:
1. **"MCP for everything immediately"** — 7 half-built servers, none documented, all written by 4 different engineers
2. **No MCP for too long** — every system reach-out is a bespoke tool wired into a single agent, and the wiring rots when the agent moves

This pack closes the gap with 7 decision-framed read-only server templates. The structure forces a written owner per server and a *read-vs-mutate* declaration before any config ships.

**Failure mode this pack prevents:** "the agent has 14 tools, half of them mutate prod, and nobody can name what they all do." MCP servers compound trust — every server adds tool definitions to every agent that loads it. Without per-server decision discipline, the trust surface grows faster than the value.

---

## How to use this pack

1. **Read-only first, mutate later.** Every server in this pack is read-only by design. Mutation patterns (post comment, write doc, run query) belong in Phase 3+ after governance is comfortable — see the adoption guide's phased rollout.
2. **One server per system worth automating.** Don't bundle three systems behind one server — debugging tool failures gets 10× harder. One Jira server, one Confluence server, one DB server.
3. **Each server needs a named owner.** A server with no owner gets disabled the first time it leaks credentials or 429s the agent. The owner is the person who will fix it within 24h, not "the platform team."
4. **Tool returns are untrusted input.** Anything an MCP server returns (a Jira ticket body, a wiki page, a DB row) can carry prompt injection — see [`governance-overlay.md`](governance-overlay.md) §14. Sandbox tool execution; treat returns as user-controlled content for safety filters.
5. **Cache the cheap calls.** Issue tracker reads, doc fetches, CI log tails are all read-heavy and cache-friendly. Use prompt caching on the system prompt that includes tool definitions; cache the static parts of returns where the protocol allows.

Each template below is structured the same way:

- **When to use** — the trigger pattern in agent workflows
- **Failure mode without it** — what stays manual / brittle / ungoverned
- **Failure mode of the server itself** — what goes wrong if you ship it sloppy
- **Owner archetype** — who in the org should own the server
- **Scope** — read-only vs gated-read vs mutate (this pack is read-only by design)
- **Config body** — `mcp_servers` block + sketch of the server-side handler

> Config syntax follows the standard MCP server registration pattern. Verify shape at [modelcontextprotocol.io](https://modelcontextprotocol.io) and [docs.claude.com/en/docs/claude-code/plugins](https://docs.claude.com/en/docs/claude-code/plugins) — protocol details drift.

---

## The 7 servers

### 1. Issue tracker — read-only (Jira / Linear / GitHub Issues)

**When to use.** Engineer asks the agent "what's the context on TICKET-1234?" or the agent is reviewing a PR and wants to read the linked ticket. Highest-leverage MCP server for most teams — unblocks ticket-to-PR context every day.

**Failure mode without it.** Engineers paste ticket bodies into chat manually. Context loss when bodies are long; copy-paste leaks ticket content into transcripts the team didn't intend to expose; agent answers without ticket context and proposes the wrong fix.

**Failure mode of the server itself.** Returns full ticket history including private comments / acquisition discussion / HR threads. Scope queries to the project(s) the engineer's team owns; **never** wire the org-wide instance read scope to a developer agent.

**Owner archetype.** Engineering productivity / DevEx team. Reviews scope quarterly. First in line when a "Claude leaked our M&A notes" thread shows up in `#security`.

**Scope.** Read-only. List + get + search by project/label. No comment posting, no status transitions in this pack — those are Phase 3+ patterns gated by governance review.

**Config body:**

```json
{
  "mcp_servers": {
    "issue-tracker": {
      "command": "node",
      "args": ["./mcp-servers/issue-tracker/index.js"],
      "env": {
        "TRACKER_BASE_URL": "https://<TEAM>.atlassian.net",
        "TRACKER_PROJECT_SCOPE": "<PROJECT_KEYS_CSV>",
        "TRACKER_TOKEN": "${TRACKER_TOKEN}"
      }
    }
  }
}
```

```js
// mcp-servers/issue-tracker/index.js (sketch)
// Tools exposed:
//   list_tickets(project, status?, assignee?)  -> [{id, title, status, assignee}]
//   get_ticket(id)                              -> {id, title, body, comments, links}
//   search_tickets(query, project?)             -> [{id, title, score}]
// Hard-scope project to TRACKER_PROJECT_SCOPE — never query outside it.
// Strip @mentions of legal/HR/security users from comment bodies before returning.
```

---

### 2. Internal docs / wiki — read-only (Confluence / Notion / Slab / GitHub Wiki)

**When to use.** Engineer asks "what's our convention for X?" or the agent is generating a doc / commit message and wants to match house style. Pairs with the `pr-review` Skill from [`claude-code-starter-skills.md`](claude-code-starter-skills.md).

**Failure mode without it.** Conventions drift because nobody reads the wiki. Agent hallucinates conventions that *sound* right. Or engineers paste wiki pages in manually — same leak risk as issue tracker.

**Failure mode of the server itself.** Indexes the entire wiki including HR / legal / executive spaces. Returns page content with *embedded credentials* people pasted into pages years ago. Scope by space/folder; run a one-time scan for credential-shaped content before exposing.

**Owner archetype.** Documentation lead or DevEx team. Owns the space allow-list. Co-owns with security for the credential-scan policy.

**Scope.** Read-only. Search + fetch by ID. No write-back of generated docs in this pack.

**Config body:**

```json
{
  "mcp_servers": {
    "internal-docs": {
      "command": "node",
      "args": ["./mcp-servers/internal-docs/index.js"],
      "env": {
        "DOCS_BASE_URL": "https://<TEAM>.atlassian.net/wiki",
        "DOCS_SPACE_ALLOWLIST": "<SPACE_KEYS_CSV>",
        "DOCS_TOKEN": "${DOCS_TOKEN}"
      }
    }
  }
}
```

```js
// mcp-servers/internal-docs/index.js (sketch)
// Tools:
//   search_docs(query, space?)  -> [{id, title, space, excerpt, url}]
//   get_doc(id)                  -> {id, title, body_md, last_modified, url}
// Allow-list spaces only; reject any id outside DOCS_SPACE_ALLOWLIST.
// Run secret-pattern regex over body before return; redact + log redaction event.
```

---

### 3. CI logs — read-only (GitHub Actions / CircleCI / Buildkite)

**When to use.** Build red. Engineer asks the agent "why did the last CI run fail on main?" Agent fetches the failed step's tail, proposes a fix. Cuts the typical 5-minute "context switch to CI tab" loop down to a sentence.

**Failure mode without it.** Agent guesses at the failure based on the diff alone. Wrong fix, wasted run, more red builds. Or engineer copy-pastes 200 lines of log into chat — burns context and tokens.

**Failure mode of the server itself.** Returns logs that include test fixtures with PII, deploy steps that print secrets to stdout (someone's old `echo $TOKEN`), or full env dumps from a debug job. Scope to specific repos; redact known secret patterns; cap log tail at e.g. 500 lines.

**Owner archetype.** CI / build infrastructure team. Owns the redaction allow-list. First call when a log redaction misses a token shape.

**Scope.** Read-only. List recent runs + tail failed step's log. No re-run, no cancel, no artifact write.

**Config body:**

```json
{
  "mcp_servers": {
    "ci-logs": {
      "command": "node",
      "args": ["./mcp-servers/ci-logs/index.js"],
      "env": {
        "CI_PROVIDER": "github-actions",
        "CI_REPO_ALLOWLIST": "<OWNER/REPO_CSV>",
        "CI_TOKEN": "${CI_TOKEN}",
        "CI_LOG_TAIL_LINES": "500"
      }
    }
  }
}
```

```js
// mcp-servers/ci-logs/index.js (sketch)
// Tools:
//   list_recent_runs(repo, branch?, status?)         -> [{id, status, branch, sha, started_at}]
//   get_failed_step_tail(run_id, max_lines?)         -> {step, tail, conclusion}
// Reject runs in repos outside CI_REPO_ALLOWLIST.
// Pipe tail through secret-redactor before return.
```

---

### 4. DB read-only replica — gated read (Postgres / Snowflake / BigQuery)

**When to use.** Agent investigates data shape during debugging, validates a schema change against real prod data shape, or pulls a small sample for a backfill plan. Single most-leveraged server for backend teams once governance is comfortable.

**Failure mode without it.** Engineer runs the query manually, pastes a slice into chat. Slow loop, leak risk. Or worse, agent generates a query the engineer runs against *primary* — and a `LIMIT 100` typo locks a table.

**Failure mode of the server itself.** Connection string points at primary instead of replica. Or an agent crafts a 40-way join that lands a $400 Snowflake query overnight. Or returns rows with raw PII into the conversation transcript. Mitigations: replica-only credentials, query timeout, row cap, schema-level allow-list, PII column redaction at the server layer.

**Owner archetype.** Data platform / DBA lead, with security co-sign. The credential and the row cap belong on the data platform team's runbook.

**Scope.** Read-only. SELECT against an allow-listed schema. Hard caps: query timeout, row cap, byte cap on returned payload.

**Config body:**

```json
{
  "mcp_servers": {
    "db-readonly": {
      "command": "node",
      "args": ["./mcp-servers/db-readonly/index.js"],
      "env": {
        "DB_REPLICA_URL": "${DB_REPLICA_URL}",
        "DB_SCHEMA_ALLOWLIST": "<SCHEMAS_CSV>",
        "DB_QUERY_TIMEOUT_MS": "10000",
        "DB_ROW_CAP": "1000",
        "DB_BYTE_CAP": "1048576"
      }
    }
  }
}
```

```js
// mcp-servers/db-readonly/index.js (sketch)
// Tools:
//   list_tables(schema)                      -> [{schema, table, row_count_estimate}]
//   describe_table(schema, table)            -> {columns: [{name, type, nullable}], pii_columns: [...]}
//   sample_rows(schema, table, n?, where?)   -> {rows, truncated}
//   run_query(sql)                            -> {rows, truncated, timed_out}
// Reject schemas outside DB_SCHEMA_ALLOWLIST.
// Reject any SQL that isn't a SELECT (parse with sqlglot or equivalent — string match is not enough).
// Apply DB_QUERY_TIMEOUT_MS, DB_ROW_CAP, DB_BYTE_CAP. Truncate + flag.
// Redact PII columns marked in describe_table catalog before return.
```

---

### 5. Observability — read-only (Datadog / Sentry / Grafana / New Relic)

**When to use.** Production incident or post-incident review. Engineer asks "what's the error rate on `/api/orders` for the last 6h?" Agent fetches the metric/log/trace, drafts the incident timeline. Pairs with on-call rituals.

**Failure mode without it.** Agent answers from training data ("typically order APIs degrade when…") instead of the actual signal. Or engineer pastes 30 Sentry events one-by-one into chat — token bleed, no useful context shape.

**Failure mode of the server itself.** Returns raw error events with user PII (emails, IPs, request bodies). Or fans out a metric query that returns 500k points and crushes the agent's context. Mitigations: query result cap, PII scrub on event bodies, time-window cap (e.g. max 24h per call).

**Owner archetype.** SRE / observability team. Owns the redaction list. First responder when a Sentry event leaks a user email through to a transcript.

**Scope.** Read-only. Metric query, log search, error event fetch. No annotation write, no alert mute, no dashboard edit.

**Config body:**

```json
{
  "mcp_servers": {
    "observability": {
      "command": "node",
      "args": ["./mcp-servers/observability/index.js"],
      "env": {
        "OBS_PROVIDER": "datadog",
        "OBS_API_KEY": "${OBS_API_KEY}",
        "OBS_APP_KEY": "${OBS_APP_KEY}",
        "OBS_TIME_WINDOW_MAX_HOURS": "24",
        "OBS_RESULT_CAP": "200"
      }
    }
  }
}
```

```js
// mcp-servers/observability/index.js (sketch)
// Tools:
//   query_metric(query, from, to)                -> {points, truncated}
//   search_logs(query, from, to, max?)            -> {entries: [{ts, level, message_redacted, service}], truncated}
//   get_error_events(service, from, to, max?)    -> {events: [{ts, type, message_redacted, fingerprint}], truncated}
// Reject windows > OBS_TIME_WINDOW_MAX_HOURS.
// Redact email, IP, credit-card, JWT, and request-body free-text before return.
```

---

### 6. Internal HTTP API catalog — read-only

**When to use.** Engineer asks the agent "does our user-service expose a `getEntitlements` endpoint?" or "what does `POST /v1/orders` accept?" — agent fetches OpenAPI/spec, answers from spec rather than guessing. Highest leverage in orgs with 50+ internal services.

**Failure mode without it.** Agent hallucinates endpoint shapes. Engineer copy-pastes the spec in. Worse: agent generates a client against a spec that's 18 months stale because nobody updated the README.

**Failure mode of the server itself.** Indexes specs that include internal-only debug endpoints, or specs whose `description` fields contain stale credential examples. Specs change shape (Swagger 2 → OpenAPI 3 → AsyncAPI) — server must handle multiple. Mitigations: service allow-list, regenerate index nightly, redact examples.

**Owner archetype.** Platform / API gateway team. Owns the allow-list. Co-owns with the team that runs the service registry.

**Scope.** Read-only. Search services + endpoints by name/tag, fetch endpoint shape, fetch full spec.

**Config body:**

```json
{
  "mcp_servers": {
    "api-catalog": {
      "command": "node",
      "args": ["./mcp-servers/api-catalog/index.js"],
      "env": {
        "API_REGISTRY_URL": "https://api-registry.<TEAM>.internal",
        "API_SERVICE_ALLOWLIST": "<SERVICE_NAMES_CSV>",
        "API_REGISTRY_TOKEN": "${API_REGISTRY_TOKEN}"
      }
    }
  }
}
```

```js
// mcp-servers/api-catalog/index.js (sketch)
// Tools:
//   list_services(tag?)                          -> [{name, tags, last_updated}]
//   list_endpoints(service)                      -> [{method, path, summary}]
//   get_endpoint(service, method, path)          -> {request_schema, response_schema, auth, examples_redacted}
//   get_spec(service)                            -> {openapi_yaml}
// Reject services outside API_SERVICE_ALLOWLIST.
// Strip example values that match credential / token patterns before return.
```

---

### 7. Code search / repo graph — read-only (Sourcegraph / GitHub code search / `ripgrep` over a checkout)

**When to use.** Agent investigating "where is `chargeCard` called from?" or "every place we deserialize JSON without a schema check." Pairs with the `refactor-scout` Skill from [`claude-code-starter-skills.md`](claude-code-starter-skills.md). Most useful in monorepos > 50k files where local `grep` is slow.

**Failure mode without it.** Agent runs `Grep` locally — fine for small repos, painful in a monorepo. Or agent answers without searching, recommending a refactor that misses 4 call sites.

**Failure mode of the server itself.** Exposes secrets that historically shipped to a repo (someone's old `.env.example` with real values). Returns matches from archived/sensitive repos. Returns full file bodies when a 3-line context window would do, blowing out the agent's context. Mitigations: repo allow-list, history-secret scan, default to small context windows on returns, hard byte cap.

**Owner archetype.** Source-of-truth platform team (Sourcegraph admins / monorepo owners). Owns the repo allow-list and the secret-scan history.

**Scope.** Read-only. Search by symbol/pattern, fetch file with line range, list call sites of a symbol.

**Config body:**

```json
{
  "mcp_servers": {
    "code-search": {
      "command": "node",
      "args": ["./mcp-servers/code-search/index.js"],
      "env": {
        "CODE_SEARCH_PROVIDER": "sourcegraph",
        "CODE_SEARCH_URL": "https://sourcegraph.<TEAM>.internal",
        "CODE_SEARCH_REPO_ALLOWLIST": "<REPO_PATTERNS_CSV>",
        "CODE_SEARCH_TOKEN": "${CODE_SEARCH_TOKEN}",
        "CODE_SEARCH_RESULT_CAP": "100",
        "CODE_SEARCH_BYTE_CAP": "65536"
      }
    }
  }
}
```

```js
// mcp-servers/code-search/index.js (sketch)
// Tools:
//   search_code(query, repo?, lang?, max?)           -> [{repo, path, line, snippet}]
//   find_symbol(name, kind?)                          -> [{repo, path, line, symbol_kind}]
//   list_callers(symbol, repo?)                       -> [{repo, path, line, snippet}]
//   get_file_range(repo, path, start, end)            -> {content, truncated}
// Reject repos outside CODE_SEARCH_REPO_ALLOWLIST.
// Apply RESULT_CAP and BYTE_CAP. Run secret-pattern regex over snippets before return.
```

---

## Phase rollout — which server when

Don't ship 7 MCP servers on day 1. Mirror the [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) phases:

| Phase | Window | Servers | Why |
|---|---|---|---|
| **Phase 2** | Weeks 5–8 | 1 (issue tracker), 2 (internal docs) | Lowest blast radius, highest daily leverage. Both are pure read of bodies engineers already have access to. |
| **Phase 2.5** | Weeks 7–9 | 3 (CI logs) | Adds value but needs redactor work first. Ship after the secret-redactor utility is hardened. |
| **Phase 3** | Weeks 9–12 | 5 (observability), 6 (API catalog), 7 (code search) | Need allow-lists + redaction policy from security. Phase 3 is when governance has bandwidth to review. |
| **Phase 3+** | Week 12+ | 4 (DB replica) | Highest blast radius even read-only. Ship only after query-cap + PII-redaction infra is proven on the lower-risk servers. |
| **Phase 4** | Quarter 2+ | Mutate variants of any of the above | Comment posting, doc writes, query writes, alert annotations. Each is its own governance review — none of these belong in this pack. |

---

## Read-only vs gated-read vs mutate (per server in this pack)

| # | Server | Default scope | Why this scope |
|---|---|---|---|
| 1 | issue-tracker | Read-only | Comment posting is Phase 4 — needs human-in-loop review for posts. |
| 2 | internal-docs | Read-only | Generated docs go through PR review, not direct write. |
| 3 | ci-logs | Read-only | Re-running CI is a write to shared infra; out of scope for this pack. |
| 4 | db-readonly | Gated read | Read-only credentials, schema allow-list, query/row/byte caps. Stricter than 1–3. |
| 5 | observability | Read-only | Annotation/mute is Phase 4 — needs on-call sign-off pattern. |
| 6 | api-catalog | Read-only | Spec writes belong in source control, not via agent. |
| 7 | code-search | Read-only | Edits go through `Edit`/`Write` tools + branch guard hook, not via search server. |

**Anti-pattern this pack rejects:** "let's give the agent comment-post access to Jira on day 1, what could go wrong." Plenty. Mutate access expands the blast radius from "leak some context" to "post a public comment under the engineer's identity" — needs governance review and a human-in-the-loop pattern, not a one-line config flip.

---

## What this pack does NOT include

- **Mutate-scope servers.** Comment posting, doc writes, query writes, deploy triggers — all Phase 4+. Each deserves its own decision frame, governance review, and incident drill before shipping.
- **Org-wide search servers** without allow-lists. A "search everything" server that includes HR, legal, executive content is a leak channel. Always scope.
- **MCP servers as a substitute for direct API tools.** If the system has a clean API and only one agent uses it, sometimes a direct tool definition is simpler than an MCP server. MCP earns its keep when ≥2 agents need the same system.
- **Production system mutate access via MCP.** Production writes go through normal CI/CD with human review, not through an agent's tool loop. The agent can *propose* the write (a PR, a deploy ticket); humans approve.
- **Server-side prompt injection defenses for free.** Returns are untrusted user input. Treat them with the same prompt-injection defenses you'd apply to any user-controlled string. See [`governance-overlay.md`](governance-overlay.md) §14.

---

## Companion artifacts

- [`claude-code-adoption-guide.md`](claude-code-adoption-guide.md) — Phase 2 names these servers; this pack ships the bodies. Phase rollout in this pack mirrors that guide.
- [`claude-code-starter-skills.md`](claude-code-starter-skills.md) — Skills + MCP compose: a Skill says *what to do*, an MCP server says *what to read*. Pair the `pr-review` Skill with servers 1–2; pair `refactor-scout` with server 7.
- [`hooks-starter-pack.md`](hooks-starter-pack.md) — Hooks defend the agent's loop; MCP servers extend the agent's reach. The `block-secrets` and `pii-scrub-prompt` hooks complement the redaction logic in servers 1–6 — defense in depth.
- [`eval-starter-pack.md`](eval-starter-pack.md) — `tool-call-accuracy` and `grounding` evals are how you catch a server that returns junk or that the agent invokes wrong. Eval each server's tool surface before promoting past Phase 2.
- [`governance-overlay.md`](governance-overlay.md) — §1 data flow taxonomy applies (tool returns leave your network embedded in the prompt); §14 prompt injection treats tool returns as untrusted; §4 BAA per-feature scope question for any server returning PHI.
- [`feature-decision-matrix.html`](feature-decision-matrix.html) — MCP column shows which patterns benefit; this pack tells you which server to ship first.
- [`reference-architectures.html`](reference-architectures.html) — agentic + domain-expert + code-automation patterns all assume an MCP layer; servers in this pack populate it.
- [`../docs/feature-inventory.md`](../docs/feature-inventory.md) — canonical MCP status + doc anchor; cross-check before shipping.

---

`© gmanch94 · CC-BY-4.0 · As of 2026-05. Verify MCP protocol shape at modelcontextprotocol.io and docs.claude.com/en/docs/claude-code/plugins.`
