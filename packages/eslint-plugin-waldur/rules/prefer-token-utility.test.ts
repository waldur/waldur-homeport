import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe, expect, it } from 'vitest';

import rule, { namedFor, readUtilities } from './prefer-token-utility.js';

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

const named = (token: string, name: string) => ({
  code: `const c = '${token}';`,
  output: `const c = '${name}';`,
  errors: [{ messageId: 'named' as const, data: { token, named: name } }],
});

describe('prefer-token-utility', () => {
  ruleTester.run('prefer-token-utility', rule as any, {
    valid: [
      // Already the utility.
      { code: "const c = 'text-quaternary bg-primary border-brand';" },
      // A variable with no utility keeps the arbitrary form.
      {
        code: "const c = 'bg-[var(--bg-brand-solid)] border-[var(--border-brand)]';",
      },
      // Component tokens have no utilities.
      {
        code: "const c = 'bg-[var(--input-bg)] border-[var(--check-border)]';",
      },
      // The status matrix is no-raw-status-ramp's.
      { code: "const c = 'text-[var(--status-danger-fg)]';" },
      // Ramps are out of scope.
      {
        code: "const c = 'bg-[var(--color-gray-100)] text-[var(--brand-600)]';",
      },
      // Not the same colour as the utility.
      {
        code: "const c = 'text-[var(--text-tertiary,red)] bg-[var(--bg-primary)]/50';",
      },
      // Sizes and lengths are not colours.
      { code: "const c = 'text-[14px] border-[1px]';" },
      // The same variable under a prefix theme.css does not define.
      { code: "const c = 'fill-[var(--text-tertiary)]';" },
    ],
    invalid: [
      named('text-[var(--text-quaternary)]', 'text-quaternary'),
      named('bg-[var(--bg-secondary)]', 'bg-secondary'),
      named('border-[var(--border-divider)]', 'border-divider'),
      // One variable, different utilities per prefix.
      named('border-[var(--text-brand)]', 'border-brand'),
      named('outline-[var(--text-brand)]', 'outline-brand'),
      // Variants, important and sides are kept.
      named(
        'hover:dark:text-[var(--text-secondary)]',
        'hover:dark:text-secondary',
      ),
      named('!bg-[var(--bg-primary)]', '!bg-primary'),
      named('border-t-[var(--border-secondary)]', 'border-t-secondary'),
      named(
        '[&:hover:not(:focus)]:text-[var(--text-primary)]',
        '[&:hover:not(:focus)]:text-primary',
      ),
      // Inside a class list, a JSX attribute and a template literal.
      {
        code: 'const A = () => <div className="flex text-[var(--text-tertiary)] gap-2" />;',
        output: 'const A = () => <div className="flex text-tertiary gap-2" />;',
        errors: [{ messageId: 'named' }],
      },
      {
        code: 'const c = `a text-[var(--text-senary)] ${x}`;',
        output: 'const c = `a text-senary ${x}`;',
        errors: [{ messageId: 'named' }],
      },
      // Several in one string are fixed in one pass.
      {
        code: "const c = 'text-[var(--text-secondary)] bg-[var(--bg-tertiary)]';",
        output: "const c = 'text-secondary bg-tertiary';",
        errors: [{ messageId: 'named' }, { messageId: 'named' }],
      },
    ],
  });
});

describe('the utility table is read from theme.css', () => {
  const utilities = readUtilities();

  it('maps a prefix and variable to the utility', () => {
    expect(utilities.get('text|--text-tertiary')).toBe('tertiary');
    expect(utilities.get('bg|--bg-primary')).toBe('primary');
    // theme.css points border-brand at --text-brand, so --border-brand has none.
    expect(utilities.get('border|--text-brand')).toBe('brand');
    expect(utilities.has('border|--border-brand')).toBe(false);
  });

  it('has no entry for a variable without a utility, or an excluded one', () => {
    expect(utilities.has('bg|--bg-brand-solid')).toBe(false);
    expect([...utilities.keys()].some((k) => k.includes('--status-'))).toBe(
      false,
    );
  });

  it('follows a stylesheet it is given', () => {
    const css = '@theme { --text-color-fancy: var(--text-fancy); }';
    expect(namedFor('text-[var(--text-fancy)]', readUtilities(css))).toBe(
      'text-fancy',
    );
  });

  it('never fixes a variable with two utilities of one prefix', () => {
    const css =
      '@theme { --text-color-a: var(--text-x); --text-color-b: var(--text-x); }';
    expect(namedFor('text-[var(--text-x)]', readUtilities(css))).toBeNull();
  });
});
