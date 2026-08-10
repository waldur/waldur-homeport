/**
 * ESLint rule to enforce proper Badge icon patterns
 * - Icon-only badges should use iconOnly prop
 * - Badges with text and icons should use leftIcon/rightIcon props
 * - Prevents manual icon placement inside Badge components
 */

function isIconComponent(node) {
  // Check if it's a JSX element that looks like an icon component
  if (node.type !== 'JSXElement') return false;

  const name = node.openingElement?.name?.name;
  if (!name) return false;

  // Common icon patterns
  return (
    name.endsWith('Icon') ||
    name === 'i' ||
    node.openingElement.attributes?.some(
      (attr) =>
        attr.name?.name === 'className' &&
        attr.value?.value?.includes('svg-icon'),
    )
  );
}

function hasTextContent(children) {
  return children.some((child) => {
    if (child.type === 'JSXText' && child.value.trim()) {
      return true;
    }
    if (child.type === 'JSXExpressionContainer') {
      // Check if the expression container contains non-icon content
      const expr = child.expression;
      if (expr.type === 'ConditionalExpression') {
        // For ternary expressions, check if either branch contains non-icon content
        return (
          hasNonIconContent(expr.consequent) ||
          hasNonIconContent(expr.alternate)
        );
      }
      // For other expressions, consider them as text content unless they're simple icon references
      return !isIconReference(expr);
    }
    if (child.type === 'JSXElement' && !isIconComponent(child)) {
      return true;
    }
    return false;
  });
}

function hasNonIconContent(node) {
  if (!node) return false;
  if (node.type === 'JSXElement') {
    return !isIconComponent(node);
  }
  if (
    node.type === 'Literal' &&
    typeof node.value === 'string' &&
    node.value.trim()
  ) {
    return true;
  }
  return false;
}

function isIconReference(node) {
  // Check if this is a simple reference to an icon component
  return (
    node &&
    ((node.type === 'Identifier' && node.name.endsWith('Icon')) ||
      (node.type === 'JSXElement' && isIconComponent(node)))
  );
}

function countIcons(children) {
  let count = 0;
  children.forEach((child) => {
    if (isIconComponent(child)) {
      count++;
    } else if (child.type === 'JSXExpressionContainer') {
      const expr = child.expression;
      if (expr.type === 'ConditionalExpression') {
        // For ternary expressions, count as 1 if both branches are icons
        if (
          (expr.consequent &&
            expr.consequent.type === 'JSXElement' &&
            isIconComponent(expr.consequent)) ||
          (expr.alternate &&
            expr.alternate.type === 'JSXElement' &&
            isIconComponent(expr.alternate))
        ) {
          count++;
        }
      } else if (expr.type === 'JSXElement' && isIconComponent(expr)) {
        count++;
      }
    }
  });
  return count;
}

function hasIconProp(node, propName) {
  return node.attributes?.some(
    (attr) => attr.type === 'JSXAttribute' && attr.name.name === propName,
  );
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce proper Badge icon patterns',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      useIconOnly:
        'Badge with only icon children should use onlyIcon prop instead of children.',
      useLeftIcon: 'Badge with text and leading icon should use leftIcon prop.',
      useRightIcon:
        'Badge with text and trailing icon should use rightIcon prop.',
      noMixedIcons:
        'Badge should not mix leftIcon/rightIcon props with icon children.',
      redundantIconOnly:
        'Badge with onlyIcon prop should not have non-icon children.',
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        // Only check Badge components
        if (node.name?.name !== 'Badge') return;

        // Get the Badge element (including children)
        const badgeElement = node.parent;
        if (badgeElement.type !== 'JSXElement') return;

        const children = badgeElement.children || [];
        const iconCount = countIcons(children);
        const hasText = hasTextContent(children);

        const hasIconOnly = hasIconProp(node, 'onlyIcon');
        const hasLeftIcon = hasIconProp(node, 'leftIcon');
        const hasRightIcon = hasIconProp(node, 'rightIcon');

        // Case 1: Badge has onlyIcon prop but also has text content
        if (hasIconOnly && hasText) {
          context.report({
            node,
            messageId: 'redundantIconOnly',
          });
          return;
        }

        // Case 2: Badge has leftIcon/rightIcon props but also icon children
        // Note: onlyIcon prop is meant to work WITH icon children, so exclude it from this check
        if ((hasLeftIcon || hasRightIcon) && iconCount > 0) {
          context.report({
            node,
            messageId: 'noMixedIcons',
          });
          return;
        }

        // Case 3: Badge has only icon children but no onlyIcon prop
        if (iconCount > 0 && !hasText && !hasIconOnly) {
          context.report({
            node,
            messageId: 'useIconOnly',
            fix(fixer) {
              return fixer.insertTextAfter(node.name, ' onlyIcon');
            },
          });
          return;
        }

        // Case 4: Badge has text + icon children (should use leftIcon/rightIcon)
        if (iconCount > 0 && hasText && !hasLeftIcon && !hasRightIcon) {
          // Determine if icon is at start or end
          const firstChild = children.find(
            (child) => child.type !== 'JSXText' || child.value.trim(),
          );
          const lastChild = [...children]
            .reverse()
            .find((child) => child.type !== 'JSXText' || child.value.trim());

          const iconIsFirst = isIconComponent(firstChild);
          const iconIsLast = isIconComponent(lastChild);

          if (iconIsFirst && !iconIsLast) {
            context.report({
              node,
              messageId: 'useLeftIcon',
            });
          } else if (iconIsLast && !iconIsFirst) {
            context.report({
              node,
              messageId: 'useRightIcon',
            });
          } else {
            // Multiple icons or mixed - suggest leftIcon as default
            context.report({
              node,
              messageId: 'useLeftIcon',
            });
          }
        }
      },
    };
  },
};
