import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * waldur-ui and shell style themselves with the semantic utilities
 * (`text-quaternary`, `bg-tertiary`, `border-secondary`, …). Those only exist
 * where a Tailwind @theme declares them, so this package must declare every
 * one it is used with — reachable from index.css, the one entry point every
 * consumer imports. When the declarations lived in waldur-homeport's own
 * src/tailwind.css, the micro-apps compiled all of these classes to nothing.
 */

const packages = path.resolve(__dirname, '../..');
const cssDir = path.resolve(__dirname, 'css');

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

/** Files index.css pulls in, following @import transitively. */
function reachableFromIndex(): string[] {
  const seen = new Set<string>();
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const css = readFileSync(file, 'utf8');
    for (const m of css.matchAll(/@import\s+['"](\.[^'"]+)['"]/g)) {
      visit(path.resolve(path.dirname(file), m[1]));
    }
  };
  visit(path.join(cssDir, 'index.css'));
  return [...seen];
}

const PROPERTY_KEYS = {
  text: '--text-color-',
  bg: '--background-color-',
  border: '--border-color-',
} as const;

function declaredUtilities(): Set<string> {
  const declared = new Set<string>();
  for (const file of reachableFromIndex()) {
    const css = readFileSync(file, 'utf8');
    for (const [prefix, key] of Object.entries(PROPERTY_KEYS)) {
      for (const m of css.matchAll(new RegExp(`${key}([\\w-]+?):`, 'g'))) {
        declared.add(`${prefix}-${m[1]}`);
      }
    }
  }
  return declared;
}

// The semantic role names; anything else (`text-sm`, `bg-brand-50`) comes from
// Tailwind's own theme or the ramps.
const ROLE =
  /^(?:[\w-]+:)*((?:text|bg|border)-(?:primary|primary-hover|secondary|tertiary|quaternary|quinary|senary|divider))$/;

function usedUtilities(): Map<string, string> {
  const used = new Map<string, string>();
  for (const pkg of ['ui', 'shell']) {
    for (const file of walk(path.join(packages, pkg, 'src'))) {
      if (!/\.tsx?$/.test(file) || /\.(test|stories)\.tsx?$/.test(file)) {
        continue;
      }
      const source = readFileSync(file, 'utf8');
      for (const token of source.split(/[\s'"`{}()]+/)) {
        const m = ROLE.exec(token);
        if (m && !used.has(m[1])) {
          used.set(m[1], path.relative(packages, file));
        }
      }
    }
  }
  return used;
}

describe('semantic Tailwind utilities', () => {
  it('are declared in a file index.css imports', () => {
    expect(reachableFromIndex().map((f) => path.relative(cssDir, f))).toContain(
      path.join('tailwind', 'theme.css'),
    );
  });

  it('cover every one waldur-ui and shell use', () => {
    const declared = declaredUtilities();
    const used = usedUtilities();
    expect(used.size).toBeGreaterThan(0);
    const missing = [...used]
      .filter(([utility]) => !declared.has(utility))
      .map(([utility, file]) => `${utility} (first used in ${file})`);
    expect(
      missing,
      'Declare these in packages/design-tokens/src/css/tailwind/theme.css',
    ).toEqual([]);
  });
});
