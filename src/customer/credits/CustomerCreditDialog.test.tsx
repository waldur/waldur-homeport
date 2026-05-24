import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customerCreditsCreate, customerCreditsUpdate } from 'waldur-js-client';

import { CustomerCreditDialog } from './CustomerCreditDialog';

vi.mock('waldur-js-client');
vi.mock('@/i18n', () => ({
  translate: (key, context) => {
    if (!context) return key;
    let result = key;
    Object.keys(context).forEach((k) => {
      result = result.replace(`{${k}}`, context[k]);
    });
    return result;
  },
  formatJsxTemplate: (text) => text,
}));
vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        CURRENCY_NAME: 'EUR',
      },
    },
  },
}));
vi.mock('@/form/useFlatpickrTheme', () => ({
  useFlatpickrTheme: vi.fn(),
}));

vi.mock('./OrganizationCostChart', () => ({
  OrganizationCostChart: () => <div data-testid="organization-cost-chart" />,
}));

vi.mock('react-redux', () => ({
  useSelector: (fn) => fn(),
  useDispatch: () => vi.fn(),
}));

vi.mock('@/workspace/selectors', () => ({
  getCustomer: () => ({ uuid: 'customer-uuid' }),
}));

vi.mock('@/marketplace/common/autocompletes', () => ({
  organizationAutocomplete: vi.fn(),
  providerOfferingsAutocomplete: vi
    .fn()
    .mockReturnValue(() =>
      Promise.resolve({ options: [], hasMore: false, additional: { page: 2 } }),
    ),
}));

vi.mock('@/form/select/AsyncSelect', () => ({
  AsyncSelect: (props) => (
    <input
      id={props.id}
      data-testid={props.id || 'async-select'}
      onChange={(e) => {
        if (props.input) {
          props.input.onChange({ url: e.target.value, name: 'Org 1' });
        }
      }}
      onBlur={(e) => {
        if (props.input) props.input.onBlur(e);
        if (props.onBlur) props.onBlur(e);
      }}
      value={props.input?.value?.url || ''}
    />
  ),
}));

vi.mock('@/form/select/SelectField', () => ({
  SelectField: (props) => (
    <input
      data-testid={props.name || props.input?.name || 'select-field'}
      onChange={(e) => {
        if (props.input) props.input.onChange(e.target.value);
        if (props.onChange) props.onChange(e.target.value);
      }}
      onBlur={(e) => {
        if (props.input) props.input.onBlur(e);
      }}
      value={props.input?.value || ''}
    />
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CustomerCreditDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits creation form correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(customerCreditsCreate).mockResolvedValue({} as any);

    const { container } = render(
      <CustomerCreditDialog resolve={{ refetch: mockRefetch }} />,
      {
        wrapper: createWrapper(),
      },
    );

    // Fill Organization
    const customerInput = screen.getByTestId('customer');
    fireEvent.change(customerInput, { target: { value: 'customer-url' } });
    fireEvent.blur(customerInput);

    // Fill Value
    const valueInput = container.querySelector('#value') as HTMLInputElement;
    await user.clear(valueInput);
    await user.type(valueInput, '100');
    await user.tab();

    const createButton = screen.getByTestId('submit-button');
    await waitFor(() => expect(createButton).not.toBeDisabled());
    await user.click(createButton);

    await waitFor(() => {
      expect(customerCreditsCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          customer: 'customer-url',
          value: '100',
          minimal_consumption_logic: 'fixed',
          offerings: undefined,
        }),
      });
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders edit form correctly', () => {
    const credit = {
      uuid: 'credit-uuid',
      customer_uuid: 'customer-uuid',
      customer_name: 'Customer 1',
      customer: 'customer-url',
      offerings: [],
      value: 500,
      minimal_consumption_logic: 'fixed',
    };

    const { container } = render(
      <CustomerCreditDialog resolve={{ credit, refetch: mockRefetch }} />,
      {
        wrapper: createWrapper(),
      },
    );

    expect(screen.getByText('Edit credit')).toBeInTheDocument();
    expect(screen.getByTestId('organization-cost-chart')).toBeInTheDocument();

    const valueInput = container.querySelector('#value') as HTMLInputElement;
    expect(valueInput).toHaveValue(500);

    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('submits edit form correctly', async () => {
    const user = userEvent.setup();
    const credit = {
      uuid: 'credit-uuid',
      customer_uuid: 'customer-uuid',
      customer_name: 'Customer 1',
      customer: 'customer-url',
      offerings: [],
      value: 500,
      minimal_consumption_logic: 'fixed',
    };

    vi.mocked(customerCreditsUpdate).mockResolvedValue({} as any);

    const { container } = render(
      <CustomerCreditDialog resolve={{ credit, refetch: mockRefetch }} />,
      {
        wrapper: createWrapper(),
      },
    );

    const valueInput = container.querySelector('#value') as HTMLInputElement;
    await user.clear(valueInput);
    await user.type(valueInput, '600');
    await user.tab();

    const confirmButton = screen.getByTestId('submit-button');
    await waitFor(() => expect(confirmButton).not.toBeDisabled());
    await user.click(confirmButton);

    await waitFor(() => {
      expect(customerCreditsUpdate).toHaveBeenCalledWith({
        path: { uuid: 'credit-uuid' },
        body: {
          apply_as_minimal_consumption: undefined,
          customer: 'customer-url',
          end_date: undefined,
          expected_consumption: undefined,
          grace_coefficient: undefined,
          minimal_consumption_logic: 'fixed',
          offerings: [],
          value: '600',
        },
      });
    });
    expect(mockRefetch).toHaveBeenCalled();
  });
});
