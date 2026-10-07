import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import noBootstrapFormCheck from './no-bootstrap-form-check.js';

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

describe('no-bootstrap-form-check', () => {
  ruleTester.run('no-bootstrap-form-check', noBootstrapFormCheck as any, {
    valid: [
      {
        code: "import { Checkbox } from 'waldur-ui'; const A = () => <Checkbox label='x' />;",
      },
      // Form itself (FormGroup, Form.Control, Form.Text) is not a check.
      {
        code: "import { Form } from 'react-bootstrap'; const A = () => <Form.Control />;",
      },
      // A `Check` member of something that is not react-bootstrap's Form.
      {
        code: "import { Form } from 'react-final-form'; const A = () => <Form.Check />;",
      },
      // Lookalike class names that are not the Bootstrap classes.
      { code: 'const A = () => <div className="box-radio-header" />;' },
      { code: 'const A = () => <div className="my-form-check" />;' },
    ],
    invalid: [
      {
        code: "import { FormCheck } from 'react-bootstrap';",
        errors: [{ messageId: 'noFormCheckImport' }],
      },
      {
        code: "import { Form } from 'react-bootstrap'; const A = () => <Form.Check type='checkbox' />;",
        errors: [{ messageId: 'noFormDotCheck' }],
      },
      // Aliased import and the compound parts.
      {
        code: "import { Form as BootstrapForm } from 'react-bootstrap'; const A = () => <BootstrapForm.Check.Input />;",
        errors: [{ messageId: 'noFormDotCheck' }],
      },
      {
        code: 'const A = () => <label className="form-check form-check-custom" />;',
        errors: [{ messageId: 'noFormCheckClass' }],
      },
      {
        code: 'const A = ({ sm }) => <span className={classNames("d-flex", { "form-switch-sm": sm })} />;',
        errors: [{ messageId: 'noFormCheckClass' }],
      },
    ],
  });
});
