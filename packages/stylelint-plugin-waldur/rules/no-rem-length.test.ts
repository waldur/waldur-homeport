import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';

import {
  describeRem,
  findRemLiterals,
  remEquivalent,
} from '../../design-tokens/scripts/rem-literals.mjs';
import plugin from '../index.js';

import { ruleName } from './no-rem-length.js';

async function lint(
  code: string,
  codeFilename: string,
  baseline: Record<string, number> = {},
) {
  const result = await stylelint.lint({
    code,
    codeFilename,
    customSyntax: codeFilename.endsWith('.scss') ? 'postcss-scss' : undefined,
    config: {
      plugins: [plugin],
      rules: { [ruleName]: [true, { baseline }] },
    },
  });
  return result.results[0].warnings;
}

describe('remEquivalent', () => {
  it.each([
    ['0.923rem', {}, { px: 12, utility: '3', exact: true }],
    ['1.85rem', {}, { px: 24.05, utility: '6', exact: false }],
    ['0.462rem', {}, { px: 6.01, utility: '1.5', exact: true }],
    ['1.077rem', { fontSize: true }, { px: 14, utility: 'text-sm' }],
    ['-0.308rem', {}, { px: -4, utility: '-1' }],
  ])('%s at the 13px root', (value, options, expected) => {
    expect(remEquivalent(value, options)).toMatchObject(expected);
  });

  it.each([['1.25rem'], ['0.5rem'], ['1rem']])(
    'names no token for %s',
    (value) => {
      expect(remEquivalent(value).token).toBeUndefined();
    },
  );
});

describe('findRemLiterals', () => {
  it('finds lengths in declarations, SCSS variables and mixin calls', () => {
    const found = findRemLiterals(
      [
        '$gap: 0.923rem;',
        '.a { padding: 0.5rem 1rem; font-size: 1.077rem; }',
        '.b { @include pad(1.85rem); }',
        '/* 2rem in a comment */',
        '@media (min-width: 48rem) { .c { margin: 0rem; } }',
        '@container (min-width: 30rem) { .e { gap: 0; } }',
        ".d { content: '3rem'; }",
      ].join('\n'),
      'src/a.scss',
    );
    expect(found.map((f) => f.value)).toEqual([
      '0.923rem',
      '0.5rem',
      '1rem',
      '1.077rem',
      '1.85rem',
      '30rem',
    ]);
    expect(found[3]).toMatchObject({ line: 2, utility: 'text-sm' });
  });

  it('finds arbitrary classes and inline style values in TSX', () => {
    const found = findRemLiterals(
      [
        '// 4rem in a comment',
        'const A = () => (',
        '  <div className="p-[1.85rem] max-w-[calc(100vw-3rem)] text-[1.077rem]"',
        "    style={{ marginTop: '0.5rem', fontSize: '1.077rem' }} />",
        ');',
        "const id = 'item-2rem';",
      ].join('\n'),
      'src/a.tsx',
    );
    expect(
      found.map(({ kind, value, utility }) => [kind, value, utility]),
    ).toEqual([
      ['class', '1.85rem', '6'],
      ['class', '3rem', undefined],
      ['class', '1.077rem', 'text-sm'],
      ['style', '0.5rem', undefined],
      ['style', '1.077rem', 'text-sm'],
    ]);
  });

  it('describes a literal with its token in the form the code writes it', () => {
    const [decl] = findRemLiterals('.a { gap: 0.923rem; }', 'src/a.css');
    expect(describeRem(decl)).toBe(
      '0.923rem = 12px at the 13px root (= calc(var(--spacing) * 3))',
    );
    const [cls] = findRemLiterals('const c = "gap-[1.85rem]";', 'src/a.ts');
    expect(describeRem(cls)).toBe(
      '1.85rem = 24.05px at the 13px root (≈ Tailwind step 6)',
    );
  });
});

describe(ruleName, () => {
  it('reports a rem length with its px and token', async () => {
    const warnings = await lint('.a {\n  padding: 0.923rem;\n}', 'src/a.scss');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({ line: 2, column: 12 });
    expect(warnings[0].text).toContain(
      '0.923rem = 12px at the 13px root (= calc(var(--spacing) * 3))',
    );
    expect(warnings[0].text).toContain('its baseline allows 0');
  });

  it('allows a file up to its baseline count', async () => {
    const code = '.a { margin: 1rem 0.5rem; }';
    expect(await lint(code, 'src/a.css', { 'src/a.css': 2 })).toHaveLength(0);
    expect(await lint(code, 'src/a.css', { 'src/a.css': 1 })).toHaveLength(2);
  });

  it('skips the design token sources', async () => {
    const warnings = await lint(
      '.a { margin: 1rem; }',
      'packages/design-tokens/src/css/a.css',
    );
    expect(warnings).toHaveLength(0);
  });
});
