// @vitest-environment node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { compile as compileTailwind } from '@tailwindcss/node';
import postcss from 'postcss';
import * as sass from 'sass';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  RETIRED_SPACING_FAMILIES,
  SPACER_TO_TAILWIND,
  SPACING_FAMILIES,
  isBootstrapOnlySpacing,
  toTailwindSpacing,
} from '../packages/eslint-plugin-waldur/rules/bootstrap-spacing.js';

/**
 * Bootstrap's spacing utilities moved to Tailwind's scale one family at a time
 * (#477), until Bootstrap generated no utility at all (#478) and the package
 * itself was dropped (#481).
 *
 * SPACER_TO_TAILWIND outlives all of that: no-retired-bootstrap-utility uses
 * it to name the Tailwind class that replaces a Bootstrap-only spelling. This
 * file checks the mapping is still arithmetically right, and that every class
 * it points at is one Tailwind really generates.
 */

const root = path.join(__dirname, '..');
const stylesDir = path.join(root, 'src/styles');
const ROOT_PX = 13;
const TAILWIND_STEP_PX = 4;

const importers = [
  {
    findFileUrl: (url: string) =>
      url.startsWith('@/')
        ? pathToFileURL(path.join(root, 'src', url.slice(2)))
        : null,
  },
];

/**
 * Bootstrap's `$spacers` in rem, as the Sass config compiled them for the last
 * time before it was deleted with the rest of the shim (#481). Frozen here
 * because nothing recomputes them any more: these are the historical values
 * SPACER_TO_TAILWIND was derived from, and the assertion below is what keeps
 * the two in step.
 */
const BOOTSTRAP_SPACERS: Record<string, number> = {
  0: 0,
  1: 0.25,
  2: 0.5,
  3: 0.75,
  4: 0.924,
  5: 1.25,
  6: 1.54,
  7: 1.692,
  8: 1.846,
  9: 2.25,
  10: 2.5,
  11: 2.75,
  12: 3,
  13: 3.25,
  14: 3.5,
  15: 3.75,
  16: 4,
  17: 4.25,
  18: 4.5,
  19: 4.75,
  20: 5,
  '2px': 0.154,
  '4px': 0.308,
  '6px': 0.462,
  '8px': 0.616,
  '10px': 0.77,
  '12px': 0.924,
};

/** Single-class selectors of the compiled legacy stylesheet. */
function bootstrapClasses() {
  const { css } = sass.compile(path.join(stylesDir, 'index.scss'), {
    loadPaths: [stylesDir, path.join(root, 'node_modules')],
    importers,
    logger: sass.Logger.silent,
  });
  const names = new Set<string>();
  postcss.parse(css).walkRules((rule) => {
    for (const selector of rule.selectors) {
      const m = /^\.([\w-]+)$/.exec(selector.trim());
      if (m) names.add(m[1]);
    }
  });
  return names;
}

/** The candidates Tailwind generates a rule for, from the real entry point. */
async function tailwindClasses(candidates: string[]) {
  const compiler = await compileTailwind(
    readFileSync(path.join(root, 'src/tailwind.css'), 'utf8'),
    { base: path.join(root, 'src'), onDependency: () => undefined },
  );
  const css = compiler.build(candidates);
  const found = new Set<string>();
  postcss.parse(css).walkRules((rule) => {
    for (const selector of rule.selectors) {
      // `.md\:mb-3` → `md:mb-3`, `.\32 xl\:gap-16` → `2xl:gap-16`
      found.add(
        selector
          .trim()
          .replace(/^\./, '')
          .replace(/\\([0-9a-f]{1,6}) ?/gi, (_, hex) =>
            String.fromCodePoint(parseInt(hex, 16)),
          )
          .replace(/\\/g, ''),
      );
    }
  });
  return candidates.filter((name) => found.has(name));
}

describe('Bootstrap spacing on Tailwind scale', () => {
  it('maps every Bootstrap spacer to its nearest half Tailwind step', () => {
    expect(Object.keys(SPACER_TO_TAILWIND).sort()).toEqual(
      Object.keys(BOOTSTRAP_SPACERS).sort(),
    );
    for (const [step, rem] of Object.entries(BOOTSTRAP_SPACERS)) {
      const tailwind = Number(SPACER_TO_TAILWIND[step]);
      // Step 20 (65px) sits exactly between 64px and 66px.
      expect(Number.isInteger(tailwind * 2), `step ${step}`).toBe(true);
      expect(
        Math.abs(tailwind - (rem * ROOT_PX) / TAILWIND_STEP_PX),
        `step ${step}`,
      ).toBeLessThanOrEqual(0.25);
    }
  });

  it.each([
    ['mb-4', 'mb-3'],
    ['gap-2', 'gap-1.5'],
    ['p-0', 'p-0'],
    ['ms-auto', 'ms-auto'],
    ['mb-md-4', 'md:mb-3'],
    ['ms-xxl-auto', '2xl:ms-auto'],
    ['mt-n2', '-mt-1.5'],
    ['me-lg-n1', 'lg:-me-1'],
    ['gap-8px', 'gap-2'],
    ['pe-auto', null],
    ['pe-none', null],
    ['p-n2', null],
    ['mb-21', null],
    ['mb-0.5', null],
    ['md:mb-4', null],
  ])('rewrites %s to %s', (token, expected) => {
    expect(toTailwindSpacing(token)).toBe(expected);
  });

  it('rewrites only the families it is given', () => {
    expect(toTailwindSpacing('mb-4', ['gap'])).toBeNull();
    expect(toTailwindSpacing('gap-4', ['gap'])).toBe('gap-3');
  });

  it.each([
    ['mb-md-4', true],
    ['mt-n2', true],
    ['gap-8px', true],
    ['mb-4', false],
    ['ms-auto', false],
  ])('knows %s is Bootstrap-only: %s', (token, expected) => {
    expect(isBootstrapOnlySpacing(token)).toBe(expected);
  });

  describe('compiled stylesheets', () => {
    let bootstrap: Set<string>;

    beforeAll(() => {
      bootstrap = bootstrapClasses();
    }, 60_000);

    it('generates no utility of a retired family', () => {
      const emitted = [...bootstrap].filter((name) => {
        const family = name.split('-')[0];
        return (
          RETIRED_SPACING_FAMILIES.includes(family) &&
          toTailwindSpacing(name) !== null
        );
      });
      expect(
        emitted.sort(),
        'Bootstrap must not generate these: its utility API is not imported',
      ).toEqual([]);
    });

    it('reports only spellings Tailwind does not define', async () => {
      const bootstrapOnly = [
        'mx-n2',
        'my-n2',
        'px-lg-3',
        'mt-lg-n1',
        'gap-8px',
      ];
      expect(bootstrapOnly.every(isBootstrapOnlySpacing)).toBe(true);
      expect(await tailwindClasses(bootstrapOnly)).toEqual([]);
    }, 60_000);

    it('rewrites to classes Tailwind generates', async () => {
      const targets = SPACING_FAMILIES.flatMap((family) =>
        Object.keys(SPACER_TO_TAILWIND).map((step) =>
          toTailwindSpacing(`${family}-${step}`),
        ),
      );
      targets.push('md:mb-3', '-mt-1.5', 'ms-auto', '2xl:gap-16');
      expect(await tailwindClasses(targets)).toEqual(targets);
    }, 60_000);
  });
});
