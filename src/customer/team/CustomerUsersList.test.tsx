import { screen } from '@testing-library/dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { CustomerUsersList } from './CustomerUsersList';

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
const rowId = 'user-uuid-1';
const row = {
  uuid: rowId,
  full_name: 'John Doe',
  image: 'avatar.jpg',
  email: 'john.doe@example.com',
  username: 'johndoe',
  role_name: 'owner',
  expiration_time: '2025-12-31T23:59:59Z',
  projects: [],
};
const tableId = 'customer-users';
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
        <CustomerUsersList />
      </DrawerProvider>
    </Provider>,
  );
};

describe('CustomerUsersList', () => {
  it('renders table headers and data cells', async () => {
    renderComponent();
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
    expect(await screen.findByText('Owner')).toBeInTheDocument();
  });
});
