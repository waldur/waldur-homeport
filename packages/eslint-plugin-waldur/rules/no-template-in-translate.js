export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow template literals and concatenation with translate function calls',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noTemplate:
        'Template literals are not allowed in translate functions. Use static strings with placeholders instead.',
      noConcatenation:
        'String concatenation with translate() is not allowed. Use complete sentences with placeholders instead of fragments.',
      noVariable:
        'Variables or expressions are not allowed as translation keys. Use string literals only.',
      missingPlaceholder:
        'Context variable "{{key}}" is provided but not used in the translation string.',
      unusedContext:
        'Context variable "{{key}}" is not used in any placeholder.',
      mismatchedContext:
        'Translation placeholders and context variables do not match. Expected: {{expected}}, Got: {{actual}}',
    },
    schema: [],
  },
  create(context) {
    function extractPlaceholders(str) {
      // Match placeholders like {name}, {count}, etc.
      // Also match XML-style tags like <tos>...</tos>, <pp>...</pp>
      const placeholderRegex = /\{(\w+)\}/g;
      const tagRegex = /<(\w+)>/g;
      const placeholders = new Set();

      let match;
      while ((match = placeholderRegex.exec(str)) !== null) {
        placeholders.add(match[1]);
      }
      while ((match = tagRegex.exec(str)) !== null) {
        placeholders.add(match[1]);
      }

      return placeholders;
    }

    function getObjectKeys(node) {
      // Extract keys from object literal
      if (node.type !== 'ObjectExpression') {
        return null;
      }
      const keys = new Set();
      for (const prop of node.properties) {
        if (prop.type === 'Property' && !prop.computed) {
          if (prop.key.type === 'Identifier') {
            keys.add(prop.key.name);
          } else if (prop.key.type === 'Literal') {
            keys.add(String(prop.key.value));
          }
        } else if (prop.type === 'SpreadElement') {
          // Can't analyze spread elements statically
          return null;
        }
      }
      return keys;
    }

    function isTranslateCall(node) {
      if (!node || node.type !== 'CallExpression') {
        return false;
      }
      return (
        (node.callee.type === 'Identifier' &&
          node.callee.name === 'translate') ||
        (node.callee.type === 'MemberExpression' &&
          node.callee.property.name === 'translate')
      );
    }

    function checkBinaryExpression(node) {
      if (node.operator !== '+') {
        return;
      }

      // Check if either side of the concatenation involves translate()
      const leftHasTranslate =
        isTranslateCall(node.left) ||
        (node.left.type === 'BinaryExpression' &&
          hasTranslateInBinary(node.left));
      const rightHasTranslate =
        isTranslateCall(node.right) ||
        (node.right.type === 'BinaryExpression' &&
          hasTranslateInBinary(node.right));

      if (leftHasTranslate || rightHasTranslate) {
        context.report({
          node,
          messageId: 'noConcatenation',
        });
      }
    }

    function hasTranslateInBinary(node) {
      if (node.type !== 'BinaryExpression') {
        return false;
      }
      if (isTranslateCall(node.left) || isTranslateCall(node.right)) {
        return true;
      }
      return (
        (node.left.type === 'BinaryExpression' &&
          hasTranslateInBinary(node.left)) ||
        (node.right.type === 'BinaryExpression' &&
          hasTranslateInBinary(node.right))
      );
    }

    return {
      CallExpression(node) {
        if (!isTranslateCall(node)) {
          return;
        }

        // Check first argument (the translation key)
        if (node.arguments.length > 0) {
          const firstArg = node.arguments[0];

          if (firstArg.type === 'TemplateLiteral') {
            context.report({
              node: firstArg,
              messageId: 'noTemplate',
            });
            return;
          } else if (
            firstArg.type !== 'Literal' ||
            typeof firstArg.value !== 'string'
          ) {
            // Not a string literal - could be variable, expression, etc.
            context.report({
              node: firstArg,
              messageId: 'noVariable',
            });
            return;
          }

          // If we have a second argument (context object), validate placeholders
          if (node.arguments.length > 1) {
            const translationString = firstArg.value;
            const contextArg = node.arguments[1];

            const placeholders = extractPlaceholders(translationString);
            const contextKeys = getObjectKeys(contextArg);

            // Only validate if we can statically analyze the context object
            if (contextKeys !== null) {
              // Check for unused context variables
              for (const key of contextKeys) {
                if (!placeholders.has(key)) {
                  context.report({
                    node: contextArg,
                    messageId: 'unusedContext',
                    data: { key },
                  });
                }
              }

              // Check for missing context variables
              for (const placeholder of placeholders) {
                if (!contextKeys.has(placeholder)) {
                  context.report({
                    node: contextArg,
                    messageId: 'missingPlaceholder',
                    data: { key: placeholder },
                  });
                }
              }
            }
          }
        }
      },
      BinaryExpression: checkBinaryExpression,
    };
  },
};
