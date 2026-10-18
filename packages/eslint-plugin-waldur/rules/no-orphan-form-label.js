/**
 * ESLint rule: a `FormLabel` has to be inside a field.
 *
 * `FormLabel` links itself to the control of the enclosing `FormField`,
 * `FieldScope` or `FormGroup`. Outside one it has no `htmlFor` and names
 * nothing: a screen reader hears a label that belongs to no control, and
 * clicking it does nothing. What was meant is usually one of:
 *
 * - a group of controls under one question: `FormFieldset` with a
 *   `FormLegend` (`<FormGroup group>` in a react-final-form form);
 * - text that captions something that is not a control (a read-only value, a
 *   preview, a button group): `FormHeading`;
 * - a label for one control: wrap both in a `FormField`.
 *
 * The check is per component: a `FormLabel` is accepted when the component
 * that contains it also renders a `FormField`, `FieldScope`, `FormFieldset` or
 * `FormGroup` (the label is often built in one place and placed in another),
 * or when it has its own `htmlFor`. A small component that returns only the
 * label for a field drawn elsewhere should say so with an eslint-disable
 * comment and the reason.
 */

const WRAPPERS = /\b(FormField|FieldScope|FormFieldset|FormGroup)\b/;

const isFunction = (node) =>
  node.type === 'FunctionDeclaration' ||
  node.type === 'FunctionExpression' ||
  node.type === 'ArrowFunctionExpression';

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require FormLabel to sit inside a FormField, FieldScope or FormGroup',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      orphanFormLabel:
        'This FormLabel is outside any field, so it names no control.\n' +
        '  - Several controls under one question: FormFieldset + FormLegend (<FormGroup group> in a form).\n' +
        '  - A caption for something that is not a control: FormHeading.\n' +
        '  - One control: wrap the label and the control in a FormField.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    return {
      JSXOpeningElement(node) {
        if (
          node.name.type !== 'JSXIdentifier' ||
          node.name.name !== 'FormLabel'
        )
          return;
        // An explicit target, or props that may carry one.
        const hasTarget = node.attributes.some(
          (attr) =>
            attr.type === 'JSXSpreadAttribute' ||
            (attr.type === 'JSXAttribute' && attr.name.name === 'htmlFor'),
        );
        if (hasTarget) return;
        // The outermost function holding the label: the component.
        let owner = null;
        for (let n = node.parent; n; n = n.parent) {
          if (isFunction(n)) owner = n;
        }
        const text = sourceCode
          .getText(owner ?? sourceCode.ast)
          .replace(/FormLabel/g, '');
        if (!WRAPPERS.test(text)) {
          context.report({ node, messageId: 'orphanFormLabel' });
        }
      },
    };
  },
};
