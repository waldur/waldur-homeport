import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { states } from './routes';

const stateByName = Object.fromEntries(
  states.map((state) => [state.name, state]),
);

// ui-router inherits `data` prototypally, so a state's own `permissions`
// replace its parent's instead of adding to them.
const getPermissions = (name: string) => {
  let state = stateByName[name];
  while (state) {
    if (state.data?.permissions) {
      return state.data.permissions;
    }
    state = stateByName[state.parent as string];
  }
  return [];
};

const canEnter = (name: string, user) =>
  getPermissions(name).every((permission) =>
    permission({ workspace: { user } }),
  );

const owner = {
  is_staff: false,
  is_support: false,
  permissions: [
    {
      scope_type: 'customer',
      scope_uuid: 'c1',
      scope_name: 'Org',
      role_name: 'CUSTOMER.OWNER',
    },
  ],
};
const manager = {
  ...owner,
  permissions: [{ ...owner.permissions[0], role_name: 'CUSTOMER.MANAGER' }],
};
const staff = { is_staff: true, permissions: [] };
const member = {
  is_staff: false,
  is_support: false,
  permissions: [
    {
      scope_type: 'project',
      scope_uuid: 'p1',
      role_name: 'PROJECT.MEMBER',
    },
  ],
};

const reportStates = states
  .map((state) => state.name)
  .filter(
    (name) => !['reporting', 'reporting-dashboard-layout'].includes(name),
  );

let features;

beforeEach(() => {
  features = ENV.FEATURES;
  ENV.FEATURES = { customer: { show_organisation_reporting: true } };
});

afterEach(() => {
  ENV.FEATURES = features;
  delete (ENV.plugins as any).WALDUR_CORE.ENABLED_REPORTING_SCREENS;
});

describe('reporting access', () => {
  it('lets staff reach every reporting state', () => {
    reportStates.forEach((name) => expect(canEnter(name, staff)).toBe(true));
  });

  it('lets organization owners reach only the landing page and scoped reports', () => {
    const reachable = reportStates.filter((name) => canEnter(name, owner));
    expect(reachable.sort()).toEqual(
      [
        'reporting-dashboard',
        'reporting-organization-summary',
        'reporting-project-detail',
        'reporting-quotas',
        'reporting-resource-usage',
        'reporting-user-usage',
      ].sort(),
    );
  });

  it('keeps users without an organization role out', () => {
    reportStates.forEach((name) => expect(canEnter(name, member)).toBe(false));
  });

  it('keeps organization managers out', () => {
    reportStates.forEach((name) => expect(canEnter(name, manager)).toBe(false));
  });

  it('keeps owners out when organisation reporting is turned off', () => {
    ENV.FEATURES = { customer: { show_organisation_reporting: false } };
    reportStates.forEach((name) => expect(canEnter(name, owner)).toBe(false));
  });

  it('keeps staff access when organisation reporting is turned off', () => {
    ENV.FEATURES = { customer: { show_organisation_reporting: false } };
    reportStates.forEach((name) => expect(canEnter(name, staff)).toBe(true));
  });

  it('keeps owners out when no scoped report is enabled', () => {
    (ENV.plugins as any).WALDUR_CORE.ENABLED_REPORTING_SCREENS = ['growth'];
    expect(canEnter('reporting-dashboard', owner)).toBe(false);
  });
});
