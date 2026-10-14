import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import rule from './require-dark-pair.js';

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

describe('require-dark-pair', () => {
  ruleTester.run('require-dark-pair', rule as any, {
    valid: [
      // Semantic utilities change with the theme.
      {
        code: 'const A = () => <div className="bg-primary text-secondary border-secondary bg-brand-subtle text-brand text-danger" />;',
      },
      // A partner in the same string.
      {
        code: 'const A = () => <div className="ring-4 ring-brand-50 dark:ring-brand-900" />;',
      },
      // A partner in another string of the same cn() call.
      {
        code: "const A = () => <div className={cn('bg-gray-100', isOpen && 'p-2', 'dark:bg-gray-dark-800')} />;",
      },
      // Same other variants: hover:/dark:hover: pair up, in either order.
      {
        code: 'const A = () => <div className="hover:text-gray-700 dark:hover:text-gray-dark-200 hover:dark:bg-x" />;',
      },
      // A class-map entry is one list (the Badge outline tones).
      {
        code: "const M = { blue: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200' };",
      },
      // A solid fill reads the same in both themes, and so does white text on it.
      {
        code: 'const A = () => <span className="bg-[var(--brand-600)] text-white" />;',
      },
      {
        code: "const M = { info: 'bg-info-600', danger: 'bg-danger text-white' };",
      },
      {
        code: 'const A = () => <span className="bg-[var(--bg-brand-solid)] text-white" />;',
      },
      // Names, not class lists.
      { code: "type C = 'bg-white' | 'bg-info';" },
      { code: 'const A = () => <Button variant="text-white" />;' },
      { code: "if (tone === 'text-gray-700') {}" },
      // Not a colour.
      {
        code: 'const A = () => <div className="border-0 border-l-2 text-sm bg-transparent ring-4" />;',
      },
    ],
    invalid: [
      {
        code: 'const A = () => <thead className="sticky-top bg-white" />;',
        errors: [
          {
            messageId: 'unpaired',
            data: { token: 'bg-white', hint: 'bg-primary' },
          },
        ],
      },
      {
        code: 'const A = () => <div className="card bg-gray-25" />;',
        errors: [
          {
            messageId: 'unpaired',
            data: { token: 'bg-gray-25', hint: 'bg-secondary' },
          },
        ],
      },
      {
        code: "const S = 'border-l-brand-600 text-brand-600 font-semibold';",
        errors: [
          {
            messageId: 'unpaired',
            data: {
              token: 'border-l-brand-600',
              hint: 'text-brand / border-brand / outline-brand',
            },
          },
          {
            messageId: 'unpaired',
            data: {
              token: 'text-brand-600',
              hint: 'text-brand / border-brand / outline-brand',
            },
          },
        ],
      },
      {
        code: "const f = () => 'text-[var(--color-error-600)]';",
        errors: [
          {
            messageId: 'unpaired',
            data: {
              token: 'text-[var(--color-error-600)]',
              hint: 'text-danger',
            },
          },
        ],
      },
      {
        // A tint is not a solid fill, and the partner must share the variants.
        code: 'const A = () => <li className="hover:bg-brand-50 dark:bg-brand-900" />;',
        errors: [
          {
            messageId: 'unpaired',
            data: { token: 'hover:bg-brand-50', hint: 'bg-brand-subtle' },
          },
        ],
      },
      {
        // White text on a tint, not a solid fill.
        code: 'const A = () => <span className="bg-success-subtle text-white" />;',
        errors: [
          {
            messageId: 'unpaired',
            data: { token: 'text-white', hint: 'a semantic utility' },
          },
        ],
      },
      {
        code: 'const A = () => <span className="text-[#E95420]" />;',
        errors: [
          {
            messageId: 'unpaired',
            data: { token: 'text-[#E95420]', hint: 'a semantic utility' },
          },
        ],
      },
    ],
  });
});
