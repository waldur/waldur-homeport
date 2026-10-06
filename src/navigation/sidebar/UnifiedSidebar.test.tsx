import { render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { hasPermissionOnAnyScope } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { UnifiedSidebar } from './UnifiedSidebar';

vi.mock('@/user/ProfileCompletenessContext', () => ({
  useProfileCompletenessContext: () => ({ shouldBlockNavigation: false }),
}));

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

vi.mock('@/permissions/hasPermission', () => ({
  hasPermissionOnAnyScope: vi.fn(),
}));

vi.mock('@/marketplace/serviceAccessMode', () => ({
  getServiceAccessMode: () => 'default',
  isMarketplaceVisible: () => true,
}));

vi.mock('@/workspace/selectors', () => ({
  checkHasNonProjectPermissions: () => false,
}));

vi.mock('./Sidebar', () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('./OrganizationsListMenu', () => ({
  OrganizationsListMenu: () => null,
}));
vi.mock('./ProjectsListMenu', () => ({ ProjectsListMenu: () => null }));
vi.mock('./ResourcesMenu', () => ({ ResourcesMenu: () => null }));
vi.mock('./ReportingMenu', () => ({ ReportingMenu: () => null }));
vi.mock('./CallPublicMenu', () => ({ CallPublicMenu: () => null }));
vi.mock('./MenuItem', () => ({ MenuItem: () => null }));

vi.mock('./marketplace-popup/MarketplaceTrigger', () => ({
  MarketplaceTrigger: () => <div data-testid="add-resource-toggle" />,
}));

const hideMarketplaceOn = () => {
  vi.mocked(isFeatureVisible).mockImplementation(
    (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
  );
};

describe('UnifiedSidebar Add resource visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'dashboard' },
      params: {},
    } as any);
    vi.mocked(hasPermissionOnAnyScope).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-1',
      is_staff: false,
    } as any);
  });

  it('hides Add resource for non-staff when hide_marketplace_from_end_users is on', () => {
    hideMarketplaceOn();
    render(<UnifiedSidebar />);
    expect(screen.queryByTestId('add-resource-toggle')).not.toBeInTheDocument();
  });

  it('shows Add resource for staff when hide_marketplace_from_end_users is on', () => {
    hideMarketplaceOn();
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff-1',
      is_staff: true,
    } as any);
    render(<UnifiedSidebar />);
    expect(screen.getByTestId('add-resource-toggle')).toBeInTheDocument();
  });

  it('shows Add resource for non-staff when the feature is off', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    render(<UnifiedSidebar />);
    expect(screen.getByTestId('add-resource-toggle')).toBeInTheDocument();
  });

  it('hides Add resource without CREATE_ORDER even when the feature is off', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    vi.mocked(hasPermissionOnAnyScope).mockReturnValue(false);
    render(<UnifiedSidebar />);
    expect(screen.queryByTestId('add-resource-toggle')).not.toBeInTheDocument();
  });
});
