import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { PermissionEnum } from './enums';
import {
  canViewCustomerTeam,
  canViewProjectTeam,
  canViewTeam,
} from './teamVisibility';

const ORG = 'org-1';
const OTHER_ORG = 'org-2';
const PROJECT = 'project-1';
const SIBLING_PROJECT = 'project-2';

const roles = [
  {
    name: 'CUSTOMER.OWNER',
    content_type: 'customer',
    is_active: true,
    permissions: [PermissionEnum.VIEW_CUSTOMER_TEAM],
  },
  {
    name: 'CUSTOMER.ufra.SRAM.research',
    content_type: 'customer',
    is_active: true,
    permissions: [PermissionEnum.LIST_PROJECTS],
  },
  {
    name: 'PROJECT.MEMBER',
    content_type: 'project',
    is_active: true,
    permissions: [PermissionEnum.VIEW_PROJECT_TEAM],
  },
  {
    name: 'PROJECT.GUEST',
    content_type: 'project',
    is_active: true,
    permissions: [],
  },
  // A project role that wrongly carries the organization permission.
  {
    name: 'PROJECT.ODD',
    content_type: 'project',
    is_active: true,
    permissions: [PermissionEnum.VIEW_CUSTOMER_TEAM],
  },
];

const grant = (
  scope_type: 'customer' | 'project',
  scope_uuid: string,
  role_name: string,
  customer_uuid: string = ORG,
) => ({ scope_type, scope_uuid, role_name, customer_uuid });

const userWith = (...permissions) =>
  ({ is_staff: false, is_support: false, permissions }) as any;

let savedRoles;
beforeEach(() => {
  savedRoles = ENV.roles;
  ENV.roles = roles as any;
});
afterEach(() => {
  ENV.roles = savedRoles;
});

describe('canViewTeam', () => {
  it('always lets staff and support in', () => {
    expect(
      canViewTeam({ is_staff: true, permissions: [] } as any, {
        customerId: ORG,
      }),
    ).toBe(true);
    expect(
      canViewTeam({ is_support: true, permissions: [] } as any, {
        customerId: ORG,
        projectId: PROJECT,
      }),
    ).toBe(true);
  });

  it('keeps an anonymous caller out', () => {
    expect(canViewTeam(undefined, { customerId: ORG })).toBe(false);
  });

  it('accepts CUSTOMER.VIEW_TEAM on the organization', () => {
    const user = userWith(grant('customer', ORG, 'CUSTOMER.OWNER'));
    expect(canViewTeam(user, { customerId: ORG })).toBe(true);
    expect(canViewTeam(user, { customerId: ORG, projectId: PROJECT })).toBe(
      true,
    );
    expect(canViewTeam(user, { customerId: OTHER_ORG })).toBe(false);
  });

  it('refuses an organization role without the permission', () => {
    // An SRAM placeholder: it may list projects, not their members.
    const user = userWith(
      grant('customer', ORG, 'CUSTOMER.ufra.SRAM.research'),
    );
    expect(canViewTeam(user, { customerId: ORG })).toBe(false);
    expect(canViewTeam(user, { customerId: ORG, projectId: PROJECT })).toBe(
      false,
    );
  });

  it('looks at every role the user holds on the organization', () => {
    // The placeholder comes first in the payload; the owner role still counts.
    const user = userWith(
      grant('customer', ORG, 'CUSTOMER.ufra.SRAM.research'),
      grant('customer', ORG, 'CUSTOMER.OWNER'),
    );
    expect(canViewTeam(user, { customerId: ORG })).toBe(true);
  });

  it('accepts PROJECT.VIEW_TEAM on the project', () => {
    const user = userWith(grant('project', PROJECT, 'PROJECT.MEMBER'));
    expect(canViewTeam(user, { customerId: ORG, projectId: PROJECT })).toBe(
      true,
    );
  });

  it('accepts PROJECT.VIEW_TEAM on another project of the organization', () => {
    const user = userWith(grant('project', SIBLING_PROJECT, 'PROJECT.MEMBER'));
    expect(canViewTeam(user, { customerId: ORG, projectId: PROJECT })).toBe(
      true,
    );
    expect(canViewTeam(user, { customerId: ORG })).toBe(true);
    expect(
      canViewTeam(user, { customerId: OTHER_ORG, projectId: 'project-9' }),
    ).toBe(false);
  });

  it('refuses a project role without the permission', () => {
    const user = userWith(grant('project', PROJECT, 'PROJECT.GUEST'));
    expect(canViewTeam(user, { customerId: ORG, projectId: PROJECT })).toBe(
      false,
    );
    expect(canViewTeam(user, { customerId: ORG })).toBe(false);
  });

  it('does not take a permission from a role of the other scope type', () => {
    const user = userWith(grant('project', PROJECT, 'PROJECT.ODD'));
    expect(canViewTeam(user, { customerId: ORG, projectId: PROJECT })).toBe(
      false,
    );
  });
});

describe('Team tab route predicates', () => {
  const stateFor = (user, { customer = undefined, project = undefined } = {}) =>
    ({ workspace: { user, customer, project } }) as any;

  it('gates the organization Team tab on the current organization', () => {
    const user = userWith(grant('customer', ORG, 'CUSTOMER.OWNER'));
    expect(
      canViewCustomerTeam(stateFor(user, { customer: { uuid: ORG } })),
    ).toBe(true);
    expect(
      canViewCustomerTeam(stateFor(user, { customer: { uuid: OTHER_ORG } })),
    ).toBe(false);
  });

  it('gates the project Team tab on the current project and its organization', () => {
    const member = userWith(grant('project', PROJECT, 'PROJECT.MEMBER'));
    const guest = userWith(grant('project', PROJECT, 'PROJECT.GUEST'));
    const project = { uuid: PROJECT, customer_uuid: ORG };
    expect(canViewProjectTeam(stateFor(member, { project }))).toBe(true);
    expect(canViewProjectTeam(stateFor(guest, { project }))).toBe(false);
  });
});
