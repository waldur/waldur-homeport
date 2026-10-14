/**
 * ESLint rule: colour comes from Tailwind and the design tokens, not from
 * Bootstrap's colour classes.
 *
 * Bootstrap no longer emits any colour utility (_utilities.scss): its
 * `.text-*`, `.bg-*` and `.border-*` colour classes were `!important` in the
 * `bootstrap` cascade layer, painted the theme-inverted SCSS colours, and beat
 * every Tailwind utility, so a `dark:` or `hover:` variant beside one never
 * applied. Tailwind now defines some of the names itself (`text-danger`,
 * `bg-success`, `text-info`, … read the status matrix); the rest (`text-dark`, `bg-light`,
 * `text-muted`, `border-bottom`, …) paint nothing at all. The rule reports:
 *
 * - `bootstrap`: a retired class name, with its replacement.
 * - `dynamic`: a class built as `text-${variant}`, which the linter cannot
 *   read and which usually lands on a retired name. Map each variant to a full
 *   class name.
 *
 * Strings that hold a name rather than a class list are skipped: a BaseButton
 * `variant="text-danger"`, an object key outside classNames()/cn(), a
 * comparison, a TypeScript literal type, a test title.
 *
 * src/tailwindBootstrapColors.test.ts checks that Bootstrap emits none of
 * RETIRED_BOOTSTRAP_COLORS and Tailwind defines none of them.
 */

import { notAClassList } from './class-name-tokens.js';

/** Bootstrap's former colour classes, which no stylesheet defines any more. */
export const RETIRED_BOOTSTRAP_COLORS = [
  'bg-body',
  'bg-danger-600',
  'bg-dark',
  'bg-dark-always',
  'bg-gray',
  'bg-info',
  'bg-light',
  'border-bottom',
  'border-danger-600',
  'border-dark',
  'border-dark-always',
  'border-end',
  'border-end-0',
  'border-gray',
  'border-info',
  'border-light',
  'border-start',
  'border-start-0',
  'border-top',
  'text-black-50',
  'text-body',
  'text-danger-600',
  'text-dark',
  'text-dark-always',
  'text-gray',
  'text-light',
  'text-muted',
  'text-reset',
  'text-white-50',
];

const RETIRED = new Set(RETIRED_BOOTSTRAP_COLORS);

/** The usual replacement, where there is one (docs/design-tokens.md). */
const REPLACEMENTS = {
  'text-danger-600': 'text-danger',
  'bg-danger-600': 'bg-danger',
  'border-danger-600': 'border-danger',
  'text-dark': 'text-primary',
  'text-body': 'text-primary',
  'text-gray': 'text-tertiary',
  'text-muted': 'text-quaternary',
  'text-reset': 'text-inherit',
  'bg-body': 'bg-primary',
  'bg-light': 'bg-tertiary dark:bg-quaternary',
  'border-top': 'border-t-[1px] border-t-secondary',
  'border-bottom': 'border-b-[1px] border-b-secondary',
  'border-start': 'border-l-[1px] border-l-secondary',
  'border-end': 'border-r-[1px] border-r-secondary',
  'border-start-0': 'border-l-0',
  'border-end-0': 'border-r-0',
};

const DYNAMIC = /(?:^|\s)((?:text|bg|border)-)$/;

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Use Tailwind's semantic colour utilities instead of Bootstrap's !important colour classes",
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      bootstrap:
        '"{{ key }}" was a Bootstrap colour utility and no longer paints anything. {{ hint }}',
      dynamic:
        '"{{ key }}" builds a class name the linter cannot read, and usually a Bootstrap colour ' +
        'utility. Map each variant to a full class name.',
    },
  },

  create(context) {
    const checkTokens = (node, text) => {
      for (const token of text.split(/\s+/)) {
        if (!RETIRED.has(token)) continue;
        context.report({
          node,
          messageId: 'bootstrap',
          data: {
            key: token,
            hint: REPLACEMENTS[token]
              ? `Use ${REPLACEMENTS[token]}.`
              : 'Use a semantic utility (docs/design-tokens.md).',
          },
        });
      }
    };

    return {
      Literal(node) {
        if (typeof node.value === 'string' && !notAClassList(node)) {
          checkTokens(node, node.value);
        }
      },
      TemplateElement(node) {
        if (notAClassList(node.parent)) return;
        const text = node.value.cooked ?? node.value.raw;
        checkTokens(node, text);
        const dynamic = !node.tail && DYNAMIC.exec(text);
        if (dynamic) {
          context.report({
            node,
            messageId: 'dynamic',
            data: { key: `${dynamic[1]}\${…}` },
          });
        }
      },
    };
  },
};
