import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import rule from './no-bootstrap-color-utility.js';

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

describe('no-bootstrap-color-utility', () => {
  ruleTester.run('no-bootstrap-color-utility', rule as any, {
    valid: [
      {
        code: 'const A = () => <div className="text-primary bg-tertiary border-b-[1px] border-secondary" />;',
      },
      {
        code: "const c = 'text-danger bg-success-subtle border-warning';",
      },
      // Tailwind's own classes.
      {
        code: "const c = 'bg-gray-600 text-white dark:text-gray-900 bg-transparent border-0';",
      },
      // Names, not class lists.
      { code: 'const A = () => <BaseButton variant="text-danger" />;' },
      {
        code: "const A = () => <BaseButton variant={ok ? 'text-success' : 'text-danger'} />;",
      },
      { code: "const action = { variant: 'text-danger' };" },
      { code: "const LABELS = { 'text-danger': 'Error', 'border-top': 'x' };" },
      { code: "if (tone === 'text-danger') {}" },
      { code: "type Tone = 'text-danger' | 'text-success';" },
      { code: "it('gives text-danger icons their own token', () => {});" },
      // Not a class name built from a variable.
      { code: 'const c = `h-${size}px w-${size}px`;' },
    ],
    invalid: [
      {
        code: 'const A = () => <div className="text-muted" />;',
        errors: [
          {
            messageId: 'bootstrap',
            data: {
              key: 'text-muted',
              hint: 'Use text-quaternary.',
            },
          },
        ],
      },
      {
        code: 'const c = `fw-bold text-dark ${x}`;',
        errors: [{ messageId: 'bootstrap' }],
      },
      {
        code: "const c = 'border-bottom bg-light';",
        errors: [{ messageId: 'bootstrap' }, { messageId: 'bootstrap' }],
      },
      {
        code: 'const c = `text-${variant}`;',
        errors: [{ messageId: 'dynamic', data: { key: 'text-${…}' } }],
      },
      {
        code: 'const c = `bullet bg-${variant} h-2`;',
        errors: [{ messageId: 'dynamic' }],
      },
      // Class lists in other positions are still checked.
      {
        code: "const c = classNames('mb-0', { 'text-dark': failed });",
        errors: [{ messageId: 'bootstrap' }],
      },
      {
        code: "const A = () => <Field labelClass={failed ? 'text-muted' : undefined} />;",
        errors: [{ messageId: 'bootstrap' }],
      },
      {
        code: "const STATUS = { error: 'text-danger-600' };",
        errors: [{ messageId: 'bootstrap' }],
      },
      {
        code: 'const A = () => <DashboardCard backgroundColor="bg-info" />;',
        errors: [{ messageId: 'bootstrap' }],
      },
    ],
  });
});
