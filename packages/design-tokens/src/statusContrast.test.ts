import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { contrastRatio } from './contrast';

/**
 * status.css promises that each intent's -fg is readable (WCAG AA, 4.5:1)
 * both on a neutral surface and on its own tinted -bg, in both themes — that
 * is what lets one slot serve text, icons and dots everywhere. This reads the
 * CSS itself, so changing a step there without re-checking fails here.
 */

// Comments stripped: a comment that mentions a token (`--card-bg: at …`)
// would otherwise read as a declaration of it.
const css = (file: string) =>
  readFileSync(path.join(__dirname, 'css', file), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );

const ramps = new Map(
  [
    ...css('primitives/colorRamps.css').matchAll(
      /(--color-[\w-]+):\s*(#[0-9a-f]+)/gi,
    ),
  ].map(([, name, value]) => [name, value]),
);

/** Token -> value for one theme block of a semantic file. */
function block(file: string, theme: 'light' | 'dark') {
  const source = css(file);
  const darkStart = source.indexOf(":root[data-theme='dark']");
  const body =
    theme === 'light' ? source.slice(0, darkStart) : source.slice(darkStart);
  return new Map(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim(),
    ]),
  );
}

function resolve(value: string): string {
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  if (!ref) return value;
  const hex = ramps.get(ref[1]);
  if (!hex) throw new Error(`Unresolved ${value}`);
  return hex;
}

const AA = 4.5;

describe.each(['light', 'dark'] as const)('status matrix (%s)', (theme) => {
  const status = block('semantic/status.css', theme);
  const background = block('semantic/background.css', theme);
  const surfaces = {
    card: resolve(background.get('--card-bg')),
    page: resolve(background.get('--page-bg')),
  };

  it.each(['success', 'warning', 'danger', 'info', 'neutral'])(
    '%s -fg clears AA on the card, the page and its own -bg',
    (intent) => {
      const fg = resolve(status.get(`--status-${intent}-fg`));
      const ratios = {
        ...Object.fromEntries(
          Object.entries(surfaces).map(([name, bg]) => [
            name,
            contrastRatio(fg, bg),
          ]),
        ),
        tint: contrastRatio(fg, resolve(status.get(`--status-${intent}-bg`))),
      };
      for (const [surface, ratio] of Object.entries(ratios)) {
        expect(ratio, `${intent} -fg on ${surface}`).toBeGreaterThanOrEqual(AA);
      }
    },
  );
});
