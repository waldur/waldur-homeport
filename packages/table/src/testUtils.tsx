import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { setTableQueryRows } from './mockTableQuery';
import { TableState } from './types';

const fakeInstance = { uuid: 'test-uuid', state: 'OK' };

/**
 * Renders a table component with one row. The test file must also stand in
 * for the table query:
 *   vi.mock('waldur-table/src/useTableQuery', () => import('@/table/mockTableQuery'));
 */
export const renderTable = (Component, tableId, _rowId, row) => {
  setTableQueryRows([row]);
  const mockStore = configureStore();
  const state: TableState = {
    loading: false,
    pagination: {
      pageSize: 10,
      resultCount: 1,
      currentPage: 1,
    },
    toggled: {},
    activeColumns: {},
    columnPositions: [],
  };
  const store = mockStore({
    tables: {
      [tableId]: state,
    },
    workspace: {
      user: {},
    },
    title: {
      title: '',
      subtitle: '',
    },
  });
  return renderWithProviders(
    <Provider store={store}>
      <DrawerProvider>
        <Component resourceScope={fakeInstance} />
      </DrawerProvider>
    </Provider>,
  );
};
