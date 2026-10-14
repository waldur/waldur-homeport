import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe, expect, it } from 'vitest';

import rule, {
  isTailwindBorderColor,
} from './no-bootstrap-border-with-tailwind-color.js';

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

describe('isTailwindBorderColor', () => {
  it.each([
    'border-brand',
    'border-secondary',
    'border-transparent',
    'hover:border-secondary',
    'dark:border-brand-700',
    'border-[var(--status-danger-border)]',
    'border-[color:var(--x)]',
    'border-t-brand',
  ])('treats %s as a Tailwind colour', (token) => {
    expect(isTailwindBorderColor(token)).toBe(true);
  });

  it.each([
    'border',
    'border-0',
    'border-2',
    'border-t',
    'border-solid',
    'border-[1px]',
    'border-[length:var(--w)]',
    'border-success',
    'border-gray-200',
    'border-top',
    'rounded',
  ])('does not treat %s as one', (token) => {
    expect(isTailwindBorderColor(token)).toBe(false);
  });
});

describe('no-bootstrap-border-with-tailwind-color', () => {
  ruleTester.run('no-bootstrap-border-with-tailwind-color', rule as any, {
    valid: [
      { code: 'const A = () => <div className="border rounded" />;' },
      { code: 'const A = () => <div className="border border-success" />;' },
      {
        code: 'const A = () => <div className="border-[1px] border-brand" />;',
      },
      { code: 'const A = () => <div className="border-2 border-brand" />;' },
      { code: "const c = 'border rounded p-4';" },
    ],
    invalid: [
      {
        code: 'const A = () => <div className="border rounded border-brand" />;',
        output:
          'const A = () => <div className="border-[1px] rounded border-brand" />;',
        errors: [{ messageId: 'clash' }],
      },
      {
        code: 'const A = () => <div className="border border-transparent hover:border-secondary" />;',
        output:
          'const A = () => <div className="border-[1px] border-transparent hover:border-secondary" />;',
        errors: [{ messageId: 'clash' }],
      },
      {
        code: 'const A = () => <div className="border-top border-[var(--x)]" />;',
        output:
          'const A = () => <div className="border-t-[1px] border-[var(--x)]" />;',
        errors: [{ messageId: 'clash' }],
      },
      {
        // Outside JSX: a class map entry.
        code: "const STYLES = { a: 'border rounded border-secondary' };",
        output:
          "const STYLES = { a: 'border-[1px] rounded border-secondary' };",
        errors: [{ messageId: 'clash' }],
      },
      {
        // The colour is only set in one branch: fixing would leave the other
        // state on currentColor, so report without a fix.
        code: "const A = ({ on }) => <div className={`border rounded ${on ? 'border-brand' : ''}`} />;",
        output: null,
        errors: [{ messageId: 'clashNoFix' }],
      },
      {
        // A variant-only colour has no base colour to fall back to.
        code: 'const A = () => <div className="border hover:border-brand" />;',
        output: null,
        errors: [{ messageId: 'clashNoFix' }],
      },
    ],
  });
});
