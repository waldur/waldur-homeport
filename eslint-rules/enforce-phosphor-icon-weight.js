/**
 * ESLint rule to enforce consistent weight prop on Phosphor icons
 * Ensures all Phosphor icons have a weight prop for visual consistency
 */

function isPhosphorIcon(node) {
  if (node.type !== 'JSXElement') return false;

  const elementName = node.openingElement.name?.name;
  if (!elementName) return false;

  // Phosphor icons typically end with 'Icon'
  return elementName.endsWith('Icon');
}

function hasPhosphorImport(context) {
  const sourceCode = context.getSourceCode();
  const text = sourceCode.getText();

  // Check for imports from @phosphor-icons/react
  return /import\s*{[^}]*}\s*from\s*['"]@phosphor-icons\/react['"]/.test(text);
}

function hasWeightProp(node) {
  return node.openingElement.attributes?.some(
    (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'weight',
  );
}

function getWeightPropValue(node) {
  const weightAttr = node.openingElement.attributes?.find(
    (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'weight',
  );

  if (!weightAttr || !weightAttr.value) return null;

  if (weightAttr.value.type === 'Literal') {
    return weightAttr.value.value;
  }

  if (
    weightAttr.value.type === 'JSXExpressionContainer' &&
    weightAttr.value.expression.type === 'Literal'
  ) {
    return weightAttr.value.expression.value;
  }

  return null;
}

function isInPhosphorImport(context, iconName) {
  const sourceCode = context.getSourceCode();
  const text = sourceCode.getText();

  // Look for the specific icon import
  const importRegex = new RegExp(
    `import\\s*{[^}]*\\b${iconName}\\b[^}]*}\\s*from\\s*['"]@phosphor-icons\/react['"]`,
  );
  return importRegex.test(text);
}

const RECOMMENDED_WEIGHTS = [
  'thin',
  'light',
  'regular',
  'bold',
  'fill',
  'duotone',
];

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent weight prop on Phosphor icons',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          defaultWeight: {
            type: 'string',
            enum: RECOMMENDED_WEIGHTS,
            default: 'bold',
          },
          allowedWeights: {
            type: 'array',
            items: {
              type: 'string',
              enum: RECOMMENDED_WEIGHTS,
            },
            default: RECOMMENDED_WEIGHTS,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingWeight:
        'Phosphor icon "{{ iconName }}" should have a weight prop for consistency. Consider adding weight="{{ defaultWeight }}".',
      invalidWeight:
        'Invalid weight "{{ weight }}" for Phosphor icon. Use one of: {{ allowedWeights }}.',
      notPhosphorIcon:
        'Element "{{ iconName }}" appears to be an icon but is not imported from @phosphor-icons/react.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const defaultWeight = options.defaultWeight || 'bold';
    const allowedWeights = options.allowedWeights || RECOMMENDED_WEIGHTS;

    return {
      JSXElement(node) {
        const elementName = node.openingElement.name?.name;

        if (!isPhosphorIcon(node)) return;

        // Check if this icon is actually imported from Phosphor
        if (!isInPhosphorImport(context, elementName)) {
          // It's an icon-like element but not from Phosphor - warn if appropriate
          if (hasPhosphorImport(context)) {
            context.report({
              node: node.openingElement.name,
              messageId: 'notPhosphorIcon',
              data: {
                iconName: elementName,
              },
            });
          }
          return;
        }

        // Check if weight prop exists
        if (!hasWeightProp(node)) {
          context.report({
            node: node.openingElement.name,
            messageId: 'missingWeight',
            data: {
              iconName: elementName,
              defaultWeight: defaultWeight,
            },
            fix(fixer) {
              // Add weight prop
              const lastAttr =
                node.openingElement.attributes[
                  node.openingElement.attributes.length - 1
                ];
              const insertPosition = lastAttr
                ? lastAttr.range[1]
                : node.openingElement.name.range[1];

              return fixer.insertTextAfterRange(
                [insertPosition, insertPosition],
                ` weight="${defaultWeight}"`,
              );
            },
          });
        } else {
          // Check if weight value is valid
          const weightValue = getWeightPropValue(node);
          if (weightValue && !allowedWeights.includes(weightValue)) {
            context.report({
              node: node.openingElement.attributes.find(
                (attr) => attr.name.name === 'weight',
              ),
              messageId: 'invalidWeight',
              data: {
                weight: weightValue,
                allowedWeights: allowedWeights.join(', '),
              },
              fix(fixer) {
                const weightAttr = node.openingElement.attributes.find(
                  (attr) => attr.name.name === 'weight',
                );
                return fixer.replaceText(
                  weightAttr.value,
                  `"${defaultWeight}"`,
                );
              },
            });
          }
        }
      },
    };
  },
};
