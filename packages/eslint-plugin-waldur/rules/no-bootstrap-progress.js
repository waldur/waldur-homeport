/**
 * ESLint rule keeping progress bars on waldur-ui's `Progress`.
 *
 * Every progress bar is now a waldur-ui `Progress` (or `PercentProgress`,
 * which wraps it), and the Bootstrap/Metronic `.progress` stylesheet they used
 * to need has been deleted.
 *
 * A `progress`, `progress-bar*` or `progress-themed` class token on any
 * element is reported, which now styles nothing.
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
} from './class-name-tokens.js';

const LEGACY_CLASS = /^(progress|progress-bar(-.+)?|progress-themed)$/;

const REPLACEMENT =
  "  Use waldur-ui's Progress:\n" +
  "    import { Progress } from 'waldur-ui';\n" +
  '    <Progress value={used} max={limit} variant="success" />\n' +
  '  or <Progress segments={[…]} /> to stack, <Progress indeterminate /> for an unknown amount.';

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent progress classes; use waldur-ui Progress',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noProgressClass:
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
              messageId: 'noProgressClass',
              data: { token },
            });
            break;
          }
        }
      },
    };
  },
};
