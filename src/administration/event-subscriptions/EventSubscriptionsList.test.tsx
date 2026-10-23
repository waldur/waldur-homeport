import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';

import { EventSubscriptionsList } from './EventSubscriptionsList';

// Serves the rows given to setTableQueryRows (none by default); no request fires.
vi.mock('@/table/useTableQuery', () => import('@/table/mockTableQuery'));

const store = configureStore()({
  tables: {
    EventSubscriptionsList: {
      loading: false,
      pagination: { pageSize: 10, resultCount: 0, currentPage: 1 },
      toggled: {},
      activeColumns: {},
      columnPositions: [],
      query: '',
    },
  },
});

describe('EventSubscriptionsList', () => {
  it('shows the deprecation banner pointing at unified event consumers', async () => {
    renderWithProviders(
      <Provider store={store}>
        <DrawerProvider>
          <EventSubscriptionsList />
        </DrawerProvider>
      </Provider>,
    );

    expect(
      await screen.findByText('Legacy event subscriptions are deprecated'),
    ).toBeInTheDocument();
    expect(screen.getByText('View event consumers')).toBeInTheDocument();
    expect(screen.getByText('View site agents')).toBeInTheDocument();
  });
});
