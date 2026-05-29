import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customerCreditsCreate,
  customerCreditsUpdate,
  invoicesList,
  customersList,
  marketplaceProviderOfferingsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { typeAndSelectOption } from '@/test/select';

import { CustomerCreditDialog } from './CustomerCreditDialog';

describe('CustomerCreditDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoicesList).mockResolvedValue({ data: [] } as any);
    vi.mocked(customersList).mockResolvedValue({
      data: [{ name: 'Org 1', url: 'customer-url' }],
      response: {
        headers: new Headers({
          'x-result-count': '1',
        }),
      },
    } as any);
    vi.mocked(marketplaceProviderOfferingsList).mockResolvedValue({
      data: [],
      response: {
        headers: new Headers({
          'x-result-count': '0',
        }),
      },
    } as any);
  });

  it('submits creation form correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(customerCreditsCreate).mockResolvedValue({} as any);

    renderWithProviders(
      <CustomerCreditDialog resolve={{ refetch: mockRefetch }} />,
    );

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

  it('renders edit form correctly', async () => {
    const credit = {
      uuid: 'credit-uuid',
      customer_uuid: 'customer-uuid',
      customer_name: 'Customer 1',
      customer: 'customer-url',
      offerings: [],
      value: 500,
      minimal_consumption_logic: 'fixed',
    };

    renderWithProviders(
      <CustomerCreditDialog resolve={{ credit, refetch: mockRefetch }} />,
    );

    expect(screen.getByText('Edit credit')).toBeInTheDocument();
    expect(await screen.findByTestId('echart')).toBeInTheDocument();

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

    renderWithProviders(
      <CustomerCreditDialog resolve={{ credit, refetch: mockRefetch }} />,
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
