/* eslint-disable waldur-custom/no-bootstrap-color-utility, waldur-custom/enforce-border-radius-tokens */
import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';

import plugin from '../index.js';

import { checkRetiredClass, ruleName } from './no-retired-class-selectors.js';

async function lint(code: string) {
  const result = await stylelint.lint({
    code,
    codeFilename: 'test.scss',
    customSyntax: 'postcss-scss',
    config: {
      plugins: [plugin],
      rules: {
        [ruleName]: true,
      },
    },
  });
  return result.results[0].warnings;
}

describe('checkRetiredClass', () => {
  it('returns layout replacements', () => {
    expect(checkRetiredClass('d-flex')).toEqual({ replacement: 'flex' });
    expect(checkRetiredClass('justify-content-sm-end')).toEqual({
      replacement: 'sm:justify-end',
    });
    expect(checkRetiredClass('w-100')).toEqual({ replacement: 'w-full' });
    expect(checkRetiredClass('w-50')).toEqual({ replacement: 'w-1/2' });
    expect(checkRetiredClass('w-125px')).toEqual({ replacement: 'w-[125px]' });
    expect(checkRetiredClass('min-w-125px')).toEqual({
      replacement: 'min-w-[125px]',
    });
    expect(checkRetiredClass('mw-175px')).toEqual({
      replacement: 'max-w-[175px]',
    });
    expect(checkRetiredClass('h-500px')).toEqual({ replacement: 'h-[500px]' });
    expect(checkRetiredClass('mw-sm-25')).toEqual({
      replacement: 'sm:max-w-1/4',
    });
    expect(checkRetiredClass('flex-column')).toEqual({
      replacement: 'flex-col',
    });
  });

  it('returns font-size replacements', () => {
    expect(checkRetiredClass('fs-5')).toEqual({ replacement: 'text-base' });
    expect(checkRetiredClass('fs-1')).toEqual({ replacement: 'text-2xl' });
  });

  it('returns retired colors without replacement', () => {
    expect(checkRetiredClass('text-muted')).toEqual({ replacement: null });
    expect(checkRetiredClass('bg-light')).toEqual({ replacement: null });
  });

  it('returns retired weights replacements', () => {
    expect(checkRetiredClass('fw-bold')).toEqual({
      replacement: 'font-medium',
    });
    expect(checkRetiredClass('fw-normal')).toEqual({
      replacement: 'font-normal',
    });
  });

  it('returns retired radius replacements', () => {
    expect(checkRetiredClass('rounded-0')).toEqual({
      replacement: 'rounded-none',
    });
    expect(checkRetiredClass('rounded-pill')).toEqual({
      replacement: 'rounded-full',
    });
  });

  it('returns null for valid Tailwind or custom classes', () => {
    expect(checkRetiredClass('flex')).toBeNull();
    expect(checkRetiredClass('text-base')).toBeNull();
    expect(checkRetiredClass('card-title')).toBeNull();
    expect(checkRetiredClass('custom-button')).toBeNull();
  });
});

describe('waldur/no-retired-class-selectors rule', () => {
  it('accepts valid modern Tailwind and component selectors', async () => {
    const warnings = await lint(`
      .card > .flex { color: red; }
      .text-base { font-size: 16px; }
      [data-x=".d-flex"] .custom-table { display: block; }
      .card-#{$variant} { margin: 0; }
    `);
    expect(warnings).toEqual([]);
  });

  it('rejects retired layout class selectors', async () => {
    const warnings = await lint(`
      .drawer > .d-flex .justify-content-sm-end { color: blue; }
      &.flex-column { display: flex; }
    `);
    expect(warnings.length).toBe(3);
    expect(warnings[0].text).toContain(
      'Do not target retired class `.d-flex` (replaced by flex in markup)',
    );
    expect(warnings[1].text).toContain(
      'Do not target retired class `.justify-content-sm-end` (replaced by sm:justify-end in markup)',
    );
    expect(warnings[2].text).toContain(
      'Do not target retired class `.flex-column` (replaced by flex-col in markup)',
    );
  });

  it('rejects retired font size selectors', async () => {
    const warnings = await lint(`
      .fs-5:hover { font-weight: bold; }
    `);
    expect(warnings.length).toBe(1);
    expect(warnings[0].text).toContain(
      'Do not target retired class `.fs-5` (replaced by text-base in markup)',
    );
  });

  it('rejects retired color selectors', async () => {
    const warnings = await lint(`
      .text-muted { opacity: 0.5; }
    `);
    expect(warnings.length).toBe(1);
    expect(warnings[0].text).toContain(
      'Do not target retired class `.text-muted`. Add a semantic hook class to the element instead.',
    );
  });
});
