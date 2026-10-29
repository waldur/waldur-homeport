import { beforeEach, describe, expect, it } from 'vitest';

import { ARROW_TABS } from '@/administration/arrow/ArrowDashboard';
import { CALL_MANAGEMENT_TABS } from '@/administration/call-management/AdministrationCallManagement';
import { MARKETPLACE_TABS } from '@/administration/marketplace/AdministrationMarketplace';
import { SOFTWARE_CATALOG_TABS } from '@/administration/marketplace/AdministrationSoftwareCatalog';
import {
  ONBOARDING_TAB,
  PROJECT_TABS,
} from '@/administration/organizations-compliance/OrganizationProjectSettingsPage';
import {
  IDENTITY_BRIDGE_TAB,
  IDENTITY_TABS,
} from '@/administration/providers/IdentityProvidersList';
import { states as administrationStates } from '@/administration/routes';
import { SERVICE_DESK_TABS } from '@/administration/service-desk/AdministrationServiceDesk';
import { DATABASE_TABS } from '@/administration/system-management/DatabasePage';
import { LOGGING_TELEMETRY_TABS } from '@/administration/system-management/LoggingTelemetryPage';
import { ENV } from '@/core/config';
import { FeaturesDescription } from '@/features/FeaturesDescription';
import { MATRIX_STAFF_TABS } from '@/matrix/MatrixAdminDashboard';
import { SettingsDescription } from '@/SettingsDescription';
import { RootState } from '@/store/reducers';

import { BRANDING_TABS } from './AdministrationBranding';
import {
  formatAdminLocationBreadcrumb,
  getFeatureLocation,
  getSearchableAdminItems,
  getSettingGroupLocations,
  getSettingLocation,
  searchAdminRegistry,
} from './registry';

const makeState = (user?: {
  is_staff?: boolean;
  is_support?: boolean;
}): RootState =>
  ({
    workspace: {
      user: user
        ? {
            uuid: 'user-1',
            is_staff: Boolean(user.is_staff),
            is_support: Boolean(user.is_support),
          }
        : undefined,
    },
  }) as unknown as RootState;

describe('administration settings registry', () => {
  beforeEach(() => {
    ENV.FEATURES = {} as any;
    ENV.plugins = {
      WALDUR_CORE: {},
    } as any;
  });

  it('maps every group in SettingsDescription to an active administration route', () => {
    const groupLocations = getSettingGroupLocations();
    const activeStateNames = new Set(
      administrationStates
        .filter((s) => !s.abstract && !s.redirectTo)
        .map((s) => s.name),
    );

    const unmappedGroups: string[] = [];
    const invalidRoutes: string[] = [];

    for (const group of SettingsDescription) {
      const location = groupLocations[group.description];
      if (!location) {
        unmappedGroups.push(group.description);
        continue;
      }
      if (!activeStateNames.has(location.state)) {
        invalidRoutes.push(`${group.description} -> ${location.state}`);
      }
    }

    expect(unmappedGroups).toEqual([]);
    expect(invalidRoutes).toEqual([]);
  });

  it('points every tabbed location at a tab its page renders', () => {
    // A key the page doesn't have silently falls back to its first tab
    const pageTabKeys: Record<string, string[]> = Object.fromEntries(
      Object.entries({
        'admin-branding': BRANDING_TABS,
        'admin-marketplace-settings': MARKETPLACE_TABS,
        'admin-software-catalog-settings': SOFTWARE_CATALOG_TABS,
        'admin-call-management-settings': CALL_MANAGEMENT_TABS,
        'admin-identity': [...IDENTITY_TABS, IDENTITY_BRIDGE_TAB],
        'admin-service-desk-settings': Object.values(SERVICE_DESK_TABS),
        'admin-matrix-chat': MATRIX_STAFF_TABS,
        'admin-arrow': ARROW_TABS,
        'admin-organization-project-settings': [
          ONBOARDING_TAB,
          ...PROJECT_TABS,
        ],
        'admin-database': DATABASE_TABS,
        'admin-logging-telemetry': LOGGING_TELEMETRY_TABS,
      }).map(([state, tabs]) => [state, tabs.map((tab) => tab.key)]),
    );

    const wrongTabs: string[] = [];
    for (const [group, location] of Object.entries(
      getSettingGroupLocations(),
    )) {
      const tab = location.params?.tab;
      if (tab && !pageTabKeys[location.state]?.includes(tab)) {
        wrongTabs.push(`${group} -> ${location.state}?tab=${tab}`);
      }
    }

    expect(wrongTabs).toEqual([]);
  });

  it('maps every section in FeaturesDescription to admin-features', () => {
    for (const section of FeaturesDescription) {
      const location = getFeatureLocation(section.key, section.description);
      expect(location.state).toBe('admin-features');
      if (section.key === 'openstack' || section.key === 'rancher') {
        expect(location.params?.tab).toBe('plugins');
      } else {
        expect(location.params?.tab).toBe(section.key);
      }
    }
  });

  it('resolves location by group name or individual setting key', () => {
    expect(getSettingLocation('SITE_NAME')).toMatchObject({
      state: 'admin-branding',
      params: { tab: 'branding' },
    });
    expect(getSettingLocation('CURRENCY_NAME')).toMatchObject({
      state: 'admin-branding',
      params: { tab: 'marketplace' },
    });
    expect(getSettingLocation('MCP_ENABLED')).toMatchObject({
      state: 'admin-personal-access-tokens-settings',
    });
    expect(getSettingLocation('USER_REVISION_RETENTION_DAYS')).toMatchObject({
      state: 'admin-logging-telemetry',
      params: { tab: 'system-logging' },
    });
    expect(
      getSettingLocation('SITE_AGENT_LOG_MAX_ROWS_PER_IDENTITY'),
    ).toMatchObject({
      state: 'admin-logging-telemetry',
      params: { tab: 'system-logging' },
    });
    expect(
      getSettingLocation('USAGE_POLL_RECORD_RETENTION_MONTHS'),
    ).toMatchObject({
      state: 'admin-marketplace-settings',
      params: { tab: 'usage-polling' },
    });
    expect(
      getSettingLocation('POSIX_ID_POOL_UTILIZATION_THRESHOLD'),
    ).toMatchObject({
      state: 'admin-marketplace-settings',
      params: { tab: 'posix-id-pools' },
    });
  });

  it('returns no items for regular (non-staff, non-support) users', () => {
    const regularState = makeState({ is_staff: false, is_support: false });
    expect(getSearchableAdminItems(regularState)).toEqual([]);
    expect(searchAdminRegistry('SITE_NAME', regularState)).toEqual([]);
  });

  it('hides staff-only routes and settings from support users', () => {
    ENV.FEATURES = {
      reseller: { arrow: true },
    } as any;

    const supportState = makeState({ is_staff: false, is_support: true });
    const staffState = makeState({ is_staff: true, is_support: false });

    const supportItems = getSearchableAdminItems(supportState);
    const staffItems = getSearchableAdminItems(staffState);

    expect(
      supportItems.find((item) => item.location.state === 'admin-email-health'),
    ).toBeUndefined();
    expect(
      supportItems.find((item) => item.location.state === 'admin-arrow'),
    ).toBeUndefined();

    expect(
      staffItems.find((item) => item.location.state === 'admin-email-health'),
    ).toBeDefined();
    expect(
      staffItems.find((item) => item.location.state === 'admin-arrow'),
    ).toBeDefined();
  });

  it('ranks exact key and title matches first in searchAdminRegistry', () => {
    const staffState = makeState({ is_staff: true });

    const results = searchAdminRegistry('CURRENCY_NAME', staffState);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toMatchObject({
      kind: 'setting',
      key: 'CURRENCY_NAME',
      title: 'Currency name',
      location: {
        state: 'admin-branding',
        params: { tab: 'marketplace', setting: 'CURRENCY_NAME' },
      },
    });
    expect(formatAdminLocationBreadcrumb(results[0].location)).toBe(
      'User interface › Branding › Marketplace Branding',
    );
  });
});
