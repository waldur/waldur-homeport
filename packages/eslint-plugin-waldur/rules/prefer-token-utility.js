/**
 * ESLint rule: use the named utility when a colour token has one.
 *
 * packages/design-tokens/src/css/tailwind/theme.css gives the semantic
 * colour roles utilities of the same name -- `text-tertiary` is
 * var(--text-tertiary), `bg-secondary` is var(--bg-secondary),
 * `border-brand` is var(--text-brand) -- so spelling the variable out in an
 * arbitrary value says the same thing in more characters:
 *
 *   text-[var(--text-quaternary)]        →  text-quaternary
 *   hover:bg-[var(--bg-primary)]         →  hover:bg-primary
 *   border-t-[var(--border-divider)]     →  border-t-divider
 *
 * The table of (utility prefix, variable) → utility is read from theme.css
 * itself, never kept here: a variable without a utility (`--bg-brand-solid`,
 * `--border-brand`, every component token such as `--input-bg`) is left
 * alone, and a utility added to theme.css is enforced with no edit to this
 * rule. The match is on the prefix as well as the variable, because the same
 * variable can back different utilities (`border-brand` reads --text-brand,
 * not --border-brand).
 *
 * Out of scope: the status matrix (`--status-*`, reported by
 * no-raw-status-ramp) and the colour ramps (`--color-*`, `--brand-N`).
 * Values with a fallback (`var(--x, red)`) or an alpha are not the same
 * colour as the utility, so they are left alone too.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const THEME_CSS = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../design-tokens/src/css/tailwind/theme.css',
);

/** `@theme` namespaces that name a colour utility, and the prefix they take. */
const NAMESPACES = [
  ['--background-color-', 'bg'],
  ['--outline-color-', 'outline'],
  ['--border-color-', 'border'],
  ['--text-color-', 'text'],
];

/** Variables reported by another rule, or that are not semantic roles. */
const EXCLUDED = /^--(status-|color-|brand-)/;

/**
 * Map of `prefix|variable` → utility suffix, from the `@theme` entries that
 * point at a variable (`--text-color-tertiary: var(--text-tertiary)`).
 */
export function readUtilities(css = readFileSync(THEME_CSS, 'utf8')) {
  const map = new Map();
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*var\((--[\w-]+)\)\s*;/g)) {
    const [, key, variable] = m;
    const ns = NAMESPACES.find(([n]) => key.startsWith(n));
    if (!ns || EXCLUDED.test(variable)) continue;
    const id = `${ns[1]}|${variable}`;
    const suffix = key.slice(ns[0].length);
    // Two utilities of one prefix for one variable: ambiguous, never fixed.
    map.set(id, map.has(id) ? null : suffix);
  }
  return map;
}

const UTILITIES = readUtilities();

// bg-, text-, outline- and border- with an optional side (border-t-, …).
const ARBITRARY =
  /^(bg|text|outline|border(?:-[trblxyse])?)-\[var\((--[\w-]+)\)\]$/;

/** Split `hover:dark:text-[…]` at the last colon outside any brackets. */
const splitVariants = (token) => {
  let depth = 0;
  let cut = -1;
  for (let i = 0; i < token.length; i += 1) {
    const c = token[i];
    if (c === '[' || c === '(') depth += 1;
    else if (c === ']' || c === ')') depth -= 1;
    else if (c === ':' && depth === 0) cut = i;
  }
  return [token.slice(0, cut + 1), token.slice(cut + 1)];
};

/** `dark:text-[var(--text-quaternary)]` → `dark:text-quaternary`, or null. */
export const namedFor = (token, utilities = UTILITIES) => {
  const [variants, utility] = splitVariants(token);
  const important = utility.startsWith('!') ? '!' : '';
  const m = ARBITRARY.exec(utility.slice(important.length));
  if (!m) return null;
  const [, prefix, variable] = m;
  const suffix = utilities.get(`${prefix.split('-')[0]}|${variable}`);
  return suffix ? `${variants}${important}${prefix}-${suffix}` : null;
};

const tokensOf = (node) =>
  (node.type === 'Literal' ? node.value : node.value.cooked)
    .split(/\s+/)
    .filter(Boolean);

const escapeRegExp = (s) => s.replace(/[[\]()|\\.*+?^$-]/g, '\\$&');

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Use the named colour utility (text-tertiary, bg-primary, …) when a token has one, instead of an arbitrary var() value',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      named:
        'Use "{{ named }}" for "{{ token }}": the colour token has a utility (tailwind/theme.css).',
    },
    fixable: 'code',
  },

  create(context) {
    const { sourceCode } = context;
    const check = (node) => {
      const replacements = [...new Set(tokensOf(node))]
        .map((token) => [token, namedFor(token)])
        .filter(([, named]) => named);
      if (!replacements.length) return;
      // Every report rewrites the whole string, so one --fix pass is enough
      // (ESLint applies one of several overlapping fixes per pass).
      const fixed = replacements.reduce(
        (text, [token, named]) =>
          text.replaceAll(
            new RegExp(
              `(?<=^|[\\s'"\`}])${escapeRegExp(token)}(?=$|[\\s'"\`$])`,
              'g',
            ),
            named,
          ),
        sourceCode.getText(node),
      );
      for (const [token, named] of replacements) {
        context.report({
          node,
          messageId: 'named',
          data: { token, named },
          fix: (fixer) => fixer.replaceText(node, fixed),
        });
      }
    };

    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node);
      },
      TemplateElement: check,
    };
  },
};
