import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesOfferingRetrieve } from 'waldur-js-client';

import { useUser } from '@/workspace/hooks';

import { ChangeLimitsAction } from './ChangeLimitsAction';

vi.mock('waldur-js-client');
vi.mock('@/workspace/hooks');
vi.mock('@/modal/actions', () => ({
  useModal: () => ({ openDialog: vi.fn() }),
}));
vi.mock('@/resource/actions/useModalDialogCallback', () => ({
  useModalDialogCallback: () => vi.fn(),
}));
vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: () => true,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('ChangeLimitsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
  });

  it('does not call marketplace API if resource is a plugin resource without marketplace link', () => {
    const resource = {
      uuid: 'instance-uuid',
      resource_type: 'OpenStack.Instance',
      plan_uuid: 'plan-uuid',
      state: 'OK',
    };

    render(
      <QueryClientProvider client={queryClient}>
        <ChangeLimitsAction resource={resource as any} />
      </QueryClientProvider>,
    );

    // We expect that marketplaceResourcesOfferingRetrieve is NOT called
    expect(marketplaceResourcesOfferingRetrieve).not.toHaveBeenCalled();
  });

  it('calls marketplace API if resource has marketplace link', () => {
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: { components: [] },
    } as any);
    const resource = {
      uuid: 'instance-uuid',
      resource_type: 'OpenStack.Instance',
      marketplace_resource_uuid: 'marketplace-uuid',
      plan_uuid: 'plan-uuid',
      state: 'OK',
    };

    render(
      <QueryClientProvider client={queryClient}>
        <ChangeLimitsAction resource={resource as any} />
      </QueryClientProvider>,
    );

    expect(marketplaceResourcesOfferingRetrieve).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { uuid: 'marketplace-uuid' },
      }),
    );
  });
});
