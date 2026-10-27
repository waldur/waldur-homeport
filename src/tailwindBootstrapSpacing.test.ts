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
 * Bootstrap's spacing utilities move to Tailwind's scale one family at a time
 * (#477): scripts/codemods/bootstrap-spacing.mjs rewrites a family's uses
 * with SPACER_TO_TAILWIND, and _utilities.scss stops generating it.
 */

const root = path.join(__dirname, '..');
const bootstrapDir = path.join(root, 'src/styles/bootstrap');
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

/** Bootstrap's $spacers as compiled, in rem. */
function compiledSpacers() {
  const { css } = sass.compileString(
    "@import 'config'; @each $k, $v in $spacers { .s-#{$k} { v: $v; } }",
    {
      loadPaths: [bootstrapDir, path.join(root, 'node_modules')],
      importers,
      logger: sass.Logger.silent,
    },
  );
  const spacers: Record<string, number> = {};
  postcss.parse(css).walkDecls('v', (d) => {
    const key = (d.parent as postcss.Rule).selector.replace(/^\.s-/, '');
    spacers[key] = parseFloat(d.value);
  });
  return spacers;
}

/** Single-class selectors of the compiled Bootstrap stylesheet. */
function bootstrapClasses() {
  const { css } = sass.compile(path.join(bootstrapDir, 'index.scss'), {
    loadPaths: [path.join(root, 'node_modules')],
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
  it('maps every compiled spacer to its nearest half Tailwind step', () => {
    const spacers = compiledSpacers();
    expect(Object.keys(SPACER_TO_TAILWIND).sort()).toEqual(
      Object.keys(spacers).sort(),
    );
    for (const [step, rem] of Object.entries(spacers)) {
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
        'Remove these from $utilities in _utilities.scss',
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
