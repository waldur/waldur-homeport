/**
 * ESLint rule to enforce breadcrumb link color consistency
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Breadcrumb links must use $text-brand-secondary color token',
      category: 'Best Practices',
    },
    fixable: 'code',
    schema: [],
    messages: {
      deprecatedBreadcrumbClass:
        'CSS class "{{className}}" is deprecated for breadcrumbs. Use design tokens instead.',
      forbiddenBreadcrumbStyle:
        'Inline style attribute is forbidden for breadcrumbs. Use design tokens in CSS/SCSS instead.',
    },
  },

  create(context) {
    // Deprecated classes: any class starting with 'text-', 'bg-', etc.
    const deprecatedClassRegexes = [
      /^text-.+/,
      /^bg-.+/,
      /^border-.+/,
      /^svg-icon.*/,
      /^btn.*/,
    ];

    function checkForBreadcrumbDeprecations(
      node,
      value,
      isBreadcrumbContext = false,
    ) {
      if (typeof value !== 'string') return;

      // Check for deprecated CSS classes in breadcrumb context
      if (isBreadcrumbContext) {
        // Find all classes matching deprecatedClassRegexes
        const matches = value.match(
          new RegExp(
            deprecatedClassRegexes.map((r) => r.source).join('|'),
            'g',
          ),
        );
        if (matches) {
          matches.forEach((deprecatedClass) => {
            if (
              deprecatedClassRegexes.some((regex) =>
                regex.test(deprecatedClass),
              )
            ) {
              context.report({
                node,
                messageId: 'deprecatedBreadcrumbClass',
                data: { className: deprecatedClass },
                fix(fixer) {
                  // Remove the deprecated class
                  const newValue = value
                    .replace(new RegExp(`\\b${deprecatedClass}\\b`, 'g'), '')
                    .replace(/\s+/g, ' ')
                    .trim();
                  if (node.type === 'Literal') {
                    return fixer.replaceText(node, `"${newValue}"`);
                  } else if (
                    node.type === 'JSXExpressionContainer' &&
                    node.expression.type === 'Literal'
                  ) {
                    return fixer.replaceText(node.expression, `"${newValue}"`);
                  }
                  return null;
                },
              });
            }
          });
        }
      }
    }

    function checkForForbiddenStyleAttr(node) {
      // Check for forbidden style attribute
      const styleAttr = node.openingElement.attributes?.find(
        (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'style',
      );
      if (styleAttr) {
        context.report({
          node: styleAttr,
          messageId: 'forbiddenBreadcrumbStyle',
        });
      }
    }

    function isBreadcrumbElement(node) {
      // Check if element is within breadcrumb context
      let current = node;
      while (current) {
        // If we hit a JSXElement, check for className as before
        if (current.type === 'JSXElement') {
          const className = current.openingElement.attributes?.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name.name === 'className',
          );
          if (className && className.value) {
            const classValue =
              className.value.value ||
              (className.value.type === 'JSXExpressionContainer' &&
                className.value.expression.value);
            if (
              typeof classValue === 'string' &&
              (classValue.includes('breadcrumb') ||
                classValue.includes('Breadcrumb'))
            ) {
              return true;
            }
          }
        }
        // If we hit a JSXOpeningElement, check the tag name
        if (current.type === 'JSXOpeningElement') {
          if (
            (current.name.type === 'JSXIdentifier' &&
              (current.name.name === 'Breadcrumb' ||
                current.name.name === 'BreadcrumbItem' ||
                current.name.name === 'Breadcrumb.Item')) ||
            (current.name.type === 'JSXMemberExpression' &&
              current.name.property.name === 'BreadcrumbItem')
          ) {
            return true;
          }
        }
        current = current.parent;
      }
      return false;
    }

    return {
      // Check breadcrumb-specific elements
      JSXElement(node) {
        const elementName = node.openingElement?.name?.name;

        if (
          elementName === 'Breadcrumb' ||
          elementName === 'BreadcrumbItem' ||
          elementName === 'Breadcrumb.Item'
        ) {
          // Check className attributes
          const classNameAttr = node.openingElement.attributes?.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name.name === 'className',
          );

          if (classNameAttr && classNameAttr.value) {
            const classValue =
              classNameAttr.value.value ||
              (classNameAttr.value.type === 'JSXExpressionContainer' &&
                classNameAttr.value.expression.value);

            checkForBreadcrumbDeprecations(
              classNameAttr.value,
              classValue,
              true,
            );
          }

          checkForForbiddenStyleAttr(node);
        }

        // Check anchor links within breadcrumb context
        if (elementName === 'a' && isBreadcrumbElement(node)) {
          const classNameAttr = node.openingElement.attributes?.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name.name === 'className',
          );

          if (classNameAttr && classNameAttr.value) {
            const classValue =
              classNameAttr.value.value ||
              (classNameAttr.value.type === 'JSXExpressionContainer' &&
                classNameAttr.value.expression.value);

            checkForBreadcrumbDeprecations(
              classNameAttr.value,
              classValue,
              true,
            );
          }

          // Check style attribute
          checkForForbiddenStyleAttr(node);
        }
      },

      // Check classNames function calls
      CallExpression(node) {
        if (node.callee && node.callee.name === 'classNames') {
          // Check if any parent element suggests breadcrumb context
          const isBreadcrumb = isBreadcrumbElement(node);

          node.arguments.forEach((arg) => {
            if (arg.type === 'Literal' && typeof arg.value === 'string') {
              checkForBreadcrumbDeprecations(arg, arg.value, isBreadcrumb);
            }
          });
        }
      },
    };
  },
};
