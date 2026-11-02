import { describe, expect, it } from 'vitest';

import { DASH_ESCAPE_CODE } from './constants';
import { renderFieldOrDash } from './utils';

describe('renderFieldOrDash', () => {
  it.each([undefined, null, '', [], false, NaN])(
    'shows a dash for %j',
    (field) => {
      expect(renderFieldOrDash(field)).toBe(DASH_ESCAPE_CODE);
    },
  );

  it.each([0, 'root', ['a'], true])('keeps %j', (field) => {
    expect(renderFieldOrDash(field)).toBe(field);
  });
});
