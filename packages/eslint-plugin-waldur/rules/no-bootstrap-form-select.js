/**
 * ESLint rule keeping native selects on waldur-ui's NativeSelect.
 *
 * A browser `<select>` is a waldur-ui `NativeSelect` (the browser's popup and
 * keyboard, drawn like an Input, with a caret icon). So the ways back to
 * Bootstrap's `.form-select` are reported:
 *
 * - a `form-select*` class token on any element.
 *
 * For a searchable or multi-value list use waldur-ui's `Select` instead.
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
} from './class-name-tokens.js';

const LEGACY_CLASS = /^form-select(-|$)/;

const REPLACEMENT =
  "  Use waldur-ui's NativeSelect (or Select for a searchable list):\n" +
  "    import { NativeSelect } from 'waldur-ui';\n" +
  '    <NativeSelect value={v} onChange={…}><option value="a">A</option></NativeSelect>';

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent form-select classes; use waldur-ui NativeSelect',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noFormSelectClass:
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
              messageId: 'noFormSelectClass',
              data: { token },
            });
            break;
          }
        }
      },
    };
  },
};
