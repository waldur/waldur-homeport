#!/usr/bin/env node
// Keeps the number of hard-coded colours from growing.
//
//   node scripts/color-literals.mjs report [path…]
//   node scripts/color-literals.mjs save
//   node scripts/color-literals.mjs compare
//
// report: Lists every colour literal (hex, rgb()/hsl(), named colour) with the
// ramp token it equals (=) or is closest to (≈). Optional paths narrow it.
//
// save: Rewrites scripts/color-literals.baseline.json with the count per file.
// Run it after removing literals; never to make a new one pass.
//
// compare: Fails when a file has more literals than its baseline entry (or has
// any and no entry), and when a file has fewer, so the baseline is lowered as
// soon as a literal goes away and the count can only fall.
//
// The detector, and which files it covers, live in
// packages/design-tokens/scripts/color-literals.mjs, shared with the
// waldur-custom/no-literal-color lint rule.

import { execSync } from 'node:child_process';
import console from 'node:console';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  BASELINE,
  findColorLiterals,
  isCovered,
  loadRampIndex,
} from '../packages/design-tokens/scripts/color-literals.mjs';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');

/** Tracked source files the ratchet covers. */
export function listFiles(paths = ['src', 'packages', 'apps']) {
  return execSync(`git ls-files -- ${paths.map((p) => `'${p}'`).join(' ')}`, {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(isCovered);
}

/** `{ file: literals[] }` for every covered file with at least one literal. */
export function scan(files = listFiles()) {
  const rampIndex = loadRampIndex();
  const result = {};
  for (const file of files) {
    const source = readFileSync(path.join(root, file), 'utf8');
    const literals = findColorLiterals(source, file, rampIndex);
    if (literals.length) result[file] = literals;
  }
  return result;
}

/** Files whose count went up (or appeared) and files whose count went down. */
export function compareCounts(baseline, current) {
  const increased = [];
  const decreased = [];
  for (const file of new Set([
    ...Object.keys(baseline),
    ...Object.keys(current),
  ])) {
    const before = baseline[file] ?? 0;
    const after = current[file] ?? 0;
    if (after > before) increased.push({ file, before, after });
    if (after < before) decreased.push({ file, before, after });
  }
  return { increased, decreased };
}

function formatLiteral(file, { line, column, value, token }) {
  const hint = token ? ` ${token.exact ? '=' : '≈'} ${token.token}` : '';
  return `${file}:${line}:${column}  ${value}${hint}`;
}

const total = (counts) => Object.values(counts).reduce((n, c) => n + c, 0);

async function runCli() {
  const [command = 'report', ...paths] = process.argv.slice(2);
  if (!['report', 'save', 'compare'].includes(command)) {
    console.error('Usage: color-literals.mjs [report [path…]|save|compare]');
    process.exit(2);
  }

  const found = scan(paths.length ? listFiles(paths) : undefined);
  const counts = Object.fromEntries(
    Object.entries(found)
      .map(([file, literals]) => [file, literals.length])
      .sort(([a], [b]) => a.localeCompare(b)),
  );

  if (command === 'report') {
    for (const [file, literals] of Object.entries(found)) {
      for (const literal of literals) console.log(formatLiteral(file, literal));
    }
    console.log(
      `\n${total(counts)} colour literals in ${Object.keys(counts).length} files`,
    );
    return;
  }

  if (command === 'save') {
    // Formatted as prettier (which lint-staged runs) would, so a rewrite only
    // shows real changes.
    const prettier = await import('prettier');
    writeFileSync(
      BASELINE,
      await prettier.format(JSON.stringify(counts), {
        ...(await prettier.resolveConfig(BASELINE)),
        filepath: BASELINE,
      }),
    );
    console.log(
      `color-literals.baseline.json: ${total(counts)} literals in ${Object.keys(counts).length} files`,
    );
    return;
  }

  if (!existsSync(BASELINE)) {
    console.error(`Baseline not found: ${BASELINE}. Run "yarn colors:save".`);
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
  const { increased, decreased } = compareCounts(baseline, counts);

  if (increased.length) {
    console.error('New hard-coded colours. Use a design token instead:');
    console.error(
      '  classes: text-*/bg-*/border-* utilities (docs/design-tokens.md)',
    );
    console.error(
      '  charts and canvas: getChartThemeColors() in src/dashboard/chartColors.ts',
    );
    console.error('  SVG: fill/stroke="currentColor" plus a text-* class\n');
    for (const { file, before, after } of increased) {
      console.error(`${file}: ${before} → ${after}`);
      for (const literal of found[file]) {
        console.error(`  ${formatLiteral(file, literal)}`);
      }
    }
  }
  if (decreased.length) {
    console.error(
      `\n${decreased.length} file(s) have fewer colour literals than the baseline. Run "yarn colors:save" and commit the lower counts:`,
    );
    for (const { file, before, after } of decreased) {
      console.error(`  ${file}: ${before} → ${after}`);
    }
  }
  console.log(
    `\nColour literals: ${total(counts)} (baseline ${total(baseline)})`,
  );
  if (increased.length || decreased.length) process.exit(1);
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  await runCli();
}
