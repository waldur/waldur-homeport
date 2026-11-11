#!/usr/bin/env node
// Checks class usage for the Bootstrap and Metronic stylesheets and tracks
// compiled selector order and size.
//
//   node scripts/bootstrap-css-usage.mjs report
//   node scripts/bootstrap-css-usage.mjs save [baseline.json]
//   node scripts/bootstrap-css-usage.mjs compare [baseline.json]
//
// Baseline file defaults to scripts/bootstrap-css-usage.baseline.json.
//
// report: Compiles each SCSS partial, extracts emitted class names, and compares
// against tokens in tracked source files under src/, packages/ and apps/.
// Prints per-partial used and unused class counts and names.
//
// save: Writes compiled byte size, per-partial unused class sets, and the
// complete selector list in source order.
//
// compare: Fails if any new unused class appears. Compares selector list order;
// passes on removals, but fails and prints a unified diff if selectors are
// added, modified, or reordered.

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import * as diff from 'diff';
import postcss from 'postcss';
import * as sass from 'sass';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const stylesDir = path.join(root, 'src/styles');
export const DEFAULT_BASELINE = path.join(
  root,
  'scripts/bootstrap-css-usage.baseline.json',
);

// Each `name` keys the partial's entry in bootstrap-css-usage.baseline.json:
// `legacy/<path>`. Every partial here is Waldur's own: Bootstrap and its Sass
// configuration are gone (#481), and each compiles from legacy/_mixins.scss
// alone, so a reference to a Bootstrap variable or mixin fails `report`,
// `save` and `compare`.
export const PARTIALS = [
  {
    name: 'legacy/reboot',
    scss: "@import 'legacy/mixins'; @import 'legacy/reboot';",
  },
  {
    name: 'legacy/base',
    scss: "@import 'legacy/mixins'; @import 'legacy/base';",
  },
  {
    name: 'legacy/content',
    scss: "@import 'legacy/mixins'; @import 'legacy/content';",
  },
  {
    name: 'legacy/ai-assistant/index',
    scss: "@import 'legacy/mixins'; @import 'legacy/ai-assistant/index';",
  },
  {
    name: 'legacy/support/helpdesk',
    scss: "@import 'legacy/mixins'; @import 'legacy/support/helpdesk';",
  },
  {
    name: 'legacy/matrix/index',
    scss: "@import 'legacy/mixins'; @import 'legacy/matrix/index';",
  },

  // Unlayered LiveKit styles in index.scss
  {
    name: 'legacy/matrix/call-livekit',
    scss: "@import 'legacy/mixins'; @import 'legacy/matrix/call-livekit';",
  },
];

/** Custom Sass options with `@/` importer and node_modules load path. */
function getSassOptions(baseDir = stylesDir) {
  return {
    loadPaths: [baseDir, path.join(root, 'node_modules')],
    importers: [
      {
        findFileUrl: (url) =>
          url.startsWith('@/')
            ? pathToFileURL(path.join(root, 'src', url.slice(2)))
            : null,
      },
    ],
    logger: sass.Logger.silent,
  };
}

/** Compiles a partial's SCSS string into CSS. */
export function compilePartial(partialScss, baseDir = stylesDir) {
  return sass.compileString(partialScss, getSassOptions(baseDir)).css;
}

/** Compiles the main stylesheet (index.scss) and extracts byte size and selectors. */
export function compileStyle(file = 'index.scss', baseDir = stylesDir) {
  const css = sass.compile(
    path.join(baseDir, file),
    getSassOptions(baseDir),
  ).css;
  const byteSize = Buffer.byteLength(css, 'utf8');
  const selectors = extractSelectors(css);
  return { css, byteSize, selectors };
}

/** Extracts all unique class names emitted in a CSS string. */
export function extractClasses(css) {
  const classes = new Set();
  const rootAst = postcss.parse(css);
  rootAst.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && rule.parent.name === 'keyframes') {
      return;
    }
    for (const sel of rule.selectors) {
      for (const m of sel.matchAll(/\.([a-zA-Z0-9_-]+)/g)) {
        classes.add(m[1]);
      }
    }
  });
  return [...classes].sort();
}

/** Extracts all selectors in source order with their at-rule context. */
export function extractSelectors(css) {
  const selectors = [];
  const rootAst = postcss.parse(css);
  rootAst.walkRules((rule) => {
    let curr = rule.parent;
    const atRules = [];
    while (curr && curr.type !== 'root') {
      if (curr.type === 'atrule') {
        atRules.unshift(`@${curr.name}${curr.params ? ' ' + curr.params : ''}`);
      }
      curr = curr.parent;
    }
    const context = atRules.length > 0 ? atRules.join(' > ') + ' :: ' : '';
    for (const s of rule.selectors) {
      selectors.push(context + s.trim().replace(/\s+/g, ' '));
    }
  });
  return selectors;
}

/** Extracts all alphanumeric/hyphen/underscore tokens from text. */
export function tokenizeContent(content) {
  const tokens = new Set();
  const matches = content.match(/[a-zA-Z0-9_-]+/g);
  if (matches) {
    for (const m of matches) {
      tokens.add(m);
    }
  }
  return tokens;
}

/**
 * Collects tokens from tracked source files under src/, packages/, apps/,
 * excluding src/styles/ — the entry point and the legacy partials — whose own
 * selectors would otherwise count as uses.
 */
export function getCorpusTokens(options = {}) {
  const repoRoot = options.rootDir ?? root;
  const rawList = execSync('git ls-files src packages apps', {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const files = rawList
    .split('\n')
    .filter(
      (f) =>
        f &&
        /\.(ts|tsx|js|mjs|html|scss|css)$/.test(f) &&
        !f.startsWith('src/styles/'),
    );

  const corpus = new Set();
  for (const rel of files) {
    try {
      const content = readFileSync(path.join(repoRoot, rel), 'utf8');
      const tokens = tokenizeContent(content);
      for (const t of tokens) {
        corpus.add(t);
      }
    } catch {
      // ignore unreadable files
    }
  }
  return corpus;
}

/**
 * Checks whether a class is referenced in the corpus, is emitted by an active
 * React-Bootstrap component, or matches an allowable dynamic/runtime prefix.
 */
export function isClassAllowed(cls, corpusTokens) {
  // 1. Direct match in corpus
  if (corpusTokens.has(cls)) return true;

  // 2. React-Bootstrap components (active when component token is in corpus)
  if (corpusTokens.has('Stack') && /^[hv]stack$/.test(cls)) return true;
  if (
    corpusTokens.has('Col') &&
    /^col(?:-(?:sm|md|lg|xl|xxl))?(?:-(?:\d+|auto))?$/.test(cls)
  ) {
    return true;
  }
  if (
    corpusTokens.has('Row') &&
    /^row(?:-cols-(?:(?:sm|md|lg|xl|xxl)-)?(?:\d+|auto))?$/.test(cls)
  ) {
    return true;
  }
  if (
    corpusTokens.has('Table') &&
    /^table(?:-(?:hover|responsive))?$/.test(cls)
  ) {
    return true;
  }
  if (
    corpusTokens.has('ListGroup') &&
    /^list-group(?:-(?:flush|item(?:-action)?))?$/.test(cls)
  ) {
    return true;
  }
  if (
    corpusTokens.has('Spinner') &&
    /^spinner-(?:border|grow)(?:-sm)?$/.test(cls)
  ) {
    return true;
  }
  if (
    corpusTokens.has('Collapse') &&
    ['collapse', 'collapsing', 'show'].includes(cls)
  ) {
    return true;
  }

  // 3. Third-party markup
  if (/^lk-/.test(cls)) return true;

  return false;
}

/** Compares selector arrays. Returns true if selectors changed other than by removal. */
export function diffSelectors(baseSelectors, currentSelectors) {
  const diffResult = diff.diffArrays(baseSelectors, currentSelectors);
  const changedOtherThanRemoval = diffResult.some((part) => part.added);
  const patch = diff.createPatch(
    'selectors',
    baseSelectors.join('\n') + (baseSelectors.length ? '\n' : ''),
    currentSelectors.join('\n') + (currentSelectors.length ? '\n' : ''),
    'baseline',
    'current',
  );
  return { changedOtherThanRemoval, patch, diffResult };
}

/** Finds new unused classes by partial compared to baseline unused map. */
export function findNewUnusedClasses(baselineUnused, currentUnused) {
  const newUnusedByPartial = {};
  for (const [partial, currentList] of Object.entries(currentUnused)) {
    const baseSet = new Set(baselineUnused?.[partial] ?? []);
    const newClasses = currentList.filter((cls) => !baseSet.has(cls));
    if (newClasses.length > 0) {
      newUnusedByPartial[partial] = newClasses;
    }
  }
  return newUnusedByPartial;
}

/**
 * Bootstrap's own Sass function names, from the 5.1.3 `scss/_functions.scss`
 * that used to be a dependency. The package is gone (#481), so the list is
 * frozen here: nothing can read it from node_modules any more, and a legacy
 * partial that calls one of these names would get a plain CSS function
 * passed through rather than a Sass error. That silent pass-through is what
 * `checkLegacyDecoupled` catches, so the guard outlives the package.
 */
const BOOTSTRAP_FUNCTIONS = [
  'add',
  'color-contrast',
  'contrast-ratio',
  'divide',
  'escape-svg',
  'luminance',
  'map-get-multiple',
  'map-loop',
  'map-merge-multiple',
  'negativify-map',
  'opaque',
  'rgba-css-var',
  'shade-color',
  'shift-color',
  'str-replace',
  'subtract',
  'tint-color',
  'to-rgb',
  'varify',
];

/**
 * Metronic's own Sass helpers, which lived alongside the overrides in the
 * former `src/styles/bootstrap/_functions.scss`. Frozen here for the same
 * reason as the list above: the file is gone, so a legacy partial calling
 * `get(...)` would emit it as a plain CSS function instead of failing.
 */
const METRONIC_FUNCTIONS = ['get', 'get-warning', 'has', 'valueif'];

/**
 * The names a partial must not call. Nothing defines them any more, so a call
 * is not a Sass error: Sass writes it out as a plain CSS function, which is
 * exactly the silent failure `checkLegacyDecoupled` exists to catch.
 */
export function bootstrapFunctionNames() {
  return new Set([...BOOTSTRAP_FUNCTIONS, ...METRONIC_FUNCTIONS]);
}

/**
 * The Bootstrap functions a compiled partial still calls. A name after a
 * colon is a pseudo-class (`:has(`), not a call.
 */
export function findBootstrapFunctionCalls(
  css,
  names = bootstrapFunctionNames(),
) {
  const found = new Set();
  for (const m of css.matchAll(/(?<![\w:-])([a-z][\w-]*)\(/g)) {
    if (names.has(m[1])) found.add(m[1]);
  }
  return [...found].sort();
}

/**
 * The stylesheets that import Waldur's own partials: legacy/_index.scss
 * (inside the bootstrap layer) and the unlayered LiveKit overrides.
 */
const LEGACY_ENTRY_POINTS = ['legacy/index', 'legacy/matrix/call-livekit'];

/**
 * Compiles each legacy entry point from _mixins.scss alone and fails when it
 * reads a Bootstrap variable or mixin (a Sass error), calls a Bootstrap
 * function, or when a file under src/styles/legacy/ is not reached from an
 * entry point — and so would escape both this check and the build.
 */
export function checkLegacyDecoupled(functionNames = bootstrapFunctionNames()) {
  const loaded = new Set();
  for (const entry of LEGACY_ENTRY_POINTS) {
    const result = sass.compileString(
      `@import 'legacy/mixins'; @import '${entry}';`,
      getSassOptions(),
    );
    for (const url of result.loadedUrls) {
      if (url.protocol === 'file:') loaded.add(fileURLToPath(url));
    }
    const calls = findBootstrapFunctionCalls(result.css, functionNames);
    if (calls.length) {
      throw new Error(
        `${entry} calls Bootstrap's ${calls.join(', ')}: Waldur's own partials must not depend on Bootstrap's Sass.`,
      );
    }
  }
  const legacyDir = path.join(root, 'src/styles/legacy');
  const missing = readdirSync(legacyDir, { recursive: true })
    .filter((f) => f.endsWith('.scss'))
    .map((f) => path.join(legacyDir, f))
    .filter((f) => !loaded.has(f));
  if (missing.length) {
    throw new Error(
      `Not imported from src/styles/legacy/_index.scss: ${missing
        .map((f) => path.relative(root, f))
        .join(', ')}`,
    );
  }
}

/** Analyzes usage across all partials. */
export function analyzeUsage(corpusTokens, partials = PARTIALS) {
  const results = {};
  let totalClasses = 0;
  let totalUsed = 0;
  let totalUnused = 0;

  const functionNames = bootstrapFunctionNames();
  checkLegacyDecoupled(functionNames);
  for (const p of partials) {
    const css = compilePartial(p.scss);
    const calls = findBootstrapFunctionCalls(css, functionNames);
    if (calls.length) {
      throw new Error(
        `${p.name} calls Bootstrap's ${calls.join(', ')}: Waldur's own partials must not depend on Bootstrap's Sass.`,
      );
    }
    const classes = extractClasses(css);
    if (classes.length === 0) continue;

    const used = [];
    const unused = [];
    for (const c of classes) {
      if (isClassAllowed(c, corpusTokens)) {
        used.push(c);
      } else {
        unused.push(c);
      }
    }

    results[p.name] = {
      total: classes.length,
      used,
      unused,
    };
    totalClasses += classes.length;
    totalUsed += used.length;
    totalUnused += unused.length;
  }

  return {
    partials: results,
    totalClasses,
    totalUsed,
    totalUnused,
  };
}

// ---------------------------------------------------------------------------
// CLI Execution
// ---------------------------------------------------------------------------

function runCli() {
  const [command = 'report', targetFile] = process.argv.slice(2);
  const baselinePath = targetFile
    ? path.resolve(process.cwd(), targetFile)
    : DEFAULT_BASELINE;

  if (!['report', 'save', 'compare'].includes(command)) {
    console.error(
      'Usage: bootstrap-css-usage.mjs [report|save|compare] [baseline-file]',
    );
    process.exit(2);
  }

  console.log('Collecting corpus tokens from tracked source files...');
  const corpusTokens = getCorpusTokens();
  console.log(`Corpus tokens: ${corpusTokens.size.toLocaleString()}`);

  console.log('Compiling SCSS partials and analyzing class usage...');
  const usage = analyzeUsage(corpusTokens);

  if (command === 'report') {
    console.log(
      '\nNote: Token matching checks whole tokens across the codebase. Words in comments or strings (e.g. "table", "visible", "scroll") count as matches, so "used" counts are an upper bound.\n',
    );
    for (const [partial, data] of Object.entries(usage.partials)) {
      const unusedNames =
        data.unused.length > 0 ? `: ${data.unused.join(', ')}` : '';
      console.log(
        `${partial.padEnd(35)}: ${data.used.length} used, ${data.unused.length} unused${unusedNames}`,
      );
    }
    console.log(
      `\nTotal: ${usage.totalClasses.toLocaleString()} classes | ${usage.totalUsed.toLocaleString()} used (upper bound) | ${usage.totalUnused.toLocaleString()} unused`,
    );

    console.log('\nCompiling index.scss...');
    const style = compileStyle();
    console.log(
      `Compiled index.scss: ${style.byteSize.toLocaleString()} bytes, ${style.selectors.length.toLocaleString()} selectors`,
    );
    return;
  }

  console.log('Compiling index.scss for selectors and byte size...');
  const style = compileStyle();

  const unusedMap = {};
  for (const [partial, data] of Object.entries(usage.partials)) {
    if (data.unused.length > 0) {
      unusedMap[partial] = data.unused;
    }
  }

  if (command === 'save') {
    const baselineData = {
      compiledByteSize: style.byteSize,
      totalClasses: usage.totalClasses,
      totalUsed: usage.totalUsed,
      totalUnused: usage.totalUnused,
      unused: unusedMap,
      selectors: style.selectors,
    };
    writeFileSync(baselinePath, JSON.stringify(baselineData, null, 2) + '\n');
    console.log(`\nBaseline successfully saved to: ${baselinePath}`);
    console.log(
      `Compiled size: ${style.byteSize.toLocaleString()} bytes | Selectors: ${style.selectors.length.toLocaleString()} | Unused classes: ${usage.totalUnused.toLocaleString()} across ${Object.keys(unusedMap).length} partials`,
    );
    return;
  }

  if (command === 'compare') {
    if (!existsSync(baselinePath)) {
      console.error(`Baseline file not found at: ${baselinePath}`);
      console.error(
        'Run "yarn styles:usage save" first to create the initial baseline.',
      );
      process.exit(1);
    }

    const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
    let hasFailure = false;

    // 1. Check for new unused classes
    const newUnused = findNewUnusedClasses(baseline.unused, unusedMap);
    const newUnusedCount = Object.values(newUnused).reduce(
      (sum, list) => sum + list.length,
      0,
    );

    if (newUnusedCount > 0) {
      hasFailure = true;
      console.error(
        `\nERROR: ${newUnusedCount} new unused class(es) detected that were not in baseline:`,
      );
      for (const [partial, list] of Object.entries(newUnused)) {
        console.error(`  ${partial}:`);
        for (const cls of list) {
          console.error(`    - .${cls}`);
        }
      }
    }

    // 2. Check selector list diff
    const selectorDiff = diffSelectors(baseline.selectors, style.selectors);
    if (selectorDiff.changedOtherThanRemoval) {
      hasFailure = true;
      console.error(
        '\nERROR: Selector list changed other than by removal (selectors were added or reordered):',
      );
      console.error(selectorDiff.patch);
    }

    const sizeDiff = style.byteSize - baseline.compiledByteSize;
    const sizeDiffSign = sizeDiff > 0 ? `+${sizeDiff}` : `${sizeDiff}`;
    const unusedDiff = usage.totalUnused - (baseline.totalUnused ?? 0);
    const unusedDiffSign = unusedDiff > 0 ? `+${unusedDiff}` : `${unusedDiff}`;
    const selectorsDiff = style.selectors.length - baseline.selectors.length;
    const selectorsDiffSign =
      selectorsDiff > 0 ? `+${selectorsDiff}` : `${selectorsDiff}`;

    console.log('\n--- Usage Comparison ---');
    console.log(
      `Compiled index.scss size : ${style.byteSize.toLocaleString()} bytes (baseline: ${baseline.compiledByteSize.toLocaleString()} bytes, diff: ${sizeDiffSign} bytes)`,
    );
    console.log(
      `Unused classes           : ${usage.totalUnused.toLocaleString()} (baseline: ${(baseline.totalUnused ?? 0).toLocaleString()}, diff: ${unusedDiffSign})`,
    );
    console.log(
      `Selectors count          : ${style.selectors.length.toLocaleString()} (baseline: ${baseline.selectors.length.toLocaleString()}, diff: ${selectorsDiffSign})`,
    );

    if (hasFailure) {
      console.error('\nBootstrap CSS usage check FAILED.');
      process.exit(1);
    }

    console.log('\nBootstrap CSS usage check PASSED.');
  }
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  runCli();
}
