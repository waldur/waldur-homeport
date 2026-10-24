import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import rule from './require-weight-scale.js';

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

describe('require-weight-scale', () => {
  ruleTester.run('require-weight-scale', rule as any, {
    valid: [
      {
        code: 'const A = () => <div className="font-light font-normal font-medium font-semibold font-bold" />;',
      },
      {
        code: "const A = () => <div className={cn('hover:font-semibold')} />;",
      },
      // Chart options are not styles.
      { code: "const o = { label: { fontWeight: 'bold' } };" },
      // Names, not class lists.
      { code: "type W = 'fw-bold';" },
      { code: 'const A = () => <Button variant="fw-bold" />;' },
    ],
    invalid: [
      {
        code: 'const A = () => <span className="text-secondary fw-bold" />;',
        output:
          'const A = () => <span className="text-secondary font-medium" />;',
        errors: [
          {
            messageId: 'retired',
            data: { token: 'fw-bold', fix: 'font-medium' },
          },
        ],
      },
      {
        // Variants and the important modifier are kept.
        code: "const c = cn('hover:fw-bolder', 'fw-normal!');",
        output: "const c = cn('hover:font-semibold', 'font-normal!');",
        errors: [{ messageId: 'retired' }, { messageId: 'retired' }],
      },
      {
        // Never-defined names fix to the weight they ask for.
        code: 'const A = () => <b className="fw-semibold" />;',
        output: 'const A = () => <b className="font-semibold" />;',
        errors: [{ messageId: 'retired' }],
      },
      {
        code: 'const A = () => <h1 className="font-black" />;',
        errors: [
          { messageId: 'offScale', data: { token: 'font-black', hint: '' } },
        ],
      },
      {
        code: 'const A = () => <h1 className="font-[600]" />;',
        errors: [
          {
            messageId: 'offScale',
            data: { token: 'font-[600]', hint: ' (here: font-semibold)' },
          },
        ],
      },
      {
        code: "const A = () => <span style={{ color: 'red', fontWeight: 600 }} />;",
        errors: [{ messageId: 'inline' }],
      },
      {
        code: "const A = ({ x }) => <span style={x ? { fontWeight: 'bold' } : undefined} />;",
        errors: [{ messageId: 'inline' }],
      },
    ],
  });
});
