/**
 * ESLint rule to prevent direct import of Bootstrap Button component.
 * Encourages use of Waldur wrapper components (BaseButton, SubmitButton, ...).
 *
 * The sibling rule `no-bootstrap-button-markup` covers the other half — `btn`
 * classes applied by hand to a native `<button>`, which carries no import and
 * so is invisible here. It lives in its own rule because it is reported as a
 * warning while the existing usages are converted, whereas this one is an error.
 */

import { WRAPPERS } from './bootstrap-button-wrappers.js';

// Files that are allowed to import Button directly (wrapper components)
const ALLOWED_FILES = [
  'src/core/buttons/BaseButton.tsx',
  'src/table/ToolbarButton.tsx',
  'src/table/TableFiltersMenu.tsx',
  'src/core/buttons/IconButton.tsx',
  'src/core/SaveButton.tsx',
  'src/modal/CloseDialogButton.tsx',
  // Files using Button as type reference for 'as' prop comparison
  'src/core/ActionItem.tsx',
  'src/marketplace/orders/actions/ApproveByProviderButton.tsx',
  'src/marketplace/orders/actions/RejectByProviderButton.tsx',
  'src/marketplace/orders/actions/MarkAsDoneButton.tsx',
  'src/marketplace/resources/resource-pending/OrderInProgressView.tsx',
  // Uses Button with ButtonGroup and Dropdown (complex Bootstrap pattern)
  'src/marketplace/offerings/actions/OfferingStateActions.tsx',
  'src/navigation/header/confirmation-drawer/PendingConsumerOrders.tsx',
  // Uses Button with 'as="a"' for anchor rendering
  'src/navigation/header/HeroButton.tsx',
  // Uses decorative scroll indicator buttons (not action buttons)
  'src/navigation/Toolbar.tsx',
  // Uses Button as OverlayTrigger child for popover
  'src/table/TableColumnsButton.tsx',
  'src/table/ExpandableRowToolbar.tsx',
];

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prevent direct import of Bootstrap Button component',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null, // Cannot auto-fix as replacement depends on context
    schema: [],
    messages: {
      noDirectBootstrapButton:
        'Avoid importing Button directly from react-bootstrap. Use Waldur wrapper components instead:\n' +
        WRAPPERS,
    },
  },

  create(context) {
    const filename = context.getFilename();
    // Normalize path separators to forward slashes for cross-platform compatibility
    const normalizedFilename = filename.replace(/\\/g, '/');

    // Check if this file is allowed to import Button directly
    const isAllowedFile = ALLOWED_FILES.some(
      (allowedPath) =>
        normalizedFilename.includes(allowedPath) ||
        normalizedFilename.endsWith(allowedPath.replace('src/', '')),
    );

    if (isAllowedFile) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        // Check if importing from react-bootstrap
        if (node.source.value === 'react-bootstrap') {
          // Check if Button is being imported
          const buttonImport = node.specifiers.find(
            (specifier) =>
              specifier.type === 'ImportSpecifier' &&
              specifier.imported &&
              specifier.imported.name === 'Button',
          );

          if (buttonImport) {
            context.report({
              node: buttonImport,
              messageId: 'noDirectBootstrapButton',
            });
          }
        }
      },
    };
  },
};
