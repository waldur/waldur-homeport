import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { paymentProfilesPartialUpdate } from 'waldur-js-client';

import { PaymentProfileUpdateDialog } from './PaymentProfileUpdateDialog';

vi.mock('waldur-js-client');

vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

vi.mock('../utils', () => ({
  getCustomer: vi.fn(),
}));

vi.mock('@/form/useFlatpickrTheme', () => ({
  useFlatpickrTheme: vi.fn(),
}));

const mockCustomer = {
  uuid: 'customer-uuid',
  url: 'customer-url',
};

const mockProfile = {
  uuid: 'profile-uuid',
  name: 'Original Profile',
  payment_type: 'invoices',
  attributes: {},
};

const renderDialog = (profile = mockProfile) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = createStore((state) => state, {
    workspace: { customer: mockCustomer },
    notifications: [],
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PaymentProfileUpdateDialog resolve={{ profile, refetch: vi.fn() }} />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('PaymentProfileUpdateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dialog with initial values', () => {
    renderDialog();
    expect(screen.getByText('Update payment profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Original Profile')).toBeInTheDocument();
    expect(screen.getByText('Monthly invoices')).toBeInTheDocument();
  });

  it('shows additional fields when profile is Fixed-price', () => {
    const fixedPriceProfile = {
      ...mockProfile,
      payment_type: 'fixed_price',
      attributes: {
        end_date: '2025-12-31',
        agreement_number: '12345',
        contract_sum: 1000,
      },
    };
    renderDialog(fixedPriceProfile);

    expect(screen.getByDisplayValue('12345')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByText('Fixed-price contract')).toBeInTheDocument();
  });

  it('submits updated values', async () => {
    const user = userEvent.setup();
    vi.mocked(paymentProfilesPartialUpdate).mockResolvedValue({} as any);

    renderDialog();

    const nameInput = screen.getByDisplayValue('Original Profile');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Profile');

    await user.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(paymentProfilesPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'profile-uuid' },
        body: expect.objectContaining({
          name: 'Updated Profile',
          payment_type: 'invoices',
        }),
      });
    });
  });

  it('handles type change during update', async () => {
    const user = userEvent.setup();
    vi.mocked(paymentProfilesPartialUpdate).mockResolvedValue({} as any);

    renderDialog();

    // Change type to Fixed-price
    await user.click(screen.getByText('Monthly invoices'));
    await user.click(await screen.findByText('Fixed-price contract'));

    // Additional fields should appear
    expect(screen.getByText(/Agreement number/i)).toBeInTheDocument();
    const agreementInput = screen.getByRole('textbox', {
      name: 'Agreement number',
    });
    await user.type(agreementInput, 'ABC-789');

    await user.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(paymentProfilesPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'profile-uuid' },
        body: expect.objectContaining({
          payment_type: 'fixed_price',
          attributes: expect.objectContaining({
            agreement_number: 'ABC-789',
          }),
        }),
      });
    });
  });
});
