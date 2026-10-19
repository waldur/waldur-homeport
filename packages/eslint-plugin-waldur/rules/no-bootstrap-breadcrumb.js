/**
 * ESLint rule keeping breadcrumbs on waldur-ui's `Breadcrumb`.
 *
 * Every breadcrumb trail is now built using waldur-ui's `Breadcrumb` primitives
 * (or the application header Breadcrumbs component), and the Bootstrap/Metronic
 * `.breadcrumb` stylesheet has been deleted. Both legacy avenues are reported:
 *
 * - react-bootstrap's `Breadcrumb` or `BreadcrumbItem`, by named or deep-path import;
 * - a `breadcrumb`, `breadcrumb-container`, `breadcrumb-item`, `breadcrumb-item-static`,
 *   `breadcrumb-item-static-label`, `breadcrumb-text` or `breadcrumb-back` class token
 *   on any element, which now styles nothing.
 *
 * `breadcrumb-mobile` is allowed: it is the mobile header's layout hook for the
 * fixed breadcrumb bar, not breadcrumb styling, and is still defined.
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
} from './class-name-tokens.js';

const LEGACY_IMPORTS = new Set(['Breadcrumb', 'BreadcrumbItem']);

const LEGACY_CLASS =
  /^(breadcrumb|breadcrumb-container|breadcrumb-item(-static(-label)?)?|breadcrumb-text|breadcrumb-back)$/;

const REPLACEMENT =
  "  Use waldur-ui's BreadcrumbTrail for a whole trail, or the Breadcrumb primitives:\n" +
  "    import { BreadcrumbTrail } from 'waldur-ui';\n" +
  "    import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from 'waldur-ui';\n" +
  '  See docs/breadcrumbs.md.';

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent react-bootstrap Breadcrumb and legacy breadcrumb classes; use waldur-ui Breadcrumb',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noBreadcrumbImport: "Avoid react-bootstrap's {{ name }}.\n" + REPLACEMENT,
      noBreadcrumbClass:
        'The "{{ token }}" class no longer has any styles.\n' + REPLACEMENT,
    },
  },

  create(context) {
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
              messageId: 'noBreadcrumbImport',
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
              messageId: 'noBreadcrumbImport',
              data: { name: specifier.imported.name },
            });
          }
        }
      },

      JSXOpeningElement(node) {
        for (const token of getClassNameTokens(node)) {
          if (LEGACY_CLASS.test(token)) {
            context.report({
              node: getClassNameAttribute(node) || node,
              messageId: 'noBreadcrumbClass',
              data: { token },
            });
            break;
          }
        }
      },
    };
  },
};
