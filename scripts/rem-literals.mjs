#!/usr/bin/env node
// Keeps the number of raw rem lengths from growing.
//
//   node scripts/rem-literals.mjs report [path…]
//   node scripts/rem-literals.mjs save
//   node scripts/rem-literals.mjs compare
//
// HomePort forces a 13px root font size, and every rem in the code is tuned
// against it. Until none is left, the root cannot go back to the browser
// default (docs/design-tokens.md → "Root font size").
//
// report: Lists every rem literal with the px it comes to at the 13px root
// and the spacing or text token that equals it. Optional paths narrow it.
//
// save: Rewrites scripts/rem-literals.baseline.json with the count per file.
// Run it after removing literals; never to make a new one pass.
//
// compare: Fails when a file has more literals than its baseline entry (or has
// any and no entry). A file with fewer only gets a reminder to run save:
// phase 1 removes rem in many parallel merge requests, and failing each one
// until it rewrites the shared baseline would make them conflict on it.
//
// The detector, and which files it covers, live in
// packages/design-tokens/scripts/rem-literals.mjs, shared with the
// waldur-custom/no-rem-length and waldur/no-rem-length lint rules.

import { execSync } from 'node:child_process';
import console from 'node:console';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  BASELINE,
  describeRem,
  findRemLiterals,
  isCovered,
} from '../packages/design-tokens/scripts/rem-literals.mjs';

import { compareCounts } from './color-literals.mjs';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');

function listFiles(paths = ['src', 'packages', 'apps']) {
  return execSync(`git ls-files -- ${paths.map((p) => `'${p}'`).join(' ')}`, {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(isCovered);
}

function scan(files) {
  const result = {};
  for (const file of files) {
    const source = readFileSync(path.join(root, file), 'utf8');
    const literals = findRemLiterals(source, file);
    if (literals.length) result[file] = literals;
  }
  return result;
}

const format = (file, literal) =>
  `${file}:${literal.line}:${literal.column}  ${describeRem(literal)}`;

const total = (counts) => Object.values(counts).reduce((n, c) => n + c, 0);

async function runCli() {
  const [command = 'report', ...paths] = process.argv.slice(2);
  if (!['report', 'save', 'compare'].includes(command)) {
    console.error('Usage: rem-literals.mjs [report [path…]|save|compare]');
    process.exit(2);
  }

  const found = scan(listFiles(paths.length ? paths : undefined));
  const counts = Object.fromEntries(
    Object.entries(found)
      .map(([file, literals]) => [file, literals.length])
      .sort(([a], [b]) => a.localeCompare(b)),
  );

  if (command === 'report') {
    for (const [file, literals] of Object.entries(found)) {
      for (const literal of literals) console.log(format(file, literal));
    }
    console.log(
      `\n${total(counts)} rem literals in ${Object.keys(counts).length} files`,
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
      `rem-literals.baseline.json: ${total(counts)} literals in ${Object.keys(counts).length} files`,
    );
    return;
  }

  if (!existsSync(BASELINE)) {
    console.error(`Baseline not found: ${BASELINE}. Run "yarn rem:save".`);
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
  const { increased, decreased } = compareCounts(baseline, counts);

  if (increased.length) {
    console.error(
      'New rem lengths. Write the px each one is at the 13px root, or the token',
    );
    console.error(
      'it equals (=): a Tailwind step or calc(var(--spacing) * N), text-* or',
    );
    console.error(
      'var(--text-*). A token marked ≈ is a sub-pixel change (docs/design-tokens.md).\n',
    );
    for (const { file, before, after } of increased) {
      console.error(`${file}: ${before} → ${after}`);
      for (const literal of found[file]) {
        console.error(`  ${format(file, literal)}`);
      }
    }
  }
  if (decreased.length) {
    console.log(
      `\n${decreased.length} file(s) have fewer rem literals than the baseline. Run "yarn rem:save" and commit the lower counts, so they cannot grow back:`,
    );
    for (const { file, before, after } of decreased) {
      console.log(`  ${file}: ${before} → ${after}`);
    }
  }
  console.log(`\nrem literals: ${total(counts)} (baseline ${total(baseline)})`);
  if (increased.length) process.exit(1);
}

await runCli();
