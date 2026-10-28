/**
 * ESLint rule keeping text-like inputs on waldur-ui.
 *
 * A text input is a waldur-ui `Input` / `Textarea` (through `BaseInputField`
 * and `BaseTextField` in @/form where a `FormGroup` wraps it), with
 * `InputGroup`, `NumberInput` and `SecretInput` for adornments, steppers
 * and show/hide, `NativeSelect` for a select and `RangeInput` for a slider.
 *
 * A `form-control*`, `input-group*`, `form-range`, `is-invalid`,
 * `is-valid`, `invalid-feedback`, `valid-feedback`, `form-label`,
 * `col-form-label`, `form-text`, `form-group` or `required` class on any
 * element is reported.
 *
 * A label, a field and its help text are waldur-ui's `FormLabel`, `FormField`
 * and `FormText` (`FormGroup` from @/form inside a react-final-form form).
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

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent legacy form classes; use waldur-ui inputs, FormField, FormLabel and FormText',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noFormControlClass:
        'The "{{ token }}" class no longer has any styles.\n' + REPLACEMENT,
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
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
