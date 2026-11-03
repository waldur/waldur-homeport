/**
 * ESLint rule: no class name that Bootstrap also emits with `!important`.
 *
 * Bootstrap's `!important` utilities sit in the `bootstrap` cascade layer,
 * and an `!important` declaration beats every normal one whatever the layer,
 * so where Tailwind and Bootstrap share a name, homeport renders Bootstrap's
 * value and a micro-app (which loads only Tailwind) renders Tailwind's. Names
 * only Bootstrap defines do nothing at all in a micro-app (#503):
 *
 *   visually-hidden   Bootstrap-only; visible there       → sr-only
 *   btn-no-focus      Bootstrap-only; BaseButton has no focus shadow and only
 *                     draws its ring on :focus-visible, so it is not needed
 *
 * Bootstrap's shadow and radius utilities are no longer generated: their uses
 * moved to tokens, and enforce-border-radius-tokens rewrites a bare `rounded`.
 * The border widths (`border-0`, `border-2`, …) are left out: both define
 * them as the same width. `.border` also sets Bootstrap's colour, which
 * no-bootstrap-border-with-tailwind-color covers.
 *
 * Only a bare token collides: `md:visually-hidden` is a different class name,
 * which Bootstrap does not define.
 */

import { notAClassList } from './class-name-tokens.js';

/** Bootstrap's `!important` class → Tailwind replacement, or null for none. */
const BOOTSTRAP_IMPORTANT_COLLISIONS = {
  'visually-hidden': 'sr-only',
  'btn-no-focus': null,
};

const HINTS = {
  'btn-no-focus':
    'Remove it: BaseButton draws its focus ring only on :focus-visible.',
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Don't use class names that Bootstrap also emits with !important",
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      collision:
        '"{{ key }}" is a Bootstrap !important utility, so it renders differently without ' +
        "Bootstrap's CSS. {{ hint }}",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    // A class token in the node's source: bounded by whitespace, a quote, a
    // backtick or a template's braces.
    const TOKEN = /(?<=^|[\s'"`}])[^\s'"`$]+(?=$|[\s'"`$])/g;

    const check = (node) => {
      const text = sourceCode.getText(node);
      for (const match of text.matchAll(TOKEN)) {
        const token = match[0];
        if (!Object.hasOwn(BOOTSTRAP_IMPORTANT_COLLISIONS, token)) continue;
        const replacement = BOOTSTRAP_IMPORTANT_COLLISIONS[token];
        const start = node.range[0] + match.index;
        context.report({
          node,
          messageId: 'collision',
          data: {
            key: token,
            hint: replacement ? `Use ${replacement}.` : HINTS[token],
          },
          fix: replacement
            ? (fixer) =>
                fixer.replaceTextRange(
                  [start, start + token.length],
                  replacement,
                )
            : null,
        });
      }
    };

    return {
      Literal(node) {
        if (typeof node.value === 'string' && !notAClassList(node)) {
          check(node);
        }
      },
      TemplateElement(node) {
        if (!notAClassList(node.parent)) check(node);
      },
    };
  },
};
