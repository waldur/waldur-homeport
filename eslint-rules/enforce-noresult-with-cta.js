/**
 * ESLint rule to enforce NoResult component to have an actionable CTA (call-to-action) button.
 * This will prevent dead-end-empty states.
 */

function hasAttribute(node, attributeName) {
  return node.attributes.some(
    (attr) =>
      attr.type === 'JSXAttribute' &&
      attr.name &&
      attr.name.name === attributeName,
  );
}

function insertAttribute(context, node, fixer, attrText) {
  if (node.attributes.length) {
    const lastAttr = node.attributes[node.attributes.length - 1];
    const sourceCode = context.sourceCode || context.getSourceCode();
    const line = sourceCode.lines[lastAttr.loc.start.line - 1];
    const indent = line.match(/^\s*/)[0];
    return fixer.insertTextAfter(lastAttr, `\n${indent}${attrText}`);
  }
  return fixer.insertTextAfter(node.name, ` ${attrText}`);
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce NoResult component to have an actionable CTA (call-to-action) button.',
      category: 'Best Practices',
      recommended: true,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      addCallToAction:
        'NoResult component should include a call-to-action (callback or actions attribute) to guide users towards a next step.',
      suggestCallback: 'Add callback prop',
      suggestActions: 'Add actions prop',
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        const elementName = node.name.name;
        if (elementName === 'NoResult') {
          if (
            !hasAttribute(node, 'actions') &&
            !hasAttribute(node, 'callback')
          ) {
            context.report({
              node,
              messageId: 'addCallToAction',
              suggest: [
                {
                  messageId: 'suggestCallback',
                  fix(fixer) {
                    return insertAttribute(
                      context,
                      node,
                      fixer,
                      'callback={() => {}}',
                    );
                  },
                },
                {
                  messageId: 'suggestActions',
                  fix(fixer) {
                    return insertAttribute(context, node, fixer, 'actions={}');
                  },
                },
              ],
            });
          }
        }
      },
    };
  },
};
