import { describe, it, expect } from 'vitest';

import { type RootState } from '@waldur/store/reducers';
import { makeSelectTableRows } from '@waldur/table/selectors';

describe('makeSelectTableRows', () => {
  it('should return rows composed from entities by order', () => {
    const selectTableRows = makeSelectTableRows();
    const table = 'userList';
    const rows = [
      {
        userName: 'Daniel',
        email: 'daniel@gmail.com',
      },
      {
        userName: 'Alice',
        email: 'alice@gmail.com',
      },
    ];
    const state = {
      tables: {
        [table]: {
          entities: {
            1: {
              userName: 'Daniel',
              email: 'daniel@gmail.com',
            },
            2: {
              userName: 'Alice',
              email: 'alice@gmail.com',
            },
          },
          order: [1, 2],
        },
      },
    } as unknown as RootState;
    expect(selectTableRows(state, table)).toEqual(rows);
  });

  it('should not thrash cache when two selector instances alternate tables', () => {
    const selectorA = makeSelectTableRows();
    const selectorB = makeSelectTableRows();

    const state = {
      tables: {
        tableA: {
          entities: { '1': { id: 1 } },
          order: ['1'],
        },
        tableB: {
          entities: { '2': { id: 2 } },
          order: ['2'],
        },
      },
    } as unknown as RootState;

    // First call — populates each selector's cache
    const rowsA1 = selectorA(state, 'tableA');
    const rowsB1 = selectorB(state, 'tableB');

    // Second call — should return the cached reference
    const rowsA2 = selectorA(state, 'tableA');
    const rowsB2 = selectorB(state, 'tableB');

    expect(rowsA2).toBe(rowsA1); // same reference, not just equal
    expect(rowsB2).toBe(rowsB1);
  });
});
