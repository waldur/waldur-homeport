/**
 * ESLint rule steering react-bootstrap's Alert towards Waldur's AlertItem.
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
        '  Bootstrap Alert renders its own colours instead of the design tokens,\n' +
        '  so the result looks foreign next to the rest of the portal.\n' +
        "  AlertItem takes title, body and variant ('info' | 'warning' | 'error').",
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
    };
  },
};
