/**
 * ESLint rule keeping breadcrumbs on waldur-ui's `Breadcrumb`.
 *
 * Every breadcrumb trail is now built using waldur-ui's `Breadcrumb` primitives
 * (or the application header Breadcrumbs component), and the Bootstrap/Metronic
 * `.breadcrumb` stylesheet has been deleted.
 *
 * A `breadcrumb`, `breadcrumb-container`, `breadcrumb-item`, `breadcrumb-item-static`,
 * `breadcrumb-item-static-label`, `breadcrumb-text` or `breadcrumb-back` class token
 * on any element is reported, which now styles nothing.
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
} from './class-name-tokens.js';

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
        'Prevent legacy breadcrumb classes; use waldur-ui Breadcrumb',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noBreadcrumbClass:
        'The "{{ token }}" class no longer has any styles.\n' + REPLACEMENT,
    },
  },

  create(context) {
    return {
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
