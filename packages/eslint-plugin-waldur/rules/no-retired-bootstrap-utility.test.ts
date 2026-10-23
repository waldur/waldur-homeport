import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import rule from './no-retired-bootstrap-utility.js';

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

describe('no-retired-bootstrap-utility', () => {
  ruleTester.run('no-retired-bootstrap-utility', rule as any, {
    valid: [
      // Still generated: base sizes, and the responsive utilities in use.
      {
        code: 'const A = () => <div className="min-h-[100px] px-5 mt-md-0 my-lg-0 mt-n2 flex-lg-row" />;',
      },
      {
        code: 'const A = () => <span className="svg-icon svg-icon-2 svg-icon-5tx" />;',
      },
      // Tailwind's own classes.
      {
        code: 'const A = () => <div className="float-start lg:p-3 -mx-2 content-center h-screen tracking-wide" />;',
      },
      { code: "type C = 'vw-100';" },
    ],
    invalid: [
      {
        code: 'const A = () => <div className="vh-100 px-lg-3" />;',
        errors: [
          { messageId: 'retired', data: { token: 'vh-100', hint: 'h-screen' } },
          {
            messageId: 'retired',
            data: {
              token: 'px-lg-3',
              hint: 'a Tailwind breakpoint variant (lg:p-3, md:min-h-[100px])',
            },
          },
        ],
      },
      {
        code: "const c = cn('mx-n2', 'mt-lg-n1', 'flex-md-fill', 'align-content-center', 'ls-2', 'lh-1', 'lh-sm');",
        errors: [
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
          { messageId: 'retired' },
        ],
      },
      {
        code: 'const A = () => <span className="svg-icon svg-icon-lg-3" />;',
        errors: [
          {
            messageId: 'retired',
            data: {
              token: 'svg-icon-lg-3',
              hint: 'svg-icon-<size> with a Tailwind breakpoint variant on the svg (lg:size-6)',
            },
          },
        ],
      },
    ],
  });
});
