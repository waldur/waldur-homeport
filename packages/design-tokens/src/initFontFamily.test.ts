import { describe, expect, it } from 'vitest';

import { initFontFamily } from './initFontFamily';

describe('initFontFamily', () => {
  it('sets the font stack on the target', () => {
    const el = document.createElement('div');
    initFontFamily('Maven Pro', el);
    expect(el.style.getPropertyValue('--font-family')).toBe(
      'Maven Pro, Helvetica, sans-serif',
    );
  });
});
