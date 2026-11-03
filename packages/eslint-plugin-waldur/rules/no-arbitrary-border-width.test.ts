import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import rule, { plainBorderWidth } from './no-arbitrary-border-width.js';

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

describe('plainBorderWidth', () => {
  it.each([
    ['border-[1px]', 'border'],
    ['border-b-[1px]', 'border-b'],
    ['border-x-[2px]', 'border-x-2'],
    ['border-[0px]', 'border-0'],
    ['border-t-[0]', 'border-t-0'],
    ['hover:border-b-[1px]', 'hover:border-b'],
    ['[&>td]:border-t-[1px]', '[&>td]:border-t'],
    ['!border-[1px]', '!border'],
    ['border-[2px]!', 'border-2!'],
  ])('rewrites %s to %s', (token, expected) => {
    expect(plainBorderWidth(token)).toBe(expected);
  });

  it.each([
    'border',
    'border-2',
    'border-[1.5px]',
    'border-[length:var(--w)]',
    'border-[var(--x)]',
    'border-[0.5rem]',
    'rounded-[1px]',
  ])('leaves %s alone', (token) => {
    expect(plainBorderWidth(token)).toBeNull();
  });
});

describe('no-arbitrary-border-width', () => {
  ruleTester.run('no-arbitrary-border-width', rule as any, {
    valid: [
      { code: 'const A = () => <div className="border border-secondary" />;' },
      { code: "const c = 'border-b-2 border-[length:var(--w)]';" },
      { code: 'const A = () => <Box variant="border-[1px]" />;' },
    ],
    invalid: [
      {
        code: 'const A = () => <div className="border-[1px] border-secondary" />;',
        output: 'const A = () => <div className="border border-secondary" />;',
        errors: [{ messageId: 'arbitrary' }],
      },
      {
        code: "const c = cn('border-b-[1px] border-b-secondary', on && 'border-t-[2px]');",
        output:
          "const c = cn('border-b border-b-secondary', on && 'border-t-2');",
        errors: [{ messageId: 'arbitrary' }, { messageId: 'arbitrary' }],
      },
      {
        code: 'const c = `hover:border-[1px] ${x} border-x-[0px]`;',
        output: 'const c = `hover:border ${x} border-x-0`;',
        errors: [{ messageId: 'arbitrary' }, { messageId: 'arbitrary' }],
      },
    ],
  });
});
