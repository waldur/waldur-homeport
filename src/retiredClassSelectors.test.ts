// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getLayoutReplacement } from '../packages/eslint-plugin-waldur/rules/no-bootstrap-layout-utility.js';
import { getFontSizeReplacement } from '../packages/eslint-plugin-waldur/rules/require-font-size-scale.js';

/**
 * The no-bootstrap-layout-utility and require-font-size-scale autofixes
 * rewrite class names in TSX (`d-flex` → `flex`, `justify-content-sm-end` →
 * `sm:justify-end`, `fs-5` → `text-base`) but cannot see stylesheets. A
 * selector that still names the old class silently stops matching, and
 * stylelint ignores src/metronic/**, where most such overrides live.
 *
 * Give the element a semantic hook class and target that instead; never
 * re-add the retired utility to the markup.
 */

const root = path.join(__dirname, '..');

/** Bootstrap's own utility definitions, which may name these classes. */
const SKIP = [
  path.join(root, 'src/metronic/sass/core'),
  path.join(root, 'src/metronic/sass/_color-ramps.scss'),
];

function stylesheets(dir: string, found: string[] = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (SKIP.some((skip) => full.startsWith(skip))) continue;
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') stylesheets(full, found);
    } else if (/\.(s?css)$/.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

/** The selector preludes of a SCSS/CSS source, without at-rules. */
function selectors(source: string) {
  const text = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/#\{[^}]*\}/g, '_')
    .replace(/(['"])(?:\\.|(?!\1).)*\1/g, '""');
  const preludes: string[] = [];
  const re = /([^{};]*)\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const prelude = m[1].trim();
    if (prelude && !prelude.startsWith('@')) preludes.push(prelude);
  }
  return preludes;
}

/** Class names a selector targets that the lint autofix has retired. */
function retiredClasses(selector: string) {
  const names = selector
    .replace(/\[[^\]]*\]/g, '')
    .matchAll(/\.(-?[_a-zA-Z][\w-]*)/g);
  return [...names]
    .map(([, name]) => name)
    .filter(
      (name) => getLayoutReplacement(name) || getFontSizeReplacement(name),
    );
}

describe('Stylesheet selectors', () => {
  it('finds retired classes', () => {
    expect(
      retiredClasses(
        '.drawer > .d-flex .justify-content-sm-end, .fs-5:hover, .flex',
      ),
    ).toEqual(['d-flex', 'justify-content-sm-end', 'fs-5']);
    expect(retiredClasses("[data-x='.d-flex'] .text-base")).toEqual([]);
    expect(
      selectors(
        '// .d-flex { }\n@media (max-width: 1px) { .a .w-100 { x: y; } }',
      ),
    ).toEqual(['.a .w-100']);
  });

  it('name no class the layout or font-size autofix retires', () => {
    const stale: string[] = [];
    for (const file of stylesheets(path.join(root, 'src'))) {
      for (const selector of selectors(readFileSync(file, 'utf8'))) {
        const names = retiredClasses(selector);
        if (names.length) {
          stale.push(
            `${path.relative(root, file)}: ${selector} (${names.join(', ')})`,
          );
        }
      }
    }
    expect(
      stale,
      'The markup no longer carries these classes: add a semantic hook class to the element and target it',
    ).toEqual([]);
  });
});
