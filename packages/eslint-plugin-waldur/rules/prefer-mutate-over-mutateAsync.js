/**
 * ESLint rule to prefer .mutate() over .mutateAsync() in buttons and action items.
 * .mutateAsync() should be reserved for forms where promise handling is required.
 */

const TARGET_COMPONENTS = new Set([
  'ActionButton',
  'CompactActionButton',
  'ToolbarButton',
  'BaseButton',
  'ActionItem',
  'Button',
  'SubmitButton',
  'CloseDialogButton',
]);

const TARGET_PROPS = new Set(['action', 'onClick', 'onSelect']);

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer .mutate() over .mutateAsync() in buttons and actions.',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferMutate:
        'Prefer using .mutate() instead of .mutateAsync() in buttons and actions.',
    },
  },

  create(context) {
    function checkCallExpression(callExpr) {
      if (
        callExpr.callee.type === 'MemberExpression' &&
        callExpr.callee.property.type === 'Identifier' &&
        callExpr.callee.property.name === 'mutateAsync'
      ) {
        context.report({
          node: callExpr.callee.property,
          messageId: 'preferMutate',
          fix(fixer) {
            return fixer.replaceText(callExpr.callee.property, 'mutate');
          },
        });
      }
    }

    return {
      JSXOpeningElement(node) {
        let componentName = '';
        if (node.name.type === 'JSXIdentifier') {
          componentName = node.name.name;
        } else if (node.name.type === 'JSXMemberExpression') {
          // Handle Dropdown.Item etc.
          componentName = node.name.property.name;
        }

        if (!TARGET_COMPONENTS.has(componentName) && componentName !== 'Item')
          return;

        node.attributes.forEach((attr) => {
          if (
            attr.type === 'JSXAttribute' &&
            TARGET_PROPS.has(attr.name.name) &&
            attr.value?.type === 'JSXExpressionContainer'
          ) {
            const expression = attr.value.expression;

            // Handle action={() => mutation.mutateAsync(...)}
            if (
              expression.type === 'ArrowFunctionExpression' ||
              expression.type === 'FunctionExpression'
            ) {
              const body = expression.body;
              if (body.type === 'CallExpression') {
                checkCallExpression(body);
              } else if (body.type === 'BlockStatement') {
                // Handle () => { mutation.mutateAsync(...) }
                body.body.forEach((stmt) => {
                  if (
                    stmt.type === 'ExpressionStatement' &&
                    stmt.expression.type === 'CallExpression'
                  ) {
                    checkCallExpression(stmt.expression);
                  }
                });
              }
            } else if (expression.type === 'CallExpression') {
              // Let's skip handleSubmit for now to be safe.
            }
          }
        });
      },
    };
  },
};
