import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { CustomerUsersList } from './CustomerUsersList';

// Mock dependencies
vi.mock('@uirouter/react', async (importOriginal) => {
  const mod: any = await importOriginal();
  return {
    ...mod,
    useRouter: () => ({
      stateService: {
        go: vi.fn(),
      },
    }),
    useCurrentStateAndParams: () => ({
      state: {},
      params: {},
    }),
  };
});

vi.mock('@waldur/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {},
    },
    roles: [],
    FEATURES: {},
  },
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
const store = mockStore({
  tables: {
    [tableId]: state,
  },
  workspace: {
    customer: { uuid: 'customer-uuid-1', name: 'Test Customer' },
    user: { is_staff: true, uuid: 'user-uuid-2' },
  },
  title: {
    title: '',
    subtitle: '',
  },
  form: {}, // For redux-form filters
});

vi.mock('@waldur/table/useTableLoader', () => ({
  useTableLoader: () => false,
}));

const renderComponent = () =>
  render(
    <Provider store={store}>
      <CustomerUsersList />
    </Provider>,
  );

describe('CustomerUsersList', () => {
  it('renders table headers and data cells', async () => {
    const node = renderComponent();
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
    expect(await node.findByText('owner')).toBeInTheDocument();
  });
});
