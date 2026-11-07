import { render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import {
  getServiceAccessMode,
  isMarketplaceVisible,
} from '@/marketplace/serviceAccessMode';
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
  getServiceAccessMode: vi.fn(() => 'both'),
  isMarketplaceVisible: vi.fn(() => true),
}));

vi.mock('@/workspace/selectors', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/workspace/selectors')>();
  return {
    ...actual,
    checkHasNonProjectPermissions: () => false,
  };
});

vi.mock('./Sidebar', () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('./OrganizationsListMenu', () => ({
  OrganizationsListMenu: () => null,
}));
vi.mock('./ProjectsListMenu', () => ({ ProjectsListMenu: () => null }));
vi.mock('./ResourcesMenu', () => ({
  ResourcesMenu: ({ open }: { open?: boolean }) => (
    <div data-testid="resources-menu" data-open={String(Boolean(open))} />
  ),
}));
vi.mock('./ReportingMenu', () => ({ ReportingMenu: () => null }));
vi.mock('./CallPublicMenu', () => ({
  CallPublicMenu: ({ open }: { open?: boolean }) => (
    <div data-testid="calls-menu" data-open={String(Boolean(open))} />
  ),
  CallsModeEntries: () => <div data-testid="calls-entries" />,
}));
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
    vi.mocked(isMarketplaceVisible).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-1',
      is_staff: false,
    } as any);
  });

  // Calls-only mode: services are reached through calls, the shop is staff's.
  it('hides Add resource for non-staff in calls-only mode', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    vi.mocked(isMarketplaceVisible).mockReturnValue(false);
    render(<UnifiedSidebar />);
    expect(screen.queryByTestId('add-resource-toggle')).not.toBeInTheDocument();
  });

  it('hides Add resource for staff too in calls-only mode', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    vi.mocked(isMarketplaceVisible).mockReturnValue(false);
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff-1',
      is_staff: true,
    } as any);
    render(<UnifiedSidebar />);
    expect(screen.queryByTestId('add-resource-toggle')).not.toBeInTheDocument();
  });

  it('hides Add resource for non-staff when hide_marketplace_from_end_users is on', () => {
    hideMarketplaceOn();
    render(<UnifiedSidebar />);
    expect(screen.queryByTestId('add-resource-toggle')).not.toBeInTheDocument();
  });

  it.each([
    ['staff', { is_staff: true, is_support: false }],
    ['support', { is_staff: false, is_support: true }],
  ])(
    'shows Add resource for %s when hide_marketplace_from_end_users is on',
    (_label, role) => {
      hideMarketplaceOn();
      vi.mocked(useUser).mockReturnValue({
        uuid: 'user-1',
        ...role,
      } as any);
      render(<UnifiedSidebar />);
      expect(screen.getByTestId('add-resource-toggle')).toBeInTheDocument();
    },
  );

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

describe('UnifiedSidebar section auto-expand', () => {
  const renderOn = (state: object) => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state,
      params: {},
    } as any);
    render(<UnifiedSidebar />);
    return {
      calls: screen.getByTestId('calls-menu').dataset.open,
      resources: screen.getByTestId('resources-menu').dataset.open,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    vi.mocked(hasPermissionOnAnyScope).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
  });

  it('opens Calls on a page whose route places it there', () => {
    expect(
      renderOn({
        name: 'reviews-assignments',
        data: { sidebarSection: 'calls', sidebarItem: 'my-reviews' },
      }),
    ).toEqual({ calls: 'true', resources: 'false' });
  });

  it('opens Resources on a page whose route places it there', () => {
    expect(
      renderOn({
        name: 'marketplace-resource-details',
        data: { sidebarSection: 'resources' },
      }),
    ).toEqual({ calls: 'false', resources: 'true' });
  });

  it('keeps both closed on an unrelated page', () => {
    expect(renderOn({ name: 'profile.details', data: {} })).toEqual({
      calls: 'false',
      resources: 'false',
    });
  });
});

describe('UnifiedSidebar in calls-only mode', () => {
  const renderOn = (state: object) => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state,
      params: {},
    } as any);
    render(<UnifiedSidebar />);
  };
  const order = () =>
    screen
      .getAllByTestId(/^(calls-entries|resources-menu|calls-menu)$/)
      .map((element) => element.dataset.testid);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServiceAccessMode).mockReturnValue('calls');
    vi.mocked(isMarketplaceVisible).mockReturnValue(false);
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    vi.mocked(hasPermissionOnAnyScope).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
  });

  it('opens on the calls, with call management after resources', () => {
    renderOn({ name: 'profile.details', data: {} });
    expect(order()).toEqual(['calls-entries', 'resources-menu', 'calls-menu']);
  });

  it("leaves Call management closed on a top-level entry's page", () => {
    renderOn({
      name: 'reviews-assignments',
      data: { sidebarSection: 'calls', sidebarItem: 'my-reviews' },
    });
    expect(screen.getByTestId('calls-menu').dataset.open).toBe('false');
  });

  it('opens Call management on an operator page', () => {
    renderOn({
      name: 'manage-calls',
      data: { sidebarSection: 'calls', sidebarItem: 'manage-calls' },
    });
    expect(screen.getByTestId('calls-menu').dataset.open).toBe('true');
  });
});
