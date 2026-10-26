/**
 * Knows every class name the app can actually style: whatever Tailwind
 * generates CSS for, plus every class selector in the app's own
 * stylesheets (compiled SCSS, plain CSS, and the node_modules stylesheets
 * the source imports), plus every class a source file selects in an
 * arbitrary variant (`[&_.has-error]:text-warning`). A class in none of
 * them is a typo or a leftover.
 *
 * Tailwind is asked directly, through the same design system the build
 * uses (`__unstable__loadDesignSystem` on the CSS entry point), so
 * variants, arbitrary values, `!` and opacity modifiers, `@theme` tokens
 * and `@utility` definitions are judged exactly as the build would judge
 * them — no hand-kept list of utilities to drift.
 *
 * Loading is async, so the ESLint rule reaches this module through a
 * synckit worker (class-oracle.worker.js). Everything is cached for the
 * life of the process and rebuilt when a stylesheet changes on disk, so an
 * editor's long-lived ESLint server picks up a class added to an .scss
 * file without a restart.
 *
 * Compiling the SCSS takes seconds (Bootstrap's index.scss alone is most of
 * it), so the stylesheet classes are also cached on disk under
 * node_modules/.cache, keyed by every stylesheet's path, size and mtime and
 * by yarn.lock (which pins the Bootstrap partials it pulls in). A commit's
 * pre-commit lint and a fresh editor session then skip the compile unless a
 * stylesheet changed.
 */

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { __unstable__loadDesignSystem } from '@tailwindcss/node';
import postcss from 'postcss';
import * as sass from 'sass';

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'storybook-static',
]);
const SOURCE_DIRS = ['src', 'packages', 'apps'];
const PLUGIN_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const walk = (dir, out = []) => {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const STYLESHEET = /\.(s?css)$/;
const SCRIPT = /\.(m?[jt]sx?)$/;
const STYLE_IMPORT = /(?:import|@import)\s*(?:url\()?['"]([^'"]+\.s?css)['"]/g;

/** Unescape a CSS identifier (`md\:flex` → `md:flex`). */
const unescapeIdent = (ident) =>
  ident.replace(/\\([0-9a-fA-F]{1,6}\s?|.)/g, (_, esc) =>
    /^[0-9a-fA-F]/.test(esc) && esc.trim().length > 1
      ? String.fromCodePoint(parseInt(esc, 16))
      : esc.trim() || esc,
  );

const CLASS_SELECTOR = /\.(-?(?:\\.|[\w-]|[\u0080-\uFFFF])+)/g;

// A Tailwind arbitrary variant (`[&_.has-error]:`, `has-[.x]:`,
// `group-[.x]:`), one level of nested brackets allowed (`[&_[data-x]]:`).
// It starts a class token or follows another variant, and is either a
// selector with `&` or the argument of a `has-`/`group-`/… variant, which
// keeps out computed keys such as `{ [Foo.bar]: 1 }`.
const ARBITRARY_VARIANT =
  /(?<=^|[\s'"`:-])\[((?:[^\s'"`[\]]|\[[^\s'"`[\]]*\])+)\]:/gm;

/**
 * Classes that source files style through another element's arbitrary
 * variant: `[&_.has-error]:text-warning` styles `.has-error`, though no
 * stylesheet names it. Underscores are spaces there, as Tailwind reads them.
 */
export const variantClassesIn = (text, classes = new Set()) => {
  for (const m of text.matchAll(ARBITRARY_VARIANT)) {
    if (text[m.index - 1] !== '-' && !m[1].includes('&')) continue;
    const selector = m[1].replace(/(?<!\\)_/g, ' ');
    for (const c of selector.matchAll(CLASS_SELECTOR)) {
      // `[0.5rem]` is a value; a class starts like an identifier.
      if (/^-?[A-Za-z_\\]/.test(c[1])) classes.add(unescapeIdent(c[1]));
    }
  }
  return classes;
};

const collectVariantClasses = (files) => {
  const classes = new Set();
  for (const file of files) {
    if (!SCRIPT.test(file) || file.endsWith('.d.ts')) continue;
    // This plugin's own comments and fixtures are examples, not styling.
    if (file.startsWith(PLUGIN_DIR + path.sep)) continue;
    variantClassesIn(readFileSync(file, 'utf8'), classes);
  }
  return classes;
};

const addSelectorClasses = (css, from, classes) => {
  let ast;
  try {
    ast = postcss.parse(css, { from });
  } catch {
    return;
  }
  ast.walkRules((rule) => {
    // Inside @keyframes, `from`/`50%` are not selectors.
    if (rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name))
      return;
    for (const m of rule.selector.matchAll(CLASS_SELECTOR)) {
      classes.add(unescapeIdent(m[1]));
    }
  });
};

/** Every node_modules from the root upwards, as Node itself would search. */
const nodeModulesDirs = (root) => {
  const dirs = [];
  for (let dir = root; ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, 'node_modules');
    if (existsSync(candidate)) dirs.push(candidate);
    if (path.dirname(dir) === dir) return dirs;
  }
};

const compileScss = (file, root) =>
  sass.compile(file, {
    loadPaths: [path.dirname(file), ...nodeModulesDirs(root)],
    quietDeps: true,
    logger: sass.Logger.silent,
    silenceDeprecations: [
      'import',
      'abs-percent',
      'function-units',
      'color-functions',
      'slash-div',
      'global-builtin',
      'if-function',
      'moz-document',
    ],
  });

/** Class selectors from every stylesheet the repo owns or imports. */
const collectStylesheetClasses = (root, files) => {
  const classes = new Set();
  const require = createRequire(path.join(root, 'package.json'));
  const external = new Set();
  const loaded = new Set();

  const byDepth = [...files].sort(
    (a, b) => a.split(path.sep).length - b.split(path.sep).length,
  );
  for (const file of byDepth) {
    if (SCRIPT.test(file) && !file.endsWith('.d.ts')) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(STYLE_IMPORT)) {
        const spec = m[1];
        if (spec.startsWith('.') || spec.startsWith('@/')) continue;
        try {
          external.add(require.resolve(spec));
        } catch {
          // Unresolvable from the root (a workspace-local dependency, a
          // Vite-only alias): its classes stay unknown, which errs loud.
        }
      }
      continue;
    }
    if (!STYLESHEET.test(file)) continue;
    // Partials are compiled through the files that @import them, and so is
    // a stylesheet an earlier compile already pulled in.
    if (path.basename(file).startsWith('_') || loaded.has(file)) continue;
    try {
      if (file.endsWith('.scss')) {
        const result = compileScss(file, root);
        for (const url of result.loadedUrls) {
          if (url.protocol === 'file:') loaded.add(fileURLToPath(url));
        }
        addSelectorClasses(result.css, file, classes);
      } else {
        addSelectorClasses(readFileSync(file, 'utf8'), file, classes);
      }
    } catch {
      // A stylesheet that only compiles inside Vite (e.g. relying on
      // additionalData) contributes nothing rather than crashing lint.
    }
  }

  for (const file of external) {
    addSelectorClasses(readFileSync(file, 'utf8'), file, classes);
  }
  return classes;
};

// Bump when the shape of what is cached changes.
const CACHE_VERSION = 1;

const fingerprint = (root, files) => {
  const hash = createHash('sha1').update(String(CACHE_VERSION));
  for (const f of [...files.filter((f) => STYLESHEET.test(f)), 'yarn.lock']) {
    const full = path.resolve(root, f);
    if (!existsSync(full)) continue;
    const { mtimeMs, size } = statSync(full);
    hash.update(`${full}:${mtimeMs}:${size}|`);
  }
  return hash.digest('hex');
};

/** Stylesheet classes from the disk cache, or compiled and cached. */
const stylesheetClassesFor = (root, files, key) => {
  const cacheFile = path.join(
    root,
    'node_modules/.cache/eslint-plugin-waldur/class-oracle.json',
  );
  try {
    const cachedOnDisk = JSON.parse(readFileSync(cacheFile, 'utf8'));
    if (cachedOnDisk.key === key) return new Set(cachedOnDisk.classes);
  } catch {
    // No cache yet, or unreadable: compile.
  }
  const classes = collectStylesheetClasses(root, files);
  try {
    mkdirSync(path.dirname(cacheFile), { recursive: true });
    writeFileSync(cacheFile, JSON.stringify({ key, classes: [...classes] }));
  } catch {
    // A read-only tree still lints; it just compiles every time.
  }
  return classes;
};

// How often a long-lived process (an editor's ESLint server) looks for
// changed stylesheets. A CLI run lints thousands of files in less time than
// one walk of the tree costs per file, so it must not walk per file.
const RECHECK_MS = 5000;

let stylesheets = null; // { root, key, variantKey, classes, checkedAt }
// Both keyed by entry path, and emptied whenever a stylesheet (the Tailwind
// entry and theme among them) changes.
const designSystems = new Map(); // → Promise<design system>
const oracles = new Map();

/** Stylesheet classes for the root, rechecked at most every RECHECK_MS. */
const currentStylesheets = (root) => {
  const now = Date.now();
  if (stylesheets?.root === root && now - stylesheets.checkedAt < RECHECK_MS) {
    return stylesheets;
  }
  const files = SOURCE_DIRS.flatMap((d) => walk(path.join(root, d)));
  const key = fingerprint(root, files);
  // Read from source on every recheck rather than cached on disk with the
  // stylesheets, whose key does not cover scripts.
  const variantClasses = collectVariantClasses(files);
  const variantKey = [...variantClasses].sort().join(' ');
  if (
    stylesheets?.root !== root ||
    stylesheets.key !== key ||
    stylesheets.variantKey !== variantKey
  ) {
    stylesheets = {
      root,
      key,
      variantKey,
      classes: new Set([
        ...stylesheetClassesFor(root, files, key),
        ...variantClasses,
      ]),
    };
    designSystems.clear();
    oracles.clear();
  }
  stylesheets.checkedAt = now;
  return stylesheets;
};

/**
 * Load (or reuse) the oracle for one repository root and Tailwind entry.
 * One design system is kept per entry point, so linting files that use
 * different entries (src/ and apps/*) does not reload anything. A changed
 * Tailwind entry (or theme) is picked up with the stylesheets, since it is
 * one of them.
 */
export const loadOracle = async (root, entryPoint) => {
  const { classes: stylesheetClasses } = currentStylesheets(root);
  const entry = path.resolve(root, entryPoint);
  if (oracles.has(entry)) return oracles.get(entry);

  if (!designSystems.has(entry)) {
    designSystems.set(
      entry,
      __unstable__loadDesignSystem(readFileSync(entry, 'utf8'), {
        base: path.dirname(entry),
      }),
    );
  }
  const designSystem = await designSystems.get(entry);
  const verdicts = new Map();

  const oracle = {
    designSystem,
    stylesheetClasses,
    /** Of `tokens`, the ones nothing can style. */
    unknown(tokens) {
      const pending = tokens.filter(
        (t) => !verdicts.has(t) && !stylesheetClasses.has(t),
      );
      if (pending.length) {
        const css = designSystem.candidatesToCss(pending);
        pending.forEach((t, i) => verdicts.set(t, css[i] !== null));
      }
      return tokens.filter(
        (t) => !stylesheetClasses.has(t) && !verdicts.get(t),
      );
    },
  };
  oracles.set(entry, oracle);
  return oracle;
};

/** Edit distance where swapping two adjacent letters (felx) costs one. */
const distance = (a, b) => {
  if (Math.abs(a.length - b.length) > 3) return Infinity;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
};

/** Closest real class to an unknown one, keeping its variant prefix. */
export const suggest = (oracle, token) => {
  oracle.vocabulary ??= [
    ...new Set([
      ...oracle.designSystem.getClassList().map(([name]) => name),
      ...oracle.stylesheetClasses,
    ]),
  ];
  const cut = token.lastIndexOf(':');
  const prefix = token.slice(0, cut + 1);
  const bare = token.slice(cut + 1).replace(/^!|!$/g, '');
  let best = null;
  let bestScore = Math.min(3, Math.floor(bare.length / 3));
  for (const name of oracle.vocabulary) {
    const d = distance(bare, name);
    if (d > 0 && d <= bestScore) {
      best = name;
      bestScore = d;
    }
  }
  const candidate = best && prefix + best;
  return candidate && !oracle.unknown([candidate]).length ? candidate : null;
};
