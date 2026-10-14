// @vitest-environment node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { compile as compileTailwind } from '@tailwindcss/node';
import postcss from 'postcss';
import * as sass from 'sass';
import { beforeAll, describe, expect, it } from 'vitest';

import { RETIRED_BOOTSTRAP_COLORS } from '../packages/eslint-plugin-waldur/rules/no-bootstrap-color-utility.js';

/**
 * Bootstrap used to emit `.text-*`, `.bg-*` and `.border-*` colour classes
 * with `!important`, in the `bootstrap` layer — which outranks every Tailwind
 * utility, `!` or not. A Tailwind class that shared a name with one of them
 * silently lost: it compiled, but Bootstrap painted it, and a `dark:` or
 * `hover:` variant next to it never applied. Colour now comes from Tailwind
 * and the design tokens only, so Bootstrap emits none (_utilities.scss).
 *
 * Read from what the compilers actually emit, not from the SCSS maps:
 * `text-white`, `bg-transparent` and friends came from Bootstrap maps other
 * than $theme-colors, and a map-based check missed them.
 *
 * (`.border` itself, which sets the colour too, is covered by the
 * no-bootstrap-border-with-tailwind-color lint rule.)
 */

const root = path.join(__dirname, '..');

/** Single-class selectors Bootstrap gives an !important colour or border. */
function bootstrapColorClasses(css: string) {
  const names = new Set<string>();
  postcss.parse(css).walkRules((rule) => {
    const paints = rule.nodes.some(
      (node) =>
        node.type === 'decl' &&
        node.important &&
        /^(?:color|background(?:-color)?|border(?:-(?:top|bottom|start|end|left|right))?(?:-color)?)$/.test(
          node.prop,
        ),
    );
    if (!paints) return;
    for (const selector of rule.selectors) {
      const m = /^\.((?:text|bg|border)-[\w-]+)$/.exec(selector.trim());
      if (m) names.add(m[1]);
    }
  });
  return names;
}

function compileMetronic() {
  // Light and dark emit the same class names; only the colours differ.
  return sass.compile(path.join(root, 'src/metronic/sass/style.scss'), {
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
}

/** The candidates Tailwind generates a rule for, from the real entry point. */
async function tailwindClasses(candidates: string[]) {
  const compiler = await compileTailwind(
    readFileSync(path.join(root, 'src/tailwind.css'), 'utf8'),
    { base: path.join(root, 'src'), onDependency: () => undefined },
  );
  return new Set(
    candidates.filter((name) => {
      let found = false;
      postcss.parse(compiler.build([name])).walkRules((rule) => {
        if (rule.selectors.includes(`.${name}`)) found = true;
      });
      return found;
    }),
  );
}

describe('Tailwind and Bootstrap colour utilities', () => {
  let bootstrap: Set<string>;
  let tailwind: Set<string>;

  beforeAll(async () => {
    bootstrap = bootstrapColorClasses(compileMetronic());
    tailwind = await tailwindClasses(RETIRED_BOOTSTRAP_COLORS);
  }, 60_000);

  it('finds an !important colour class', () => {
    const css = '.text-x { color: red !important } .text-y { color: red }';
    expect([...bootstrapColorClasses(css)]).toEqual(['text-x']);
  });

  it('emits no Bootstrap colour utility', () => {
    expect(
      [...bootstrap].sort(),
      'Colour comes from Tailwind: remove these from $utilities in _utilities.scss',
    ).toEqual([]);
  });

  it('retires only names Tailwind does not define', () => {
    expect(
      [...tailwind].sort(),
      'A Tailwind class, not a retired Bootstrap one: drop it from RETIRED_BOOTSTRAP_COLORS',
    ).toEqual([]);
  });
});

/** Every `.fw-*` class the stylesheet defines. */
const fontWeightClasses = (css: string) => {
  const found = new Set<string>();
  postcss.parse(css).walkRules((rule) => {
    for (const selector of rule.selectors) {
      const m = /^\.(fw-[\w-]+)$/.exec(selector);
      if (m) found.add(m[1]);
    }
  });
  return found;
};

/** The font-weight a Tailwind class compiles to, or null when it has no rule. */
async function tailwindWeights(candidates: string[]) {
  const compiler = await compileTailwind(
    readFileSync(path.join(root, 'src/tailwind.css'), 'utf8'),
    { base: path.join(root, 'src'), onDependency: () => undefined },
  );
  const css = postcss.parse(compiler.build(candidates));
  const vars = new Map<string, string>();
  css.walkDecls(/^--font-weight-/, (d) => {
    vars.set(d.prop, d.value);
  });
  const weights = new Map<string, string | null>(
    candidates.map((c) => [c, null]),
  );
  css.walkRules((rule) => {
    const name = rule.selector.replace(/^\./, '');
    if (!weights.has(name)) return;
    rule.walkDecls('font-weight', (d) => {
      const ref = /^var\((--[\w-]+)\)$/.exec(d.value);
      weights.set(name, ref ? (vars.get(ref[1]) ?? null) : d.value);
    });
  });
  return weights;
}

describe('Font weight', () => {
  it('emits no Bootstrap .fw-* class', () => {
    expect(
      [...fontWeightClasses(compileMetronic())].sort(),
      'Weight comes from Tailwind: remove font-weight from $utilities in _utilities.scss',
    ).toEqual([]);
  });

  it('Metronic sets every weight through the scale', () => {
    const raw: string[] = [];
    postcss.parse(compileMetronic()).walkDecls('font-weight', (d) => {
      if (
        !/^var\(--(font-weight-(light|normal|medium|semibold|bold)|bs-body-font-weight)\)$/.test(
          d.value,
        ) &&
        d.value !== 'inherit'
      ) {
        raw.push(
          `${(d.parent as postcss.Rule).selector} { font-weight: ${d.value} }`,
        );
      }
    });
    expect(
      raw,
      'Use var(--font-weight-*) (or a $font-weight-* variable) in Metronic SCSS',
    ).toEqual([]);
  });

  it('compiles exactly the five loaded weights', async () => {
    const weights = await tailwindWeights([
      'font-light',
      'font-normal',
      'font-medium',
      'font-semibold',
      'font-bold',
      'font-thin',
      'font-extralight',
      'font-extrabold',
      'font-black',
    ]);
    expect(Object.fromEntries(weights)).toEqual({
      'font-light': '300',
      'font-normal': '400',
      'font-medium': '500',
      'font-semibold': '600',
      'font-bold': '700',
      'font-thin': null,
      'font-extralight': null,
      'font-extrabold': null,
      'font-black': null,
    });
  }, 60_000);
});
