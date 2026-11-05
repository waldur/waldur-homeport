import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import rule from './no-rem-length.js';

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

const options = (baseline: Record<string, number> = {}) => [{ baseline }];

describe('no-rem-length', () => {
  ruleTester.run('no-rem-length', rule as any, {
    valid: [
      {
        code: 'const A = () => <div className="p-6 gap-[9px] text-sm" />;',
        filename: 'src/a.tsx',
        options: options(),
      },
      // At or under the file's baseline count.
      {
        code: 'const A = () => <div className="p-[1.85rem]" style={{ margin: "1rem" }} />;',
        filename: 'src/a.tsx',
        options: options({ 'src/a.tsx': 2 }),
      },
      // Comments, zero and words that only end in "rem" are not lengths.
      {
        code: "// was 1rem\nconst a = '0rem';\nconst b = 'item-2rem';\nconst c = 'lorem';",
        filename: 'src/a.ts',
        options: options(),
      },
      // Files the checks do not cover: tests, stories, the token sources.
      {
        code: "const c = 'p-[1rem]';",
        filename: 'src/a.test.tsx',
        options: options(),
      },
      {
        code: "const c = 'p-[1rem]';",
        filename: 'src/a.stories.tsx',
        options: options(),
      },
    ],
    invalid: [
      {
        code: 'const A = () => <div className="flex p-[0.923rem]" />;',
        filename: 'src/a.tsx',
        options: options(),
        errors: [
          {
            messageId: 'rem',
            line: 1,
            column: 41,
            endColumn: 49,
            data: {
              description:
                '0.923rem = 12px at the 13px root (= Tailwind step 3)',
              count: 1,
              allowed: 0,
            },
          },
        ],
      },
      {
        code: 'const A = () => <div className="text-[1.077rem]" />;',
        filename: 'src/a.tsx',
        options: options(),
        errors: [
          {
            messageId: 'rem',
            data: {
              description: '1.077rem = 14px at the 13px root (= text-sm)',
              count: 1,
              allowed: 0,
            },
          },
        ],
      },
      {
        code: "const A = () => <div style={{ paddingTop: '0.5rem' }} />;",
        filename: 'src/a.tsx',
        options: options(),
        errors: [
          {
            messageId: 'rem',
            data: {
              description: '0.5rem = 6.5px at the 13px root',
              count: 1,
              allowed: 0,
            },
          },
        ],
      },
      // Over the baseline: every rem in the file is listed.
      {
        code: 'const c = "max-w-[calc(100vw-3rem)] mt-[1.85rem]";',
        filename: 'src/a.ts',
        options: options({ 'src/a.ts': 1 }),
        errors: [
          {
            messageId: 'rem',
            data: {
              description: '3rem = 39px at the 13px root',
              count: 2,
              allowed: 1,
            },
          },
          {
            messageId: 'rem',
            data: {
              description:
                '1.85rem = 24.05px at the 13px root (≈ Tailwind step 6)',
              count: 2,
              allowed: 1,
            },
          },
        ],
      },
    ],
  });
});
