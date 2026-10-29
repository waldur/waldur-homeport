import { describe, expect, it } from 'vitest';

import { compareCounts } from '../../../scripts/color-literals.mjs';
import {
  findColorLiterals,
  loadRampIndex,
  nearestToken,
} from '../scripts/color-literals.mjs';

const values = (source: string, fileName: string) =>
  findColorLiterals(source, fileName).map((l) => l.value);

describe('findColorLiterals in scripts', () => {
  it('finds hex and colour functions anywhere in a string', () => {
    const source = [
      "const a = { border: '1px solid #ccc', color: 'rgba(0, 0, 0, 0.3)' };",
      "const b = { color: '#333', border: '1px dashed #666', shadow: 'inset 0 0 0 1px #999' };",
      "const g = 'linear-gradient(#000, transparent)';",
      'const html = `<span style="color:#667085">${name}</span>`;',
    ].join('\n');
    expect(values(source, 'a.ts')).toEqual([
      '#ccc',
      'rgba(0, 0, 0, 0.3)',
      '#333',
      '#666',
      '#999',
      '#000',
      '#667085',
    ]);
  });

  it('reports the line and column of each literal', () => {
    const [literal] = findColorLiterals("\nconst c = '#fff';", 'a.ts');
    expect(literal).toMatchObject({ line: 2, column: 12 });
  });

  it('ignores comments, anchors and HTML entities', () => {
    const source = [
      '// was #666',
      "const href = '#/projects';",
      "const quote = '&#39;';",
      "const id = '#section-1';",
      "const issue = 'Retired in #455 (see #1234), also (#469).';",
    ].join('\n');
    expect(values(source, 'a.ts')).toEqual([]);
  });

  it('ignores colour functions built from a token or a variable', () => {
    const source = [
      "const a = 'rgba(var(--brand-color-rgb), 0.1)';",
      'const b = `rgba(${rgb}, 0.2)`;',
      "const c = 'Use rgb() or hsl() here';",
    ].join('\n');
    expect(values(source, 'a.ts')).toEqual([]);
  });

  it('counts a named colour only under a colour-like key or attribute', () => {
    const source = [
      "const a = { fill: 'white', name: 'white', variant: 'green' };",
      'const b = <Icon color="red" weight="bold" />;',
      "const c = 'black';",
    ].join('\n');
    expect(values(source, 'a.tsx')).toEqual(['white', 'red']);
  });
});

describe('findColorLiterals in stylesheets', () => {
  it('finds literals in declaration values, SCSS variables included', () => {
    const source = [
      '/* #000 in a comment */',
      '$shadow: #101828;',
      '.a { color: white; border: 1px solid rgb(0 0 0 / 0.2); }',
      '.b { color: var(--text-primary); background: url(#white); }',
    ].join('\n');
    expect(values(source, 'a.scss')).toEqual([
      '#101828',
      'white',
      'rgb(0 0 0 / 0.2)',
    ]);
  });

  it('ignores colour functions over a variable', () => {
    expect(values('.a { color: rgba($black, 0.1); }', 'a.scss')).toEqual([]);
  });
});

describe('nearestToken', () => {
  const rampIndex = loadRampIndex();

  it('names the ramp token a hex value equals', () => {
    expect(nearestToken('#667085', rampIndex)).toEqual({
      token: 'gray-500',
      exact: true,
    });
    expect(nearestToken('#D0D5DD', rampIndex)).toEqual({
      token: 'gray-300',
      exact: true,
    });
  });

  it('names the closest ramp token otherwise', () => {
    expect(nearestToken('#f3f4f6', rampIndex)).toMatchObject({
      exact: false,
    });
    // Not the dark-UI ramp.
    expect(nearestToken('#666', rampIndex)).toEqual({
      token: 'gray-500',
      exact: false,
    });
  });

  it('returns null for anything but hex', () => {
    expect(nearestToken('white', rampIndex)).toBeNull();
  });
});

describe('compareCounts', () => {
  it('splits files into increased (including new) and decreased', () => {
    expect(compareCounts({ a: 2, b: 3, c: 1 }, { a: 2, b: 4, d: 1 })).toEqual({
      increased: [
        { file: 'b', before: 3, after: 4 },
        { file: 'd', before: 0, after: 1 },
      ],
      decreased: [{ file: 'c', before: 1, after: 0 }],
    });
  });
});
