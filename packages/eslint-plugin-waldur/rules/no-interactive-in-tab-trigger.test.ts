import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import noInteractiveInTabTrigger from './no-interactive-in-tab-trigger.js';

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

describe('no-interactive-in-tab-trigger', () => {
  ruleTester.run(
    'no-interactive-in-tab-trigger',
    noInteractiveInTabTrigger as any,
    {
      valid: [
        { code: '<TabsTrigger value="a" hint="Help">A</TabsTrigger>' },
        // Decorative content is fine.
        {
          code: '<TabsTrigger value="a"><LockIcon aria-hidden="true" /><span>A</span></TabsTrigger>',
        },
        // A HelpIcon next to the strip, not inside a trigger.
        { code: '<TabsList><TabsTrigger value="a">A</TabsTrigger></TabsList>' },
      ],
      invalid: [
        {
          code: '<TabsTrigger value="a">A <Link state="x">x</Link></TabsTrigger>',
          errors: [{ messageId: 'nested' }],
        },
        {
          code: '<TabsTrigger value="a">A <HelpIcon label="x" /></TabsTrigger>',
          errors: [{ messageId: 'nested' }],
        },
        {
          code: '<TabsTrigger value="a"><>{show && <button>x</button>}</></TabsTrigger>',
          errors: [{ messageId: 'nested' }],
        },
      ],
    },
  );
});
