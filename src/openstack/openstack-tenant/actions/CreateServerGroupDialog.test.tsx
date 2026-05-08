import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openstackTenantsCreateServerGroup } from 'waldur-js-client';

import { CreateServerGroupDialog } from './CreateServerGroupDialog';

// Mock dependencies
vi.mock('@/i18n', () => ({
  translate: (str: string, params?: any) => {
    if (params) {
      return Object.keys(params).reduce(
        (res, key) => res.replace(`{${key}}`, params[key]),
        str,
      );
    }
    return str;
  },
}));

vi.mock('waldur-js-client', async () => {
  const actual = await vi.importActual('waldur-js-client');
  return {
    ...actual,
    openstackTenantsCreateServerGroup: vi.fn(),
  };
});

const mockStore = configureStore();
const store = mockStore({
  modal: {},
  notifications: [],
});

const mockResource = {
  uuid: 'tenant-uuid',
  name: 'test-tenant',
  url: 'tenant-url',
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('CreateServerGroupDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <CreateServerGroupDialog
            resolve={{ resource: mockResource as any, refetch: vi.fn() }}
          />
        </QueryClientProvider>
      </Provider>,
    );

    expect(
      screen.getByText('Create server group for OpenStack tenant test-tenant'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByText('Policy')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <CreateServerGroupDialog
            resolve={{ resource: mockResource as any, refetch: vi.fn() }}
          />
        </QueryClientProvider>
      </Provider>,
    );

    const nameInput = screen.getByLabelText('Name');
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('This field is required.')).toBeInTheDocument();
    });
  });

  it('validates latin name characters', async () => {
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <CreateServerGroupDialog
            resolve={{ resource: mockResource as any, refetch: vi.fn() }}
          />
        </QueryClientProvider>
      </Provider>,
    );

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'имя'); // Cyrillic characters
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(
        screen.getByText('Name should consist of latin symbols and numbers.'),
      ).toBeInTheDocument();
    });
  });

  it('submits correctly with valid data', async () => {
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <CreateServerGroupDialog
            resolve={{ resource: mockResource as any, refetch: vi.fn() }}
          />
        </QueryClientProvider>
      </Provider>,
    );

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'test-server-group');

    // Policy has initial value 'affinity'
    const submitButton = screen.getByText('Submit');
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    expect(openstackTenantsCreateServerGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          name: 'test-server-group',
          policy: 'affinity',
        }),
      }),
    );
  });
});
