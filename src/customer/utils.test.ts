import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';

import { canAccessOrganization } from './utils';

vi.mock('@/features/connect');

const buildState = (user: any) => ({ workspace: { user } }) as any;

describe('canAccessOrganization', () => {
  beforeEach(() => {
    vi.mocked(isFeatureVisible).mockReset();
  });

  it('returns true for any authenticated user when the hide-from-project-members feature is off', () => {
    vi.mocked(isFeatureVisible).mockImplementation((feature) => {
      if (
        feature ===
        MarketplaceFeatures.hide_organization_information_from_project_members
      ) {
        return false;
      }
      return false;
    });

    const projectOnlyUser = {
      is_staff: false,
      is_support: false,
      permissions: [{ scope_type: 'project' }],
    };

    expect(canAccessOrganization(buildState(projectOnlyUser))).toBe(true);
  });

  it('returns true for staff when the feature is on', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(true);

    const staffUser = {
      is_staff: true,
      is_support: false,
      permissions: [],
    };

    expect(canAccessOrganization(buildState(staffUser))).toBe(true);
  });

  it('returns true for support users when the feature is on', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(true);

    const supportUser = {
      is_staff: false,
      is_support: true,
      permissions: [],
    };

    expect(canAccessOrganization(buildState(supportUser))).toBe(true);
  });

  it('returns true for users with a customer-scoped role when the feature is on', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(true);

    const ownerUser = {
      is_staff: false,
      is_support: false,
      permissions: [{ scope_type: 'project' }, { scope_type: 'customer' }],
    };

    expect(canAccessOrganization(buildState(ownerUser))).toBe(true);
  });

  it('returns false for project-only users when the feature is on', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(true);

    const projectManager = {
      is_staff: false,
      is_support: false,
      permissions: [{ scope_type: 'project' }, { scope_type: 'project' }],
    };

    expect(canAccessOrganization(buildState(projectManager))).toBe(false);
  });

  it('returns false for users with no permissions when the feature is on', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(true);

    const userWithNoPerms = {
      is_staff: false,
      is_support: false,
      permissions: [],
    };

    expect(canAccessOrganization(buildState(userWithNoPerms))).toBe(false);
  });
});
