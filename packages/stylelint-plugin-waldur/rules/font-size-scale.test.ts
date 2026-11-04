import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';

import plugin from '../index.js';

import { checkFontSize, ruleName, shorthandSize } from './font-size-scale.js';

async function lint(code: string) {
  const result = await stylelint.lint({
    code,
    codeFilename: 'test.scss',
    customSyntax: 'postcss-scss',
    config: { plugins: [plugin], rules: { [ruleName]: true } },
  });
  return result.results[0].warnings;
}

describe('checkFontSize', () => {
  it.each([
    'var(--text-xs)',
    'var(--text-sm)',
    'var(--text-4xl)',
    '0.875em',
    '1em',
    '85%',
    'inherit',
    'smaller',
    'larger',
  ])('accepts %s', (value) => {
    expect(checkFontSize(value)).toBeUndefined();
  });

  it.each([
    ['14px', 'sm'],
    ['1.077rem', 'sm'],
    ['0.925rem', 'xs'],
    ['1.75rem', '2xl'],
  ])('names the token %s equals', (value, token) => {
    expect(checkFontSize(value)).toEqual({ token });
  });

  it.each([
    '13px',
    '1rem',
    '$h3-font-size',
    'var(--text-md)',
    'calc(1rem + 1px)',
  ])('rejects %s with no equal token', (value) => {
    expect(checkFontSize(value)).toEqual({ token: undefined });
  });
});

describe('shorthandSize', () => {
  it.each([
    ['600 1.077rem/1.2 var(--font-sans)', '1.077rem'],
    ['italic var(--text-sm) Inter, sans-serif', 'var(--text-sm)'],
    ['var(--font-weight-medium) var(--text-xs)/1 Inter', 'var(--text-xs)'],
    ['$font-size-lg Inter', '$font-size-lg'],
    ['inherit', undefined],
    ['menu', undefined],
  ])('reads %s', (value, size) => {
    expect(shorthandSize(value)).toBe(size);
  });
});

describe(ruleName, () => {
  it('reports an off-scale size, ignoring !important', async () => {
    const warnings = await lint(`
      .a { font-size: 1.077rem !important; }
      .b { font-size: var(--text-sm); }
      .c { font-weight: 14px; }
    `);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toContain('the --text-sm token');
  });

  it('checks the size in a font shorthand', async () => {
    const warnings = await lint(`
      .a { font: 600 1.077rem/1.2 var(--font-sans); }
      .b { font: var(--text-sm)/1.5 var(--font-sans); }
      .c { font: inherit; }
    `);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toContain('"1.077rem"');
  });

  it('reports a Sass variable', async () => {
    const warnings = await lint('.a { font-size: $font-size-lg; }');
    expect(warnings).toHaveLength(1);
  });
});
