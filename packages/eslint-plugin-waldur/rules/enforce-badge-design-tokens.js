/**
 * ESLint rule to enforce Badge design token migration
 * - Migrate bg="secondary" → variant="default" outline
 * - Migrate variant="light-*" → variant="*" outline
 * - Remove text="dark" (handled by design tokens)
 * - Enforce outline for consistent design system usage
 */

const DEPRECATED_BG_VALUES = {
  secondary: { variant: 'default', outline: true },
  'gray-200': { variant: 'default', outline: true },
  info: { variant: 'purple', outline: true },
  warning: { variant: 'warning', outline: true },
  success: { variant: 'success', outline: true },
  danger: { variant: 'danger', outline: true },
  '': { variant: 'default', outline: true }, // Empty bg=""
};

const DEPRECATED_VARIANTS = {
  'light-danger': { variant: 'danger', outline: true },
  'light-warning': { variant: 'warning', outline: true },
  'light-success': { variant: 'success', outline: true },
  'light-info': { variant: 'purple', outline: true },
  'light-primary': { variant: 'primary', outline: true },
  'light-secondary': { variant: 'default', outline: true },
  light: { variant: 'default', outline: true },
};

const DEPRECATED_TEXT_VALUES = ['dark', 'muted', 'light'];

function getPropValue(attr) {
  if (!attr.value) {
    return true; // Boolean prop without value
  }

  if (attr.value.type === 'Literal') {
    return attr.value.value;
  }

  if (attr.value.type === 'JSXExpressionContainer') {
    if (attr.value.expression.type === 'Literal') {
      return attr.value.expression.value;
    }
  }

  return null;
}

function findAttribute(attrs, name) {
  return attrs.find(
    (attr) => attr.type === 'JSXAttribute' && attr.name.name === name,
  );
}

function hasAttribute(attrs, name, value = undefined) {
  const attr = findAttribute(attrs, name);
  if (!attr) return false;

  if (value === undefined) {
    return true;
  }

  return getPropValue(attr) === value;
}

function createAttributeText(name, value) {
  if (value === true) {
    return name;
  }
  return `${name}="${value}"`;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce Badge design token migration',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      deprecatedBg:
        'Badge bg="{{ bg }}" is deprecated. Use variant="{{ variant }}" {{ outline }} instead.',
      deprecatedVariant:
        'Badge variant="{{ variant }}" is deprecated. Use variant="{{ newVariant }}" {{ outline }} instead.',
      deprecatedText:
        'Badge text="{{ text }}" is deprecated. Remove this prop as design tokens handle text color automatically.',
      missingOutline:
        'Badge should use outline prop for consistent design system styling.',
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        // Only check Badge components
        if (node.name?.name !== 'Badge') return;

        const attrs = node.attributes.filter(
          (attr) => attr.type === 'JSXAttribute',
        );
        const sourceCode = context.getSourceCode();

        // Check for deprecated bg prop
        const bgAttr = findAttribute(attrs, 'bg');
        if (bgAttr) {
          const bgValue = getPropValue(bgAttr);
          if (bgValue !== null && DEPRECATED_BG_VALUES[bgValue]) {
            const replacement = DEPRECATED_BG_VALUES[bgValue];

            context.report({
              node: bgAttr,
              messageId: 'deprecatedBg',
              data: {
                bg: bgValue,
                variant: replacement.variant,
                outline: replacement.outline ? 'outline' : '',
              },
              fix(fixer) {
                const fixes = [];

                // Replace bg with variant
                fixes.push(
                  fixer.replaceText(
                    bgAttr,
                    createAttributeText('variant', replacement.variant),
                  ),
                );

                // Add outline prop if needed and not already present
                if (replacement.outline && !hasAttribute(attrs, 'outline')) {
                  fixes.push(fixer.insertTextAfter(bgAttr, ' outline'));
                }

                return fixes;
              },
            });
          }
        }

        // Check for deprecated variant prop
        const variantAttr = findAttribute(attrs, 'variant');
        if (variantAttr) {
          const variantValue = getPropValue(variantAttr);
          if (variantValue && DEPRECATED_VARIANTS[variantValue]) {
            const replacement = DEPRECATED_VARIANTS[variantValue];

            context.report({
              node: variantAttr,
              messageId: 'deprecatedVariant',
              data: {
                variant: variantValue,
                newVariant: replacement.variant,
                outline: replacement.outline ? 'outline' : '',
              },
              fix(fixer) {
                const fixes = [];

                // Replace variant value
                fixes.push(
                  fixer.replaceText(
                    variantAttr,
                    createAttributeText('variant', replacement.variant),
                  ),
                );

                // Add outline prop if needed and not already present
                if (replacement.outline && !hasAttribute(attrs, 'outline')) {
                  fixes.push(fixer.insertTextAfter(variantAttr, ' outline'));
                }

                return fixes;
              },
            });
          }
        }

        // Check for deprecated text prop
        const textAttr = findAttribute(attrs, 'text');
        if (textAttr) {
          const textValue = getPropValue(textAttr);
          if (textValue && DEPRECATED_TEXT_VALUES.includes(textValue)) {
            context.report({
              node: textAttr,
              messageId: 'deprecatedText',
              data: {
                text: textValue,
              },
              fix(fixer) {
                // Remove the text attribute
                const tokenBefore = sourceCode.getTokenBefore(textAttr);
                let start = textAttr.range[0];

                // Include any whitespace before the attribute
                if (tokenBefore && tokenBefore.range[1] < start) {
                  const textBetween = sourceCode
                    .getText()
                    .slice(tokenBefore.range[1], start);
                  if (textBetween.trim() === '') {
                    start = tokenBefore.range[1];
                  }
                }

                return fixer.removeRange([start, textAttr.range[1]]);
              },
            });
          }
        }

        // Check if Badge should have outline prop for design consistency
        const hasVariant = hasAttribute(attrs, 'variant');
        const hasOutline = hasAttribute(attrs, 'outline');
        const hasLight = hasAttribute(attrs, 'light');
        const hasOnlyIcon = hasAttribute(attrs, 'onlyIcon');

        // Suggest outline for Badges that don't have explicit styling props
        if (hasVariant && !hasOutline && !hasLight && !hasOnlyIcon && !bgAttr) {
          const variantValue = getPropValue(variantAttr);
          // Only suggest outline for common variants that benefit from it
          if (
            ['default', 'success', 'danger', 'warning', 'purple'].includes(
              variantValue,
            )
          ) {
            context.report({
              node: variantAttr,
              messageId: 'missingOutline',
              fix(fixer) {
                return fixer.insertTextAfter(variantAttr, ' outline');
              },
            });
          }
        }
      },
    };
  },
};
