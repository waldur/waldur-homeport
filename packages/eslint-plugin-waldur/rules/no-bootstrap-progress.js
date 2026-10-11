/**
 * ESLint rule keeping progress bars on waldur-ui's `Progress`.
 *
 * Every progress bar is now a waldur-ui `Progress` (or `PercentProgress`,
 * which wraps it), and the Bootstrap/Metronic `.progress` stylesheet they used
 * to need has been deleted. So both ways back to the old look are reported:
 *
 * - react-bootstrap's `ProgressBar`, by name or by deep path;
 * - a `progress`, `progress-bar*` or `progress-themed` class token on any
 *   element, which now styles nothing.
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
      description:
        'Prevent react-bootstrap ProgressBar and progress classes; use waldur-ui Progress',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noProgressImport: "Avoid react-bootstrap's ProgressBar.\n" + REPLACEMENT,
      noProgressClass:
        'The "{{ token }}" class no longer has any styles.\n' + REPLACEMENT,
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source === 'react-bootstrap/ProgressBar') {
          context.report({ node, messageId: 'noProgressImport' });
          return;
        }
        if (source !== 'react-bootstrap') {
          return;
        }
        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.name === 'ProgressBar'
          ) {
            context.report({ node: specifier, messageId: 'noProgressImport' });
          }
        }
      },

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
