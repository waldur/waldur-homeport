import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
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
        // Arbitrary pixel value matching a scale token: named, not autofixed,
        // since the token also sets a line height
        code: 'const A = () => <h1 className="text-[14px] text-[18px]" />;',
        errors: [
          {
            messageId: 'offScale',
            data: { token: 'text-[14px]', fix: '"text-sm"' },
          },
          {
            messageId: 'offScale',
            data: { token: 'text-[18px]', fix: '"text-lg"' },
          },
        ],
      },
      {
        // Inline style
        code: "const A = () => <span style={{ color: 'red', fontSize: '14px' }} />;",
        errors: [{ messageId: 'inline' }],
      },
      {
        // An arbitrary variant keeps its brackets in the prefix
        code: "const c = '[&>a]:fs-6';",
        output: "const c = '[&>a]:text-sm';",
        errors: [{ messageId: 'retired' }],
      },
      {
        // A length-labelled px size on the scale
        code: 'const A = () => <span className="text-[length:14px]" />;',
        errors: [{ messageId: 'offScale' }],
      },
      {
        // The size/line-height form keeps its line height in the suggestion
        code: "const c = cn('text-[1.077rem]/5', 'text-[14px]/[1.2]');",
        errors: [
          {
            messageId: 'rem',
            data: { token: 'text-[1.077rem]/5', fix: '"text-sm/5"' },
          },
          {
            messageId: 'offScale',
            data: { token: 'text-[14px]/[1.2]', fix: '"text-sm/[1.2]"' },
          },
        ],
      },
      {
        // rem sizes name the equal token but are not autofixed: the token
        // also sets a line height
        code: "const c = cn('text-[1.077rem]', 'md:text-[length:1.25rem]');",
        errors: [
          {
            messageId: 'rem',
            data: { token: 'text-[1.077rem]', fix: '"text-sm"' },
          },
          {
            messageId: 'rem',
            data: { token: 'md:text-[length:1.25rem]', fix: '"md:text-base"' },
          },
        ],
      },
      {
        // A variant with nested brackets still splits off
        code: "const c = '[&_[data-x]]:text-[14px]';",
        errors: [
          {
            messageId: 'offScale',
            data: {
              token: '[&_[data-x]]:text-[14px]',
              fix: '"[&_[data-x]]:text-sm"',
            },
          },
        ],
      },
      {
        // A rem size with no equal token is reported, not fixed
        code: 'const A = () => <span className="text-[1.275rem]" />;',
        errors: [
          {
            messageId: 'rem',
            data: {
              token: 'text-[1.275rem]',
              fix: 'the nearest text-xs … text-4xl class',
            },
          },
        ],
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
