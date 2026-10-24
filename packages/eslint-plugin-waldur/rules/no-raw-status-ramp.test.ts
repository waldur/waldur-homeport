import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import rule from './no-raw-status-ramp.js';

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

describe('no-raw-status-ramp', () => {
  ruleTester.run('no-raw-status-ramp', rule as any, {
    valid: [
      // The named status utilities.
      {
        code: 'const A = () => <div className="bg-success-subtle text-success border-danger-subtle bg-danger" />;',
      },
      // A slot with no named utility keeps the arbitrary form.
      {
        code: "const c = 'text-[var(--status-danger-solid)] border-[var(--status-neutral-bg)]';",
      },
      // Non-status ramps are out of scope.
      { code: "const c = 'bg-brand-50 text-info-600 border-gray-200';" },
      // Not a class list.
      { code: "const s = 'error-500';" },
    ],
    invalid: [
      {
        code: 'const A = () => <div className="bg-success-50 dark:bg-success-900" />;',
        errors: [
          {
            messageId: 'raw',
            data: { token: 'bg-success-50', intent: 'success' },
          },
        ],
      },
      {
        code: "const STYLES = { danger: 'text-error-700' };",
        errors: [
          {
            messageId: 'raw',
            data: { token: 'text-error-700', intent: 'danger' },
          },
        ],
      },
      {
        code: 'const A = ({ on }) => <div className={`p-2 ${on ? "ring-warning-100" : ""}`} />;',
        errors: [{ messageId: 'raw' }],
      },
      {
        code: 'const A = () => <div className="hover:border-warning-300/50" />;',
        errors: [{ messageId: 'raw' }],
      },
      // The arbitrary form of a slot that has a named utility.
      {
        code: 'const A = () => <div className="fw-bold text-[var(--status-danger-fg)] dark:bg-[var(--status-success-bg)]" />;',
        output:
          'const A = () => <div className="fw-bold text-danger dark:bg-success-subtle" />;',
        errors: [
          {
            messageId: 'arbitrary',
            data: {
              token: 'text-[var(--status-danger-fg)]',
              named: 'text-danger',
            },
          },
          {
            messageId: 'arbitrary',
            data: {
              token: 'dark:bg-[var(--status-success-bg)]',
              named: 'dark:bg-success-subtle',
            },
          },
        ],
      },
      {
        code: "const c = `a ${x ? 'bg-[var(--status-warning-solid)]' : 'border-[var(--status-danger-border)]'} b`;",
        output: "const c = `a ${x ? 'bg-warning' : 'border-danger-subtle'} b`;",
        errors: [{ messageId: 'arbitrary' }, { messageId: 'arbitrary' }],
      },
      {
        code: 'const c = `x text-[var(--status-neutral-fg)] ${y}`;',
        output: 'const c = `x text-neutral ${y}`;',
        errors: [{ messageId: 'arbitrary' }],
      },
    ],
  });
});
