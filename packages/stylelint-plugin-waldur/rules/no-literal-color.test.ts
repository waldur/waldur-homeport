import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';

import plugin from '../index.js';

import { ruleName } from './no-literal-color.js';

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

describe(ruleName, () => {
  it('reports a hard-coded colour with its line, column and ramp step', async () => {
    const warnings = await lint('.a {\n  color: #d92d20;\n}', 'src/a.scss');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({ line: 2, column: 10 });
    expect(warnings[0].text).toContain(
      '"#d92d20" is a hard-coded colour (= error-600)',
    );
  });

  it('reports named colours, colour functions and SCSS variables', async () => {
    const warnings = await lint(
      '$x: white;\n.a { border: 1px solid rgb(0 0 0 / 0.2); }',
      'src/a.scss',
    );
    expect(warnings.map((w) => w.text.match(/^"([^"]+)"/)?.[1])).toEqual([
      'white',
      'rgb(0 0 0 / 0.2)',
    ]);
  });

  it('allows tokens, comments and colours built from variables', async () => {
    const warnings = await lint(
      '/* was #666 */\n.a { color: var(--text-primary); background: rgba($black, 0.1); }',
      'src/a.scss',
    );
    expect(warnings).toEqual([]);
  });

  it('stays quiet while a file is within its baseline count', async () => {
    const code = '.a { color: #667085; background: #f2f4f7; }';
    expect(await lint(code, 'src/a.css', { 'src/a.css': 2 })).toEqual([]);
    expect(await lint(code, 'src/a.css', { 'src/a.css': 1 })).toHaveLength(2);
  });

  it('skips the design token sources', async () => {
    expect(
      await lint(
        ':root { --x: #fff; }',
        'packages/design-tokens/src/css/a.css',
      ),
    ).toEqual([]);
  });
});
