/**
 * ESLint rule to enforce nav-line-tabs class usage for consistent navigation styling
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Navigation tabs must use nav-line-tabs class for consistent styling',
      category: 'Best Practices',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useNavLineTabs:
        'Navigation tabs should use "nav nav-line-tabs" classes for consistent styling',
      missingNavLineTabs:
        'Nav element with nav-tabs should use nav-line-tabs for consistent design',
      useTabsScrollableContainer:
        'Navigation tabs should be wrapped in tabs-container with tabs-scrollable for responsive behavior',
    },
  },

  create(context) {
    return {
      JSXElement(node) {
        const elementName = node.openingElement?.name?.name;

        // Check nav elements with tab-related classes
        if (elementName === 'nav') {
          const classNameAttr = node.openingElement.attributes?.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name.name === 'className',
          );

          if (classNameAttr && classNameAttr.value) {
            let classValue = '';

            if (classNameAttr.value.type === 'Literal') {
              classValue = classNameAttr.value.value;
            } else if (
              classNameAttr.value.type === 'JSXExpressionContainer' &&
              classNameAttr.value.expression.type === 'Literal'
            ) {
              classValue = classNameAttr.value.expression.value;
            } else if (
              classNameAttr.value.type === 'JSXExpressionContainer' &&
              classNameAttr.value.expression.type === 'TemplateLiteral'
            ) {
              // Handle template literals
              classValue = classNameAttr.value.expression.quasis
                .map((q) => q.value.raw)
                .join('');
            }

            if (typeof classValue === 'string') {
              // Check if nav has nav-tabs but not nav-line-tabs
              if (
                classValue.includes('nav-tabs') &&
                !classValue.includes('nav-line-tabs')
              ) {
                context.report({
                  node: classNameAttr,
                  messageId: 'missingNavLineTabs',
                  fix(fixer) {
                    const newClassValue = classValue.replace(
                      'nav-tabs',
                      'nav-line-tabs',
                    );

                    if (classNameAttr.value.type === 'Literal') {
                      return fixer.replaceText(
                        classNameAttr.value,
                        `"${newClassValue}"`,
                      );
                    } else if (
                      classNameAttr.value.type === 'JSXExpressionContainer' &&
                      classNameAttr.value.expression.type === 'Literal'
                    ) {
                      return fixer.replaceText(
                        classNameAttr.value.expression,
                        `"${newClassValue}"`,
                      );
                    }
                    return null;
                  },
                });
              }

              // Check if nav has nav class but is missing nav-line-tabs for tab navigation
              if (
                classValue.includes('nav') &&
                !classValue.includes('nav-line-tabs')
              ) {
                // Look for nav-link children to determine if this is tab navigation
                const hasNavLinkChildren = node.children?.some((child) => {
                  if (child.type === 'JSXElement') {
                    const childClass = child.openingElement.attributes?.find(
                      (attr) =>
                        attr.type === 'JSXAttribute' &&
                        attr.name.name === 'className',
                    );
                    if (childClass && childClass.value) {
                      const childClassValue =
                        childClass.value.value ||
                        (childClass.value.type === 'JSXExpressionContainer' &&
                          childClass.value.expression.value);
                      return (
                        typeof childClassValue === 'string' &&
                        childClassValue.includes('nav-link')
                      );
                    }
                  }
                  return false;
                });

                if (hasNavLinkChildren) {
                  context.report({
                    node: classNameAttr,
                    messageId: 'useNavLineTabs',
                    fix(fixer) {
                      const newClassValue =
                        `${classValue} nav-line-tabs`.trim();

                      if (classNameAttr.value.type === 'Literal') {
                        return fixer.replaceText(
                          classNameAttr.value,
                          `"${newClassValue}"`,
                        );
                      } else if (
                        classNameAttr.value.type === 'JSXExpressionContainer' &&
                        classNameAttr.value.expression.type === 'Literal'
                      ) {
                        return fixer.replaceText(
                          classNameAttr.value.expression,
                          `"${newClassValue}"`,
                        );
                      }
                      return null;
                    },
                  });
                }
              }
            }
          }
        }

        // Check for tabs container wrapper
        if (elementName === 'div') {
          const classNameAttr = node.openingElement.attributes?.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name.name === 'className',
          );

          if (classNameAttr && classNameAttr.value) {
            let classValue = '';

            if (classNameAttr.value.type === 'Literal') {
              classValue = classNameAttr.value.value;
            } else if (
              classNameAttr.value.type === 'JSXExpressionContainer' &&
              classNameAttr.value.expression.type === 'Literal'
            ) {
              classValue = classNameAttr.value.expression.value;
            }

            // Check if this div contains nav-line-tabs but doesn't have proper container
            if (typeof classValue === 'string') {
              const hasNavChild = node.children?.some((child) => {
                if (
                  child.type === 'JSXElement' &&
                  child.openingElement.name.name === 'nav'
                ) {
                  const navClass = child.openingElement.attributes?.find(
                    (attr) =>
                      attr.type === 'JSXAttribute' &&
                      attr.name.name === 'className',
                  );
                  if (navClass && navClass.value) {
                    const navClassValue =
                      navClass.value.value ||
                      (navClass.value.type === 'JSXExpressionContainer' &&
                        navClass.value.expression.value);
                    return (
                      typeof navClassValue === 'string' &&
                      navClassValue.includes('nav-line-tabs')
                    );
                  }
                }
                return false;
              });

              if (hasNavChild && !classValue.includes('tabs-container')) {
                context.report({
                  node: classNameAttr,
                  messageId: 'useTabsScrollableContainer',
                  fix(fixer) {
                    const newClassValue =
                      `tabs-container tabs-scrollable ${classValue}`.trim();

                    if (classNameAttr.value.type === 'Literal') {
                      return fixer.replaceText(
                        classNameAttr.value,
                        `"${newClassValue}"`,
                      );
                    } else if (
                      classNameAttr.value.type === 'JSXExpressionContainer' &&
                      classNameAttr.value.expression.type === 'Literal'
                    ) {
                      return fixer.replaceText(
                        classNameAttr.value.expression,
                        `"${newClassValue}"`,
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

      // Check classNames function calls
      CallExpression(node) {
        if (node.callee && node.callee.name === 'classNames') {
          node.arguments.forEach((arg) => {
            if (arg.type === 'Literal' && typeof arg.value === 'string') {
              const classValue = arg.value;

              // Check for nav-tabs without nav-line-tabs
              if (
                classValue.includes('nav-tabs') &&
                !classValue.includes('nav-line-tabs')
              ) {
                context.report({
                  node: arg,
                  messageId: 'missingNavLineTabs',
                  fix(fixer) {
                    const newClassValue = classValue.replace(
                      'nav-tabs',
                      'nav-line-tabs',
                    );
                    return fixer.replaceText(arg, `"${newClassValue}"`);
                  },
                });
              }
            }
          });
        }
      },
    };
  },
};
