import { afterEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';
import { CustomerFeatures, MarketplaceFeatures } from '@/FeaturesEnums';
import { states } from '@/states';

// A portal that sends projects over OpenPortal and one that receives them are
// different deployments, so each side has its own feature. Pages both sides
// use need no feature of their own, but show only while either side is on.
describe('OpenPortal route features', () => {
  const byName = new Map(states.map((state) => [state.name, state]));
  const featureOf = (name: string) => {
    const state = byName.get(name);
    expect(state, name).toBeDefined();
    return state.data?.feature;
  };

  it.each([
    'organization-remote-projects',
    'organization-remote-project-detail',
    'organization-remote-project-audit',
    'organization-remote-projects-audit',
  ])('gates the sending-side page %s', (name) => {
    expect(featureOf(name)).toBe(
      CustomerFeatures.show_openportal_remote_projects,
    );
  });

  it.each([
    'managed-projects',
    'marketplace-provider-managed-projects',
    'marketplace-provider-managed-project-detail',
    'marketplace-provider-managed-projects-audit',
    'marketplace-provider-project-templates',
  ])('gates the receiving-side page %s', (name) => {
    expect(featureOf(name)).toBe(MarketplaceFeatures.show_managed_projects);
  });

  it.each([
    'project.openportal-reports',
    'organization-openportal-reports',
    'organization-openportal-allocation',
    'support-openportal-usage',
    'support.access-for-email',
  ])('leaves the shared page %s to the plugin switch', (name) => {
    expect(featureOf(name)).toBeUndefined();
  });

  describe('shared pages', () => {
    const SHARED = [
      'project.openportal-reports',
      'organization-openportal-reports',
      'organization-openportal-allocation',
      'support-openportal-usage',
      'support.access-for-email',
    ];
    // The last permission of each shared page is the OpenPortal one; the
    // others check the user's role.
    const pluginGate = (name: string) => {
      const permissions = byName.get(name).data.permissions;
      return permissions[permissions.length - 1];
    };
    const configure = (
      enabled: boolean,
      remoteProjects: boolean,
      managedProjects: boolean,
    ) => {
      ENV.plugins.WALDUR_OPENPORTAL = { ENABLED: enabled };
      ENV.FEATURES = {
        customer: { show_openportal_remote_projects: remoteProjects },
        marketplace: { show_managed_projects: managedProjects },
      };
    };
    const saved = {
      plugin: ENV.plugins.WALDUR_OPENPORTAL,
      features: ENV.FEATURES,
    };

    afterEach(() => {
      ENV.plugins.WALDUR_OPENPORTAL = saved.plugin;
      ENV.FEATURES = saved.features;
    });

    it.each(SHARED)('%s shows on a sending portal', (name) => {
      configure(true, true, false);
      expect(pluginGate(name)(undefined)).toBe(true);
    });

    it.each(SHARED)('%s shows on a receiving portal', (name) => {
      configure(true, false, true);
      expect(pluginGate(name)(undefined)).toBe(true);
    });

    it.each(SHARED)('%s hides when the portal plays neither side', (name) => {
      configure(true, false, false);
      expect(pluginGate(name)(undefined)).toBe(false);
    });

    it.each(SHARED)('%s hides while the plugin is off', (name) => {
      configure(false, true, true);
      expect(pluginGate(name)(undefined)).toBe(false);
    });
  });
});
