import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
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
      // Lookalike class names that are not the Bootstrap classes.
      { code: 'const A = () => <div className="box-radio-header" />;' },
      { code: 'const A = () => <div className="my-form-check" />;' },
    ],
    invalid: [
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
