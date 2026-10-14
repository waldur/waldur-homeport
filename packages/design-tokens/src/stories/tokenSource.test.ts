import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseTokenFile, utilitiesByToken } from './tokenSource';

const cssDir = path.resolve(__dirname, '../css');
const read = (file: string) => readFileSync(path.join(cssDir, file), 'utf8');
const tokenFiles = ['semantic', 'components'].flatMap((dir) =>
  readdirSync(path.join(cssDir, dir))
    .filter((f) => f.endsWith('.css') && f !== 'index.css')
    .map((f) => `${dir}/${f}`),
);

/** Every `--name:` declaration in the file, outside comments. */
const declaredNames = (css: string) =>
  new Set(
    [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:/g)].map(
      (m) => m[1],
    ),
  );

describe('tokenSource', () => {
  it.each(tokenFiles)('parses every token %s declares', (file) => {
    const css = read(file);
    const parsed = parseTokenFile(css);
    expect(new Set(parsed.tokens.map((t) => t.name))).toEqual(
      declaredNames(css),
    );
    for (const token of parsed.tokens) {
      expect(Object.keys(token.values).length).toBeGreaterThan(0);
    }
  });

  it('reads both themes and the comment above a declaration', () => {
    const { blocks, tokens } = parseTokenFile(read('semantic/text.css'));
    expect(blocks).toEqual(['light', 'dark']);
    const disabled = tokens.find((t) => t.name === '--text-disabled');
    expect(disabled?.values).toEqual({
      light: 'var(--color-gray-300)',
      dark: 'var(--color-gray-dark-500)',
    });
    expect(disabled?.note).toMatch(/disabled text/);
  });

  it('labels the sidebar styles by their attribute value', () => {
    const { blocks } = parseTokenFile(read('components/sidebar.css'));
    expect(blocks).toEqual(
      expect.arrayContaining([
        'light',
        'dark',
        'light style',
        'dark style',
        'primary style',
      ]),
    );
  });

  it('turns a short heading comment into a section, not a note', () => {
    const { tokens } = parseTokenFile(read('semantic/brand.css'));
    const first = tokens.find((t) => t.name === '--bg-brand-primary');
    expect(first?.section).toBe('Surfaces');
    expect(first?.note).toBeUndefined();
    // A heading followed by the token's own note keeps both.
    const text = tokens.find((t) => t.name === '--text-brand');
    expect(text?.section).toBe('Text and marks');
    expect(text?.note).toMatch(/tenant colour/);
  });

  it('maps tokens to the utilities that read them', () => {
    const utilities = utilitiesByToken(read('tailwind/theme.css'));
    expect(utilities.get('--text-tertiary')).toEqual(['text-tertiary']);
    expect(utilities.get('--bg-brand-subtle')).toEqual(['bg-brand-subtle']);
    expect(utilities.get('--text-brand')).toEqual([
      'text-brand',
      'border-brand',
      'outline-brand',
    ]);
    expect(utilities.get('--status-danger-fg')).toEqual(['text-danger']);
  });

  it('gives every component token file a Foundations page', () => {
    const stories = readFileSync(
      path.resolve(__dirname, '../ComponentTokens.stories.tsx'),
      'utf8',
    );
    const missing = tokenFiles
      .filter((f) => f.startsWith('components/'))
      .map((f) => path.basename(f, '.css'))
      .filter((name) => !stories.includes(`page('${name}'`));
    expect(missing, 'Add an export to ComponentTokens.stories.tsx').toEqual([]);
  });
});
