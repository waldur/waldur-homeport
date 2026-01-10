/**
 * ESLint rule to prevent size overrides on EditButton
 * Encourages use of CompactEditButton for small edit buttons
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prevent size="sm" override on EditButton. Use CompactEditButton instead.',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noSizeOverride:
        'Do not override EditButton size. Use CompactEditButton from @waldur/form/CompactEditButton for compact edit buttons in forms and settings.',
    },
  },

  create(context) {
    // Skip the CompactEditButton wrapper component itself
    const filename = context.getFilename();
    if (filename.endsWith('CompactEditButton.tsx')) {
      return {};
    }

    return {
      JSXOpeningElement(node) {
        // Check if this is an EditButton
        if (node.name && node.name.name === 'EditButton') {
          // Check for size prop
          const sizeAttr = node.attributes.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name?.name === 'size',
          );

          if (sizeAttr) {
            context.report({
              node: sizeAttr,
              messageId: 'noSizeOverride',
            });
          }
        }
      },
    };
  },
};
