import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesOfferingRetrieve } from 'waldur-js-client';

import { useUser } from '@/workspace/hooks';

import { RequestLimitsChangeAction } from './RequestLimitsChangeAction';

vi.mock('waldur-js-client');
vi.mock('@/workspace/hooks');
vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));
vi.mock('@/resource/actions/useModalDialogCallback', () => ({
  useModalDialogCallback: () => vi.fn(),
}));
vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: () => false,
}));

const renderAction = (resource) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RequestLimitsChangeAction resource={resource as any} />
    </QueryClientProvider>,
  );
};

const baseResource = {
  uuid: 'instance-uuid',
  resource_type: 'OpenStack.Instance',
  marketplace_resource_uuid: 'marketplace-uuid',
  plan_uuid: 'plan-uuid',
  state: 'OK',
};

describe('RequestLimitsChangeAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Regular project member: not staff/support and no UPDATE_RESOURCE_LIMITS.
    vi.mocked(useUser).mockReturnValue({} as any);
  });

  it('shows the action when the offering has limit-based components', async () => {
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: { components: [{ billing_type: 'limit' }] },
    } as any);

    renderAction(baseResource);

    expect(await screen.findByText('Request limit change')).toBeInTheDocument();
  });

  it('shows the action when the offering has prepaid components', async () => {
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: { components: [{ billing_type: 'usage', is_prepaid: true }] },
    } as any);

    renderAction(baseResource);

    expect(await screen.findByText('Request limit change')).toBeInTheDocument();
  });

  it('hides the action when the offering has no limit-based or prepaid components', async () => {
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: { components: [{ billing_type: 'usage' }] },
    } as any);

    renderAction(baseResource);

    await waitFor(() =>
      expect(marketplaceResourcesOfferingRetrieve).toHaveBeenCalled(),
    );
    await waitFor(() =>
      expect(screen.queryByText('Request limit change')).toBeNull(),
    );
  });

  it('does not render or fetch the offering for users who can update limits directly', () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);

    renderAction(baseResource);

    expect(screen.queryByText('Request limit change')).toBeNull();
    expect(marketplaceResourcesOfferingRetrieve).not.toHaveBeenCalled();
  });

  it('renders the action without fetching the offering when the resource has no plan', () => {
    const resourceWithoutPlan = { ...baseResource, plan_uuid: undefined };

    renderAction(resourceWithoutPlan);

    // Mirrors ChangeLimitsAction: shown (disabled) but the offering is not
    // fetched because a limit change is not feasible without a plan.
    expect(screen.getByText('Request limit change')).toBeInTheDocument();
    expect(marketplaceResourcesOfferingRetrieve).not.toHaveBeenCalled();
  });
});
