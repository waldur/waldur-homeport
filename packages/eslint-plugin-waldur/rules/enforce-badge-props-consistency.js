/**
 * ESLint rule to enforce consistent Badge props pattern
 * - Enforce prop ordering: variant, size, pill, outline, onlyIcon
 * - Remove explicit boolean values (light={true} → light)
 * - Enforce pill before outline
 */

const PREFERRED_PROP_ORDER = [
  'variant',
  'size',
  'leftIcon',
  'rightIcon',
  'pill',
  'outline',
  'light',
  'onlyIcon',
  'alignIcon',
  'roundless',
  'hasBullet',
  'tooltip',
  'tooltipProps',
  'className',
];

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

function hasExplicitBooleanValue(attr) {
  if (!attr.value) return false;

  if (attr.value.type === 'JSXExpressionContainer') {
    const expr = attr.value.expression;
    return expr.type === 'Literal' && typeof expr.value === 'boolean';
  }

  return false;
}

function getPropsOrder(attrs) {
  const badgeProps = attrs.filter(
    (attr) =>
      attr.type === 'JSXAttribute' &&
      PREFERRED_PROP_ORDER.includes(attr.name.name),
  );

  return badgeProps.map((attr) => ({
    name: attr.name.name,
    index: PREFERRED_PROP_ORDER.indexOf(attr.name.name),
    attr,
  }));
}

function isPropsOrderCorrect(propsOrder) {
  for (let i = 1; i < propsOrder.length; i++) {
    if (propsOrder[i].index < propsOrder[i - 1].index) {
      return false;
    }
  }
  return true;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce consistent Badge props pattern',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      explicitBooleanValue:
        'Badge prop "{{ prop }}" should not have explicit boolean value. Use {{ prop }} instead of {{ prop }}={{value}}.',
      wrongPropsOrder:
        'Badge props should be ordered: {{ expectedOrder }}. Current order: {{ actualOrder }}.',
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

        // Check for explicit boolean values
        for (const attr of attrs) {
          if (hasExplicitBooleanValue(attr)) {
            const value = getPropValue(attr);
            if (value === true) {
              context.report({
                node: attr,
                messageId: 'explicitBooleanValue',
                data: {
                  prop: attr.name.name,
                  value: 'true',
                },
                fix(fixer) {
                  return fixer.replaceText(attr, attr.name.name);
                },
              });
            }
          }
        }

        // Check props ordering
        const propsOrder = getPropsOrder(attrs);
        if (propsOrder.length > 1 && !isPropsOrderCorrect(propsOrder)) {
          const actualOrder = propsOrder.map((p) => p.name).join(', ');
          const expectedOrder = propsOrder
            .sort((a, b) => a.index - b.index)
            .map((p) => p.name)
            .join(', ');

          context.report({
            node,
            messageId: 'wrongPropsOrder',
            data: {
              expectedOrder,
              actualOrder,
            },
            fix() {
              // For now, let's disable the auto-fix for prop ordering as it's complex
              // The rule will still show the error but won't auto-fix
              return null;
            },
          });
        }
      },
    };
  },
};
