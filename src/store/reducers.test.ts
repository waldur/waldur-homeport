import { describe, expect, it } from 'vitest';

import { ALL_RESOURCES_TABLE_ID } from '@/marketplace/resources/list/constants';
import { setFilter } from '@/table/actions';
import { INITIAL_STATE } from '@/table/constants';

import { resetSession, rootReducer } from './reducers';

describe('rootReducer tables', () => {
  it('has the all-resources table before it mounts, for the sidebar filters', () => {
    const state = rootReducer(undefined, { type: '@@INIT' });
    expect(state.tables[ALL_RESOURCES_TABLE_ID]).toBe(INITIAL_STATE);
  });

  it('updates a table by id and keeps the seeded one', () => {
    let state = rootReducer(undefined, { type: '@@INIT' });
    state = rootReducer(
      state,
      setFilter('projects', { name: 'state', value: 'OK', label: null }),
    );
    expect(state.tables.projects.filtersStorage).toEqual([
      { name: 'state', value: 'OK', label: null },
    ]);
    expect(state.tables[ALL_RESOURCES_TABLE_ID]).toBe(INITIAL_STATE);

    state = rootReducer(state, resetSession());
    expect(Object.keys(state.tables)).toEqual([ALL_RESOURCES_TABLE_ID]);
  });
});
