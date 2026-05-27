import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { paymentProfilesCreate, paymentProfilesEnable } from 'waldur-js-client';

import { PaymentProfileCreateDialog } from './PaymentProfileCreateDialog';

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

const renderDialog = () => {
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
        <PaymentProfileCreateDialog resolve={{ refetch: vi.fn() }} />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('PaymentProfileCreateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dialog correctly', () => {
    renderDialog();
    expect(screen.getByText('Add payment profile')).toBeInTheDocument();
    expect(screen.getByText(/Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Type/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText('Enable profile after creation'),
    ).toBeInTheDocument();
  });

  it('shows additional fields when Fixed-price contract is selected', async () => {
    const user = userEvent.setup();
    renderDialog();

    // Select Type
    const typeSelect = screen.getByRole('combobox', { name: /Type/i });
    await user.click(typeSelect);

    const option = await screen.findByText('Fixed-price contract');
    await user.click(option);

    expect(screen.getByText(/End date/i)).toBeInTheDocument();
    expect(screen.getByText(/Agreement number/i)).toBeInTheDocument();
    expect(screen.getByText(/Contract sum/i)).toBeInTheDocument();
  });

  it('submits the form correctly without enabling', async () => {
    const user = userEvent.setup();
    vi.mocked(paymentProfilesCreate).mockResolvedValue({
      data: { uuid: 'new-profile-uuid' },
    } as any);

    renderDialog();

    await user.type(
      screen.getByRole('textbox', { name: 'Name' }),
      'Test Profile',
    );

    // Select Type
    const typeSelect = screen.getByRole('combobox', { name: 'Type' });
    await user.click(typeSelect);
    await user.click(await screen.findByText('Monthly invoices'));

    // Ensure enabled is unchecked (it is by default in component [false])
    // Wait, in CreateDialog it is: const [isFixedPrice, setIsFixedPrice] = useState(false);
    // And enabled field: <AwesomeCheckbox ... label={translate('Enable profile after creation')} />

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(paymentProfilesCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: 'Test Profile',
          payment_type: 'invoices',
          organization: 'customer-url',
        }),
      });
    });

    expect(paymentProfilesEnable).not.toHaveBeenCalled();
  });

  it('submits the form and enables the profile', async () => {
    const user = userEvent.setup();
    vi.mocked(paymentProfilesCreate).mockResolvedValue({
      data: { uuid: 'new-profile-uuid' },
    } as any);
    vi.mocked(paymentProfilesEnable).mockResolvedValue({} as any);

    renderDialog();

    await user.type(
      screen.getByRole('textbox', { name: 'Name' }),
      'Test Profile',
    );

    const typeSelect = screen.getByRole('combobox', { name: 'Type' });
    await user.click(typeSelect);
    await user.click(await screen.findByText('Monthly invoices'));

    await user.click(screen.getByLabelText('Enable profile after creation'));

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(paymentProfilesCreate).toHaveBeenCalled();
      expect(paymentProfilesEnable).toHaveBeenCalledWith({
        path: { uuid: 'new-profile-uuid' },
      });
    });
  });
});
