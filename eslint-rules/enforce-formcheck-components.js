/**
 * ESLint rule to enforce React Bootstrap FormCheck components
 * over custom form control markup
 */

function isFormControlInput(node) {
  if (node.type !== 'JSXElement') return false;

  const elementName = node.openingElement.name.name;
  if (elementName !== 'input') return false;

  const typeAttr = node.openingElement.attributes?.find(
    (attr) => attr.name?.name === 'type',
  );

  if (!typeAttr || !typeAttr.value) return false;

  const typeValue =
    typeAttr.value.type === 'Literal'
      ? typeAttr.value.value
      : typeAttr.value.type === 'JSXExpressionContainer'
        ? typeAttr.value.expression.type === 'Literal'
          ? typeAttr.value.expression.value
          : null
        : null;

  return typeValue === 'checkbox' || typeValue === 'radio';
}

function hasFormCheckClass(node) {
  const classNameAttr = node.openingElement.attributes?.find(
    (attr) => attr.name?.name === 'className',
  );

  if (!classNameAttr || !classNameAttr.value) return false;

  const classNameValue =
    classNameAttr.value.type === 'Literal'
      ? classNameAttr.value.value
      : classNameAttr.value.type === 'JSXExpressionContainer'
        ? classNameAttr.value.expression.type === 'Literal'
          ? classNameAttr.value.expression.value
          : null
        : null;

  return classNameValue && classNameValue.includes('form-check-input');
}

function isFormCheckLabel(node) {
  if (node.type !== 'JSXElement') return false;

  const elementName = node.openingElement.name.name;
  if (elementName !== 'label') return false;

  const classNameAttr = node.openingElement.attributes?.find(
    (attr) => attr.name?.name === 'className',
  );

  if (!classNameAttr || !classNameAttr.value) return false;

  const classNameValue =
    classNameAttr.value.type === 'Literal'
      ? classNameAttr.value.value
      : classNameAttr.value.type === 'JSXExpressionContainer'
        ? classNameAttr.value.expression.type === 'Literal'
          ? classNameAttr.value.expression.value
          : null
        : null;

  return classNameValue && classNameValue.includes('form-check-label');
}

function hasFormCheckImport(context) {
  const sourceCode = context.getSourceCode();
  const text = sourceCode.getText();

  // Check for FormCheck import from react-bootstrap
  return (
    /import\s*{[^}]*FormCheck[^}]*}\s*from\s*['"]react-bootstrap['"]/.test(
      text,
    ) || /import\s*{[^}]*Form[^}]*}\s*from\s*['"]react-bootstrap['"]/.test(text)
  );
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce React Bootstrap FormCheck components over custom form control markup',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      useFormCheck:
        'Use React Bootstrap FormCheck component instead of custom form control markup.',
      useFormCheckLabel:
        'Use FormCheck.Label instead of label with form-check-label class.',
      missingImport:
        'FormCheck component is not imported. Add FormCheck to your react-bootstrap imports.',
    },
  },

  create(context) {
    return {
      JSXElement(node) {
        // Check for input elements with form control types
        if (isFormControlInput(node) && hasFormCheckClass(node)) {
          const typeAttr = node.openingElement.attributes.find(
            (attr) => attr.name?.name === 'type',
          );
          const typeValue =
            typeAttr.value.type === 'Literal'
              ? typeAttr.value.value
              : typeAttr.value.expression?.value;

          context.report({
            node,
            messageId: 'useFormCheck',
            fix(fixer) {
              if (!hasFormCheckImport(context)) {
                return null; // Don't auto-fix without import
              }

              const sourceCode = context.getSourceCode();
              const attributes = node.openingElement.attributes
                .filter(
                  (attr) =>
                    attr.name?.name !== 'className' &&
                    attr.name?.name !== 'type',
                )
                .map((attr) => sourceCode.getText(attr))
                .join(' ');

              const replacement = `<FormCheck type="${typeValue}"${attributes ? ' ' + attributes : ''} />`;

              return fixer.replaceText(node, replacement);
            },
          });
        }

        // Check for label elements with form-check-label class
        if (isFormCheckLabel(node)) {
          context.report({
            node,
            messageId: 'useFormCheckLabel',
            fix(fixer) {
              if (!hasFormCheckImport(context)) {
                return null; // Don't auto-fix without import
              }

              const sourceCode = context.getSourceCode();

              // Get attributes except className (remove form-check-label)
              const otherAttrs = node.openingElement.attributes
                .filter((attr) => attr.name?.name !== 'className')
                .map((attr) => sourceCode.getText(attr));

              // Handle className - remove form-check-label but keep other classes
              const classNameAttr = node.openingElement.attributes.find(
                (attr) => attr.name?.name === 'className',
              );

              if (classNameAttr) {
                const classNameValue =
                  classNameAttr.value.type === 'Literal'
                    ? classNameAttr.value.value
                    : null;

                if (classNameValue) {
                  const remainingClasses = classNameValue
                    .split(/\s+/)
                    .filter((cls) => cls !== 'form-check-label')
                    .join(' ')
                    .trim();

                  if (remainingClasses) {
                    otherAttrs.push(`className="${remainingClasses}"`);
                  }
                }
              }

              const attributes =
                otherAttrs.length > 0 ? ' ' + otherAttrs.join(' ') : '';
              const children = node.children
                .map((child) => sourceCode.getText(child))
                .join('');

              const replacement = `<FormCheck.Label${attributes}>${children}</FormCheck.Label>`;

              return fixer.replaceText(node, replacement);
            },
          });
        }
      },
    };
  },
};
