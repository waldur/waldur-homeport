/**
 * ESLint rule to prevent manual icon colors inside Badge components
 * - Prevent className="text-*" on icons inside Badge components
 * - Badge variant should control icon colors automatically
 * - Enforces consistent design system usage
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

function getClassNameValue(attr) {
  if (!attr.value) return '';

  if (attr.value.type === 'Literal') {
    return attr.value.value;
  }

  if (attr.value.type === 'JSXExpressionContainer') {
    if (attr.value.expression.type === 'Literal') {
      return attr.value.expression.value;
    }
    if (attr.value.expression.type === 'TemplateLiteral') {
      // For template literals, we can't easily analyze, so skip
      return '';
    }
  }

  return '';
}

function hasTextColorClass(className) {
  if (!className) return false;

  const textColorPatterns = [
    /\btext-primary\b/,
    /\btext-secondary\b/,
    /\btext-success\b/,
    /\btext-danger\b/,
    /\btext-warning\b/,
    /\btext-info\b/,
    /\btext-light\b/,
    /\btext-dark\b/,
    /\btext-muted\b/,
    /\btext-white\b/,
    /\btext-pink\b/,
    /\btext-purple\b/,
    /\btext-orange\b/,
    /\btext-gray-\d+\b/,
    /\btext-\w+-\d+\b/, // Covers text-primary-600, text-danger-700, etc.
  ];

  return textColorPatterns.some((pattern) => pattern.test(className));
}

function removeTextColorClasses(className) {
  if (!className) return '';

  const textColorPatterns = [
    /\btext-primary\b/g,
    /\btext-secondary\b/g,
    /\btext-success\b/g,
    /\btext-danger\b/g,
    /\btext-warning\b/g,
    /\btext-info\b/g,
    /\btext-light\b/g,
    /\btext-dark\b/g,
    /\btext-muted\b/g,
    /\btext-white\b/g,
    /\btext-pink\b/g,
    /\btext-purple\b/g,
    /\btext-orange\b/g,
    /\btext-gray-\d+\b/g,
    /\btext-\w+-\d+\b/g,
  ];

  let result = className;
  textColorPatterns.forEach((pattern) => {
    result = result.replace(pattern, '');
  });

  // Clean up extra whitespace
  return result.replace(/\s+/g, ' ').trim();
}

function isInsideBadge(node) {
  // Walk up the parent chain to find if we're inside a Badge component
  let current = node.parent;
  while (current) {
    if (
      current.type === 'JSXElement' &&
      current.openingElement?.name?.name === 'Badge'
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent manual icon colors inside Badge components',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      noManualIconColors:
        'Icons inside Badge components should not have manual color classes. Badge variant controls icon colors automatically.',
      removeTextClasses:
        'Remove "{{ classes }}" from icon className. Badge handles icon colors via design tokens.',
    },
  },

  create(context) {
    return {
      JSXElement(node) {
        // Only check icon components
        if (!isIconComponent(node)) return;

        // Only check icons that are inside Badge components
        if (!isInsideBadge(node)) return;

        // Check if the icon has a className with text color classes
        const classNameAttr = node.openingElement.attributes.find(
          (attr) =>
            attr.type === 'JSXAttribute' && attr.name.name === 'className',
        );

        if (!classNameAttr) return;

        const className = getClassNameValue(classNameAttr);
        if (!hasTextColorClass(className)) return;

        const textColorClasses = className.match(/\btext-[\w-]+\b/g) || [];

        context.report({
          node: classNameAttr,
          messageId: 'removeTextClasses',
          data: {
            classes: textColorClasses.join(', '),
          },
          fix(fixer) {
            const newClassName = removeTextColorClasses(className);

            if (newClassName === '') {
              // Remove the entire className attribute if it becomes empty
              const sourceCode = context.getSourceCode();
              const tokenBefore = sourceCode.getTokenBefore(classNameAttr);
              let start = classNameAttr.range[0];

              // Include any whitespace before the attribute
              if (tokenBefore && tokenBefore.range[1] < start) {
                const textBetween = sourceCode
                  .getText()
                  .slice(tokenBefore.range[1], start);
                if (textBetween.trim() === '') {
                  start = tokenBefore.range[1];
                }
              }

              return fixer.removeRange([start, classNameAttr.range[1]]);
            } else {
              // Replace with cleaned className
              if (classNameAttr.value.type === 'Literal') {
                return fixer.replaceText(
                  classNameAttr.value,
                  `"${newClassName}"`,
                );
              }
            }

            return null;
          },
        });
      },
    };
  },
};
