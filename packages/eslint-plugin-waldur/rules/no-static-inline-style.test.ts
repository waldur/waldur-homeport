import { RuleTester } from 'eslint';
import { parser as tsParser } from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import rule, { utilityFor } from './no-static-inline-style.js';

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

describe('no-static-inline-style', () => {
  ruleTester.run('no-static-inline-style', rule as any, {
    valid: [
      // The utility is already in className.
      { code: 'const A = () => <div className="max-w-full max-h-20" />;' },

      // A value measured, animated or derived at runtime.
      { code: 'const A = () => <div style={{ width: `${pct}%` }} />;' },
      { code: 'const A = () => <div style={{ height: containerHeight }} />;' },
      { code: 'const A = () => <div style={{ maxHeight }} />;' },
      { code: 'const A = () => <div style={{ width: size * 2 }} />;' },
      {
        code: 'const A = () => <div style={{ transform: `rotate(${deg}deg)` }} />;',
      },

      // A CSS custom property bridging a varying value into a literal utility.
      {
        code: "const A = () => <div style={{ '--sidebar-width': '240px' }} />;",
      },

      // A spread of a caller's style.
      { code: 'const A = () => <div style={{ ...style }} />;' },
      // A spread makes merge order decide the winner, so the whole object is
      // left alone.
      { code: 'const A = () => <div style={{ width: 16, ...style }} />;' },
      { code: "const A = () => <div style={{ ...rest, display: 'flex' }} />;" },

      // No utility to name.
      {
        code: "const A = () => <div style={{ background: 'linear-gradient(transparent, #fff)' }} />;",
      },
      { code: "const A = () => <div style={{ maskType: 'alpha' }} />;" },
      {
        code: "const A = () => <div style={{ gridTemplateColumns: '6rem repeat(3, auto) 1fr' }} />;",
      },
      {
        code: "const A = () => <div style={{ borderBottom: '1px solid var(--border-secondary)' }} />;",
      },
      // An off-grid flex shorthand with no utility.
      { code: "const A = () => <div style={{ flex: '0 0 220px' }} />;" },

      // Owned by the three rules that already report them inline.
      { code: 'const A = () => <div style={{ fontSize: 14 }} />;' },
      { code: 'const A = () => <div style={{ fontWeight: 600 }} />;' },
      { code: 'const A = () => <div style={{ borderRadius: 4 }} />;' },

      // Not a JSX style attribute at all.
      { code: "const o = { legend: { display: 'flex', width: 320 } };" },
      { code: "const A = () => <Chart options={{ display: 'none' }} />;" },

      // A fraction `max-w-*` does not have, so nothing to name.
      { code: "const A = () => <div style={{ maxWidth: '50%' }} />;" },
    ],
    invalid: [
      // The example from the audit.
      {
        code: "const A = () => <img style={{ maxWidth: '100%', maxHeight: '80px' }} />;",
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'maxWidth', utility: 'max-w-full' },
          },
          {
            messageId: 'prefer',
            data: { property: 'maxHeight', utility: 'max-h-20' },
          },
        ],
      },
      // Keyword, 1:1.
      {
        code: "const A = () => <p style={{ whiteSpace: 'pre-wrap' }} />;",
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'whiteSpace', utility: 'whitespace-pre-wrap' },
          },
        ],
      },
      {
        code: "const A = () => <div style={{ display: 'none', cursor: 'pointer' }} />;",
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'display', utility: 'hidden' },
          },
          {
            messageId: 'prefer',
            data: { property: 'cursor', utility: 'cursor-pointer' },
          },
        ],
      },
      // A number is px, and lands on the 4px scale.
      {
        code: 'const A = () => <div style={{ minWidth: 160 }} />;',
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'minWidth', utility: 'min-w-40' },
          },
        ],
      },
      // A half step.
      {
        code: 'const A = () => <div style={{ minWidth: 90 }} />;',
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'minWidth', utility: 'min-w-22.5' },
          },
        ],
      },
      // Logical sides.
      {
        code: "const A = () => <div style={{ paddingLeft: '16px', marginRight: 8 }} />;",
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'paddingLeft', utility: 'ps-4' },
          },
          {
            messageId: 'prefer',
            data: { property: 'marginRight', utility: 'me-2' },
          },
        ],
      },
      // An off-grid px is named arbitrary, not as an unreadable `m-4.25`.
      {
        code: 'const A = () => <div style={{ margin: 17 }} />;',
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'margin', utility: 'm-[17px]' },
          },
        ],
      },
      // A viewport unit.
      {
        code: "const A = () => <div style={{ maxHeight: '70vh' }} />;",
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'maxHeight', utility: 'max-h-[70vh]' },
          },
        ],
      },
      // calc()'s spaces cannot survive into a class name.
      {
        code: "const A = () => <div style={{ height: 'calc(100vh - 320px)' }} />;",
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'height', utility: 'h-[calc(100vh-320px)]' },
          },
        ],
      },
      // A template literal with no holes is still a literal.
      {
        code: 'const A = () => <div style={{ width: `100%` }} />;',
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'width', utility: 'w-full' },
          },
        ],
      },
      // A quoted key. React wants camelCase, so the kebab spelling is not a
      // declaration this rule claims to know.
      {
        code: "const A = () => <div style={{ 'minHeight': 0 }} />;",
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'minHeight', utility: 'min-h-0' },
          },
        ],
      },
      // Inside a conditional style object, the static branch still counts.
      {
        code: "const A = () => <div style={cond ? { overflowY: 'auto' } : {}} />;",
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'overflowY', utility: 'overflow-y-auto' },
          },
        ],
      },
      // A negative step keeps Tailwind's leading dash.
      {
        code: 'const A = () => <div style={{ marginBottom: -2 }} />;',
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'marginBottom', utility: '-mb-0.5' },
          },
        ],
      },
      // The static half of a mixed object is reported; the computed half is not.
      {
        code: 'const A = () => <div style={{ display: "flex", height: rowHeight }} />;',
        errors: [
          {
            messageId: 'prefer',
            data: { property: 'display', utility: 'flex' },
          },
        ],
      },
    ],
  });

  // The length mapping carries the plan's whole scale story, so it is worth
  // checking directly rather than only through the reports above.
  it('maps lengths through the px-pinned 4px scale', () => {
    expect(utilityFor('maxWidth', 520)).toBe('max-w-130');
    expect(utilityFor('maxHeight', '80px')).toBe('max-h-20');
    expect(utilityFor('padding', '16px')).toBe('p-4');
    expect(utilityFor('gap', 16)).toBe('gap-4');
    expect(utilityFor('minWidth', 0)).toBe('min-w-0');
    expect(utilityFor('paddingRight', 0)).toBe('pe-0');
    expect(utilityFor('width', 10)).toBe('w-2.5');
    expect(utilityFor('marginLeft', 46)).toBe('ms-11.5');
  });

  // no-bootstrap-layout-utility rejects w/h/min-w/min-h/top/bottom/start/end
  // at steps 25, 50, 75 and 100, because Bootstrap used those names for
  // percentages. The two rules have to agree, or the codemod writes a class
  // the linter then rejects.
  it('avoids the steps Bootstrap made ambiguous', () => {
    expect(utilityFor('minWidth', 200)).toBe('min-w-[200px]');
    expect(utilityFor('width', 100)).toBe('w-[100px]');
    expect(utilityFor('width', 300)).toBe('w-[300px]');
    expect(utilityFor('height', 400)).toBe('h-[400px]');
    expect(utilityFor('top', 200)).toBe('top-[200px]');
    // max-w and max-h were never ambiguous: Bootstrap spelled them mw-/mh-.
    expect(utilityFor('maxWidth', 200)).toBe('max-w-50');
    expect(utilityFor('maxHeight', 400)).toBe('max-h-100');
    // Other prefixes keep the step.
    expect(utilityFor('padding', 100)).toBe('p-25');
    expect(utilityFor('marginTop', 200)).toBe('mt-50');
    // Neighbouring steps are unaffected.
    expect(utilityFor('minWidth', 196)).toBe('min-w-49');
    expect(utilityFor('width', 104)).toBe('w-26');
  });

  it('names an arbitrary utility where the scale has no step', () => {
    expect(utilityFor('width', 42.5)).toBe('w-[42.5px]');
    expect(utilityFor('width', 1)).toBe('w-[1px]');
    expect(utilityFor('minWidth', '10ch')).toBe('min-w-[10ch]');
    expect(utilityFor('minHeight', '1.2em')).toBe('min-h-[1.2em]');
    expect(utilityFor('width', '5%')).toBe('w-[5%]');
  });

  it('keeps the keyword utilities a length utility also accepts', () => {
    expect(utilityFor('width', '100%')).toBe('w-full');
    expect(utilityFor('height', 'auto')).toBe('h-auto');
    expect(utilityFor('minWidth', 'max-content')).toBe('min-w-max');
    expect(utilityFor('maxWidth', 'none')).toBe('max-w-none');
    expect(utilityFor('width', '50%')).toBe('w-1/2');
  });

  it('has nothing to name for a value with no utility', () => {
    expect(utilityFor('maxWidth', '50%')).toBeNull();
    expect(utilityFor('minWidth', 'none')).toBeNull();
    expect(utilityFor('display', 'ruby')).toBeNull();
    expect(utilityFor('background', 'linear-gradient(#fff, #000)')).toBeNull();
    expect(utilityFor('animation', 'spin 1s linear infinite')).toBeNull();
    expect(utilityFor('fontSize', 14)).toBeNull();
    expect(utilityFor('width', 'var(--w)')).toBeNull();
  });
});
