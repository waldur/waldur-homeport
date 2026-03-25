/**
 * ESLint rule to enforce use of a tooltip prop on action button components when they are disabled.
 * Ensuring users always understand why an action is unavailable.
 */

const TARGET_COMPONENTS = new Set([
  'ActionButton',
  'CompactActionButton',
  'ToolbarButton',
  'BaseButton',
]);

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce use of tooltip on disabled action buttons to explain why they are unavailable.',
      category: 'Best Practices',
      recommended: true,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      missingTooltip:
        'Disabled action buttons must have a tooltip explaining why they are unavailable.',
      addTooltip: 'Add tooltip placeholder',
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        const componentName = node.name?.name;
        if (!TARGET_COMPONENTS.has(componentName)) return;

        const disabledAttr = node.attributes.find(
          (attr) =>
            attr.type === 'JSXAttribute' && attr.name.name === 'disabled',
        );

        if (!disabledAttr) return;
        if (
          disabledAttr.value &&
          disabledAttr.value.type === 'JSXExpressionContainer' &&
          disabledAttr.value.expression.type === 'Literal' &&
          disabledAttr.value.expression.value === false
        ) {
          return;
        }

        const hasTooltip = node.attributes.some(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            (attr.name.name === 'tooltip' ||
              attr.name.name === 'disabledReason'),
        );

        if (!hasTooltip) {
          context.report({
            node,
            messageId: 'missingTooltip',
            suggest: [
              {
                messageId: 'addTooltip',
                fix(fixer) {
                  const lastAttr = node.attributes[node.attributes.length - 1];
                  const sourceCode =
                    context.sourceCode || context.getSourceCode();
                  const line = sourceCode.lines[lastAttr.loc.start.line - 1];
                  const indent = line.match(/^\s*/)[0];
                  return fixer.insertTextAfter(
                    lastAttr,
                    `\n${indent}disabledReason={translate('TODO: explain why disabled')}`,
                  );
                },
              },
            ],
          });
        }
      },
    };
  },
};
