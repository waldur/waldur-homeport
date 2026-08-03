import { describe, it, expect } from 'vitest';

import { initialState } from '@/table/store.fixture';

import * as actions from './actions';
import { getTableState } from './selectors';
import { reducer } from './store';

describe('Table reducer', () => {
  it('should return default state', () => {
    const state = { tables: {} };
    expect(getTableState('users')(state)).toEqual({
      loading: false,
      error: null,
      mode: 'table',
      pagination: {
        pageSize: 10,
        resultCount: 0,
        currentPage: 1,
      },
      entities: {},
      order: [],
      sorting: {
        mode: undefined,
        field: null,
        loading: false,
      },
      toggled: {},
      filterPosition: 'menu',
      filtersStorage: [],
      registeredFilterNames: [],
      savedFilters: [],
      selectedSavedFilter: null,
      activeColumns: {},
      applyFilters: false,
      columnPositions: [],
      pinnedColumnKeys: [],
      selectedRows: [],
      firstFetch: true,
    });
  });

  it('should handle start action', () => {
    const state: any = reducer(
      {},
      {
        type: actions.FETCH_LIST_START,
        payload: {
          table: 'users',
        },
      },
    );
    expect(state.users.loading).toBe(true);
  });

  it('should handle done action', () => {
    const state: any = reducer(
      {},
      {
        type: actions.FETCH_LIST_DONE,
        payload: {
          table: 'users',
          resultCount: 1,
        },
      },
    );
    expect(state.users.loading).toBe(false);
    expect(state.users.error).toBe(null);
    expect(state.users.pagination.resultCount).toBe(1);
  });

  // Leaf filters self-register their name so the table can tell its own filter
  // fields apart from unrelated global URL params.
  it('should register filter names and de-duplicate them', () => {
    let state: any = reducer(
      {},
      actions.registerFilterName('users', 'scope_type'),
    );
    expect(state.users.registeredFilterNames).toEqual(['scope_type']);

    state = reducer(state, actions.registerFilterName('users', 'role'));
    expect(state.users.registeredFilterNames).toEqual(['scope_type', 'role']);

    // Registering the same name again is a no-op (no duplicates).
    const before = state.users.registeredFilterNames;
    state = reducer(state, actions.registerFilterName('users', 'scope_type'));
    expect(state.users.registeredFilterNames).toBe(before);
  });

  it('should clear registered filter names on table teardown', () => {
    let state: any = reducer(
      {},
      actions.registerFilterName('users', 'scope_type'),
    );
    expect(state.users.registeredFilterNames).toEqual(['scope_type']);

    state = reducer(state, actions.clearRegisteredFilterNames('users'));
    expect(state.users.registeredFilterNames).toEqual([]);
  });

  it('should handle error action', () => {
    const state: any = reducer(
      {},
      {
        type: actions.FETCH_LIST_ERROR,
        payload: {
          table: 'users',
          error: 'Unable to fetch data.',
        },
      },
    );
    expect(state.users.loading).toBe(false);
    expect(state.users.error).toBe('Unable to fetch data.');
  });

  it('should handle goto page action', () => {
    const state: any = reducer(
      {},
      {
        type: actions.FETCH_LIST_GOTO_PAGE,
        payload: {
          table: 'users',
          page: 3,
        },
      },
    );
    expect(state.users.pagination.currentPage).toBe(3);
  });

  it('should handle ENTITY_CREATE action', () => {
    const prevState = reducer(
      {},
      {
        type: actions.FETCH_LIST_DONE,
        payload: {
          table: 'users',
          entities: initialState.entities,
          order: initialState.order,
          resultCount: 2,
        },
      },
    );
    const state: any = reducer(prevState, {
      type: actions.ENTITY_CREATE,
      payload: {
        table: 'users',
        uuid: '52ff72e159d7472fb35d4db517e6c16k',
        content: {
          uuid: '52ff72e159d7472fb35d4db517e6c16k',
          full_name: 'John Brown',
          email: 'john@gmail.com',
        },
      },
    });
    expect(state.users.entities).toEqual({
      '10ff42e159d7472fb35d4db517e6c16e': {
        uuid: '10ff42e159d7472fb35d4db517e6c16e',
        full_name: 'Dereck Benon',
        email: 'dereck@gmail.com',
      },
      '412ff42e159g7472fb3524db517e65165': {
        uuid: '412ff42e159g7472fb3524db517e65165',
        full_name: 'Alice Grown',
        email: 'alice@gmail.com',
      },
      '52ff72e159d7472fb35d4db517e6c16k': {
        uuid: '52ff72e159d7472fb35d4db517e6c16k',
        full_name: 'John Brown',
        email: 'john@gmail.com',
      },
    });
    expect(state.users.order).toEqual([
      '10ff42e159d7472fb35d4db517e6c16e',
      '412ff42e159g7472fb3524db517e65165',
      '52ff72e159d7472fb35d4db517e6c16k',
    ]);
  });

  it('should handle ENTITY_UPDATE action', () => {
    const prevState = reducer(
      {},
      {
        type: actions.FETCH_LIST_DONE,
        payload: {
          table: 'users',
          entities: initialState.entities,
          order: initialState.order,
          resultCount: 2,
        },
      },
    );
    const state: any = reducer(prevState, {
      type: actions.ENTITY_UPDATE,
      payload: {
        table: 'users',
        uuid: '10ff42e159d7472fb35d4db517e6c16e',
        content: {
          uuid: '10ff42e159d7472fb35d4db517e6c16e',
          full_name: 'Derek',
          email: 'derek@gmail.com',
        },
      },
    });
    expect(state.users.entities).toEqual({
      '10ff42e159d7472fb35d4db517e6c16e': {
        uuid: '10ff42e159d7472fb35d4db517e6c16e',
        full_name: 'Derek',
        email: 'derek@gmail.com',
      },
      '412ff42e159g7472fb3524db517e65165': {
        uuid: '412ff42e159g7472fb3524db517e65165',
        full_name: 'Alice Grown',
        email: 'alice@gmail.com',
      },
    });
    expect(state.users.order).toEqual([
      '10ff42e159d7472fb35d4db517e6c16e',
      '412ff42e159g7472fb3524db517e65165',
    ]);
  });

  it('should handle ENTITY_DELETE action', () => {
    const prevState = reducer(
      {},
      {
        type: actions.FETCH_LIST_DONE,
        payload: {
          table: 'users',
          entities: initialState.entities,
          order: initialState.order,
          resultCount: 2,
        },
      },
    );
    const state: any = reducer(prevState, {
      type: actions.ENTITY_DELETE,
      payload: {
        table: 'users',
        uuid: '10ff42e159d7472fb35d4db517e6c16e',
      },
    });
    expect(state.users.entities).toEqual({
      '412ff42e159g7472fb3524db517e65165': {
        uuid: '412ff42e159g7472fb3524db517e65165',
        full_name: 'Alice Grown',
        email: 'alice@gmail.com',
      },
    });
    expect(state.users.order).toEqual(['412ff42e159g7472fb3524db517e65165']);
  });

  it('should handle PAGE_SIZE_UPDATE action', () => {
    const state: any = reducer(
      {},
      {
        type: actions.PAGE_SIZE_UPDATE,
        payload: {
          table: 'users',
          size: 40,
        },
      },
    );
    expect(state.users.pagination.pageSize).toBe(40);
  });

  it('should handle SORT_LIST_START action', () => {
    const expected = {
      field: 'phone_number',
      mode: 'desc',
      loading: true,
    };
    const state: any = reducer(
      {},
      {
        type: actions.SORT_LIST_START,
        payload: {
          table: 'users',
          sorting: {
            field: 'phone_number',
            mode: 'desc',
          },
        },
      },
    );
    expect(state.users.sorting).toEqual(expected);
  });

  it('should handle toggleRow action', () => {
    const state: any = reducer(
      {},
      {
        type: actions.TOGGLE_ROW,
        payload: {
          table: 'users',
          row: 10,
        },
      },
    );
    expect(state.users.toggled).toEqual({ 10: true });
  });
});
