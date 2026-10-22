#!/usr/bin/env node
// Compiles the Metronic stylesheets and records the colour every declaration
// resolves to, in the light and the dark theme, so a refactor of the SCSS
// colour variables can be checked declaration by declaration.
//
//   node scripts/color-diff.mjs save <snapshot.json>
//   node scripts/color-diff.mjs compare <snapshot.json>
//
// Light is index.scss with the light design tokens, dark the same stylesheet
// with the dark tokens (the `:root[data-theme='dark']` blocks), as the app
// renders them. Every var() is resolved against the tokens and the
// stylesheet's own :root; one nobody defines (the runtime --brand-* ramp)
// stays as written. A rule wrapped by the dark-theme or light-theme mixin
// counts for its theme only, as an override of the same selector. Colours are
// normalised (#fff, white and rgb(255, 255, 255) compare equal).
//
// compare prints every declaration whose resolved value changed in either
// theme, and exits 1 when anything did.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import postcss from 'postcss';
import * as sass from 'sass';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const sassDir = path.join(root, 'src/styles/bootstrap');
const tokensDir = path.join(root, 'packages/design-tokens/src/css');

const compile = (file) =>
  sass.compile(path.join(sassDir, file), {
    loadPaths: [path.join(root, 'node_modules')],
    importers: [
      {
        findFileUrl: (url) =>
          url.startsWith('@/')
            ? pathToFileURL(path.join(root, 'src', url.slice(2)))
            : null,
      },
    ],
    logger: sass.Logger.silent,
  }).css;

/** Custom properties from the token files: light, and dark overrides. */
function tokenVars() {
  const light = {};
  const dark = {};
  const walk = (dir) => {
    for (const entry of readdirSafe(dir)) {
      const full = path.join(dir, entry);
      if (entry.endsWith('.css')) {
        postcss.parse(readFileSync(full, 'utf8')).walkDecls(/^--/, (decl) => {
          const selector = decl.parent?.selector ?? '';
          if (/^:root\[data-theme=['"]?dark['"]?\]$/.test(selector)) {
            dark[decl.prop] = decl.value;
          } else if (selector === ':root' || selector.startsWith('@theme')) {
            light[decl.prop] = decl.value;
          } else if (decl.parent?.type === 'atrule') {
            light[decl.prop] ??= decl.value;
          }
        });
      } else if (!entry.includes('.')) {
        walk(full);
      }
    }
  };
  walk(tokensDir);
  return { light, dark: { ...light, ...dark } };
}

function readdirSafe(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

const NAMED = { white: '#ffffff', black: '#000000', transparent: '#0000' };

/** #abc, #aabbcc, #aabbccdd, rgb()/rgba() → rgba(r,g,b,a). */
function normalise(value) {
  return value
    .replace(/\b(white|black|transparent)\b/gi, (m) => NAMED[m.toLowerCase()])
    .replace(/#([0-9a-f]{3,8})\b/gi, (m, hex) => {
      let h = hex.toLowerCase();
      if (h.length === 3 || h.length === 4)
        h = [...h].map((c) => c + c).join('');
      if (h.length !== 6 && h.length !== 8) return m;
      const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
      const a =
        h.length === 8 ? +(parseInt(h.slice(6), 16) / 255).toFixed(3) : 1;
      return `rgba(${r},${g},${b},${a})`;
    })
    .replace(
      /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/gi,
      (m, r, g, b, a = '1') => {
        const alpha = a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a);
        return `rgba(${+r},${+g},${+b},${+alpha.toFixed(3)})`;
      },
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Replace var(--x[, fallback]) until nothing resolvable is left. */
function resolve(value, vars) {
  let out = value;
  for (let i = 0; i < 12; i++) {
    const next = out.replace(
      /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))*[^()]*))?\)/g,
      (m, name, fallback) =>
        name in vars
          ? vars[name]
          : fallback !== undefined
            ? fallback
            : `⟨${name}⟩`,
    );
    if (next === out) break;
    out = next;
  }
  return normalise(out.replace(/⟨(--[\w-]+)⟩/g, 'var($1)'));
}

const DARK_ONLY = /:where\(\[data-theme=["']?dark["']?\]\)\s*/g;
const LIGHT_ONLY = /:where\(:root:not\(\[data-theme=["']?dark["']?\]\)\)\s*/g;

/**
 * The selectors of a rule as the given theme sees them: null when the rule is
 * for the other theme only, else the selector without the theme wrapper (the
 * dark-theme / light-theme mixins), and whether it had one.
 */
function themedSelector(selector, theme) {
  const parts = selector.split(/,(?![^(]*\))/).map((part) => part.trim());
  const kept = [];
  let themed = false;
  for (const part of parts) {
    const dark = DARK_ONLY.test(part);
    DARK_ONLY.lastIndex = 0;
    const light = LIGHT_ONLY.test(part);
    LIGHT_ONLY.lastIndex = 0;
    if ((dark && theme !== 'dark') || (light && theme !== 'light')) continue;
    themed ||= dark || light;
    kept.push(part.replace(DARK_ONLY, '').replace(LIGHT_ONLY, ''));
  }
  return kept.length ? { selector: kept.join(', '), themed } : null;
}

/**
 * Declarations keyed by context + selector + property + occurrence, as the
 * theme renders them. A dark-theme or light-theme rule is an override: it
 * keeps the selector's specificity and comes later in the source, so it
 * replaces the latest value of the same selector and property.
 */
function declarations(css, tokens, theme) {
  const tree = postcss.parse(css);
  const vars = { ...tokens };
  tree.walkDecls(/^--/, (decl) => {
    if (decl.parent?.selector === ':root') vars[decl.prop] = decl.value;
  });
  const seen = new Map();
  const out = {};
  tree.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) return;
    const rule = decl.parent;
    const view = rule.selector
      ? themedSelector(rule.selector, theme)
      : { selector: rule.name, themed: false };
    if (!view) return;
    const context = [];
    for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) {
      if (p.type === 'atrule') context.unshift(`@${p.name} ${p.params}`);
    }
    const base = `${context.join(' ')} ${view.selector} { ${decl.prop}`
      .replace(/\s+/g, ' ')
      .trim();
    const value =
      resolve(decl.value, vars) + (decl.important ? ' !important' : '');
    const n = seen.get(base) ?? 0;
    if (view.themed && n > 0) {
      out[n > 1 ? `${base} #${n}` : base] = value;
      return;
    }
    seen.set(base, n + 1);
    out[n + 1 > 1 ? `${base} #${n + 1}` : base] = value;
  });
  return out;
}

function snapshot() {
  const tokens = tokenVars();
  const lightCss = compile('index.scss');
  return {
    light: declarations(lightCss, tokens.light, 'light'),
    dark: declarations(lightCss, tokens.dark, 'dark'),
  };
}

const [command, file] = process.argv.slice(2);
if (!['save', 'compare'].includes(command) || !file) {
  console.error('usage: color-diff.mjs save|compare <snapshot.json>');
  process.exit(2);
}

const current = snapshot();
if (command === 'save') {
  writeFileSync(file, JSON.stringify(current));
  console.log(
    `${Object.keys(current.light).length} light / ${Object.keys(current.dark).length} dark declarations → ${file}`,
  );
} else {
  const base = JSON.parse(readFileSync(file, 'utf8'));
  let changes = 0;
  for (const theme of ['light', 'dark']) {
    const keys = new Set([
      ...Object.keys(base[theme]),
      ...Object.keys(current[theme]),
    ]);
    for (const key of [...keys].sort()) {
      const before = base[theme][key];
      const after = current[theme][key];
      if (before === after) continue;
      changes++;
      console.log(
        `[${theme}] ${key}\n    ${before ?? '(none)'}\n  → ${after ?? '(none)'}`,
      );
    }
  }
  console.log(changes ? `${changes} change(s)` : 'No change in either theme.');
  process.exit(changes ? 1 : 0);
}
