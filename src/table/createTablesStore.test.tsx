import { act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderHookWithProviders } from '@/test/harness';

import { createTablesStore } from './store';
import { TableRequest } from './types';
import { useTable } from './useTable';

// What a micro-app has: a store with only `tables`, no homeport root store.
const renderOnTablesStore = (fetchData) => {
  const store = createTablesStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <DrawerProvider>{children}</DrawerProvider>
    </Provider>
  );
  const view = renderHookWithProviders(
    () => useTable({ table: 'projects', fetchData, queryField: 'name' }),
    { wrapper },
  );
  return { ...view, store };
};

const lastRequest = (fetchData) =>
  fetchData.mock.calls.at(-1)[0] as TableRequest;

describe('createTablesStore', () => {
  it('runs a table with no other Redux state', async () => {
    const fetchData = vi.fn((request: TableRequest) =>
      Promise.resolve({
        rows: [{ uuid: `page-${request.currentPage}` }],
        resultCount: 25,
      }),
    );
    const { result, store } = renderOnTablesStore(fetchData);

    await waitFor(() =>
      expect(result.current.rows).toEqual([{ uuid: 'page-1' }]),
    );
    expect(result.current.pagination.resultCount).toBe(25);

    act(() => result.current.gotoPage(2));
    await waitFor(() =>
      expect(result.current.rows).toEqual([{ uuid: 'page-2' }]),
    );
    expect(lastRequest(fetchData).currentPage).toBe(2);

    act(() => result.current.sortList({ field: 'name', mode: 'desc' }));
    await waitFor(() => expect(lastRequest(fetchData).filter.o).toBe('-name'));

    act(() =>
      result.current.setFilter({ name: 'state', value: 'OK', label: null }),
    );
    expect(store.getState().tables.projects.filtersStorage).toEqual([
      { name: 'state', value: 'OK', label: null },
    ]);

    act(() => result.current.selectRow({ uuid: 'page-2' }));
    expect(result.current.selectedRows).toEqual([{ uuid: 'page-2' }]);
    expect(Object.keys(store.getState())).toEqual(['tables']);
  });

  it('starts from the tables it is given', () => {
    const store = createTablesStore({ projects: { query: 'demo' } as any });
    expect(store.getState().tables.projects.query).toBe('demo');
  });
});
