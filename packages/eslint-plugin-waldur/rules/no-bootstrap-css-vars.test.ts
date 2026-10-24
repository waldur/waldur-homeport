import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import noBootstrapCssVars from './no-bootstrap-css-vars.js';

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

describe('no-bootstrap-css-vars', () => {
  ruleTester.run('no-bootstrap-css-vars', noBootstrapCssVars as any, {
    valid: [
      { code: "const a = { color: 'var(--text-primary)' };" },
      { code: 'const a = <div className="bg-[var(--bg-primary)]" />;' },
      { code: "const a = getCssVar('--brand-color');" },
      // Not a Bootstrap variable, just a similar prefix.
      { code: "const a = 'var(--bsx-thing)';" },
      // `--bs-` inside a longer name is not a Bootstrap variable.
      { code: "const a = 'var(--my--bs-thing)';" },
    ],
    invalid: [
      {
        code: "const a = { border: '1px solid var(--bs-border-color)' };",
        errors: [{ messageId: 'noBootstrapVar' }],
      },
      {
        code: 'const a = <div className="text-[var(--bs-gray-500)]" />;',
        errors: [{ messageId: 'noBootstrapVar' }],
      },
      {
        code: "const a = getCssVar('--bs-body-color', '#000');",
        errors: [{ messageId: 'noBootstrapVar' }],
      },
      {
        code: 'const a = `1px solid var(--bs-border-color)`;',
        errors: [{ messageId: 'noBootstrapVar' }],
      },
      {
        code: "const a = 'var(--bs-success)';",
        errors: [
          {
            message:
              '`--bs-success` is a Bootstrap variable, not a design token. Use --status-success-fg.',
          },
        ],
      },
      {
        code: "const a = 'rgba(var(--bs-primary-rgb), 0.05)';",
        errors: [
          {
            message:
              '`--bs-primary-rgb` is a Bootstrap variable, not a design token. Use --brand-color-rgb.',
          },
        ],
      },
      {
        // Two variables in one string are two reports.
        code: "const a = 'var(--bs-body-bg) var(--bs-primary)';",
        errors: [
          { messageId: 'noBootstrapVar' },
          { messageId: 'noBootstrapVar' },
        ],
      },
    ],
  });
});
