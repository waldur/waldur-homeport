import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { TableState } from '@/table/types';
import { renderWithProviders } from '@/test/harness';

const fakeInstance = { uuid: 'test-uuid', state: 'OK' };

export const renderTable = (Component, tableId, rowId, row) => {
  const mockStore = configureStore();
  const state: TableState = {
    loading: false,
    entities: {
      [rowId]: row,
    },
    order: [rowId],
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
