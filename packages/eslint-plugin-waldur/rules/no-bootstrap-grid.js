/**
 * ESLint rule keeping layouts off Bootstrap's grid.
 *
 * Bootstrap's grid (`.row`, `.col-*`, the `g-*`/`gx-*`/`gy-*` gutters) and the
 * Metronic table gutters (`.table.gs-*` …) are no longer compiled. Layouts are
 * Tailwind grid or flex: `grid md:grid-cols-2 gap-5`, a 12-column
 * `grid md:grid-cols-12` with `md:col-span-8` children for mixed widths, or
 * `flex` with `flex-1` / `flex-none` children. So both ways back are reported:
 *
 * - react-bootstrap's `Row`, `Col` (and their `RowProps`/`ColProps` types), by
 *   named or deep-path import;
 * - a `row`, `col`, `col-*`, `offset-*`, `row-cols-*`, `g-*`, `gx-*`, `gy-*`
 *   or `gs-*` class token in a `className`, `*ClassName` or `*Class` attribute
 *   (`labelClass`, `valueClass`) or in such a prop's default value, which now
 *   styles nothing. Tokens with a variant prefix (`md:col-span-2`) are
 *   Tailwind's and left alone. Unprefixed `col-<n>` and `col-auto` are
 *   reported too, though Tailwind does generate them (`grid-column: <n>`):
 *   in this codebase they are nearly always a Bootstrap column left behind,
 *   so the message says what each one means here instead of claiming it
 *   styles nothing.
 */

import { getExpressionTokens } from './class-name-tokens.js';

const LEGACY_IMPORTS = new Set(['Row', 'Col', 'RowProps', 'ColProps']);

const BP = '(?:xs|sm|md|lg|xl|xxl)';

const LEGACY_CLASS = new RegExp(
  [
    '^row$',
    '^col$',
    `^col-(?:${BP}-)?(?:\\d+|auto)$`,
    `^col-${BP}$`,
    `^offset-(?:${BP}-)?\\d+$`,
    `^row-cols-(?:${BP}-)?(?:\\d+|auto)$`,
    `^g[xys]?-(?:${BP}-)?(?:\\d+|\\d+px)$`,
    '^(?:[a-z0-9]+:)+col-(?:\\d+|auto)$',
  ].join('|'),
);

const REPLACEMENT =
  '  Use a Tailwind grid or flex layout: `grid md:grid-cols-2 gap-5`, or `grid md:grid-cols-12` with `md:col-span-*` children.';

const isLegacyGridClass = (token) => LEGACY_CLASS.test(token);

// Bootstrap column names that Tailwind also generates, with another meaning.
const TAILWIND_LOOKALIKE = /^(?:[a-z0-9]+:)*col-(?:\d+|auto)$/;

// className, labelClassName, valueClass, controlClass, …
const CLASS_PROP = /^(className|\w+Class(Name)?)$/;

const isClassAttribute = (attr) =>
  attr.type === 'JSXAttribute' &&
  typeof attr.name.name === 'string' &&
  CLASS_PROP.test(attr.name.name);

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Prevent react-bootstrap's Row/Col and Bootstrap grid classes; use Tailwind grid or flex",
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noGridImport: "Avoid react-bootstrap's {{ name }}.\n" + REPLACEMENT,
      noGridClass:
        'The "{{ token }}" class is Bootstrap\'s grid, which is no longer compiled.\n' +
        REPLACEMENT,
      tailwindLookalike:
        'The "{{ token }}" class is Bootstrap\'s column width here, but Tailwind reads it as `grid-column: …` (a grid line, not a width), so it no longer sizes the element.\n' +
        '  Size the cell from its grid parent with `col-span-*`, or with `w-*` / `flex-none` in a flex row; place it on a line with `col-start-*`.',
    },
  },

  create(context) {
    const check = (node, expression) => {
      for (const token of getExpressionTokens(expression)) {
        if (isLegacyGridClass(token)) {
          context.report({
            node,
            messageId: TAILWIND_LOOKALIKE.test(token)
              ? 'tailwindLookalike'
              : 'noGridClass',
            data: { token },
          });
          return;
        }
      }
    };

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== 'string') {
          return;
        }
        const deep = source.match(/^react-bootstrap\/(\w+)$/);
        if (deep) {
          if (LEGACY_IMPORTS.has(deep[1])) {
            context.report({
              node,
              messageId: 'noGridImport',
              data: { name: deep[1] },
            });
          }
          return;
        }
        if (source !== 'react-bootstrap') {
          return;
        }
        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            LEGACY_IMPORTS.has(specifier.imported.name)
          ) {
            context.report({
              node: specifier,
              messageId: 'noGridImport',
              data: { name: specifier.imported.name },
            });
          }
        }
      },

      JSXOpeningElement(node) {
        for (const attribute of node.attributes.filter(isClassAttribute)) {
          check(attribute, attribute.value);
        }
      },

      // A component's default for a class prop: `labelClass = 'col-sm-3'`.
      AssignmentPattern(node) {
        const name = node.left.type === 'Identifier' ? node.left.name : null;
        const key =
          node.parent?.type === 'Property' &&
          node.parent.key.type === 'Identifier'
            ? node.parent.key.name
            : null;
        if (CLASS_PROP.test(key ?? name ?? '')) {
          check(node, node.right);
        }
      },
    };
  },
};
