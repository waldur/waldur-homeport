import { describe, expect, it } from 'vitest';

import { setMarketplaceFilter } from './actions';
import { filterReducer } from './reducer';

describe('filterReducer', () => {
  const withFilter = filterReducer(
    undefined,
    setMarketplaceFilter({
      name: 'category',
      value: { uuid: 'c1', labels: ['x', 'y'] },
    } as any),
  );

  it('keeps the state when the value is equal, in a different key order', () => {
    const state = filterReducer(
      withFilter,
      setMarketplaceFilter({
        name: 'category',
        value: { labels: ['x', 'y'], uuid: 'c1' },
      } as any),
    );
    expect(state).toBe(withFilter);
  });

  it('replaces the filter when the value changes', () => {
    const state = filterReducer(
      withFilter,
      setMarketplaceFilter({
        name: 'category',
        value: { uuid: 'c1', labels: ['y', 'x'] },
      } as any),
    );
    expect(state.filtersStorage).toEqual([
      { name: 'category', value: { uuid: 'c1', labels: ['y', 'x'] } },
    ]);
  });
});
