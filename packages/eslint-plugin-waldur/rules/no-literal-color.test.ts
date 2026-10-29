import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import rule from './no-literal-color.js';

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

describe('no-literal-color', () => {
  ruleTester.run('no-literal-color', rule as any, {
    valid: [
      {
        code: 'const A = () => <div className="text-primary bg-secondary" />;',
        filename: 'src/a.tsx',
        options: options(),
      },
      {
        code: 'const A = () => <path fill="currentColor" />;',
        filename: 'src/a.tsx',
        options: options(),
      },
      // At or under the file's baseline count.
      {
        code: "const o = { color: '#667085', fill: 'white' };",
        filename: 'src/a.ts',
        options: options({ 'src/a.ts': 2 }),
      },
      // Comments, anchors and colours built from tokens are not literals.
      {
        code: "// was #666\nconst a = '#/projects';\nconst b = 'rgba(var(--brand-color-rgb), 0.1)';",
        filename: 'src/a.ts',
        options: options(),
      },
      // Files the checks do not cover: tests, stories, the token sources.
      {
        code: "const c = '#d92d20';",
        filename: 'src/a.test.ts',
        options: options(),
      },
      {
        code: "const c = '#d92d20';",
        filename: 'src/a.stories.tsx',
        options: options(),
      },
      {
        code: "const c = '#d92d20';",
        filename: 'packages/design-tokens/src/a.ts',
        options: options(),
      },
    ],
    invalid: [
      {
        code: 'const A = () => <div style={{ color: "#d92d20" }} />;',
        filename: 'src/a.tsx',
        options: options(),
        errors: [
          {
            messageId: 'literal',
            line: 1,
            column: 39,
            endColumn: 46,
            data: {
              value: '#d92d20',
              token: ' (= error-600)',
              count: 1,
              allowed: 0,
              hint: 'a text-*/bg-*/border-* utility, getChartThemeColors() in a chart, or currentColor in SVG',
            },
          },
        ],
      },
      {
        code: 'const A = () => <rect fill="white" stroke="rgb(0, 0, 0)" />;',
        filename: 'src/a.tsx',
        options: options(),
        errors: [
          { messageId: 'literal', column: 29 },
          { messageId: 'literal', column: 44 },
        ],
      },
      // Over the baseline: every literal in the file is listed.
      {
        code: "const o = {\n  color: '#667085',\n  borderColor: '#f3f4f6',\n};",
        filename: 'src/a.ts',
        options: options({ 'src/a.ts': 1 }),
        errors: [
          {
            messageId: 'literal',
            line: 2,
            data: {
              value: '#667085',
              token: ' (= gray-500)',
              count: 2,
              allowed: 1,
              hint: 'a text-*/bg-*/border-* utility, getChartThemeColors() in a chart, or currentColor in SVG',
            },
          },
          { messageId: 'literal', line: 3 },
        ],
      },
    ],
  });
});
