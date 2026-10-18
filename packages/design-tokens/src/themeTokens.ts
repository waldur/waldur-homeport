import { readFileSync } from 'node:fs';
import path from 'node:path';

import { DEFAULT_PRIMARY_COLORS } from './brandColors';

/**
 * Every custom property the token CSS declares, per theme, so contrast tests
 * can resolve a Tailwind class or a component token to the hex it paints
 * with. Read from the CSS itself, so a token edit is seen without a build.
 * Test support only: it reads the CSS from disk, so it is exported as
 * `waldur-design-tokens/test-support/theme-tokens` and never from the
 * package root, which runs in the browser.
 */

export type ThemeName = 'light' | 'dark';

const FILES = [
  'primitives/colorRamps.css',
  'primitives/colors.css',
  'semantic/background.css',
  'semantic/borders.css',
  'semantic/brand.css',
  'semantic/status.css',
  'semantic/text.css',
  'components/button.css',
  'tailwind/theme.css',
];

const DARK = ":root[data-theme='dark']";

// Comments stripped: a comment that mentions a token would otherwise read as
// a declaration of it.
const read = (file: string) =>
  readFileSync(path.join(__dirname, 'css', file), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );

const declarations = (source: string) =>
  [...source.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(
    ([, name, value]) => [name, value.trim()] as const,
  );

function load(): Record<ThemeName, Map<string, string>> {
  const light = new Map<string, string>();
  const darkOnly = new Map<string, string>();
  // The brand ramp is set at runtime from the tenant's colour; the default
  // ramp stands in for it.
  for (const [step, hex] of Object.entries(DEFAULT_PRIMARY_COLORS)) {
    light.set(`--brand-${step}`, hex);
  }
  for (const file of FILES) {
    const source = read(file);
    const darkStart = source.indexOf(DARK);
    const lightPart = darkStart === -1 ? source : source.slice(0, darkStart);
    for (const [name, value] of declarations(lightPart)) light.set(name, value);
    if (darkStart !== -1) {
      for (const [name, value] of declarations(source.slice(darkStart))) {
        darkOnly.set(name, value);
      }
    }
  }
  // Dark overrides only what it lists; the rest falls through to :root.
  return { light, dark: new Map([...light, ...darkOnly]) };
}

const TOKENS = load();

/** The hex a value (`#fff`, `var(--x)`) paints with in a theme. */
function resolveValue(value: string, theme: ThemeName): string {
  const reference = /^var\((--[\w-]+)\)$/.exec(value.trim());
  if (!reference) return value.trim().toLowerCase();
  const next = TOKENS[theme].get(reference[1]);
  if (next === undefined) throw new Error(`Unresolved ${reference[1]}`);
  return resolveValue(next, theme);
}

/** The hex a custom property paints with in a theme. */
export const resolveToken = (name: string, theme: ThemeName) =>
  resolveValue(`var(${name})`, theme);

const NAMED: Record<'bg' | 'text', string[]> = {
  bg: ['--background-color-', '--color-'],
  text: ['--text-color-', '--color-'],
};

/**
 * The hex a Tailwind `bg-*` or `text-*` utility paints with in a theme:
 * `bg-[var(--x)]`, a theme utility (`bg-success-subtle`, `text-tertiary`) or
 * a ramp step (`bg-purple-700`). `white` and `black` are literal.
 */
export function resolveUtility(
  kind: 'bg' | 'text',
  utility: string,
  theme: ThemeName,
): string {
  const arbitrary = /^\[(.+)\]$/.exec(utility);
  if (arbitrary) return resolveValue(arbitrary[1], theme);
  if (utility === 'white') return '#ffffff';
  if (utility === 'black') return '#000000';
  for (const prefix of NAMED[kind]) {
    if (TOKENS[theme].has(prefix + utility)) {
      return resolveToken(prefix + utility, theme);
    }
  }
  throw new Error(`Unresolved ${kind}-${utility}`);
}
