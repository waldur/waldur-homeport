/**
 * ESLint rule to enforce rightIcon usage pattern for Badge components
 * - Move trailing interactive elements (like RemoveFilterBadgeButton) to rightIcon prop
 * - Enforce consistent pattern for remove buttons and trailing icons
 */

function isRemoveFilterBadgeButton(node) {
  return (
    node.type === 'JSXElement' &&
    node.openingElement?.name?.name === 'RemoveFilterBadgeButton'
  );
}

function isTrailingInteractiveElement(node) {
  if (!node) return false;

  // Check for RemoveFilterBadgeButton
  if (isRemoveFilterBadgeButton(node)) {
    return true;
  }

  // Check for other interactive elements that should be in rightIcon
  if (node.type === 'JSXElement') {
    const name = node.openingElement?.name?.name;
    const hasOnClick = node.openingElement?.attributes?.some(
      (attr) => attr.name?.name === 'onClick',
    );

    // Button-like elements with onClick handlers
    if ((name === 'button' || name === 'Button') && hasOnClick) {
      return true;
    }

    // Icons with click handlers
    if (name?.endsWith('Icon') && hasOnClick) {
      return true;
    }
  }

  return false;
}

function getLastMeaningfulChild(children) {
  // Find the last child that's not just whitespace
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (child.type === 'JSXText') {
      if (child.value.trim() !== '') {
        return child;
      }
    } else if (
      child.type === 'JSXElement' ||
      child.type === 'JSXExpressionContainer'
    ) {
      return child;
    }
  }
  return null;
}

function hasRightIconProp(node) {
  return node.openingElement?.attributes?.some(
    (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'rightIcon',
  );
}

function getElementText(node, sourceCode) {
  return sourceCode.getText(node);
}

function findTrailingRemoveButton(children) {
  // Look for RemoveFilterBadgeButton in the last few children
  for (
    let i = children.length - 1;
    i >= Math.max(0, children.length - 3);
    i--
  ) {
    const child = children[i];

    if (child.type === 'JSXElement' && isRemoveFilterBadgeButton(child)) {
      return { element: child, index: i };
    }

    // Also check inside JSXExpressionContainer
    if (child.type === 'JSXExpressionContainer') {
      const expr = child.expression;
      if (expr.type === 'LogicalExpression' && expr.operator === '&&') {
        // Check for patterns like {condition && <RemoveFilterBadgeButton />}
        if (
          expr.right.type === 'JSXElement' &&
          isRemoveFilterBadgeButton(expr.right)
        ) {
          return { element: expr.right, index: i, container: child };
        }
      }
      if (expr.type === 'JSXElement' && isRemoveFilterBadgeButton(expr)) {
        return { element: expr, index: i, container: child };
      }
    }
  }

  return null;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce rightIcon usage pattern for Badge components',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      useRightIcon:
        'Trailing interactive elements should use rightIcon prop instead of children. Move {{ elementName }} to rightIcon.',
      useRightIconForRemoveButton:
        'RemoveFilterBadgeButton should be in rightIcon prop, not as a child element.',
    },
  },

  create(context) {
    return {
      JSXElement(node) {
        // Only check Badge components
        if (node.openingElement?.name?.name !== 'Badge') return;

        const children = node.children || [];
        if (children.length === 0) return;

        // Skip if Badge already has rightIcon prop
        if (hasRightIconProp(node)) return;

        const sourceCode = context.getSourceCode();

        // Check for trailing RemoveFilterBadgeButton specifically
        const removeButtonInfo = findTrailingRemoveButton(children);
        if (removeButtonInfo) {
          context.report({
            node: removeButtonInfo.container || removeButtonInfo.element,
            messageId: 'useRightIconForRemoveButton',
            fix(fixer) {
              const fixes = [];
              const elementText = getElementText(
                removeButtonInfo.element,
                sourceCode,
              );

              // Add rightIcon prop to opening element
              const openingElement = node.openingElement;
              const insertLocation = openingElement.name;
              fixes.push(
                fixer.insertTextAfter(
                  insertLocation,
                  ` rightIcon={${elementText}}`,
                ),
              );

              // Remove the element from children
              if (removeButtonInfo.container) {
                // Remove the entire expression container
                fixes.push(fixer.remove(removeButtonInfo.container));
              } else {
                // Remove just the element and any surrounding whitespace
                let start = removeButtonInfo.element.range[0];
                let end = removeButtonInfo.element.range[1];

                // Include preceding whitespace if this is the only thing on the line
                const prevSibling = children[removeButtonInfo.index - 1];
                if (prevSibling && prevSibling.type === 'JSXText') {
                  const prevText = prevSibling.value;
                  if (prevText.trim() === '' && prevText.includes('\n')) {
                    start = prevSibling.range[0];
                  }
                }

                fixes.push(fixer.removeRange([start, end]));
              }

              return fixes;
            },
          });
          return;
        }

        // Check for other trailing interactive elements
        const lastChild = getLastMeaningfulChild(children);
        if (lastChild && lastChild.type === 'JSXElement') {
          if (isTrailingInteractiveElement(lastChild)) {
            const elementName =
              lastChild.openingElement?.name?.name || 'element';

            context.report({
              node: lastChild,
              messageId: 'useRightIcon',
              data: {
                elementName,
              },
              fix(fixer) {
                const fixes = [];
                const elementText = getElementText(lastChild, sourceCode);

                // Add rightIcon prop to opening element
                const openingElement = node.openingElement;
                const insertLocation = openingElement.name;
                fixes.push(
                  fixer.insertTextAfter(
                    insertLocation,
                    ` rightIcon={${elementText}}`,
                  ),
                );

                // Remove the element from children
                fixes.push(fixer.remove(lastChild));

                return fixes;
              },
            });
          }
        }
      },
    };
  },
};
