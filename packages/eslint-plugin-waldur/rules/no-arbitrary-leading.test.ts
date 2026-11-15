import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import rule, { plainLeading } from './no-arbitrary-leading.js';

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

describe('plainLeading', () => {
  it.each([
    ['leading-[20px]', 'leading-5'],
    ['leading-[16px]', 'leading-4'],
    ['leading-[14px]', 'leading-3.5'],
    ['leading-[18px]', 'leading-4.5'],
    ['leading-[30px]', 'leading-7.5'],
    ['leading-[0px]', 'leading-0'],
    ['md:leading-[24px]', 'md:leading-6'],
    [
      'group-data-[density=compact]/menu:leading-[20px]',
      'group-data-[density=compact]/menu:leading-5',
    ],
    ['!leading-[20px]', '!leading-5'],
    ['leading-[20px]!', 'leading-5!'],
  ])('rewrites %s to %s', (token, expected) => {
    expect(plainLeading(token)).toBe(expected);
  });

  it.each([
    'leading-5',
    'leading-none',
    'leading-[17px]',
    'leading-[23px]',
    'leading-[1.75]',
    'leading-[20]',
    'leading-[inherit]',
    'leading-[var(--x)]',
    'leading-[1.25rem]',
    'leading-[20.5px]',
    'text-[20px]',
  ])('leaves %s alone', (token) => {
    expect(plainLeading(token)).toBeNull();
  });
});

describe('no-arbitrary-leading', () => {
  ruleTester.run('no-arbitrary-leading', rule as any, {
    valid: [
      { code: 'const A = () => <div className="text-sm leading-5" />;' },
      { code: "const c = 'text-xs leading-[17px] leading-[1.75]';" },
      { code: 'const A = () => <Box variant="leading-[20px]" />;' },
    ],
    invalid: [
      {
        code: 'const A = () => <div className="text-sm leading-[20px] font-medium" />;',
        output:
          'const A = () => <div className="text-sm leading-5 font-medium" />;',
        errors: [{ messageId: 'arbitrary' }],
      },
      {
        code: "const c = cn('text-xs leading-[18px]', on && 'md:leading-[14px]');",
        output: "const c = cn('text-xs leading-4.5', on && 'md:leading-3.5');",
        errors: [{ messageId: 'arbitrary' }, { messageId: 'arbitrary' }],
      },
      {
        code: 'const c = `leading-[16px] ${x} hover:leading-[30px]`;',
        output: 'const c = `leading-4 ${x} hover:leading-7.5`;',
        errors: [{ messageId: 'arbitrary' }, { messageId: 'arbitrary' }],
      },
    ],
  });
});
