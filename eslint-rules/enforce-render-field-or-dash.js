/**
 * ESLint rule to enforce use of renderFieldOrDash() for table cells.
 * Detects inline fallback patterns like || 'N/A', ?? '-', value ? value : '—'
 * and suggests using renderFieldOrDash(value) from @waldur/table/utils instead.
 */

const FALLBACK_LITERALS = new Set(['N/A', 'n/a', '-', '—', '–']);

const SKIP_PROPERTIES = new Set([
  'className',
  'initialValues',
  'defaultValue',
  'defaultValues',
  'placeholder',
  'copyField',
  'style',
  'href',
  'src',
]);

const EXCLUDED_FILE_PATTERNS = [/table\/utils/, /table\/constants/];

/**
 * Walk up the AST to check if the node is inside a context
 * where fallback patterns are legitimate (not display contexts).
 */
function isInSkippedContext(node) {
  let current = node.parent;

  while (current) {
    // JSX attribute: <Component className={value || 'N/A'} />
    if (
      current.type === 'JSXAttribute' &&
      current.name &&
      SKIP_PROPERTIES.has(current.name.name)
    ) {
      return true;
    }

    // Object property: { className: value || 'N/A' }
    if (current.type === 'Property' && current.key) {
      const keyName =
        current.key.type === 'Identifier'
          ? current.key.name
          : current.key.type === 'Literal'
            ? current.key.value
            : null;

      if (keyName && SKIP_PROPERTIES.has(keyName)) {
        return true;
      }
    }

    // Variable assignment: const className = value || 'N/A'
    if (
      current.type === 'VariableDeclarator' &&
      current.id &&
      current.id.type === 'Identifier' &&
      SKIP_PROPERTIES.has(current.id.name)
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

function isExcludedFile(filename) {
  return EXCLUDED_FILE_PATTERNS.some((pattern) => pattern.test(filename));
}

function isFallbackLiteral(node) {
  return (
    node &&
    node.type === 'Literal' &&
    typeof node.value === 'string' &&
    FALLBACK_LITERALS.has(node.value.trim())
  );
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce renderFieldOrDash() for table cells to handle empty values',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      useFunction:
        'Table cells should use renderFieldOrDash() to handle empty values consistently.',
    },
  },

  create(context) {
    const filename = context.getFilename();

    if (isExcludedFile(filename)) {
      return {};
    }

    let hasRenderFieldOrDashImport = false;

    return {
      ImportDeclaration(node) {
        if (
          node.source.value === '@waldur/table/utils' &&
          node.specifiers.some(
            (specifier) =>
              specifier.type === 'ImportSpecifier' &&
              specifier.imported &&
              specifier.imported.name === 'renderFieldOrDash',
          )
        ) {
          hasRenderFieldOrDashImport = true;
        }
      },

      // Detect: value ? value : 'N/A'
      ConditionalExpression(node) {
        if (!isFallbackLiteral(node.alternate)) return;

        const sourceCode = context.getSourceCode();
        const valueText = sourceCode.getText(node.test);
        const sameValue = valueText === sourceCode.getText(node.consequent);

        if (!sameValue) return;
        if (isInSkippedContext(node)) return;

        context.report({
          node,
          messageId: 'useFunction',
          fix(fixer) {
            if (!hasRenderFieldOrDashImport) {
              return null;
            }
            return fixer.replaceText(node, `renderFieldOrDash(${valueText})`);
          },
        });
      },

      // Detect: value || 'N/A', value ?? '-'
      LogicalExpression(node) {
        if (node.operator !== '||' && node.operator !== '??') return;
        if (!isFallbackLiteral(node.right)) return;
        if (isInSkippedContext(node)) return;

        const sourceCode = context.getSourceCode();
        const valueText = sourceCode.getText(node.left);

        context.report({
          node,
          messageId: 'useFunction',
          fix(fixer) {
            if (!hasRenderFieldOrDashImport) {
              return null;
            }
            return fixer.replaceText(node, `renderFieldOrDash(${valueText})`);
          },
        });
      },
    };
  },
};
