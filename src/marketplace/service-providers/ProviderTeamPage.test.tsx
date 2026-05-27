import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import * as workspaceHooks from '@/workspace/hooks';

import { ProviderTeamPage } from './ProviderTeamPage';
vi.mock('@/workspace/hooks');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

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

vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {},
    },
    roles: [],
    FEATURES: {},
  },
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
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <DrawerProvider>
          <ProviderTeamPage />
        </DrawerProvider>
      </Provider>
    </QueryClientProvider>,
  );
};

describe('ProviderTeamPage', () => {
  it('renders team members table and actions', async () => {
    const node = renderComponent();

    expect(await node.findByText('Team members')).toBeInTheDocument();

    expect(await node.findByText('Member')).toBeInTheDocument();
    expect(await node.findByText('Email')).toBeInTheDocument();
    expect(await node.findByText('Username')).toBeInTheDocument();
    expect(await node.findByText('Role in organization')).toBeInTheDocument();
    expect(await node.findByText('Role expiration')).toBeInTheDocument();

    // Member
    expect(await node.findByText('John Doe')).toBeInTheDocument();
    // Email
    expect(await node.findByText('john.doe@example.com')).toBeInTheDocument();
    // Username
    expect(await node.findByText('johndoe')).toBeInTheDocument();
    // Role
    expect(await node.findByText('CUSTOMER.MANAGER')).toBeInTheDocument();

    // Table actions
    expect(await node.findByText('Add')).toBeInTheDocument();
    expect(await node.findByText('Export')).toBeInTheDocument();
  });
});
