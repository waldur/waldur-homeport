import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesRetrieve,
  marketplaceResourcesSetSpendingLimits,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { SetSpendingLimitsDialog } from './SetSpendingLimitsDialog';

const offering = {
  type: 'Marketplace.Basic',
  plans: [{ uuid: 'plan-1', components: [] }],
  components: [
    {
      type: 'token_cost',
      name: 'Token cost',
      billing_type: 'usage',
      measured_unit: 'EUR',
      spending_limit_periods: {
        day: { maximum: 100 },
        month: { default: 300 },
      },
    },
    {
      type: 'cores',
      name: 'Cores',
      billing_type: 'limit',
      spending_limit_periods: {},
    },
  ],
};

const resource = {
  uuid: 'res-1',
  name: 'Inference',
  plan_uuid: 'plan-1',
  offering_type: 'Marketplace.Basic',
  spending_limits: { token_cost: { day: 20, month: 300, year: 2000 } },
};

const renderDialog = () =>
  renderWithProviders(
    <SetSpendingLimitsDialog
      resolve={{
        resource: { uuid: 'res-1', offering_type: 'Marketplace.Basic' },
        refetch: vi.fn(),
      }}
    />,
  );

const getInput = (period: string) =>
  screen.getByRole('spinbutton', { name: new RegExp(`^${period} limit`) });

describe('SetSpendingLimitsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceResourcesRetrieve).mockResolvedValue({
      data: resource,
    } as any);
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: offering,
    } as any);
    vi.mocked(marketplaceResourcesSetSpendingLimits).mockResolvedValue({
      data: {},
    } as any);
  });

  it('pre-fills the current limits of the offered periods', async () => {
    renderDialog();
    await waitFor(() => expect(getInput('Daily')).toHaveValue(20));
    expect(getInput('Monthly')).toHaveValue(300);
  });

  it('names a limit on a period no longer offered, which saving drops', async () => {
    renderDialog();
    expect(
      await screen.findByTestId('dropped-spending-limits'),
    ).toHaveTextContent('Yearly limit of 2000 on Token cost');
  });

  it('replaces the limits; a cleared field clears that limit', async () => {
    const user = userEvent.setup();
    renderDialog();
    await waitFor(() => expect(getInput('Daily')).toHaveValue(20));

    await user.clear(getInput('Daily'));
    await user.clear(getInput('Monthly'));
    await user.type(getInput('Monthly'), '250');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(marketplaceResourcesSetSpendingLimits).toHaveBeenCalledWith({
        path: { uuid: 'res-1' },
        body: { spending_limits: { token_cost: { month: 250 } } },
      }),
    );
  });

  it('checks the order of offered periods only', async () => {
    const user = userEvent.setup();
    renderDialog();
    await waitFor(() => expect(getInput('Monthly')).toHaveValue(300));

    // Above the hidden yearly limit of 2000, which saving drops anyway.
    await user.clear(getInput('Monthly'));
    await user.type(getInput('Monthly'), '2500');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(marketplaceResourcesSetSpendingLimits).toHaveBeenCalledWith({
        path: { uuid: 'res-1' },
        body: { spending_limits: { token_cost: { day: 20, month: 2500 } } },
      }),
    );
  });

  it('removes limits the provider no longer offers at all', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: {
        ...offering,
        components: offering.components.map((c) => ({
          ...c,
          spending_limit_periods: {},
        })),
      },
    } as any);
    renderDialog();
    expect(
      await screen.findByTestId('dropped-spending-limits'),
    ).toHaveTextContent('Daily limit of 20 on Token cost');

    await user.click(screen.getByRole('button', { name: 'Remove limits' }));

    await waitFor(() =>
      expect(marketplaceResourcesSetSpendingLimits).toHaveBeenCalledWith({
        path: { uuid: 'res-1' },
        body: { spending_limits: {} },
      }),
    );
  });

  it('shows why a stored limit above a lowered maximum blocks Save', async () => {
    vi.mocked(marketplaceResourcesRetrieve).mockResolvedValue({
      data: { ...resource, spending_limits: { token_cost: { day: 150 } } },
    } as any);
    renderDialog();
    expect(await screen.findByText('Must not exceed 100.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  // Lets the refetch land and the form re-initialise if it is going to.
  const refetchAndSettle = (queryClient) =>
    act(async () => {
      await queryClient.refetchQueries();
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

  const typeDailyLimit = async (user) => {
    await waitFor(() => expect(getInput('Daily')).toHaveValue(20));
    await user.clear(getInput('Daily'));
    await user.type(getInput('Daily'), '50');
  };

  it('keeps typed edits across a refetch that changes only usage', async () => {
    const user = userEvent.setup();
    const { queryClient } = renderDialog();
    await typeDailyLimit(user);

    vi.mocked(marketplaceResourcesRetrieve).mockResolvedValue({
      data: {
        ...resource,
        spending_limits: { token_cost: { day: 20, month: 300, year: 2000 } },
        spending_limit_status: [{ component_type: 'token_cost', used: 7 }],
      },
    } as any);
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: { ...offering, order_count: 2 },
    } as any);
    await refetchAndSettle(queryClient);

    expect(marketplaceResourcesRetrieve).toHaveBeenCalledTimes(2);
    expect(getInput('Daily')).toHaveValue(50);
  });

  it('takes up limits changed elsewhere on a refetch', async () => {
    // The control for the test above: a real change does re-initialise.
    const user = userEvent.setup();
    const { queryClient } = renderDialog();
    await typeDailyLimit(user);

    vi.mocked(marketplaceResourcesRetrieve).mockResolvedValue({
      data: { ...resource, spending_limits: { token_cost: { day: 30 } } },
    } as any);
    await refetchAndSettle(queryClient);

    expect(getInput('Daily')).toHaveValue(30);
  });

  it('keeps Save disabled while a limit exceeds its maximum', async () => {
    const user = userEvent.setup();
    renderDialog();
    await waitFor(() => expect(getInput('Daily')).toHaveValue(20));

    await user.clear(getInput('Daily'));
    await user.type(getInput('Daily'), '120');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled(),
    );
    expect(marketplaceResourcesSetSpendingLimits).not.toHaveBeenCalled();
  });
});
