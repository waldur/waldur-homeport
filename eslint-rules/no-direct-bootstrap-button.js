/**
 * ESLint rule to prevent direct import of Bootstrap Button component
 * Encourages use of Waldur wrapper components (SubmitButton, ActionButton, etc.)
 */

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
  'src/navigation/header/confirmation-drawer/PendingConsumerOrders.tsx',
  // Uses Button with 'as="a"' for anchor rendering
  'src/navigation/header/HeroButton.tsx',
  // Uses decorative scroll indicator buttons (not action buttons)
  'src/navigation/Toolbar.tsx',
  // Uses Button as OverlayTrigger child for popover
  'src/table/TableColumnsButton.tsx',
];

const RECOMMENDED_COMPONENTS = {
  'form submit/action buttons': 'SubmitButton from @waldur/form',
  'icon-only buttons': 'IconButton from @waldur/core/buttons/IconButton',
  'toolbar buttons': 'ToolbarButton from @waldur/table/ToolbarButton',
  'table row actions':
    'ActionButton or RowActionButton from @waldur/table/ActionButton',
  'dialog cancel/close':
    'CloseDialogButton from @waldur/modal/CloseDialogButton',
  'create/edit/delete modals':
    'CreateModalButton, EditModalButton, DeleteButton from @waldur/core/buttons',
};

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
        '  - SubmitButton: for form submit and action buttons\n' +
        '  - IconButton: for icon-only buttons with tooltips\n' +
        '  - ToolbarButton: for table/panel toolbar buttons\n' +
        '  - ActionButton: for table row actions\n' +
        '  - CloseDialogButton: for modal cancel/close buttons',
    },
  },

  create(context) {
    const filename = context.getFilename();

    // Check if this file is allowed to import Button directly
    const isAllowedFile = ALLOWED_FILES.some(
      (allowedPath) =>
        filename.includes(allowedPath) ||
        filename.endsWith(allowedPath.replace('src/', '')),
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
