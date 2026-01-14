/**
 * ESLint rule to prevent direct import of Bootstrap DropdownButton component
 * Encourages use of Waldur wrapper components (ActionDropdownButton, CompactActionDropdownButton)
 */

// Files that are allowed to import DropdownButton directly (wrapper components)
const ALLOWED_FILES = ['src/table/ActionDropdownButton.tsx'];

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prevent direct import of Bootstrap DropdownButton component',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null, // Cannot auto-fix as replacement depends on context
    schema: [],
    messages: {
      noDirectBootstrapDropdownButton:
        'Avoid importing DropdownButton directly from react-bootstrap. Use Waldur wrapper components instead:\n' +
        '  - ActionDropdownButton: for panel/card header dropdown menus (large size)\n' +
        '  - CompactActionDropdownButton: for inline contexts like table cells (small size)\n' +
        'Import from @waldur/table/ActionDropdownButton',
    },
  },

  create(context) {
    const filename = context.getFilename();
    // Normalize path separators to forward slashes for cross-platform compatibility
    const normalizedFilename = filename.replace(/\\/g, '/');

    // Check if this file is allowed to import DropdownButton directly
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
          // Check if DropdownButton is being imported
          const dropdownButtonImport = node.specifiers.find(
            (specifier) =>
              specifier.type === 'ImportSpecifier' &&
              specifier.imported &&
              specifier.imported.name === 'DropdownButton',
          );

          if (dropdownButtonImport) {
            context.report({
              node: dropdownButtonImport,
              messageId: 'noDirectBootstrapDropdownButton',
            });
          }
        }
      },
    };
  },
};
