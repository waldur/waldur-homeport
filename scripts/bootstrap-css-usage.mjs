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
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import * as diff from 'diff';
import postcss from 'postcss';
import * as sass from 'sass';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const sassDir = path.join(root, 'src/styles/bootstrap');
export const DEFAULT_BASELINE = path.join(
  root,
  'scripts/bootstrap-css-usage.baseline.json',
);

export const PARTIALS = [
  // Bootstrap components (from _bootstrap.scss)
  {
    name: 'core/components/root',
    scss: "@import 'config'; @import 'components/root';",
  },
  {
    name: 'bootstrap/scss/reboot',
    scss: "@import 'config'; @import 'bootstrap/scss/reboot';",
  },
  {
    name: 'bootstrap/scss/type',
    scss: "@import 'config'; @import 'bootstrap/scss/reboot'; @import 'bootstrap/scss/type';",
  },
  {
    name: 'bootstrap/scss/images',
    scss: "@import 'config'; @import 'bootstrap/scss/images';",
  },
  {
    name: 'bootstrap/scss/containers',
    scss: "@import 'config'; $container-max-widths: (); @import 'bootstrap/scss/containers';",
  },
  {
    name: 'bootstrap/scss/grid',
    scss: "@import 'config'; @import 'bootstrap/scss/grid';",
  },
  {
    name: 'bootstrap/scss/tables',
    scss: "@import 'config'; $grid-breakpoints: (xs: 0); @import 'bootstrap/scss/tables';",
  },
  {
    name: 'bootstrap/scss/transitions',
    scss: "@import 'config'; @import 'bootstrap/scss/transitions';",
  },
  {
    name: 'bootstrap/scss/card',
    scss: "@import 'config'; @import 'bootstrap/scss/card';",
  },
  {
    name: 'bootstrap/scss/list-group',
    scss: "@import 'config'; $theme-colors: (); $grid-breakpoints: (); @import 'bootstrap/scss/list-group';",
  },
  {
    name: 'bootstrap/scss/spinners',
    scss: "@import 'config'; @import 'bootstrap/scss/spinners';",
  },
  {
    name: 'bootstrap/scss/helpers',
    scss: "@import 'config'; $theme-colors: (); $aspect-ratios: (); $grid-breakpoints: (xs: 0); @import 'bootstrap/scss/helpers';",
  },
  {
    name: 'bootstrap/scss/utilities',
    scss: "@import 'config'; @import 'utilities'; @import 'bootstrap/scss/utilities/api';",
  },

  // Components (from components/)
  {
    name: 'core/components/helpers',
    scss: "@import 'config'; @import 'components/flex'; @import 'components/text';",
  },
  {
    name: 'core/components/separator',
    scss: "@import 'config'; @import 'components/separator';",
  },
  {
    name: 'core/components/card',
    scss: "@import 'config'; @import 'components/card';",
  },
  {
    name: 'core/components/buttons',
    scss: "@import 'config'; @import 'components/buttons';",
  },
  {
    name: 'core/components/code',
    scss: "@import 'config'; @import 'components/code';",
  },
  {
    name: 'core/components/tables',
    scss: "@import 'config'; @import 'components/tables';",
  },
  {
    name: 'core/components/image-input',
    scss: "@import 'config'; @import 'components/image-input';",
  },
  {
    name: 'core/components/symbol',
    scss: "@import 'config'; @import 'components/symbol';",
  },
  {
    name: 'core/components/svg-icon',
    scss: "@import 'config'; @import 'components/svg-icon';",
  },
  {
    name: 'core/components/timeline',
    scss: "@import 'config'; @import 'components/timeline';",
  },
  {
    name: 'core/components/bullet',
    scss: "@import 'config'; @import 'components/bullet';",
  },
  {
    name: 'core/components/scroll',
    scss: "@import 'config'; @import 'components/scroll';",
  },
  {
    name: 'core/components/consent-dialog',
    scss: "@import 'config'; @import 'components/consent-dialog';",
  },

  // Legacy partials (from legacy/)
  {
    name: 'custom/base',
    scss: "@import 'config'; @import 'legacy/base';",
  },
  {
    name: 'custom/borders',
    scss: "@import 'config'; @import 'legacy/borders';",
  },
  {
    name: 'custom/buttons',
    scss: "@import 'config'; @import 'legacy/buttons';",
  },
  {
    name: 'custom/content',
    scss: "@import 'config'; @import 'legacy/content';",
  },
  {
    name: 'custom/file-upload',
    scss: "@import 'config'; @import 'custom/file-upload';",
  },
  {
    name: 'custom/icon',
    scss: "@import 'config'; @import 'legacy/icon';",
  },
  {
    name: 'custom/landing',
    scss: "@import 'config'; @import 'custom/landing';",
  },
  {
    name: 'custom/marketplaces-selector',
    scss: "@import 'config'; @import 'custom/marketplaces-selector';",
  },
  {
    name: 'custom/table',
    scss: "@import 'config'; @import 'custom/table';",
  },
  {
    name: 'custom/CopyToClipboardContainer',
    scss: "@import 'config'; @import 'custom/CopyToClipboardContainer';",
  },
  {
    name: 'custom/CodeBlock',
    scss: "@import 'config'; @import 'custom/CodeBlock';",
  },
  {
    name: 'custom/action-group',
    scss: "@import 'config'; @import 'custom/action-group';",
  },
  {
    name: 'custom/ai-assistant/index',
    scss: "@import 'config'; @import 'custom/ai-assistant/index';",
  },
  {
    name: 'custom/support/helpdesk',
    scss: "@import 'config'; @import 'custom/support/helpdesk';",
  },
  {
    name: 'custom/matrix/index',
    scss: "@import 'config'; @import 'custom/matrix/index';",
  },
  {
    name: 'custom/tos',
    scss: "@import 'config'; @import 'custom/tos';",
  },

  // Unlayered LiveKit styles in index.scss
  {
    name: 'custom/matrix/call-livekit',
    scss: "@import 'config'; @import 'custom/matrix/call-livekit';",
  },
];

/** Custom Sass options with `@/` importer and node_modules load path. */
function getSassOptions(baseDir = sassDir) {
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
export function compilePartial(partialScss, baseDir = sassDir) {
  return sass.compileString(partialScss, getSassOptions(baseDir)).css;
}

/** Compiles the main stylesheet (index.scss) and extracts byte size and selectors. */
export function compileStyle(file = 'index.scss', baseDir = sassDir) {
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
 * excluding the stylesheet directory (src/styles/bootstrap/).
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
        !f.startsWith('src/styles/bootstrap/'),
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
    corpusTokens.has('Card') &&
    /^card(?:-(?:header|body|title|footer|subtitle|text|img(?:-(?:top|bottom|overlay))?))?$/.test(
      cls,
    )
  ) {
    return true;
  }
  if (
    corpusTokens.has('Table') &&
    /^table(?:-(?:sm|hover|striped|bordered|borderless|responsive))?$/.test(cls)
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

  // 3. Runtime-built prefixes
  if (/^symbol-\d+px$/.test(cls)) return true;
  if (/^symbol-group(?:-[\w-]+)?$/.test(cls)) return true;
  if (/^svg-icon(?:-[\w-]+)?$/.test(cls)) return true;

  // 4. Third-party markup
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

/** Analyzes usage across all partials. */
export function analyzeUsage(corpusTokens, partials = PARTIALS) {
  const results = {};
  let totalClasses = 0;
  let totalUsed = 0;
  let totalUnused = 0;

  for (const p of partials) {
    const css = compilePartial(p.scss);
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
