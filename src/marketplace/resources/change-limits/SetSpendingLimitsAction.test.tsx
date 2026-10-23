import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesOfferingRetrieve } from 'waldur-js-client';

import { hasPermission } from '@/permissions/hasPermission';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { SetSpendingLimitsAction } from './SetSpendingLimitsAction';

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(() => true),
  hasAllPermissions: vi.fn(() => true),
}));

const resource = {
  uuid: 'res-1',
  offering_type: 'Marketplace.Basic',
  plan_uuid: 'plan-1',
  project_uuid: 'project-1',
  customer_uuid: 'customer-1',
  state: 'OK',
};

const usageComponent = {
  type: 'token_cost',
  name: 'Token cost',
  billing_type: 'usage',
  spending_limit_periods: { month: {} },
};

const mockOffering = (components) =>
  vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
    data: {
      type: 'Marketplace.Basic',
      plans: [{ uuid: 'plan-1', components: [] }],
      components,
    },
  } as any);

const renderAction = (props = {}) =>
  renderWithProviders(
    inActionsMenu(
      <SetSpendingLimitsAction resource={{ ...resource, ...props } as any} />,
    ),
  );

describe('SetSpendingLimitsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    vi.mocked(hasPermission).mockReturnValue(true);
  });

  it('is offered when a component takes spending limits', async () => {
    mockOffering([usageComponent]);
    renderAction();
    expect(
      await screen.findByText('Change spending limits'),
    ).toBeInTheDocument();
  });

  it('is shown while the resource holds limits no longer offered', async () => {
    mockOffering([{ ...usageComponent, spending_limit_periods: {} }]);
    renderAction({ spending_limits: { token_cost: { day: 20 } } });
    expect(
      await screen.findByText('Change spending limits'),
    ).toBeInTheDocument();
  });

  it('is hidden when no component takes spending limits', async () => {
    mockOffering([{ ...usageComponent, spending_limit_periods: {} }]);
    renderAction();
    await waitFor(() =>
      expect(marketplaceResourcesOfferingRetrieve).toHaveBeenCalled(),
    );
    expect(
      screen.queryByText('Change spending limits'),
    ).not.toBeInTheDocument();
  });

  it('is hidden when the plan bills the component by limit', async () => {
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: {
        type: 'Marketplace.Basic',
        plans: [
          {
            uuid: 'plan-1',
            components: [{ type: 'token_cost', billing_type: 'limit' }],
          },
        ],
        components: [usageComponent],
      },
    } as any);
    renderAction();
    await waitFor(() =>
      expect(marketplaceResourcesOfferingRetrieve).toHaveBeenCalled(),
    );
    expect(
      screen.queryByText('Change spending limits'),
    ).not.toBeInTheDocument();
  });

  it('is hidden without the limits permission, and fetches nothing', () => {
    vi.mocked(hasPermission).mockReturnValue(false);
    mockOffering([usageComponent]);
    renderAction();
    expect(
      screen.queryByText('Change spending limits'),
    ).not.toBeInTheDocument();
    expect(marketplaceResourcesOfferingRetrieve).not.toHaveBeenCalled();
  });
});
