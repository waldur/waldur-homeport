import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe } from 'vitest';

import rule from './no-bootstrap-important-collision.js';

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

describe('no-bootstrap-important-collision', () => {
  ruleTester.run('no-bootstrap-important-collision', rule as any, {
    valid: [
      {
        code: 'const A = () => <span className="sr-only rounded-lg border-0" />;',
      },
      // A variant is a different class name, which Bootstrap does not define.
      { code: "const c = 'md:visually-hidden';" },
      // Names that only start with a colliding one.
      { code: "const c = 'visually-hidden-focusable btn-no-focus-ring';" },
      // Not a class list.
      { code: 'const A = () => <BaseButton variant="btn-no-focus" />;' },
      { code: "if (look === 'visually-hidden') {}" },
    ],
    invalid: [
      {
        code: 'const A = () => <span className="visually-hidden" aria-live="polite" />;',
        errors: [{ messageId: 'collision' }],
        output:
          'const A = () => <span className="sr-only" aria-live="polite" />;',
      },
      {
        code: 'const c = `w-[250px] ${a} visually-hidden`;',
        errors: [{ messageId: 'collision' }],
        output: 'const c = `w-[250px] ${a} sr-only`;',
      },
      // No fix: the class has no Tailwind counterpart.
      {
        code: 'const A = () => <BaseButton className="btn-no-focus" />;',
        errors: [{ messageId: 'collision' }],
      },
    ],
  });
});
