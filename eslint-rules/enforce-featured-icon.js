/**
 * ESLint rule to enforce FeaturedIcon component usage over custom icon implementations
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce FeaturedIcon component with solid/size props instead of custom icon styling',
      category: 'Best Practices',
    },
    fixable: null,
    schema: [],
    messages: {
      useFeaturedIconComponent:
        'Use FeaturedIcon component instead of custom icon implementation',
      useFeaturedIconProps:
        'FeaturedIcon should use "solid" and "size" props for consistent styling',
      deprecatedFeaturedIconSize:
        'FeaturedIcon size "{{size}}" should use standard sizes: sm, lg, xl',
    },
  },

  create(context) {
    const standardSizes = ['sm', 'lg', 'xl'];

    return {
      JSXElement(node) {
        const elementName = node.openingElement?.name?.name;

        if (elementName === 'FeaturedIcon') {
          // Check for proper props usage
          const attributes = node.openingElement.attributes || [];
          const props = {};

          attributes.forEach((attr) => {
            if (attr.type === 'JSXAttribute') {
              props[attr.name.name] = attr.value;
            }
          });

          // Check for size prop validation
          if (props.size && props.size.value) {
            const sizeValue = props.size.value;
            if (
              typeof sizeValue === 'string' &&
              !standardSizes.includes(sizeValue)
            ) {
              context.report({
                node: props.size,
                messageId: 'deprecatedFeaturedIconSize',
                data: { size: sizeValue },
              });
            }
          }
        }

        // Check for manual icon implementations that should use FeaturedIcon
        if (elementName === 'div') {
          const classNameAttr = node.openingElement.attributes?.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name.name === 'className',
          );

          if (classNameAttr && classNameAttr.value) {
            let classValue = '';

            if (classNameAttr.value.type === 'Literal') {
              classValue = classNameAttr.value.value;
            } else if (classNameAttr.value.type === 'JSXExpressionContainer') {
              const expr = classNameAttr.value.expression;
              if (expr.type === 'Literal') {
                classValue = expr.value;
              } else if (expr.type === 'TemplateLiteral') {
                // Extract template literal for basic analysis
                classValue = expr.quasis.map((q) => q.value.raw).join('');
              }
            }

            // Detect manual icon styling patterns that should use FeaturedIcon
            const iconPatterns = [
              /border.*circular/i,
              /border-radius.*50%/i,
              /icon.*border.*circle/i,
              /bg-(success|danger|warning|primary|secondary).*icon/i,
              /text-(success|danger|warning|primary|secondary).*border/i,
            ];

            const hasIconPattern = iconPatterns.some(
              (pattern) =>
                typeof classValue === 'string' && pattern.test(classValue),
            );

            // Check if this div contains an icon component (Phosphor icons, etc.)
            const hasIconChild = node.children?.some((child) => {
              if (child.type === 'JSXElement') {
                const childName = child.openingElement?.name?.name;
                // Common icon component patterns
                return (
                  /^[A-Z][a-zA-Z]*Icon$/.test(childName) ||
                  (childName && childName.endsWith('Icon')) ||
                  childName === 'i'
                ); // font icons
              }
              return false;
            });

            if (hasIconPattern && hasIconChild) {
              // Skip if already inside a FeaturedIcon or similar component
              let current = node.parent;
              let isInsideFeaturedIcon = false;

              while (current && current.type === 'JSXElement') {
                if (current.openingElement.name.name === 'FeaturedIcon') {
                  isInsideFeaturedIcon = true;
                  break;
                }
                current = current.parent;
              }

              if (!isInsideFeaturedIcon) {
                context.report({
                  node,
                  messageId: 'useFeaturedIconComponent',
                });
              }
            }
          }
        }

        // Check for icon wrapper patterns that should be FeaturedIcon
        if (elementName === 'div') {
          const styleAttr = node.openingElement.attributes?.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name.name === 'style',
          );

          if (styleAttr && styleAttr.value) {
            // Look for manual styling that mimics FeaturedIcon
            if (
              styleAttr.value.type === 'JSXExpressionContainer' &&
              styleAttr.value.expression.type === 'ObjectExpression'
            ) {
              const styleObj = styleAttr.value.expression;
              const hasCircularBorder = styleObj.properties.some((prop) => {
                if (
                  prop.type === 'Property' &&
                  prop.key.name === 'borderRadius'
                ) {
                  return (
                    prop.value.value === '50%' || prop.value.raw === '"50%"'
                  );
                }
                return false;
              });

              const hasIconChild = node.children?.some((child) => {
                if (child.type === 'JSXElement') {
                  const childName = child.openingElement?.name?.name;
                  return childName && childName.endsWith('Icon');
                }
                return false;
              });

              if (hasCircularBorder && hasIconChild) {
                context.report({
                  node,
                  messageId: 'useFeaturedIconComponent',
                });
              }
            }
          }
        }
      },
    };
  },
};
