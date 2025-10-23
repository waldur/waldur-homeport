/**
 * ESLint rule to enforce design token button variants
 * Prevents usage of deprecated hard-coded button variants
 */

const DEPRECATED_BUTTON_VARIANTS = [
  'btn-outline-default',
  'btn-active-light-danger',
  'btn-active-light-primary',
  'btn-active-secondary',
  'btn-light-danger',
  'btn-outline-danger',
  'btn-outline-warning',
  'outline btn-outline-default',
  'outline',
  'light',
  'light-danger',
  'active-light-danger',
  'active-light-primary',
  'active-secondary',
  'outline-default',
  'outline-danger',
  'outline-warning',
];

const RECOMMENDED_VARIANTS = {
  'btn-outline-default': 'tertiary',
  'outline btn-outline-default': 'tertiary',
  outline: 'tertiary',
  'outline-default': 'tertiary',
  'btn-active-light-danger': 'text-danger',
  'active-light-danger': 'text-danger',
  'btn-light-danger': 'danger',
  'light-danger': 'danger',
  light: 'tertiary',
  'btn-active-light-primary': 'text-secondary',
  'active-light-primary': 'text-secondary',
  'btn-active-secondary': 'text-primary',
  'active-secondary': 'text-primary',
  'btn-outline-danger': 'danger',
  'outline-danger': 'danger',
  'btn-outline-warning': 'warning',
  'outline-warning': 'warning',
};

const DEPRECATED_CLASS_NAMES = [
  'btn-outline',
  'btn-outline-default',
  'btn-active-light-danger',
  'btn-active-light-primary',
  'btn-active-secondary',
  'btn-light-danger',
  'btn-outline-danger',
  'btn-outline-warning',
  'btn-icon-danger',
  'btn-icon-primary',
  'btn-text-primary',
  'btn-text-dark',
  'btn-text-grey-500',
  'btn-active-color-primary',
];

const CLASS_NAME_REPLACEMENTS = {
  'btn-outline-default': 'btn-tertiary',
  'btn-active-light-danger': 'btn-text-danger',
  'btn-active-light-primary': 'btn-text-secondary',
  'btn-active-secondary': 'btn-text-primary',
  'btn-light-danger': 'btn-danger',
  'btn-outline-danger': 'btn-danger',
  'btn-outline-warning': 'btn-warning',
  'btn-text-primary': '', // Remove this class as it's handled by variant
  'btn-text-dark': '', // Remove this class
  'btn-text-grey-500': '', // Remove this class
  'btn-icon-danger': '', // Remove this class
  'btn-icon-primary': '', // Remove this class
  'btn-active-color-primary': '', // Remove this class
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce design token button variants',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      deprecatedVariant:
        'Button variant "{{ variant }}" is deprecated. Use "{{ recommended }}" instead.',
      deprecatedClassName:
        'Button className "{{ className }}" contains deprecated classes. Use design token variants instead.',
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        // Check Button components
        if (node.name && node.name.name === 'Button') {
          // Check variant prop
          const variantAttr = node.attributes.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name.name === 'variant',
          );

          if (variantAttr && variantAttr.value) {
            let variantValue = '';

            if (variantAttr.value.type === 'Literal') {
              variantValue = variantAttr.value.value;
            } else if (
              variantAttr.value.type === 'JSXExpressionContainer' &&
              variantAttr.value.expression.type === 'Literal'
            ) {
              variantValue = variantAttr.value.expression.value;
            }

            if (DEPRECATED_BUTTON_VARIANTS.includes(variantValue)) {
              const recommended =
                RECOMMENDED_VARIANTS[variantValue] || 'a design token variant';
              context.report({
                node: variantAttr,
                messageId: 'deprecatedVariant',
                data: {
                  variant: variantValue,
                  recommended,
                },
                fix(fixer) {
                  if (RECOMMENDED_VARIANTS[variantValue]) {
                    const newValue = `"${RECOMMENDED_VARIANTS[variantValue]}"`;
                    return fixer.replaceText(variantAttr.value, newValue);
                  }
                  return null;
                },
              });
            }
          }

          // Check className prop for deprecated classes
          const classNameAttr = node.attributes.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name.name === 'className',
          );

          if (classNameAttr && classNameAttr.value) {
            let classNameValue = '';

            if (classNameAttr.value.type === 'Literal') {
              classNameValue = classNameAttr.value.value;
            } else if (
              classNameAttr.value.type === 'JSXExpressionContainer' &&
              classNameAttr.value.expression.type === 'Literal'
            ) {
              classNameValue = classNameAttr.value.expression.value;
            }

            const hasDeprecatedClass = DEPRECATED_CLASS_NAMES.some(
              (deprecatedClass) => classNameValue.includes(deprecatedClass),
            );

            if (hasDeprecatedClass) {
              context.report({
                node: classNameAttr,
                messageId: 'deprecatedClassName',
                data: {
                  className: classNameValue,
                },
                fix(fixer) {
                  // Try to auto-fix simple className replacements
                  let newClassName = classNameValue;
                  let hasChanges = false;

                  for (const [deprecated, replacement] of Object.entries(
                    CLASS_NAME_REPLACEMENTS,
                  )) {
                    if (newClassName.includes(deprecated)) {
                      if (replacement === '') {
                        // Remove the deprecated class
                        newClassName = newClassName
                          .replace(new RegExp(`\\b${deprecated}\\b`, 'g'), '')
                          .replace(/\s+/g, ' ')
                          .trim();
                      } else {
                        // Replace with new class
                        newClassName = newClassName.replace(
                          new RegExp(`\\b${deprecated}\\b`, 'g'),
                          replacement,
                        );
                      }
                      hasChanges = true;
                    }
                  }

                  if (hasChanges && classNameAttr.value.type === 'Literal') {
                    return fixer.replaceText(
                      classNameAttr.value,
                      `"${newClassName}"`,
                    );
                  }
                  return null;
                },
              });
            }
          }
        }

        // Check className prop on any element for button-related deprecated classes
        if (node.name && node.name.name !== 'Button') {
          const classNameAttr = node.attributes.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name.name === 'className',
          );

          if (classNameAttr && classNameAttr.value) {
            let classNameValue = '';

            if (classNameAttr.value.type === 'Literal') {
              classNameValue = classNameAttr.value.value;
            } else if (
              classNameAttr.value.type === 'JSXExpressionContainer' &&
              classNameAttr.value.expression.type === 'Literal'
            ) {
              classNameValue = classNameAttr.value.expression.value;
            }

            // Only check if it contains 'btn' to avoid false positives
            if (classNameValue.includes('btn')) {
              const hasDeprecatedClass = DEPRECATED_CLASS_NAMES.some(
                (deprecatedClass) => classNameValue.includes(deprecatedClass),
              );

              if (hasDeprecatedClass) {
                context.report({
                  node: classNameAttr,
                  messageId: 'deprecatedClassName',
                  data: {
                    className: classNameValue,
                  },
                  fix(fixer) {
                    // Try to auto-fix simple className replacements
                    let newClassName = classNameValue;
                    let hasChanges = false;

                    for (const [deprecated, replacement] of Object.entries(
                      CLASS_NAME_REPLACEMENTS,
                    )) {
                      if (newClassName.includes(deprecated)) {
                        if (replacement === '') {
                          // Remove the deprecated class
                          newClassName = newClassName
                            .replace(new RegExp(`\\b${deprecated}\\b`, 'g'), '')
                            .replace(/\s+/g, ' ')
                            .trim();
                        } else {
                          // Replace with new class
                          newClassName = newClassName.replace(
                            new RegExp(`\\b${deprecated}\\b`, 'g'),
                            replacement,
                          );
                        }
                        hasChanges = true;
                      }
                    }

                    if (hasChanges && classNameAttr.value.type === 'Literal') {
                      return fixer.replaceText(
                        classNameAttr.value,
                        `"${newClassName}"`,
                      );
                    }
                    return null;
                  },
                });
              }
            }
          }
        }
      },
    };
  },
};
