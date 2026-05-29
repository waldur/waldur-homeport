import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { ProviderTeamPage } from './ProviderTeamPage';

// Mock useTableQuery to not make actual API calls
vi.mock('@/table/useTableQuery', () => ({
  useTableQuery: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

const mockStore = configureStore();
const rowId = 'permission-uuid-1';
const row = {
  uuid: rowId,
  user_uuid: 'user-uuid-1',
  user_full_name: 'John Doe',
  user_image: 'avatar.jpg',
  user_email: 'john.doe@example.com',
  user_username: 'johndoe',
  role_name: 'CUSTOMER.MANAGER',
  expiration_time: '2025-12-31T23:59:59Z',
};
const tableId = 'service-provider-users';
const state = {
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
  activeColumns: {
    member: true,
    email: true,
    username: true,
    role_name: true,
    expiration_time: true,
  },
  columnPositions: [
    'member',
    'email',
    'username',
    'role_name',
    'expiration_time',
  ],
};
vi.mocked(workspaceHooks.useUser).mockReturnValue({
  is_staff: true,
  uuid: 'user-uuid-2',
} as any);
vi.mocked(workspaceHooks.useCustomer).mockReturnValue({
  uuid: 'customer-uuid-1',
  name: 'Test Customer',
  service_provider_uuid: 'provider-uuid',
  service_provider: '/api/service-providers/provider-uuid/',
} as any);
const store = mockStore({
  tables: {
    [tableId]: state,
  },
});

const renderComponent = () => {
  return renderWithProviders(
    <Provider store={store}>
      <DrawerProvider>
        <ProviderTeamPage />
      </DrawerProvider>
    </Provider>,
  );
};

describe('ProviderTeamPage', () => {
  it('renders team members table and actions', async () => {
    renderComponent();

    expect(await screen.findByText('Team members')).toBeInTheDocument();

    expect(await screen.findByText('Member')).toBeInTheDocument();
    expect(await screen.findByText('Email')).toBeInTheDocument();
    expect(await screen.findByText('Username')).toBeInTheDocument();
    expect(await screen.findByText('Role in organization')).toBeInTheDocument();
    expect(await screen.findByText('Role expiration')).toBeInTheDocument();

    // Member
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    // Email
    expect(await screen.findByText('john.doe@example.com')).toBeInTheDocument();
    // Username
    expect(await screen.findByText('johndoe')).toBeInTheDocument();
    // Role
    expect(await screen.findByText('CUSTOMER.MANAGER')).toBeInTheDocument();

    // Table actions
    expect(await screen.findByText('Add')).toBeInTheDocument();
    expect(await screen.findByText('Export')).toBeInTheDocument();
  });
});
