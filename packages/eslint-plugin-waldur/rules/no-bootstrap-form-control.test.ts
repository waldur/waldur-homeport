import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import noBootstrapFormControl from './no-bootstrap-form-control.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
});

describe('no-bootstrap-form-control', () => {
  ruleTester.run('no-bootstrap-form-control', noBootstrapFormControl as any, {
    valid: [
      {
        code: "import { Input, InputGroup } from 'waldur-ui'; const A = () => <InputGroup><Input /></InputGroup>;",
      },
      {
        code: "import { FormField, FormLabel, FormText } from 'waldur-ui'; const A = () => <FormField><FormLabel required>x</FormLabel><FormText>y</FormText></FormField>;",
      },
      // Lookalike class names.
      {
        code: 'const A = () => <div className="form-controller input-groups my-form-control" />;',
      },
      {
        code: 'const A = () => <div className="form-textual form-labelled" />;',
      },
    ],
    invalid: [
      {
        code: 'const A = () => <label className="form-label required" />;',
        errors: [{ messageId: 'noFormControlClass' }],
      },
      {
        code: 'const A = () => <div className="form-text mt-2" />;',
        errors: [{ messageId: 'noFormControlClass' }],
      },
      {
        code: 'const A = () => <input className="form-control form-control-sm" />;',
        errors: [{ messageId: 'noFormControlClass' }],
      },
      {
        code: 'const A = () => <div className="input-group mb-3" />;',
        errors: [{ messageId: 'noFormControlClass' }],
      },
      {
        code: 'const A = () => <input type="range" className="form-range" />;',
        errors: [{ messageId: 'noFormControlClass' }],
      },
      {
        code: 'const A = ({ bad }) => <input className={classNames("w-100", { "is-invalid": bad })} />;',
        errors: [{ messageId: 'noFormControlClass' }],
      },
      {
        code: 'const A = () => <div className="invalid-feedback d-block" />;',
        errors: [{ messageId: 'noFormControlClass' }],
      },
    ],
  });
});
