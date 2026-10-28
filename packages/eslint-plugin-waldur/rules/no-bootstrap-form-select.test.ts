import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
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
      // Lookalike class names.
      {
        code: 'const A = () => <div className="form-selection my-form-select" />;',
      },
    ],
    invalid: [
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
