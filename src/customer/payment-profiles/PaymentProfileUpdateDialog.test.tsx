import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { paymentProfilesPartialUpdate } from 'waldur-js-client';

import { PaymentProfileUpdateDialog } from './PaymentProfileUpdateDialog';

vi.mock('waldur-js-client');

vi.mock('../utils', () => ({
  getCustomer: vi.fn(),
}));

vi.mock('@/form/useFlatpickrTheme', () => ({
  useFlatpickrTheme: vi.fn(),
}));

vi.mock('@/workspace/hooks', () => ({
  useUser: () => ({ is_staff: true }),
  useCustomer: () => ({ url: 'customer-url' }),
  useProject: () => ({ uuid: 'project-uuid' }),
  useSetCustomer: () => vi.fn(),
  useSetProject: () => vi.fn(),
}));

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
  return render(
    <QueryClientProvider client={queryClient}>
      <PaymentProfileUpdateDialog resolve={{ profile, refetch: vi.fn() }} />
    </QueryClientProvider>,
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
