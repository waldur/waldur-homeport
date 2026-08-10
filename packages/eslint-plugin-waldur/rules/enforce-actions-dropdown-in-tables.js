/**
 * ESLint rule to enforce ActionsDropdown pattern for table row actions.
 *
 * Table row actions should use the ActionsDropdown component (3-dot menu)
 * with ActionItem children, not standalone buttons.
 *
 * Good:
 *   rowActions={({ row }) => (
 *     <ActionsDropdown row={row}>
 *       <DeleteAction row={row} />
 *     </ActionsDropdown>
 *   )}
 *
 * Bad:
 *   rowActions={({ row }) => (
 *     <DeleteButton row={row} />
 *   )}
 */

// Components that should NOT be used directly in rowActions
// (they should be inside ActionsDropdown as ActionItem instead)
const FORBIDDEN_DIRECT_COMPONENTS = [
  'ActionButton',
  'RowActionButton',
  'CompactRowActionButton',
  'CompactActionButton',
  'IconButton',
  'CompactIconButton',
  'Button', // Bootstrap Button
];

// Components that ARE allowed as direct returns from rowActions
const ALLOWED_WRAPPER_COMPONENTS = [
  'ActionsDropdown',
  'ActionsDropdownComponent',
];

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce ActionsDropdown pattern for table row actions',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      useActionsDropdown:
        'Table row actions should use ActionsDropdown with ActionItem children.\n' +
        'Instead of standalone buttons, wrap actions in ActionsDropdown:\n' +
        '  rowActions={({ row }) => (\n' +
        '    <ActionsDropdown row={row}>\n' +
        '      <YourAction row={row} />\n' +
        '    </ActionsDropdown>\n' +
        '  )}',
      forbiddenComponent:
        '{{component}} should not be used directly in rowActions. ' +
        'Use ActionsDropdown with ActionItem components instead.',
    },
  },

  create(context) {
    /**
     * Get the name of a JSX element
     */
    function getJSXElementName(openingElement) {
      if (!openingElement || !openingElement.name) return null;

      if (openingElement.name.type === 'JSXIdentifier') {
        return openingElement.name.name;
      }
      if (openingElement.name.type === 'JSXMemberExpression') {
        return openingElement.name.property.name;
      }
      return null;
    }

    /**
     * Check the return value of a rowActions function
     */
    function checkReturnValue(node) {
      if (!node) return;

      // null/undefined returns are fine (no actions for this row)
      if (node.type === 'Literal' && node.value === null) return;
      if (node.type === 'Identifier' && node.name === 'null') return;

      // Conditional expressions - check both branches
      if (node.type === 'ConditionalExpression') {
        checkReturnValue(node.consequent);
        checkReturnValue(node.alternate);
        return;
      }

      // Logical expressions (e.g., condition && <Component />)
      if (node.type === 'LogicalExpression') {
        checkReturnValue(node.right);
        return;
      }

      // JSX Fragment - check children
      if (node.type === 'JSXFragment') {
        node.children.forEach((child) => {
          if (child.type === 'JSXElement') {
            checkReturnValue(child);
          }
        });
        return;
      }

      // JSX Element - main check
      if (node.type === 'JSXElement') {
        const elementName = getJSXElementName(node.openingElement);

        // Check if it's a forbidden component used directly
        if (FORBIDDEN_DIRECT_COMPONENTS.includes(elementName)) {
          context.report({
            node,
            messageId: 'forbiddenComponent',
            data: { component: elementName },
          });
          return;
        }

        // If it's not an allowed wrapper and not a custom component ending in "Actions"
        // (which likely wraps ActionsDropdown), warn
        if (
          !ALLOWED_WRAPPER_COMPONENTS.includes(elementName) &&
          !elementName?.endsWith('Actions') &&
          !elementName?.endsWith('RowActions')
        ) {
          // Could be a custom component - don't warn for now
          // The forbidden component check above catches the main cases
        }
      }
    }

    /**
     * Check if this is a rowActions prop on a Table-like component
     */
    function isRowActionsProp(node) {
      if (node.type !== 'JSXAttribute') return false;
      if (!node.name || node.name.name !== 'rowActions') return false;

      // Check if parent is a Table-like component
      const parent = node.parent;
      if (!parent || parent.type !== 'JSXOpeningElement') return false;

      const parentName = getJSXElementName(parent);
      // Match Table, or any component containing "Table" or "List"
      return (
        parentName === 'Table' ||
        parentName?.includes('Table') ||
        parentName?.includes('List')
      );
    }

    return {
      JSXAttribute(node) {
        if (!isRowActionsProp(node)) return;

        const value = node.value;
        if (!value) return;

        // Handle JSXExpressionContainer
        if (value.type === 'JSXExpressionContainer') {
          const expr = value.expression;

          // Arrow function: rowActions={({ row }) => <Component />}
          if (expr.type === 'ArrowFunctionExpression') {
            // Check the body
            if (
              expr.body.type === 'JSXElement' ||
              expr.body.type === 'JSXFragment' ||
              expr.body.type === 'ConditionalExpression' ||
              expr.body.type === 'LogicalExpression'
            ) {
              checkReturnValue(expr.body);
            }
            // Block body - would need to check return statements
            // Skip for now as most rowActions use expression body
          }

          // Direct component reference: rowActions={MyActions}
          if (expr.type === 'Identifier') {
            // Can't easily check what this component returns
            // Trust that components ending in "Actions" are properly implemented
          }
        }
      },
    };
  },
};
