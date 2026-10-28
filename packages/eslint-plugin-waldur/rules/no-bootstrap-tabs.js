/**
 * ESLint rule keeping tab bars on waldur-ui.
 *
 * Every tab bar is a waldur-ui `Tabs` (state-driven panels) or `TabNav`
 * (router-driven, no panels), and the Bootstrap/Metronic `.nav` stylesheet
 * they used to need has been deleted. So both ways back to the old markup are
 * reported:
 *
 * - a `nav`, `nav-item`, `nav-link`, `nav-tabs`, `nav-pills`, `nav-line-tabs`
 *   (and similar) class token on any element, which now styles nothing;
 * - `@radix-ui/react-tabs` outside waldur-ui's own Tabs, which bypasses its
 *   look, mount modes and defaults (use `TabsList variant="segmented"` for
 *   the segmented look).
 *
 * This replaces `enforce-nav-tabs-pattern`, which pushed the other way
 * (towards `nav-line-tabs`).
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
} from './class-name-tokens.js';

const LEGACY_CLASS =
  /^(nav|nav-(item|link|tabs|pills|stretch|fill|justified|group(-.*)?|line-tabs(-2x)?))$/;

const REPLACEMENT =
  "  Use waldur-ui's Tabs when the page holds the panels, TabNav when the router does:\n" +
  "    import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';\n" +
  "    import { TabNav, TabNavList, TabNavItem } from 'waldur-ui';";

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent nav-* classes and raw radix tabs; use waldur-ui Tabs and TabNav',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noRadixTabs:
        'Use waldur-ui\'s Tabs instead of @radix-ui/react-tabs (TabsList variant="segmented" for the segmented look).',
      noNavClass:
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
        if (source === '@radix-ui/react-tabs') {
          const filename = context.filename ?? context.getFilename();
          if (!/packages[\\/]ui[\\/]src[\\/]Tabs[\\/]/.test(filename)) {
            context.report({ node, messageId: 'noRadixTabs' });
          }
        }
      },

      JSXOpeningElement(node) {
        for (const token of getClassNameTokens(node)) {
          if (LEGACY_CLASS.test(token)) {
            context.report({
              node: getClassNameAttribute(node) || node,
              messageId: 'noNavClass',
              data: { token },
            });
            break;
          }
        }
      },
    };
  },
};
