/**
 * ESLint rule keeping checkboxes, radios and switches on waldur-ui.
 *
 * Every one of them is now a waldur-ui `Checkbox`, `Radio` or `Switch`
 * (with their own `label` prop), and the Bootstrap/Metronic `.form-check`
 * stylesheet they used to need has been deleted.
 *
 * A `form-check*`, `form-switch*` or `btn-check` class token on any element is reported,
 * which now styles nothing.
 *
 * This replaces `enforce-formcheck-components`, which pushed the other way
 * (towards `FormCheck`).
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
} from './class-name-tokens.js';

const LEGACY_CLASS = /^(form-(check|switch)(-|$)|btn-check$)/;

const REPLACEMENT =
  "  Use waldur-ui's Checkbox, Radio, Switch or RadioGroup:\n" +
  "    import { Checkbox } from 'waldur-ui';\n" +
  '    <Checkbox label={…} checked={on} onCheckedChange={setOn} />';

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent form-check classes; use waldur-ui Checkbox, Radio, Switch and RadioGroup',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noFormCheckClass:
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
              messageId: 'noFormCheckClass',
              data: { token },
            });
            break;
          }
        }
      },
    };
  },
};
