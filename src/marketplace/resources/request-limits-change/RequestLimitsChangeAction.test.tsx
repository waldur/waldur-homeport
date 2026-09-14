import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourceLimitChangeRequestsList,
  marketplaceResourcesOfferingRetrieve,
} from 'waldur-js-client';

import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { RequestLimitsChangeAction } from './RequestLimitsChangeAction';

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: () => false,
  hasAllPermissions: () => false,
}));

const renderAction = (resource) => {
  return renderWithProviders(
    inActionsMenu(<RequestLimitsChangeAction resource={resource as any} />),
  );
};

const baseResource = {
  uuid: 'instance-uuid',
  resource_type: 'OpenStack.Instance',
  marketplace_resource_uuid: 'marketplace-uuid',
  plan_uuid: 'plan-uuid',
  state: 'OK',
};

const OFFERING_KEY = ['resource-offering', 'marketplace-uuid'];
const PENDING_KEY = [
  'resource-limit-change-requests',
  'marketplace-uuid',
  'user-uuid',
];

const optedIn = { enable_resource_limit_change_requests: true };

const mockOffering = (data) =>
  vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
    data,
  } as any);

const mockOwnPending = (data) =>
  vi.mocked(marketplaceResourceLimitChangeRequestsList).mockResolvedValue({
    data,
  } as any);

// Absence is only meaningful once the data it depends on has arrived: before
// that the action is hidden anyway, so asserting earlier proves nothing.
const waitUntilLoaded = (queryClient: QueryClient, queryKey) =>
  waitFor(() =>
    expect(queryClient.getQueryState(queryKey)?.status).toBe('success'),
  );

describe('RequestLimitsChangeAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Regular project member: not staff/support and no UPDATE_RESOURCE_LIMITS.
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-uuid' } as any);
  });

  it('shows the action when the offering has limit-based components', async () => {
    mockOffering({
      plugin_options: optedIn,
      components: [{ billing_type: 'limit' }],
    });

    renderAction(baseResource);

    expect(await screen.findByText('Request limit change')).toBeInTheDocument();
  });

  it('shows the action when the offering has prepaid components', async () => {
    mockOffering({
      plugin_options: optedIn,
      components: [{ billing_type: 'usage', is_prepaid: true }],
    });

    renderAction(baseResource);

    expect(await screen.findByText('Request limit change')).toBeInTheDocument();
  });

  it('hides the action when the offering does not accept limit change requests', async () => {
    mockOffering({
      plugin_options: {},
      components: [{ billing_type: 'limit' }],
    });
    mockOwnPending([]);

    const { queryClient } = renderAction(baseResource);

    await waitUntilLoaded(queryClient, OFFERING_KEY);
    await waitUntilLoaded(queryClient, PENDING_KEY);
    expect(screen.queryByText('Request limit change')).toBeNull();
    expect(screen.queryByText('Cancel limit change request')).toBeNull();
  });

  it('offers only to cancel a pending request once the offering opts out', async () => {
    mockOffering({
      plugin_options: {},
      components: [{ billing_type: 'limit' }],
    });
    mockOwnPending([{ uuid: 'request-uuid' }]);

    renderAction(baseResource);

    expect(
      await screen.findByText('Cancel limit change request'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Request limit change')).toBeNull();
  });

  it('does not look up pending requests while the offering accepts them', async () => {
    mockOffering({
      plugin_options: optedIn,
      components: [{ billing_type: 'limit' }],
    });

    renderAction(baseResource);

    await screen.findByText('Request limit change');
    expect(marketplaceResourceLimitChangeRequestsList).not.toHaveBeenCalled();
  });

  it('hides the action while the offering is loading', () => {
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockReturnValue(
      new Promise(() => {}) as any,
    );

    renderAction(baseResource);

    expect(screen.queryByText('Request limit change')).toBeNull();
  });

  it('hides the action when the offering has no limit-based or prepaid components', async () => {
    mockOffering({
      plugin_options: optedIn,
      components: [{ billing_type: 'usage' }],
    });

    const { queryClient } = renderAction(baseResource);

    await waitUntilLoaded(queryClient, OFFERING_KEY);
    expect(screen.queryByText('Request limit change')).toBeNull();
  });

  it('does not render or fetch the offering for users who can update limits directly', () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);

    renderAction(baseResource);

    expect(screen.queryByText('Request limit change')).toBeNull();
    expect(marketplaceResourcesOfferingRetrieve).not.toHaveBeenCalled();
  });

  it('renders the action when the resource has no plan and the offering opts in', async () => {
    mockOffering({
      plugin_options: optedIn,
      components: [{ billing_type: 'limit' }],
    });
    const resourceWithoutPlan = { ...baseResource, plan_uuid: undefined };

    renderAction(resourceWithoutPlan);

    // Mirrors ChangeLimitsAction: shown (disabled) once the offering is known
    // to accept requests, because a limit change is not feasible without a plan.
    expect(await screen.findByText('Request limit change')).toBeInTheDocument();
  });
});
