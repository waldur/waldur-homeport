import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import rule from './enforce-border-radius-tokens.js';

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

describe('enforce-border-radius-tokens', () => {
  ruleTester.run('enforce-border-radius-tokens', rule as any, {
    valid: [
      {
        code: 'const A = () => <div className="rounded-none rounded-xs rounded-sm rounded-md rounded-lg rounded-xl rounded-2xl rounded-modal rounded-full" />;',
      },
      {
        code: 'const A = () => <div className="rounded rounded-t-md rounded-b-lg rounded-tl-sm" />;',
      },
      {
        code: "const A = () => <div className={cn('hover:rounded-lg', 'md:rounded-modal')} />;",
      },
      // Arbitrary radius that does not match a pinned scale token (e.g. 15px)
      {
        code: 'const A = () => <div className="rounded-[15px] rounded-[3px]" />;',
      },
      // Chart or options objects (not style attribute)
      { code: 'const o = { itemStyle: { borderRadius: 4 } };' },
      { code: "type S = 'rounded-0';" },
      { code: 'const A = () => <Button variant="rounded-0" />;' },
    ],
    invalid: [
      {
        code: 'const A = () => <span className="rounded-0" />;',
        output: 'const A = () => <span className="rounded-none" />;',
        errors: [
          {
            messageId: 'retired',
            data: { token: 'rounded-0', fix: 'rounded-none' },
          },
        ],
      },
      {
        code: 'const A = () => <span className="rounded-pill rounded-circle" />;',
        output:
          'const A = () => <span className="rounded-full rounded-full" />;',
        errors: [
          {
            messageId: 'retired',
            data: { token: 'rounded-pill', fix: 'rounded-full' },
          },
          {
            messageId: 'retired',
            data: { token: 'rounded-circle', fix: 'rounded-full' },
          },
        ],
      },
      {
        code: 'const A = () => <div className="rounded-top-0 rounded-bottom-0" />;',
        output:
          'const A = () => <div className="rounded-t-none rounded-b-none" />;',
        errors: [{ messageId: 'retired' }, { messageId: 'retired' }],
      },
      {
        // Arbitrary pixel value matching scale token
        code: 'const A = () => <div className="rounded-[6px] rounded-[8px]" />;',
        output: 'const A = () => <div className="rounded-md rounded-lg" />;',
        errors: [
          {
            messageId: 'offScale',
            data: { token: 'rounded-[6px]', fix: 'rounded-md' },
          },
          {
            messageId: 'offScale',
            data: { token: 'rounded-[8px]', fix: 'rounded-lg' },
          },
        ],
      },
      {
        // Arbitrary pixel with direction
        code: 'const A = () => <div className="rounded-t-[8px] rounded-b-[4px]" />;',
        output:
          'const A = () => <div className="rounded-t-lg rounded-b-sm" />;',
        errors: [{ messageId: 'offScale' }, { messageId: 'offScale' }],
      },
      {
        // Inline style
        code: 'const A = () => <span style={{ borderRadius: 4 }} />;',
        errors: [{ messageId: 'inline' }],
      },
      {
        // Corner inline style
        code: 'const A = () => <span style={{ borderTopLeftRadius: "6px" }} />;',
        errors: [{ messageId: 'inline' }],
      },
      {
        // Variants and important modifier
        code: "const c = cn('hover:rounded-0', 'rounded-pill!');",
        output: "const c = cn('hover:rounded-none', 'rounded-full!');",
        errors: [{ messageId: 'retired' }, { messageId: 'retired' }],
      },
    ],
  });
});
