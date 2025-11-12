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
  return children.some(
    (child) =>
      (child.type === 'JSXText' && child.value.trim()) ||
      child.type === 'JSXExpressionContainer' ||
      (child.type === 'JSXElement' && !isIconComponent(child)),
  );
}

function countIcons(children) {
  return children.filter(isIconComponent).length;
}

function hasIconProp(node, propName) {
  return node.openingElement.attributes?.some(
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
        'Badge with only icon children should use iconOnly prop instead of children.',
      useLeftIcon: 'Badge with text and leading icon should use leftIcon prop.',
      useRightIcon:
        'Badge with text and trailing icon should use rightIcon prop.',
      noMixedIcons: 'Badge should not mix icon props with icon children.',
      redundantIconOnly:
        'Badge with iconOnly prop should not have non-icon children.',
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

        const hasIconOnly = hasIconProp(node, 'iconOnly');
        const hasLeftIcon = hasIconProp(node, 'leftIcon');
        const hasRightIcon = hasIconProp(node, 'rightIcon');

        // Case 1: Badge has iconOnly prop but also has text content
        if (hasIconOnly && hasText) {
          context.report({
            node,
            messageId: 'redundantIconOnly',
          });
          return;
        }

        // Case 2: Badge has icon props but also icon children
        if ((hasLeftIcon || hasRightIcon || hasIconOnly) && iconCount > 0) {
          context.report({
            node,
            messageId: 'noMixedIcons',
          });
          return;
        }

        // Case 3: Badge has only icon children but no iconOnly prop
        if (iconCount > 0 && !hasText && !hasIconOnly) {
          context.report({
            node,
            messageId: 'useIconOnly',
            fix(fixer) {
              return fixer.insertTextAfter(node.name, ' iconOnly');
            },
          });
          return;
        }

        // Case 4: Badge has text + icon children (should use leftIcon/rightIcon)
        if (iconCount > 0 && hasText && !hasLeftIcon && !hasRightIcon) {
          const iconElements = children.filter(isIconComponent);
          const textElements = children.filter(
            (child) => !isIconComponent(child),
          );

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
