import { describe, expect, it } from 'vitest';

import { resolveCallStateFilter } from './call-tabs';

describe('resolveCallStateFilter', () => {
  it('is undefined when nothing selects a state', () => {
    expect(resolveCallStateFilter(undefined, undefined)).toBeUndefined();
    expect(resolveCallStateFilter(null, '')).toBeUndefined();
    expect(resolveCallStateFilter([], undefined)).toBeUndefined();
  });

  // What a state tab writes: `?state=active`.
  it('accepts a bare string from a tab', () => {
    expect(resolveCallStateFilter(undefined, 'active')).toEqual(['active']);
  });

  // What the multi-select filter stores, and what URL syncing used to write
  // back over the tab's value.
  it('accepts the filter form option objects', () => {
    expect(
      resolveCallStateFilter(
        [
          { label: 'Active', value: 'active' },
          { label: 'Draft', value: 'draft' },
        ],
        undefined,
      ),
    ).toEqual(['active', 'draft']);
  });

  it('accepts an array of plain strings', () => {
    expect(resolveCallStateFilter(['active', 'archived'])).toEqual([
      'active',
      'archived',
    ]);
  });

  // The form is the more specific choice, so it wins over the tab.
  it('prefers the first source that carries a selection', () => {
    expect(
      resolveCallStateFilter([{ label: 'Draft', value: 'draft' }], 'active'),
    ).toEqual(['draft']);
    expect(resolveCallStateFilter(undefined, 'active')).toEqual(['active']);
    expect(resolveCallStateFilter([], 'active')).toEqual(['active']);
  });

  it('drops entries that carry no value', () => {
    expect(
      resolveCallStateFilter([{ label: 'Broken' }, { value: 'active' }]),
    ).toEqual(['active']);
  });
});
