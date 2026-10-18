/**
 * ESLint rule keeping text-like inputs on waldur-ui.
 *
 * A text input is a waldur-ui `Input` / `Textarea` (through `BaseInputField`
 * and `BaseTextField` in @/form where a `FormGroup` wraps it), with
 * `InputGroup`, `NumberInput` and `SecretInput` for adornments, steppers
 * and show/hide, `NativeSelect` for a select and `RangeInput` for a slider.
 * So the ways back to Bootstrap's form stylesheet are reported:
 *
 * - react-bootstrap's `FormControl`, `InputGroup`, `FormRange`, `FormGroup`,
 *   `FormLabel` and `FormText`, and `Form.Control` (with `.Feedback`),
 *   `Form.Range`, `Form.Group`, `Form.Label`, `Form.Text` under whatever name
 *   `Form` was imported as, including the deep imports;
 * - a `form-control*`, `input-group*`, `form-range`, `is-invalid`,
 *   `is-valid`, `invalid-feedback`, `valid-feedback`, `form-label`,
 *   `col-form-label`, `form-text`, `form-group` or `required` class on any
 *   element.
 *
 * A label, a field and its help text are waldur-ui's `FormLabel`, `FormField`
 * and `FormText` (`FormGroup` from @/form inside a react-final-form form). The
 * `<Form>` element itself, which is only a `<form>`, is not covered.
 */

import {
  getClassNameAttribute,
  getClassNameTokens,
} from './class-name-tokens.js';

const LEGACY_CLASS =
  /^(form-control(-|$)|input-group(-|$)|form-range$|is-(in)?valid$|(in)?valid-feedback$|form-label$|col-form-label$|form-text$|form-group$|required$)/;

const REPLACEMENT =
  "  Use waldur-ui's Input, Textarea, NumberInput, SecretInput, InputGroup,\n" +
  '  NativeSelect or RangeInput (BaseInputField / BaseTextField in @/form\n' +
  '  inside a FormGroup), and FormField, FormLabel and FormText around them:\n' +
  "    import { FormField, FormLabel, Input } from 'waldur-ui';\n" +
  '    <FormField controlId="name"><FormLabel required>Name</FormLabel><Input /></FormField>';

const COMPONENTS = new Set([
  'FormControl',
  'InputGroup',
  'FormRange',
  'FormGroup',
  'FormLabel',
  'FormText',
]);
const DEEP = new Set([
  'react-bootstrap/FormControl',
  'react-bootstrap/InputGroup',
  'react-bootstrap/FormRange',
  'react-bootstrap/FormGroup',
  'react-bootstrap/FormLabel',
  'react-bootstrap/FormText',
]);
const FORM_MEMBERS = new Set(['Control', 'Range', 'Group', 'Label', 'Text']);

/** The leftmost identifier of `A.B.C`, or null. */
const rootName = (name) => {
  let node = name;
  while (node && node.type === 'JSXMemberExpression') {
    node = node.object;
  }
  return node && node.type === 'JSXIdentifier' ? node.name : null;
};

/** True for `X.Control`, `X.Control.Feedback`, `X.Range`, `X.Group`, `X.Label`, `X.Text`. */
const hasFormMember = (name) => {
  let node = name;
  while (node && node.type === 'JSXMemberExpression') {
    if (FORM_MEMBERS.has(node.property.name)) {
      return true;
    }
    node = node.object;
  }
  return false;
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent react-bootstrap form markup (FormControl, InputGroup, Form.Range, Form.Group, Form.Label, Form.Text) and its classes; use waldur-ui inputs, FormField, FormLabel and FormText',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noFormControlImport:
        "Avoid react-bootstrap's form components.\n" + REPLACEMENT,
      noFormDotControl: "Avoid react-bootstrap's {{ name }}.\n" + REPLACEMENT,
      noFormControlClass:
        'The "{{ token }}" class no longer has any styles.\n' + REPLACEMENT,
    },
  },

  create(context) {
    // Local names react-bootstrap's `Form` was imported under.
    const formNames = new Set();

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (DEEP.has(source)) {
          context.report({ node, messageId: 'noFormControlImport' });
          return;
        }
        if (source === 'react-bootstrap/Form') {
          for (const specifier of node.specifiers) {
            if (specifier.type === 'ImportDefaultSpecifier') {
              formNames.add(specifier.local.name);
            }
          }
          return;
        }
        if (source !== 'react-bootstrap') {
          return;
        }
        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier') {
            continue;
          }
          const imported = specifier.imported.name;
          if (COMPONENTS.has(imported)) {
            context.report({
              node: specifier,
              messageId: 'noFormControlImport',
            });
          } else if (imported === 'Form') {
            formNames.add(specifier.local.name);
          }
        }
      },

      JSXOpeningElement(node) {
        if (
          node.name.type === 'JSXMemberExpression' &&
          formNames.has(rootName(node.name)) &&
          hasFormMember(node.name)
        ) {
          context.report({
            node: node.name,
            messageId: 'noFormDotControl',
            data: { name: context.sourceCode.getText(node.name) },
          });
        }

        for (const token of getClassNameTokens(node)) {
          if (LEGACY_CLASS.test(token)) {
            context.report({
              node: getClassNameAttribute(node) || node,
              messageId: 'noFormControlClass',
              data: { token },
            });
            break;
          }
        }
      },
    };
  },
};
