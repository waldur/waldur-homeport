import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customerCreditsCreate, customerCreditsUpdate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { createTestWrapper } from '@/test/harness';
import { typeAndSelectOption } from '@/test/select';

import { CustomerCreditDialog } from './CustomerCreditDialog';

ENV.plugins.WALDUR_CORE.CURRENCY_NAME = 'EUR';

vi.mock('@/form/useFlatpickrTheme', () => ({
  useFlatpickrTheme: vi.fn(),
}));

vi.mock('./OrganizationCostChart', () => ({
  OrganizationCostChart: () => <div data-testid="organization-cost-chart" />,
}));

vi.mock('@/marketplace/common/autocompletes', () => ({
  organizationAutocomplete: vi.fn(),
  providerOfferingsAutocomplete: vi
    .fn()
    .mockReturnValue(() =>
      Promise.resolve({ options: [], hasMore: false, additional: { page: 2 } }),
    ),
}));

const createWrapper = () => createTestWrapper().wrapper;

describe('CustomerCreditDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(organizationAutocomplete).mockReturnValue(() =>
      Promise.resolve({
        options: [{ name: 'Org 1', url: 'customer-url' }],
        hasMore: false,
        additional: { page: 1 },
      }),
    );
  });

  it('submits creation form correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(customerCreditsCreate).mockResolvedValue({} as any);

    render(<CustomerCreditDialog resolve={{ refetch: mockRefetch }} />, {
      wrapper: createWrapper(),
    });

    // Fill Organization
    await typeAndSelectOption(user, 'Organization', 'Org 1', 'Org 1');

    // Fill Value
    const valueInput = screen.getByTestId('value');
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

    render(
      <CustomerCreditDialog resolve={{ credit, refetch: mockRefetch }} />,
      {
        wrapper: createWrapper(),
      },
    );

    expect(screen.getByText('Edit credit')).toBeInTheDocument();
    expect(screen.getByTestId('organization-cost-chart')).toBeInTheDocument();

    const valueInput = screen.getByTestId('value');
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

    render(
      <CustomerCreditDialog resolve={{ credit, refetch: mockRefetch }} />,
      {
        wrapper: createWrapper(),
      },
    );

    const valueInput = screen.getByTestId('value');
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
