import { describe, expect, it } from 'vitest';

import { CustomerFeatures, MarketplaceFeatures } from '@/FeaturesEnums';
import { states } from '@/states';

// A portal that sends projects over OpenPortal and one that receives them are
// different deployments, so each side has its own feature. Pages both sides
// use stay on the plugin switch alone.
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
});
