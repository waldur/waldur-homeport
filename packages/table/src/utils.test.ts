import { describe, expect, it } from 'vitest';

import { DASH_ESCAPE_CODE } from './constants';
import { getId, renderFieldOrDash } from './utils';

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

describe('getId', () => {
  it('keys a row by its uuid, then pk, then position', () => {
    expect(getId({ uuid: 'u1', pk: 7 }, 3)).toBe('u1');
    expect(getId({ pk: 7 }, 3)).toBe(7);
    expect(getId({ name: 'x' }, 3)).toBe(3);
  });

  it("keys a row by the table's rowKey when the row has one", () => {
    // A job keeps its expanded state when a new job comes in above it.
    expect(getId({ job_id: '91' }, 0, 'job_id')).toBe('91');
    expect(getId({ name: 'x' }, 2, 'job_id')).toBe(2);
  });
});
