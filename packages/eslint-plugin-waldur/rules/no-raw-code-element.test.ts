import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import rule from './no-raw-code-element.js';

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

describe('no-raw-code-element', () => {
  ruleTester.run('no-raw-code-element', rule as any, {
    valid: [
      { code: 'const A = () => <Code>yarn start</Code>;' },
      { code: 'const A = () => <Kbd>⌘K</Kbd>;' },
      // A code block keeps its bare <code>.
      {
        code: 'const A = () => <pre className="p-3"><code>{text}</code></pre>;',
      },
      // …also when an expression inside the <pre> produces it.
      {
        code: 'const A = () => <pre>{lines.map((l) => <code key={l}>{l}</code>)}</pre>;',
      },
      { code: 'const A = () => <pre>{text && <code>{text}</code>}</pre>;' },
    ],
    invalid: [
      {
        code: 'const A = () => <p>Run <code>yarn start</code></p>;',
        errors: [
          { messageId: 'raw', data: { tag: 'code', replacement: 'Code' } },
        ],
      },
      {
        code: 'const A = () => <kbd className="text-xs">K</kbd>;',
        errors: [
          { messageId: 'raw', data: { tag: 'kbd', replacement: 'Kbd' } },
        ],
      },
      // Only a direct child of <pre> is a code block.
      {
        code: 'const A = () => <pre><span><code>x</code></span></pre>;',
        errors: [
          { messageId: 'raw', data: { tag: 'code', replacement: 'Code' } },
        ],
      },
      // An expression outside any <pre> is still inline code.
      {
        code: 'const A = () => <p>{name && <code>{name}</code>}</p>;',
        errors: [
          { messageId: 'raw', data: { tag: 'code', replacement: 'Code' } },
        ],
      },
    ],
  });
});
