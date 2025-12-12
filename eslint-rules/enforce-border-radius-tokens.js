/**
 * ESLint rule to enforce border radius design tokens
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce border radius tokens instead of hardcoded values',
      category: 'Best Practices',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useBorderRadiusToken:
        'Use border radius token {{newToken}} instead of {{oldValue}}',
    },
  },

  create(context) {
    const borderRadiusTokens = {
      // CSS property values
      'border-radius: $border-radius-xs': 'border-radius: $border-radius-xs',
      'border-radius: $border-radius-sm': 'border-radius: $border-radius-sm',
      'border-radius: $border-radius': 'border-radius: $border-radius', // or $border-radius-lg
      'border-radius: $border-radius-xl': 'border-radius: $border-radius-xl',

      // Individual corner properties
      'border-top-left-radius: $border-radius-xs':
        'border-top-left-radius: $border-radius-xs',
      'border-top-right-radius: $border-radius-xs':
        'border-top-right-radius: $border-radius-xs',
      'border-bottom-left-radius: $border-radius-xs':
        'border-bottom-left-radius: $border-radius-xs',
      'border-bottom-right-radius: $border-radius-xs':
        'border-bottom-right-radius: $border-radius-xs',

      'border-top-left-radius: $border-radius-sm':
        'border-top-left-radius: $border-radius-sm',
      'border-top-right-radius: $border-radius-sm':
        'border-top-right-radius: $border-radius-sm',
      'border-bottom-left-radius: $border-radius-sm':
        'border-bottom-left-radius: $border-radius-sm',
      'border-bottom-right-radius: $border-radius-sm':
        'border-bottom-right-radius: $border-radius-sm',

      'border-top-left-radius: $border-radius':
        'border-top-left-radius: $border-radius',
      'border-top-right-radius: $border-radius':
        'border-top-right-radius: $border-radius',
      'border-bottom-left-radius: $border-radius':
        'border-bottom-left-radius: $border-radius',
      'border-bottom-right-radius: $border-radius':
        'border-bottom-right-radius: $border-radius',

      'border-top-left-radius: $border-radius-xl':
        'border-top-left-radius: $border-radius-xl',
      'border-top-right-radius: $border-radius-xl':
        'border-top-right-radius: $border-radius-xl',
      'border-bottom-left-radius: $border-radius-xl':
        'border-bottom-left-radius: $border-radius-xl',
      'border-bottom-right-radius: $border-radius-xl':
        'border-bottom-right-radius: $border-radius-xl',
    };
    const borderRadiusRawValues = {
      // Raw values (for CSS-in-JS)
      '4px': '$border-radius-xs',
      '6px': '$border-radius-sm',
      '8px': '$border-radius', // or $border-radius-lg
      '12px': '$border-radius-xl',
    };

    const allowedValues = [
      '0',
      '50%', // For circular elements
      'inherit',
      'initial',
      'unset',
      'auto',
    ];

    function isBorderRadiusProperty(propertyName) {
      const borderRadiusProps = [
        'borderRadius',
        'borderTopLeftRadius',
        'borderTopRightRadius',
        'borderBottomLeftRadius',
        'borderBottomRightRadius',
        'border-radius',
        'border-top-left-radius',
        'border-top-right-radius',
        'border-bottom-left-radius',
        'border-bottom-right-radius',
      ];

      return borderRadiusProps.includes(propertyName);
    }

    function checkForBorderRadiusValues(node, value, styleContext = '') {
      if (typeof value !== 'string') return;

      // Skip if already using tokens or allowed values
      if (
        value.includes('$') ||
        value.includes('var(--') ||
        allowedValues.some((allowed) => value.includes(allowed))
      ) {
        return;
      }

      // Check CSS property: value patterns
      Object.entries(borderRadiusTokens).forEach(([oldValue, newToken]) => {
        if (value.includes(oldValue)) {
          context.report({
            node,
            messageId: 'useBorderRadiusToken',
            data: { oldValue, newToken },
            fix(fixer) {
              const newValue = value.replace(oldValue, newToken);
              if (node.type === 'Literal') {
                return fixer.replaceText(node, `"${newValue}"`);
              } else if (node.type === 'TemplateLiteral') {
                return fixer.replaceText(node, `\`${newValue}\``);
              }
              return null;
            },
          });
        }
      });

      // Check for standalone border radius values in specific contexts
      if (styleContext === 'borderRadius') {
        const pixelValues = ['4px', '6px', '8px', '12px'];
        pixelValues.forEach((pixelValue) => {
          if (value === pixelValue) {
            const token = borderRadiusRawValues[pixelValue];
            context.report({
              node,
              messageId: 'useBorderRadiusToken',
              data: { oldValue: pixelValue, newToken: token },
              fix(fixer) {
                if (node.type === 'Literal') {
                  return fixer.replaceText(node, `"${token}"`);
                }
                return null;
              },
            });
          }
        });
      }
    }

    return {
      Literal(node) {
        checkForBorderRadiusValues(node, node.value);
      },

      TemplateLiteral(node) {
        node.quasis.forEach((quasi) => {
          if (quasi.value && quasi.value.raw) {
            checkForBorderRadiusValues(node, quasi.value.raw);
          }
        });
      },

      // Check CSS-in-JS object properties
      Property(node) {
        if (node.value && node.value.type === 'Literal' && node.key) {
          const propertyName =
            node.key.name ||
            (node.key.type === 'Literal' ? node.key.value : '');

          if (isBorderRadiusProperty(propertyName)) {
            checkForBorderRadiusValues(
              node.value,
              node.value.value,
              'borderRadius',
            );
          }
        }
      },

      // Check styled-components template literals
      TaggedTemplateExpression(node) {
        if (
          node.tag &&
          (node.tag.name === 'css' ||
            (node.tag.type === 'MemberExpression' &&
              node.tag.property &&
              node.tag.property.name))
        ) {
          if (node.quasi) {
            node.quasi.quasis.forEach((quasi) => {
              if (quasi.value && quasi.value.raw) {
                checkForBorderRadiusValues(node, quasi.value.raw);
              }
            });
          }
        }
      },

      // Check className attributes for potential hardcoded radius utilities
      JSXAttribute(node) {
        if (
          node.name.name === 'className' &&
          node.value &&
          node.value.type === 'Literal'
        ) {
          const classValue = node.value.value;

          if (typeof classValue === 'string') {
            // Look for potential custom radius classes that should use tokens
            const customRadiusPatterns = [
              /rounded-\d+/,
              /radius-\d+/,
              /br-\d+/,
            ];
            // Allowed patterns for whitelisted radius classes
            const allowedRadiusPatterns = [
              /^rounded-0$/, // exactly 'rounded-0'
              /^menu-rounded-\w+$/, // e.g. menu-rounded-0
            ];

            classValue.split(/\s+/).forEach((cls) => {
              // Skip allowed patterns
              if (allowedRadiusPatterns.some((pat) => pat.test(cls))) return;
              customRadiusPatterns.forEach((pattern) => {
                if (pattern.test(cls)) {
                  context.report({
                    node: node.value,
                    messageId: 'useBorderRadiusToken',
                    data: {
                      oldValue: `class="${cls}"`,
                      newToken:
                        'Consider using $border-radius-* tokens in SCSS instead',
                    },
                  });
                }
              });
            });
          }
        }
      },
    };
  },
};
