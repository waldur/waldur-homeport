import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesOfferingForSubresourcesList } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { INSTANCE_TYPE } from '@/openstack/constants';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { AddResourceButton } from './AddResourceButton';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

vi.mock('@/marketplace/links/OfferingLink', () => ({
  OfferingLink: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

const resource = {
  marketplace_resource_uuid: 'mp-resource-uuid',
} as any;

describe('AddResourceButton (OpenStack sub-resource deploy)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    vi.mocked(
      marketplaceResourcesOfferingForSubresourcesList,
    ).mockResolvedValue({
      data: [{ uuid: 'offering-uuid', type: INSTANCE_TYPE }],
    } as any);
  });

  it('is not rendered when hide_marketplace_from_end_users is on for non-staff', async () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    const { container } = renderWithProviders(
      <AddResourceButton resource={resource} offeringType={INSTANCE_TYPE} />,
    );
    expect(container).toBeEmptyDOMElement();
    await waitFor(() =>
      expect(
        marketplaceResourcesOfferingForSubresourcesList,
      ).not.toHaveBeenCalled(),
    );
  });

  it('is rendered when hide_marketplace_from_end_users is on for staff', async () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    renderWithProviders(
      <AddResourceButton resource={resource} offeringType={INSTANCE_TYPE} />,
    );
    expect(
      await screen.findByRole('button', { name: /add resource/i }),
    ).toBeInTheDocument();
  });
});
