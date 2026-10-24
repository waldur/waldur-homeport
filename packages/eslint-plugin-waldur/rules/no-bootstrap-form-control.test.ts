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
      // The <Form> element is only a <form>.
      {
        code: "import { Form } from 'react-bootstrap'; const A = () => <Form onSubmit={f}><input /></Form>;",
      },
      {
        code: "import { FormField, FormLabel, FormText } from 'waldur-ui'; const A = () => <FormField><FormLabel required>x</FormLabel><FormText>y</FormText></FormField>;",
      },
      // A `Control` member of something that is not react-bootstrap's Form.
      {
        code: "import { Form } from 'react-final-form'; const A = () => <Form.Control />;",
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
        code: "import { FormGroup, FormLabel, FormText } from 'react-bootstrap';",
        errors: [
          { messageId: 'noFormControlImport' },
          { messageId: 'noFormControlImport' },
          { messageId: 'noFormControlImport' },
        ],
      },
      {
        code: "import { Form } from 'react-bootstrap'; const A = () => <Form.Group controlId='a'><Form.Label>x</Form.Label><Form.Text>y</Form.Text></Form.Group>;",
        errors: [
          { messageId: 'noFormDotControl' },
          { messageId: 'noFormDotControl' },
          { messageId: 'noFormDotControl' },
        ],
      },
      {
        code: 'const A = () => <label className="form-label required" />;',
        errors: [{ messageId: 'noFormControlClass' }],
      },
      {
        code: 'const A = () => <div className="form-text mt-2" />;',
        errors: [{ messageId: 'noFormControlClass' }],
      },
      {
        code: "import { FormControl } from 'react-bootstrap';",
        errors: [{ messageId: 'noFormControlImport' }],
      },
      {
        code: "import { InputGroup } from 'react-bootstrap';",
        errors: [{ messageId: 'noFormControlImport' }],
      },
      {
        code: "import InputGroup from 'react-bootstrap/InputGroup';",
        errors: [{ messageId: 'noFormControlImport' }],
      },
      {
        code: "import { Form } from 'react-bootstrap'; const A = () => <Form.Control type='text' />;",
        errors: [{ messageId: 'noFormDotControl' }],
      },
      {
        code: "import { Form } from 'react-bootstrap'; const A = () => <Form.Control.Feedback type='invalid' />;",
        errors: [{ messageId: 'noFormDotControl' }],
      },
      {
        code: "import { Form } from 'react-bootstrap'; const A = () => <Form.Range />;",
        errors: [{ messageId: 'noFormDotControl' }],
      },
      {
        code: "import { Form as BsForm } from 'react-bootstrap'; const A = () => <BsForm.Control />;",
        errors: [{ messageId: 'noFormDotControl' }],
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
