#!/usr/bin/env node
// check-counts.mjs — assert the artifact count is consistent across the repo.
// No dependencies (Node builtins only). Run from anywhere:
//     node scripts/check-counts.mjs
// Exit 0 = all counts agree; exit 1 = a mismatch (or a count sentence moved).
//
// Why this exists: the "bump the count when you add an artifact" ritual step
// keeps getting skipped. Precedent 2026-07-19 — scope.md/CLAUDE.md said 46 while
// artifacts/ and the README catalog both already held 51. This guard makes the
// drift fail loudly instead of shipping silently.
//
// Ground truth = the number of files in artifacts/. Every stated count and the
// README "## Artifacts" catalog must equal it. (If the ground truth itself is
// wrong — e.g. a stray non-artifact file landed in artifacts/ — fix that first.)

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// --- ground truth: artifact files (.md + .html live in artifacts/) ---
const artifactFiles = readdirSync(join(ROOT, 'artifacts')).filter(
  (f) => f.endsWith('.md') || f.endsWith('.html'),
);
const N = artifactFiles.length;

// --- README "## Artifacts" catalog rows (lines like `| [name](artifacts/…)`) ---
function readmeCatalogRows() {
  let inSection = false;
  let count = 0;
  for (const line of read('README.md').split(/\r?\n/)) {
    if (/^##\s+Artifacts\s*$/.test(line)) { inSection = true; continue; }
    if (inSection && /^##\s/.test(line)) break; // reached the next section
    if (inSection && /^\|\s*\[/.test(line)) count++;
  }
  return count;
}

// --- stated counts scattered through the docs (must all equal N) ---
const scope = read('docs/scope.md');
const claude = read('CLAUDE.md');
const grab = (re, s) => { const m = s.match(re); return m ? Number(m[1]) : null; };

const checks = [
  { label: 'README "## Artifacts" catalog rows', value: readmeCatalogRows() },
  { label: 'scope.md  "now ships N"',            value: grab(/now ships (\d+)/, scope) },
  { label: 'scope.md  "full N-row catalog"',     value: grab(/full (\d+)-row catalog/, scope) },
  { label: 'scope.md  "All N artifacts mapped"', value: grab(/All (\d+) artifacts mapped/, scope) },
  { label: 'CLAUDE.md "currently ships N"',      value: grab(/currently ships (\d+)/, claude) },
];

// --- index.html cards (informational — companions are reached via parent sub-links) ---
const indexCards = (read('index.html').match(/class="card"/g) || []).length;

// --- report ---
console.log(`Ground truth: artifacts/ holds ${N} files (.md + .html)\n`);
let failed = false;
for (const c of checks) {
  if (c.value === null) {
    console.log(`  ??       ${c.label}: PATTERN NOT FOUND — a count sentence was reworded; re-point this regex`);
    failed = true;
    continue;
  }
  const ok = c.value === N;
  if (!ok) failed = true;
  console.log(`  ${ok ? 'OK      ' : 'MISMATCH'} ${c.label}: ${c.value}${ok ? '' : `  (expected ${N})`}`);
}
console.log(
  `\n  info     index.html cards: ${indexCards} (expect <= ${N}; ` +
  `${N - indexCards} companion(s) reached via a parent card's sub-links)`,
);
if (indexCards > N) {
  console.log('  WARN     more index cards than artifacts — a card may point at a non-artifact or a dead link');
  failed = true;
}

if (failed) {
  console.log(`\nFAIL — artifact count is inconsistent. Make every count equal ${N} (ground truth = artifacts/ file count).`);
  process.exit(1);
}
console.log(`\nPASS — all counts agree at ${N}.`);
