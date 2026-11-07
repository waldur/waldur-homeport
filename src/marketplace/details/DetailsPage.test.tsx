import { screen, waitFor } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplacePluginsList,
  marketplacePublicOfferingsRetrieve,
} from 'waldur-js-client';

import { goToNotFound } from '@/error/utils';
import { isFeatureVisible } from '@/features/connect';
import { isMarketplaceVisible } from '@/marketplace/serviceAccessMode';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { OfferingDetailsPage } from './DetailsPage';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

vi.mock('@/marketplace/serviceAccessMode', () => ({
  isMarketplaceVisible: vi.fn(),
}));

vi.mock('@/error/utils', () => ({
  goToNotFound: vi.fn(),
}));

vi.mock('@/auth/PermissionLayout', () => ({
  usePermissionView: vi.fn(),
}));

vi.mock('@/navigation/title', () => ({
  useTitle: vi.fn(),
}));

vi.mock('../deploy/DeployPage', () => ({
  DeployPage: () => <div>Deploy form</div>,
}));

const renderPage = (offering: Record<string, unknown>) => {
  vi.mocked(marketplacePublicOfferingsRetrieve).mockResolvedValue({
    data: { uuid: 'offering-uuid', type: 'OpenStack.Instance', ...offering },
  } as any);
  return renderWithProviders(<OfferingDetailsPage />);
};

describe('OfferingDetailsPage (deploy form)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'marketplace-offering-public' },
      params: { offering_uuid: 'offering-uuid' },
    } as any);
    vi.mocked(marketplacePluginsList).mockResolvedValue({
      data: [{ offering_type: 'OpenStack.Instance', available_limits: [] }],
    } as any);
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    vi.mocked(isMarketplaceVisible).mockReturnValue(false);
  });

  describe('calls-only mode', () => {
    it('is not found for a shared offering', async () => {
      renderPage({ state: 'Active', shared: true });
      await waitFor(() => expect(goToNotFound).toHaveBeenCalled());
      expect(screen.queryByText('Deploy form')).not.toBeInTheDocument();
    });

    it('deploys from a private offering', async () => {
      renderPage({ state: 'Active', shared: false });
      expect(await screen.findByText('Deploy form')).toBeInTheDocument();
      expect(goToNotFound).not.toHaveBeenCalled();
    });

    it('lets staff deploy from a shared offering', async () => {
      vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
      renderPage({ state: 'Active', shared: true });
      expect(await screen.findByText('Deploy form')).toBeInTheDocument();
    });
  });

  it('deploys from a shared offering where the marketplace is shown', async () => {
    vi.mocked(isMarketplaceVisible).mockReturnValue(true);
    renderPage({ state: 'Active', shared: true });
    expect(await screen.findByText('Deploy form')).toBeInTheDocument();
  });

  it('is not found for an inactive offering', async () => {
    vi.mocked(isMarketplaceVisible).mockReturnValue(true);
    renderPage({ state: 'Paused', shared: true });
    await waitFor(() => expect(goToNotFound).toHaveBeenCalled());
  });
});
