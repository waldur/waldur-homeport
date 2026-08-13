import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesOfferingRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ChangeLimitsAction } from './ChangeLimitsAction';

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: () => true,
  hasAllPermissions: () => true,
}));

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

    renderWithProviders(<ChangeLimitsAction resource={resource as any} />);

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

    renderWithProviders(<ChangeLimitsAction resource={resource as any} />);

    expect(marketplaceResourcesOfferingRetrieve).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { uuid: 'marketplace-uuid' },
      }),
    );
  });
});
