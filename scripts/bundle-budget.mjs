#!/usr/bin/env node
// Guards the cold-start download: the entry script plus every modulepreload
// in dist/index.html is what a visitor fetches before the first paint.
// Fails when that set exceeds the gzip budget or contains a package that is
// meant to load lazily (see docs/architecture.md, "Cold-start budget").
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const dist = path.resolve(process.argv[2] || 'dist');
const budgetKb = Number(process.env.BUNDLE_BUDGET_KB || 900);
const forbidden = [
  'echarts',
  'zrender',
  'matrix-js-sdk',
  'livekit-client',
  'monaco-editor',
  '@mdxeditor/editor',
  'mermaid',
];

const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
const refs = [
  ...html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g),
  ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g),
].map((m) => m[1]);

if (refs.length === 0) {
  console.error('bundle-budget: no module scripts found in dist/index.html');
  process.exit(2);
}

let total = 0;
const rows = [];
const offenders = new Map();
for (const ref of refs) {
  const file = path.join(
    dist,
    ref.replace(/^\.?\//, '').replace(/^[^/]*\/(?=assets\/)/, ''),
  );
  const local = existsSync(file)
    ? file
    : path.join(dist, 'assets', path.basename(ref));
  const gz = gzipSync(readFileSync(local), { level: 9 }).length;
  total += gz;
  rows.push([path.basename(local), gz]);
  const map = `${local}.map`;
  if (existsSync(map)) {
    const { sources = [] } = JSON.parse(readFileSync(map, 'utf8'));
    for (const pkg of forbidden) {
      if (sources.some((s) => s.includes(`node_modules/${pkg}/`))) {
        offenders.set(pkg, [
          ...(offenders.get(pkg) || []),
          path.basename(local),
        ]);
      }
    }
  }
}

rows.sort((a, b) => b[1] - a[1]);
console.log(
  `bundle-budget: ${refs.length} files on the cold path, ${(total / 1024).toFixed(0)} KB gzip (budget ${budgetKb} KB)`,
);
for (const [name, gz] of rows.slice(0, 8)) {
  console.log(`  ${String((gz / 1024).toFixed(0)).padStart(6)} KB  ${name}`);
}

let failed = false;
if (total > budgetKb * 1024) {
  console.error(`bundle-budget: cold path exceeds ${budgetKb} KB gzip`);
  failed = true;
}
for (const [pkg, files] of offenders) {
  console.error(
    `bundle-budget: ${pkg} is on the cold path via ${files.join(', ')}`,
  );
  failed = true;
}
process.exit(failed ? 1 : 0);
