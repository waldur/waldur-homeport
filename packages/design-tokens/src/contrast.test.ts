import { describe, expect, it } from 'vitest';

import {
  contrastRatio,
  parseColor,
  readableOn,
  relativeLuminance,
} from './contrast';

describe('parseColor', () => {
  it.each([
    ['#ffffff', [255, 255, 255]],
    ['#1F5000', [31, 80, 0]],
    ['#0f0', [0, 255, 0]],
    ['  #307300 ', [48, 115, 0]],
    ['rgb(24, 34, 48)', [24, 34, 48]],
    ['rgba(31, 80, 0, 0.5)', [31, 80, 0]],
    ['rgb(1 2 3 / 50%)', [1, 2, 3]],
  ])('reads %s', (value, expected) => {
    expect(parseColor(value)).toEqual(expected);
  });

  it.each(['', 'red', '#12', '#12345', '#gggggg', 'rgb(1, 2)', 'var(--x)'])(
    'returns null for %j',
    (value) => {
      expect(parseColor(value)).toBeNull();
    },
  );
});

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance([0, 0, 0])).toBe(0);
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 10);
  });

  it('weights green above red above blue', () => {
    const [r, g, b] = [
      relativeLuminance([255, 0, 0]),
      relativeLuminance([0, 255, 0]),
      relativeLuminance([0, 0, 255]),
    ];
    expect(g).toBeGreaterThan(r);
    expect(r).toBeGreaterThan(b);
  });
});

describe('contrastRatio', () => {
  it('is 21:1 for black on white and 1:1 for a colour on itself', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#307300', '#307300')).toBe(1);
  });

  it('does not depend on which colour is first', () => {
    expect(contrastRatio('#1f242f', '#1f5000')).toBe(
      contrastRatio('#1f5000', '#1f242f'),
    );
  });

  it('matches the known figure for #767676 on white (4.54:1)', () => {
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });

  it('takes parsed colours as well as strings', () => {
    expect(contrastRatio([0, 0, 0], 'rgb(255, 255, 255)')).toBeCloseTo(21, 5);
  });

  it('says which colour it could not read', () => {
    expect(() => contrastRatio('#ffffff', 'var(--x)')).toThrow(
      'Not a colour: var(--x)',
    );
  });

  it('shows the dark-mode node label that was unreadable (1.6:1)', () => {
    expect(contrastRatio('#1f242f', '#1f5000')).toBeLessThan(2);
    expect(contrastRatio('#f0f1f1', '#1f5000')).toBeGreaterThan(8);
  });
});

describe('readableOn', () => {
  it('is white on a dark fill and black on a light one', () => {
    expect(readableOn('#1f5000')).toBe('#fff');
    expect(readableOn('#0c111d')).toBe('#fff');
    expect(readableOn('#e6f0e3')).toBe('#000');
    expect(readableOn('#ffffff')).toBe('#000');
    expect(readableOn('#000000')).toBe('#fff');
  });

  it('reads a computed rgb() value too', () => {
    expect(readableOn('rgb(31, 80, 0)')).toBe('#fff');
  });

  it('is null when the colour cannot be read', () => {
    expect(readableOn('var(--x)')).toBeNull();
  });
});
