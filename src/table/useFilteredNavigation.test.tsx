import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore as createStore } from 'redux';
import { describe, expect, it } from 'vitest';

import { router } from '@/router';

import { setFilter } from './actions';
import { tablesReducer } from './store';
import { useFilteredNavigation } from './useFilteredNavigation';

const setup = () => {
  const store = createStore(combineReducers({ tables: tablesReducer }));
  const { result } = renderHook(() => useFilteredNavigation(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });
  return { store, go: result.current };
};

const tableOf = (store, table: string) =>
  (store.getState().tables as Record<string, any>)[table];

describe('useFilteredNavigation', () => {
  it('replaces a filter the list kept from an earlier visit', () => {
    const { store, go } = setup();
    store.dispatch(
      setFilter('Orders', {
        name: 'state',
        value: 'done',
        label: null,
        component: null,
      }),
    );

    go('orders', 'Orders', { state: 'pending' }, { uuid: 'c1' });

    expect(tableOf(store, 'Orders').filtersStorage).toEqual([
      expect.objectContaining({ name: 'state', value: 'pending' }),
    ]);
    expect(router.stateService.go).toHaveBeenCalledWith('orders', {
      uuid: 'c1',
    });
  });

  it('clears a filter given no value, and starts on the first page', () => {
    const { store, go } = setup();
    store.dispatch(
      setFilter('Orders', {
        name: 'state',
        value: 'done',
        label: null,
        component: null,
      }),
    );

    go('orders', 'Orders', { state: null });

    expect(tableOf(store, 'Orders').filtersStorage).toEqual([]);
    expect(tableOf(store, 'Orders').pagination.currentPage).toBe(1);
  });
});
