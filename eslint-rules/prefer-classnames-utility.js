/**
 * ESLint rule to prefer classNames() utility over manual string concatenation
 * Detects manual className string concatenation and suggests using classNames()
 */

function isStringConcatenation(node) {
  return node.type === 'BinaryExpression' && node.operator === '+';
}

function hasStringConcatenationInExpression(node) {
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    return true;
  }
  if (node.type === 'ConditionalExpression') {
    return (
      hasStringConcatenationInExpression(node.consequent) ||
      hasStringConcatenationInExpression(node.alternate)
    );
  }
  if (node.type === 'LogicalExpression') {
    return (
      hasStringConcatenationInExpression(node.left) ||
      hasStringConcatenationInExpression(node.right)
    );
  }
  return false;
}

function containsClassRelatedStrings(node) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    // Check if the string looks like CSS classes
    return /\b(btn|form|text|bg|d-|flex|m[tblrxy]?-|p[tblrxy]?-|w-|h-|fs-|fw-|border|rounded|shadow|align|justify)/i.test(
      node.value,
    );
  }
  if (node.type === 'BinaryExpression') {
    return (
      containsClassRelatedStrings(node.left) ||
      containsClassRelatedStrings(node.right)
    );
  }
  if (node.type === 'ConditionalExpression') {
    return (
      containsClassRelatedStrings(node.consequent) ||
      containsClassRelatedStrings(node.alternate)
    );
  }
  return false;
}

function isClassNameAttribute(node) {
  return node.type === 'JSXAttribute' && node.name.name === 'className';
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer classNames() utility over manual string concatenation for className',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferClassNames:
        'Use classNames() utility instead of manual string concatenation for className.',
      missingImport:
        'classNames utility is not imported. Add "import classNames from \'classnames\';"',
    },
  },

  create(context) {
    let hasClassNamesImport = false;

    return {
      ImportDeclaration(node) {
        // Check for classNames import
        if (node.source.value === 'classnames') {
          hasClassNamesImport = true;
        }
      },

      JSXAttribute(node) {
        if (!isClassNameAttribute(node)) return;

        const value = node.value;
        if (!value || value.type !== 'JSXExpressionContainer') return;

        const expression = value.expression;

        // Check for string concatenation patterns
        if (
          hasStringConcatenationInExpression(expression) &&
          containsClassRelatedStrings(expression)
        ) {
          context.report({
            node: value,
            messageId: 'preferClassNames',
            fix(fixer) {
              if (!hasClassNamesImport) {
                // Don't auto-fix if classNames isn't imported
                return null;
              }

              // Simple auto-fix for basic patterns
              const sourceCode = context.getSourceCode();
              const expressionText = sourceCode.getText(expression);

              // Try to convert simple concatenation patterns
              if (
                expression.type === 'BinaryExpression' &&
                expression.operator === '+'
              ) {
                const left = sourceCode.getText(expression.left);
                const right = sourceCode.getText(expression.right);

                // Pattern: 'base' + (condition ? ' extra' : '')
                if (
                  expression.left.type === 'Literal' &&
                  expression.right.type === 'ConditionalExpression'
                ) {
                  const baseClass = expression.left.value;
                  const conditionalText = sourceCode.getText(expression.right);

                  // Simple conditional pattern
                  if (
                    expression.right.consequent.type === 'Literal' &&
                    expression.right.alternate.type === 'Literal'
                  ) {
                    const consequent = expression.right.consequent.value.trim();
                    const alternate = expression.right.alternate.value.trim();
                    const condition = sourceCode.getText(expression.right.test);

                    if (alternate === '') {
                      return fixer.replaceText(
                        expression,
                        `classNames('${baseClass}', { '${consequent}': ${condition} })`,
                      );
                    }
                  }
                }

                // Pattern: 'base' + (className ? ' ' + className : '')
                if (
                  expression.left.type === 'Literal' &&
                  expression.right.type === 'ConditionalExpression'
                ) {
                  const baseClass = expression.left.value;
                  return fixer.replaceText(
                    expression,
                    `classNames('${baseClass}', ${sourceCode.getText(expression.right.test)})`,
                  );
                }
              }

              return null; // Don't auto-fix complex patterns
            },
          });
        }

        // Also check for ternary expressions that could use classNames
        if (
          expression.type === 'ConditionalExpression' &&
          containsClassRelatedStrings(expression)
        ) {
          context.report({
            node: value,
            messageId: 'preferClassNames',
          });
        }
      },

      'Program:exit'() {
        // Report missing import if classNames patterns were found but no import
        if (!hasClassNamesImport) {
          // This will only trigger if we found className concatenation patterns
          // The actual reporting is done in JSXAttribute visitor
        }
      },
    };
  },
};
