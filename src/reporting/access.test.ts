import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { getReportingOrganizations } from './access';
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
const withRole = (role_name: string) => ({
  ...owner,
  permissions: [{ ...owner.permissions[0], role_name }],
});
const reader = withRole('CUSTOMER.READER');
const manager = withRole('CUSTOMER.MANAGER');
const staff = { is_staff: true, permissions: [] };
const support = { is_staff: false, is_support: true, permissions: [] };
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

// The reports and their lists: not the layout states, nor the redirect of a
// retired URL, which shows nothing of its own.
const reportStates = states
  .map((state) => state.name)
  .filter(
    (name) =>
      ![
        'reporting',
        'reporting-dashboard-layout',
        'reporting-proposals-retired',
      ].includes(name),
  );

const VIEW_REPORTING = 'CUSTOMER.VIEW_REPORTING';

let features;
let roles;

beforeEach(() => {
  features = ENV.FEATURES;
  roles = ENV.roles;
  ENV.FEATURES = { customer: { show_organisation_reporting: true } };
  ENV.roles = [
    { name: 'CUSTOMER.OWNER', permissions: [VIEW_REPORTING] },
    { name: 'CUSTOMER.READER', permissions: [VIEW_REPORTING] },
    { name: 'CUSTOMER.MANAGER', permissions: [] },
    { name: 'CUSTOMER.ANALYST', permissions: [VIEW_REPORTING] },
    {
      name: 'CUSTOMER.org.OWNER',
      template_name: 'CUSTOMER.OWNER',
      permissions: [],
    },
  ] as any;
});

afterEach(() => {
  ENV.FEATURES = features;
  ENV.roles = roles;
  delete (ENV.plugins as any).WALDUR_CORE.ENABLED_REPORTING_SCREENS;
});

describe('reporting access', () => {
  // The Proposals category's old reports live on in the call reports: their
  // URLs land there, and the page decides who may stay.
  it('sends the retired proposal report URLs to the call reports', () => {
    const retired = stateByName['reporting-proposals-retired'];
    expect(retired.redirectTo).toBe('reporting-proposals-list');
  });

  it('lets staff reach every reporting state', () => {
    reportStates.forEach((name) => expect(canEnter(name, staff)).toBe(true));
  });

  // Their endpoints answer support users with 403.
  it('keeps support out of the reports built on staff-only endpoints only', () => {
    const unreachable = reportStates.filter((name) => !canEnter(name, support));
    expect(unreachable).toEqual([
      'reporting-projects-by-affiliated-organization',
    ]);
  });

  it.each([
    ['owners', owner],
    ['readers', reader],
  ])(
    'lets organization %s reach only the landing page and scoped reports',
    (_, user) => {
      const reachable = reportStates.filter((name) => canEnter(name, user));
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
    },
  );

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

  it('lets in any role that grants CUSTOMER.VIEW_REPORTING', () => {
    expect(
      canEnter('reporting-organization-summary', withRole('CUSTOMER.ANALYST')),
    ).toBe(true);
  });

  it('keeps out an owner clone without CUSTOMER.VIEW_REPORTING', () => {
    expect(
      canEnter(
        'reporting-organization-summary',
        withRole('CUSTOMER.org.OWNER'),
      ),
    ).toBe(false);
  });

  it('lists an organization once when several roles grant the permission', () => {
    const user = {
      ...owner,
      permissions: [
        owner.permissions[0],
        { ...owner.permissions[0], role_name: 'CUSTOMER.READER' },
      ],
    };
    expect(getReportingOrganizations(user as any)).toEqual([
      { uuid: 'c1', name: 'Org' },
    ]);
  });

  it('keeps owners out when no scoped report is enabled', () => {
    (ENV.plugins as any).WALDUR_CORE.ENABLED_REPORTING_SCREENS = ['growth'];
    expect(canEnter('reporting-dashboard', owner)).toBe(false);
  });
});

describe('the call reports', () => {
  const callManager = {
    is_staff: false,
    is_support: false,
    permissions: [
      {
        scope_type: 'call',
        scope_uuid: 'call-1',
        customer_uuid: 'c1',
        role_name: 'CALL.MANAGER',
      },
    ],
  };
  const page = 'reporting-proposals-list';

  // Across every organization: staff, and support, who read.
  it.each([
    ['staff', staff, true],
    ['support', support, true],
    ['an organization owner', owner, false],
    ['a call manager', callManager, false],
    ['an anonymous visitor', null, false],
  ])('%s: %s', (_label, user, expected) => {
    expect(canEnter(page, user)).toBe(expected);
  });

  it('is not offered when the reporting screen is switched off', () => {
    (ENV.plugins as any).WALDUR_CORE.ENABLED_REPORTING_SCREENS = ['quotas'];
    expect(canEnter(page, staff)).toBe(false);
    expect(canEnter(page, support)).toBe(false);
  });

  it('is not offered where calls run outside Waldur', () => {
    ENV.FEATURES = { marketplace: { call_only: true } } as any;
    expect(canEnter(page, staff)).toBe(false);
  });

  it('shows only with call management', () => {
    expect(stateByName[page].data.feature).toBe(
      'marketplace.show_call_management_functionality',
    );
  });
});
