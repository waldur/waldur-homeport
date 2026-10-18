import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import noBootstrapFormSelect from './no-bootstrap-form-select.js';

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

describe('no-bootstrap-form-select', () => {
  ruleTester.run('no-bootstrap-form-select', noBootstrapFormSelect as any, {
    valid: [
      {
        code: "import { NativeSelect } from 'waldur-ui'; const A = () => <NativeSelect><option /></NativeSelect>;",
      },
      // Other parts of Form are not selects.
      {
        code: "import { Form } from 'react-bootstrap'; const A = () => <Form.Control />;",
      },
      // A `Select` member of something that is not react-bootstrap's Form.
      {
        code: "import { Form } from 'react-final-form'; const A = () => <Form.Select />;",
      },
      // Lookalike class names.
      {
        code: 'const A = () => <div className="form-selection my-form-select" />;',
      },
    ],
    invalid: [
      {
        code: "import { FormSelect } from 'react-bootstrap';",
        errors: [{ messageId: 'noFormSelectImport' }],
      },
      {
        code: "import FormSelect from 'react-bootstrap/FormSelect';",
        errors: [{ messageId: 'noFormSelectImport' }],
      },
      {
        code: "import { Form } from 'react-bootstrap'; const A = () => <Form.Select size='sm' />;",
        errors: [{ messageId: 'noFormDotSelect' }],
      },
      // Aliased import.
      {
        code: "import { Form as BsForm } from 'react-bootstrap'; const A = () => <BsForm.Select />;",
        errors: [{ messageId: 'noFormDotSelect' }],
      },
      {
        code: "import Form from 'react-bootstrap/Form'; const A = () => <Form.Select />;",
        errors: [{ messageId: 'noFormDotSelect' }],
      },
      {
        code: 'const A = () => <select className="form-select form-select-sm" />;',
        errors: [{ messageId: 'noFormSelectClass' }],
      },
      {
        code: 'const A = ({ solid }) => <select className={classNames("w-100", { "form-select-solid": solid })} />;',
        errors: [{ messageId: 'noFormSelectClass' }],
      },
    ],
  });
});
