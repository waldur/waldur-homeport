import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import rule from './require-font-size-scale.js';

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

describe('require-font-size-scale', () => {
  ruleTester.run('require-font-size-scale', rule as any, {
    valid: [
      {
        code: 'const A = () => <div className="text-xs text-sm text-base text-lg text-xl text-2xl text-3xl text-4xl" />;',
      },
      {
        code: "const A = () => <div className={cn('hover:text-sm', 'md:text-lg')} />;",
      },
      // Arbitrary size that does not match a pinned scale token (e.g. 11px, 13px)
      {
        code: 'const A = () => <div className="text-[11px] text-[13px]" />;',
      },
      // Chart or options objects (not style attribute)
      { code: 'const o = { label: { fontSize: 14 } };' },
      { code: "type S = 'fs-6';" },
      { code: 'const A = () => <Button variant="fs-6" />;' },
    ],
    invalid: [
      {
        code: 'const A = () => <span className="fs-6" />;',
        output: 'const A = () => <span className="text-sm" />;',
        errors: [
          { messageId: 'retired', data: { token: 'fs-6', fix: 'text-sm' } },
        ],
      },
      {
        code: 'const A = () => <span className="fs-7 fs-8 fs-4 fs-3 fs-2 fs-1" />;',
        output:
          'const A = () => <span className="text-xs text-xs text-base text-lg text-xl text-2xl" />;',
        errors: [
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
        ],
      },
      {
        code: 'const A = () => <div className="fs-md-6 fs-lg-3" />;',
        output: 'const A = () => <div className="md:text-sm lg:text-lg" />;',
        errors: [{ messageId: 'retired' }, { messageId: 'retired' }],
      },
      {
        // Arbitrary pixel value matching scale token
        code: 'const A = () => <h1 className="text-[14px] text-[18px]" />;',
        output: 'const A = () => <h1 className="text-sm text-lg" />;',
        errors: [
          {
            messageId: 'offScale',
            data: { token: 'text-[14px]', fix: 'text-sm' },
          },
          {
            messageId: 'offScale',
            data: { token: 'text-[18px]', fix: 'text-lg' },
          },
        ],
      },
      {
        // Inline style
        code: "const A = () => <span style={{ color: 'red', fontSize: '14px' }} />;",
        errors: [{ messageId: 'inline' }],
      },
      {
        // Variants and important modifier
        code: "const c = cn('hover:fs-6', 'fs-7!');",
        output: "const c = cn('hover:text-sm', 'text-xs!');",
        errors: [{ messageId: 'retired' }, { messageId: 'retired' }],
      },
    ],
  });
});
