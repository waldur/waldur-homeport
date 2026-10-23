import { describe, it, expect } from 'vitest';

import { type RootState } from '@/store/reducers';
import { selectFilterValues } from '@/table/selectors';

describe('selectFilterValues', () => {
  const makeState = (filtersStorage: any[]) =>
    ({
      tables: {
        myTable: { filtersStorage },
      },
    }) as unknown as RootState;

  it('flattens filtersStorage into a {name: value} map', () => {
    const state = makeState([
      { name: 'offering', value: { uuid: 'o1' } },
      { name: 'state', value: 'OK' },
    ]);
    expect(selectFilterValues('myTable')(state)).toEqual({
      offering: { uuid: 'o1' },
      state: 'OK',
    });
  });

  // Regression: inline `selectFilterValues(table)` used to build a fresh
  // createSelector each render, returning a new object reference every time.
  // That made react-redux's useSyncExternalStore re-render forever
  // ("Maximum update depth exceeded") on tables with active filters.
  it('returns a stable reference across separate factory calls for the same table', () => {
    const state = makeState([{ name: 'offering', value: { uuid: 'o1' } }]);

    // Two independent invocations of the factory, as happens across renders.
    const first = selectFilterValues('myTable')(state);
    const second = selectFilterValues('myTable')(state);

    expect(second).toBe(first); // same reference, not just equal
  });

  it('recomputes when filtersStorage actually changes', () => {
    const state1 = makeState([{ name: 'offering', value: 'a' }]);
    const state2 = makeState([{ name: 'offering', value: 'b' }]);

    const result1 = selectFilterValues('myTable')(state1);
    const result2 = selectFilterValues('myTable')(state2);

    expect(result1).not.toBe(result2);
    expect(result2).toEqual({ offering: 'b' });
  });
});
