import * as actions from './actions';
import { reducer, getTableState } from './store'

describe('Table reducer', () => {
  it('should return default state', () => {
    const state = {'tables': {}};
    expect(getTableState('users')(state)).toEqual({
      rows: [],
      loading: false,
      error: null,
      pagination: {
        pageSize: 10,
        resultCount: 0,
        currentPage: 1,
      }
    });
  });

  it('should handle start action', () => {
    const state = reducer({}, {
      type: actions.FETCH_LIST_START,
      payload: {
        table: 'users'
      }
    });
    expect(state.users.loading).toBe(true);
  });

  it('should handle done action', () => {
    const state = reducer({}, {
      type: actions.FETCH_LIST_DONE,
      payload: {
        table: 'users',
        rows: [{
          name: 'Alice',
          id: 1
        }],
        resultCount: 1,
      }
    });
    expect(state.users.loading).toBe(false);
    expect(state.users.error).toBe(null);
    expect(state.users.pagination.resultCount).toBe(1);
  });

  it('should handle error action', () => {
    const state = reducer({}, {
      type: actions.FETCH_LIST_ERROR,
      payload: {
        table: 'users',
        error: 'Unable to fetch data.'
      }
    });
    expect(state.users.loading).toBe(false);
    expect(state.users.error).toBe('Unable to fetch data.');
  });

  it('should handle goto page action', () => {
    const state = reducer({}, {
      type: actions.FETCH_LIST_GOTO_PAGE,
      payload: {
        table: 'users',
        page: 3
      }
    });
    expect(state.users.pagination.currentPage).toBe(3);
  });

});
