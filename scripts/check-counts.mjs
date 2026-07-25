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
import { Script } from 'node:vm';

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

// --- in-prose counted lists (the class the artifact count guard does NOT cover) ---
// Precedent 2026-07-25: system-card-readout §5 gained two rows; the heading was
// bumped by one and shipped saying "six actions" over seven rows, while every
// check above passed. Counted PROSE is unguarded by construction — a sentence
// saying "six" sits happily next to seven table rows. This section closes it for
// the artifacts whose lists are rewritten on a cadence (per-model-release).
// To extend: add a row — [file, stated-count regex, row-matching regex, label].
const WORDS = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
const toNum = (w) => WORDS[w.toLowerCase()] ?? Number(w);

const prose = [
  ['artifacts/system-card-readout.md', /##\s*2\.\s*The (\w+) questions/,          /^\|\s*Q\d+\s*\|/gm,        '§2 questions'],
  ['artifacts/system-card-readout.md', /##\s*3\.\s*(\w+) rules for quoting/,      /^\d+\.\s+\*\*/gm,          '§3 quoting rules'],
  ['artifacts/system-card-readout.md', /—\s*(\w+) actions, \w+ owners/,           /^\|\s*\*\*A\d+\*\*\s*\|/gm, '§5 actions'],
];

// --- cross-file counted claims (a count stated in one file, implemented in another) ---
// Precedent 2026-07-25: three docs described the config builder's linter as "9-check"
// while the file implemented 10, and as "5 posture questions" while it asked 6 — both
// drifted when the code grew, and neither section above can see it, because the stated
// count and the counted thing live in DIFFERENT files (prose in .md, rows in .html).
// This is the same class as the in-prose guard, one file-boundary further out.
// To extend: [statedFile, statedRe (capture group 1 = the number or number-word),
//             countedFile, rowRe (global), label].
// KNOWN LIMIT: the linter rows are counted by their `// N. ` comment marker, so a check
// added WITHOUT that comment convention leaves this green. The convention is therefore
// load-bearing — number every new check's comment, or this guard silently under-counts.
const crossFile = [
  ['CLAUDE.md',     /(\w+)-check rule linter/,        'artifacts/claude-code-config-builder.html', /^\s*\/\/ \d+\. /gm,        'builder linter checks (CLAUDE.md)'],
  ['README.md',     /A \*\*(\w+)-check rule linter/,  'artifacts/claude-code-config-builder.html', /^\s*\/\/ \d+\. /gm,        'builder linter checks (README)'],
  ['CLAUDE.md',     /(\w+) posture questions \(deliv/, 'artifacts/claude-code-config-builder.html', /class="q" id="q-/g,        'builder posture questions (CLAUDE.md)'],
  ['README.md',     /from (\w+) posture answers \(deliv/, 'artifacts/claude-code-config-builder.html', /class="q" id="q-/g,     'builder posture questions (README)'],
  ['docs/scope.md', /\*\*(\w+) posture questions \+ an advanced drawer\*\*/, 'artifacts/claude-code-config-builder.html', /class="q" id="q-/g, 'builder posture questions (scope)'],
];

// --- malformed markdown tables (structure, not counts) ---
// Precedent 2026-07-25: an edit inserted a new 5-column header above the rows but
// left the original 4-column header in place. GitHub/kramdown renders the second
// header and its separator as ordinary data rows — two header rows, visible on the
// published page. Neither the artifact-count guard nor the in-prose guard sees it:
// the row count was right and the numbers agreed. Structure is its own class.
//
// Asserts per table block: exactly one separator, on row 2, and every row the same
// width as the separator. Fenced code is blanked first — pipes in a bash pipeline
// are not table cells (a `| sed -E …` block false-positived on the first run).
const isSep = (l) => /^\|(\s*:?-{2,}:?\s*\|)+\s*$/.test(l.trim());
const cellCount = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).length;

function malformedTables(rel) {
  const raw = read(rel).split(/\r?\n/);
  const lines = [];
  let inFence = false;
  for (const l of raw) {
    if (/^\s*(```|~~~)/.test(l)) inFence = !inFence;
    lines.push(inFence ? '' : l);
  }
  const issues = [];
  let i = 0;
  while (i < lines.length) {
    if (!/^\s*\|/.test(lines[i])) { i++; continue; }
    const start = i;
    const block = [];
    while (i < lines.length && /^\s*\|/.test(lines[i])) { block.push(lines[i]); i++; }
    if (block.length < 2) continue;
    const seps = block.map((l, j) => (isSep(l) ? j : -1)).filter((j) => j >= 0);
    if (seps.length === 0) { issues.push(`line ${start + 1}: table with no separator row`); continue; }
    if (seps.length > 1) {
      issues.push(`line ${start + 1}: ${seps.length} header blocks in one table (separators at lines ${seps.map((j) => start + j + 1).join(', ')}) — the extra header renders as a data row`);
    }
    if (seps[0] !== 1) issues.push(`line ${start + 1}: separator on row ${seps[0] + 1}, expected row 2`);
    const width = cellCount(block[seps[0]]);
    for (const [j, l] of block.entries()) {
      const c = cellCount(l);
      if (c !== width) issues.push(`line ${start + j + 1}: ${c} cells in a ${width}-column table`);
    }
  }
  return issues;
}

// --- inline <script> syntax in HTML artifacts (does the page's JS even parse?) ---
// Precedent 2026-07-25: a new code comment in claude-code-config-builder.html contained a glob
// with the block-comment terminator inside it, which closed the comment early and made the whole
// 110KB inline script fail to parse. Every checkbox list rendered empty and the tool produced no
// output at all — but the page still LOOKED fine, because all the static markup was untouched.
//
// Nothing else here could see it: the count guard and the pipe scanner both read Markdown, and the
// only other witness is a browser probe. This is the cheap deterministic version of that probe —
// it proves the script parses, not that it behaves.
function badScripts(rel) {
  const src = read(rel);
  const issues = [];
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m, i = 0;
  while ((m = re.exec(src)) !== null) {
    i++;
    const body = m[1];
    if (!body.trim()) continue;
    const line = src.slice(0, m.index).split(/\r?\n/).length;
    try {
      new Script(body);
    } catch (e) {
      issues.push(`script #${i} (opens at line ${line}) does not parse: ${e.message}`);
    }
  }
  return issues;
}

const htmlFiles = readdirSync(join(ROOT, 'artifacts')).filter((f) => f.endsWith('.html')).map((f) => `artifacts/${f}`);
const scriptIssues = htmlFiles.flatMap((f) => badScripts(f).map((m) => `${f} ${m}`));

const mdFiles = [
  ...['artifacts', 'docs'].flatMap((d) =>
    readdirSync(join(ROOT, d)).filter((f) => f.endsWith('.md')).map((f) => `${d}/${f}`),
  ),
  'README.md', 'CLAUDE.md', 'LESSONS_LEARNED.md',
];
const tableIssues = mdFiles.flatMap((f) => malformedTables(f).map((m) => `${f} ${m}`));

const proseResults = prose.map(([file, statedRe, rowRe, label]) => {
  const src = read(file);
  const m = src.match(statedRe);
  const stated = m ? toNum(m[1]) : null;
  const actual = (src.match(rowRe) || []).length;
  return { file, label, stated, actual };
});

const crossResults = crossFile.map(([sFile, sRe, cFile, rowRe, label]) => {
  const m = read(sFile).match(sRe);
  const stated = m ? toNum(m[1]) : null;
  const actual = (read(cFile).match(rowRe) || []).length;
  return { file: sFile, label, stated, actual };
});

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

console.log('\nIn-prose counted lists (stated wording vs actual rows):');
let proseFailed = false;
for (const r of proseResults) {
  if (r.stated === null) {
    console.log(`  ??       ${r.label}: PATTERN NOT FOUND — the heading was reworded; re-point this regex`);
    proseFailed = true;
    continue;
  }
  const ok = r.stated === r.actual;
  if (!ok) proseFailed = true;
  console.log(
    `  ${ok ? 'OK      ' : 'MISMATCH'} ${r.label}: says ${r.stated}, has ${r.actual} row(s)` +
    `${ok ? '' : `  → fix ${r.file}`}`,
  );
}

console.log('\nCross-file counted claims (a count stated in one file, implemented in another):');
for (const r of crossResults) {
  if (r.stated === null) {
    console.log(`  ??       ${r.label}: PATTERN NOT FOUND — the sentence was reworded; re-point this regex`);
    proseFailed = true;
    continue;
  }
  const ok = r.stated === r.actual;
  if (!ok) proseFailed = true;
  console.log(
    `  ${ok ? 'OK      ' : 'MISMATCH'} ${r.label}: says ${r.stated}, file has ${r.actual}` +
    `${ok ? '' : `  → fix ${r.file}`}`,
  );
}

console.log(`\nInline <script> syntax (${htmlFiles.length} HTML artifacts):`);
if (scriptIssues.length === 0) {
  console.log('  OK       every inline script parses');
} else {
  for (const s of scriptIssues) console.log(`  BROKEN   ${s}`);
}

console.log(`\nMarkdown table structure (${mdFiles.length} files):`);
if (tableIssues.length === 0) {
  console.log('  OK       every table has one header, a separator on row 2, and a consistent column count');
} else {
  for (const t of tableIssues) console.log(`  MALFORMED ${t}`);
}

if (failed) {
  console.log(`\nFAIL — artifact count is inconsistent. Make every count equal ${N} (ground truth = artifacts/ file count).`);
  process.exit(1);
}
if (scriptIssues.length) {
  console.log("\nFAIL — an inline script doesn't parse. The page renders its static markup and produces NOTHING else; it looks fine and is dead.");
  process.exit(1);
}
if (tableIssues.length) {
  console.log('\nFAIL — malformed table(s). A stray second header or a ragged row renders as garbage on the published page.');
  process.exit(1);
}
if (proseFailed) {
  console.log('\nFAIL — a counted list disagrees with the sentence describing it. The rows are ground truth; fix the prose.');
  process.exit(1);
}
console.log(`\nPASS — all counts agree at ${N}; in-prose lists match their rows; tables well-formed.`);
