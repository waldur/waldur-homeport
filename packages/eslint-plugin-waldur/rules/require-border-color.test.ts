import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import rule, { isBorderColor } from './require-border-color.js';

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

describe('isBorderColor', () => {
  it.each([
    'border-brand',
    'border-secondary',
    'border-transparent',
    'hover:border-secondary',
    'dark:border-brand-700',
    'border-[var(--status-danger-border)]',
    'border-t-brand',
    'border-success',
    'border-gray-200',
  ])('treats %s as a colour', (token) => {
    expect(isBorderColor(token)).toBe(true);
  });

  it.each([
    'border',
    'border-0',
    'border-2',
    'border-t',
    'border-solid',
    'border-dashed',
    'border-[1px]',
    'border-[length:var(--w)]',
    'rounded',
  ])('does not treat %s as one', (token) => {
    expect(isBorderColor(token)).toBe(false);
  });
});

describe('require-border-color', () => {
  ruleTester.run('require-border-color', rule as any, {
    valid: [
      { code: 'const A = () => <div className="border border-secondary" />;' },
      { code: 'const A = () => <div className="border-2 rounded-lg" />;' },
      { code: 'const A = () => <div className="border-[1px] p-2" />;' },
      // A colour in another string of the same attribute counts.
      {
        code: "const A = () => <div className={cn('border p-2', on ? 'border-brand' : 'border-secondary')} />;",
      },
      { code: "const c = 'border border-[var(--card-border-color)]';" },
      // A colour in another argument of the same helper call.
      {
        code: "const c = cn('rounded-lg border', err ? 'border-danger' : 'border-secondary');",
      },
      // A function call may supply the colour.
      {
        code: 'const A = () => <li className={`rounded-md border px-3 ${cellClass(cell)}`} />;',
      },
      // Not a class list.
      { code: 'const A = () => <Card variant="border" />;' },
      { code: "if (look === 'border') {}" },
      { code: "const SLOTS = ['bg', 'border', 'solid', 'fg'] as const;" },
      {
        code: "const A = () => <span>{x ? 'A badge with a subtle ring border' : 'Plain'}</span>;",
      },
    ],
    invalid: [
      {
        code: 'const A = () => <div className="border rounded-lg p-3" />;',
        output:
          'const A = () => <div className="border border-secondary rounded-lg p-3" />;',
        errors: [{ messageId: 'missingColor' }],
      },
      // A colour only under a variant leaves the other states without one.
      {
        code: 'const A = () => <div className="border hover:border-brand" />;',
        output:
          'const A = () => <div className="border border-secondary hover:border-brand" />;',
        errors: [{ messageId: 'missingColor' }],
      },
      {
        code: "const A = () => <div className={cn('border p-2', active && 'font-bold')} />;",
        output:
          "const A = () => <div className={cn('border border-secondary p-2', active && 'font-bold')} />;",
        errors: [{ messageId: 'missingColor' }],
      },
      {
        code: 'const c = `border ${x} p-2`;',
        output: 'const c = `border border-secondary ${x} p-2`;',
        errors: [{ messageId: 'missingColor' }],
      },
      {
        code: "const c = cn('border');",
        output: "const c = cn('border border-secondary');",
        errors: [{ messageId: 'missingColor' }],
      },
      {
        code: "const c = 'p-2 border';",
        output: "const c = 'p-2 border border-secondary';",
        errors: [{ messageId: 'missingColor' }],
      },
    ],
  });
});
