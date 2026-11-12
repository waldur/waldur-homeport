import { DrawerProvider } from '@/drawer/DrawerContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it } from 'vitest';

import { fetchAll } from './api';
import { getTableOptions } from './registry';
import { useRowsTable } from './useRowsTable';

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createStore(() => ({ tables: {} }))}>
    <QueryClientProvider client={new QueryClient()}>
      <DrawerProvider>{children}</DrawerProvider>
    </QueryClientProvider>
  </Provider>
);

describe('useRowsTable', () => {
  it('lets the Export reach every row, page by page', async () => {
    const rows = Array.from({ length: 25 }, (_, index) => ({ index }));
    renderHook(() => useRowsTable('rows-table-export', rows, rows), {
      wrapper,
    });
    const { fetchData } = getTableOptions('rows-table-export');
    const all = await fetchAll(fetchData, {
      tableKey: 'rows-table-export',
      pageSize: 10,
      currentPage: 1,
      filter: {},
    } as any);
    expect(all).toEqual(rows);
  });

  it('hands its export options to the table', () => {
    const exportFields = () => ['A'];
    renderHook(
      () => useRowsTable('rows-table-options', [], null, { exportFields }),
      { wrapper },
    );
    expect(getTableOptions('rows-table-options').exportFields).toBe(
      exportFields,
    );
  });
});
