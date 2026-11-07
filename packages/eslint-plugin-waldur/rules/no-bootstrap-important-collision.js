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
 *
 * Bootstrap generates no utility any more (#478): shadow and radius uses
 * moved to tokens, and require-border-color keeps a bare `border` coloured.
 * What is left are its helpers, which this rule reports.
 *
 * Only a bare token collides: `md:visually-hidden` is a different class name,
 * which Bootstrap does not define.
 */

import { notAClassList } from './class-name-tokens.js';

/** Bootstrap's `!important` class → its Tailwind replacement. */
const BOOTSTRAP_IMPORTANT_COLLISIONS = {
  'visually-hidden': 'sr-only',
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
            hint: `Use ${replacement}.`,
          },
          fix: (fixer) =>
            fixer.replaceTextRange([start, start + token.length], replacement),
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
