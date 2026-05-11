import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceCustomerServiceAccountsCreate,
  marketplaceCustomerServiceAccountsPartialUpdate,
} from 'waldur-js-client';

import { ServiceAccountFormDialog } from './ServiceAccountFormDialog';

vi.mock('waldur-js-client', async (importOriginal) => {
  const mod = await importOriginal<any>();
  return {
    ...mod,
    marketplaceCustomerServiceAccountsCreate: vi.fn(),
    marketplaceCustomerServiceAccountsPartialUpdate: vi.fn(),
  };
});

const fakeScope = { uuid: 'scope-uuid' };

const renderDialog = (props: any) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = createStore((state) => state);
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ServiceAccountFormDialog {...props} />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('ServiceAccountFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create dialog correctly', () => {
    renderDialog({
      resolve: {
        context: 'customer',
        scope: fakeScope,
        refetch: vi.fn(),
      },
    });
    expect(screen.getByText('Create service account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred identifier/i)).toBeInTheDocument();
  });

  it('renders edit dialog correctly', () => {
    const row = {
      uuid: 'row-uuid',
      username: 'test-user',
      email: 'test@example.com',
    };
    renderDialog({
      resolve: {
        row,
        context: 'customer',
        scope: fakeScope,
        refetch: vi.fn(),
      },
    });
    expect(screen.getByText('Edit service account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-user')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('submits create form correctly', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(marketplaceCustomerServiceAccountsCreate).mockResolvedValue({
      data: { username: 'new-user', token: 'token', expires_at: 'date' },
    } as any);

    renderDialog({
      resolve: {
        context: 'customer',
        scope: fakeScope,
        refetch,
      },
    });

    await user.type(screen.getByLabelText(/Preferred identifier/i), 'backup');
    await user.type(
      screen.getByLabelText(/Notification email/i),
      'notify@example.com',
    );
    await user.type(screen.getByLabelText(/Description/i), 'Backups account');

    await user.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(marketplaceCustomerServiceAccountsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            preferred_identifier: 'backup',
            email: 'notify@example.com',
            description: 'Backups account',
            customer: 'scope-uuid',
          },
        }),
      );
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('submits edit form correctly', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const row = {
      uuid: 'row-uuid',
      username: 'old-user',
      email: 'old@example.com',
    };
    vi.mocked(
      marketplaceCustomerServiceAccountsPartialUpdate,
    ).mockResolvedValue({} as any);

    renderDialog({
      resolve: {
        row,
        context: 'customer',
        scope: fakeScope,
        refetch,
      },
    });

    await user.clear(screen.getByLabelText(/Notification email/i));
    await user.type(
      screen.getByLabelText(/Notification email/i),
      'new@example.com',
    );

    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(
        marketplaceCustomerServiceAccountsPartialUpdate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'row-uuid' },
          body: expect.objectContaining({
            email: 'new@example.com',
          }),
        }),
      );
    });
  });
});
