/**
 * ESLint rule steering Bootstrap alerts towards Waldur's AlertItem.
 *
 * Two shapes are reported: `import { Alert } from 'react-bootstrap'`, and
 * `<div className="alert alert-warning">` — the hand-rolled form, which carries
 * no import and so used to slip through the rule entirely.
 *
 * Bootstrap's Alert paints its own colours rather than the design tokens, so a
 * screen using it reads as foreign next to the rest of the portal. AlertItem
 * carries the themed info/warning/error variants and the matching FeaturedIcon.
 *
 * Reported as a warning: the tree still has dozens of Alert usages, and
 * converting them is a per-screen judgement rather than a mechanical swap. The
 * rule is here to steer new code; the count can be driven down before this is
 * promoted to an error.
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
  isNativeElement,
} from './class-name-tokens.js';

const RATIONALE =
  '  Bootstrap alerts render their own colours instead of the design tokens,\n' +
  '  so the result looks foreign next to the rest of the portal.\n' +
  "  AlertItem takes title, body and variant ('info' | 'warning' | 'error').";

// AlertItem itself, and places where a bare Bootstrap alert is deliberate.
const ALLOWED_FILES = ['src/core/AlertItem.tsx'];

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer the themed AlertItem over react-bootstrap Alert so alerts follow the design tokens',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      preferAlertItem:
        "Prefer AlertItem from '@/core/AlertItem' over react-bootstrap's Alert.\n" +
        RATIONALE,
      preferAlertItemOverMarkup:
        'Prefer AlertItem from \'@/core/AlertItem\' over a hand-rolled <{{ element }} className="alert">.\n' +
        RATIONALE,
    },
  },

  create(context) {
    const filename = context.getFilename().replace(/\\/g, '/');
    if (ALLOWED_FILES.some((allowed) => filename.includes(allowed))) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'react-bootstrap') {
          return;
        }
        const alertImport = node.specifiers.find(
          (specifier) =>
            specifier.type === 'ImportSpecifier' &&
            specifier.imported &&
            specifier.imported.name === 'Alert',
        );
        if (alertImport) {
          context.report({ node: alertImport, messageId: 'preferAlertItem' });
        }
      },

      JSXOpeningElement(node) {
        // Deliberately no tag filter, unlike `no-bootstrap-button-markup`'s
        // BUTTON_ELEMENTS: Bootstrap's `.alert` is a plain container style that
        // reads the same on a div, a span or a p, whereas `.btn` only means a
        // button on the handful of elements Bootstrap styles as one.
        if (!isNativeElement(node)) {
          return;
        }
        // Exact token: AlertItem's own `alert-icon` / `alert-actions` and
        // Bootstrap's `alert-heading` are inner parts, not the alert container.
        if (!getClassNameTokens(node).has('alert')) {
          return;
        }
        context.report({
          node: getClassNameAttribute(node) || node,
          messageId: 'preferAlertItemOverMarkup',
          data: { element: node.name.name },
        });
      },
    };
  },
};
