---
description: Verify an artifact's technical claims (config keys, env defaults, version pins, paths, enum/string sentinels) against the live doc it cites — the claim-vs-source fact-check /stale-check does not do
allowed-tools: Bash, Glob, Grep, Read
---

Run the global **`doc-verify`** skill (`~/.claude/skills/doc-verify/`) against this repo. It encodes the full procedure — extract atomic claims → fetch the live `.md` doc → diff MATCH / MISMATCH / UNVERIFIED with a verbatim source quote per verdict, presence-check before pulling the quote — and is stack-agnostic; nothing here restates it.

This is the layer `/stale-check` (metadata: as-of stamps, model pins, surface status, URL *health*) and the monthly refresh (feature-inventory drift) both leave open. A claim can sit behind a healthy URL, a current stamp, and a correct model pin and still be **wrong** — the value drifted. Precedent (2026-07-12): `claude-code-enterprise-config.md` asserted `disableBypassPermissionsMode: true`; the live settings doc says `"disable"`. Only a claim-vs-source diff catches that class.

Repo specifics the skill needs (it's otherwise generic):

- **Target `$ARGUMENTS`** = one artifact path. If empty, do the claim-dense set in order:
  - `artifacts/claude-code-enterprise-config.md`
  - `artifacts/claude-code-101.md`
  - `docs/feature-inventory.md`
  - `artifacts/governance-overlay.md`
  - `artifacts/enterprise-data-boundaries.html`
  - Skip narrative/strategy artifacts (decision-spine, playbook, workforce-change, memes) — judgment claims, not verifiable assertions.
- **Docs host:** the artifact's **Sourcing** line lists the `docs.claude.com/en/docs/claude-code/*` URLs to map claims to.
- **Fetch:** `curl -sL "<url>.md"` — docs.claude.com is Mintlify, so the `.md` endpoint returns clean markdown (proven 2026-07-12: 200, ~10× smaller than HTML).

Complements `/stale-check` (metadata + URL health), the monthly refresh (feature-inventory), and `/render-fix` (kramdown render). Run when a config/claim-dense artifact changes or before a release.
