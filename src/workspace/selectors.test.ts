import { afterEach, beforeEach, describe, it, expect } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { type RootState } from '@/store/reducers';

import {
  canAccessServiceProviderWorkspace,
  canViewServiceProviderTeam,
  checkCanAccessServiceProvider,
  checkHasServiceProviderRole,
  checkServiceProviderPermission,
  hasServiceProviderPermission,
  checkIsServiceManagerOnly,
  hasAnyOrganizationAccess,
  isOwnerOrStaff,
  isServiceProviderManager,
} from './selectors';

describe('isOwnerOrStaff selector', () => {
  const staff = {
    is_staff: true,
    is_support: false,
    uuid: 'staff_uuid',
  };

  const owner = {
    is_staff: false,
    is_support: false,
    uuid: 'owner_uuid',
  };

  it('returns true if user is staff', () => {
    const workspace = { user: staff };
    const actual = isOwnerOrStaff({ workspace } as RootState);
    expect(actual).toBe(true);
  });

  it('returns true if user is organization owner', () => {
    const workspace = {
      user: {
        ...owner,
        permissions: [
          {
            scope_type: 'customer',
            scope_uuid: 'alice',
            role_name: RoleEnum.CUSTOMER_OWNER,
          },
        ],
      },
      customer: {
        uuid: 'alice',
      },
    };
    const actual = isOwnerOrStaff({ workspace } as RootState);
    expect(actual).toBe(true);
  });

  it('returns false if user is not staff and is not organization owner', () => {
    const workspace = {
      user: {
        ...owner,
        permissions: [],
      },
      customer: {
        uuid: 'alice',
      },
    };
    const actual = isOwnerOrStaff({ workspace } as RootState);
    expect(actual).toBe(false);
  });
});

describe('hasAnyOrganizationAccess selector', () => {
  it('returns false if no user', () => {
    const workspace = { user: null };
    const actual = hasAnyOrganizationAccess({ workspace } as RootState);
    expect(actual).toBe(false);
  });

  it('returns true if user is staff', () => {
    const workspace = { user: { is_staff: true, is_support: false } };
    const actual = hasAnyOrganizationAccess({ workspace } as RootState);
    expect(actual).toBe(true);
  });

  it('returns true if user is support', () => {
    const workspace = { user: { is_staff: false, is_support: true } };
    const actual = hasAnyOrganizationAccess({ workspace } as RootState);
    expect(actual).toBe(true);
  });

  it('returns true if user has customer permission', () => {
    const workspace = {
      user: {
        is_staff: false,
        is_support: false,
        permissions: [{ scope_type: 'customer', scope_uuid: 'org1' }],
      },
    };
    const actual = hasAnyOrganizationAccess({ workspace } as RootState);
    expect(actual).toBe(true);
  });

  it('returns false if user has no customer permissions', () => {
    const workspace = {
      user: {
        is_staff: false,
        is_support: false,
        permissions: [{ scope_type: 'project', scope_uuid: 'proj1' }],
      },
    };
    const actual = hasAnyOrganizationAccess({ workspace } as RootState);
    expect(actual).toBe(false);
  });
});

describe('isServiceProviderManager selector', () => {
  it('returns true if user is staff', () => {
    const workspace = { user: { is_staff: true } };
    const actual = isServiceProviderManager({ workspace } as RootState);
    expect(actual).toBe(true);
  });

  it('returns true if user is customer owner', () => {
    const workspace = {
      user: {
        is_staff: false,
        permissions: [
          {
            scope_type: 'customer',
            role_name: RoleEnum.CUSTOMER_OWNER,
          },
        ],
      },
    };
    const actual = isServiceProviderManager({ workspace } as RootState);
    expect(actual).toBe(true);
  });

  it('returns true if user is customer manager', () => {
    const workspace = {
      user: {
        is_staff: false,
        permissions: [
          {
            scope_type: 'customer',
            role_name: RoleEnum.CUSTOMER_MANAGER,
          },
        ],
      },
    };
    const actual = isServiceProviderManager({ workspace } as RootState);
    expect(actual).toBe(true);
  });

  it('returns false if user has only project permissions', () => {
    const workspace = {
      user: {
        is_staff: false,
        permissions: [
          {
            scope_type: 'project',
            role_name: RoleEnum.PROJECT_ADMIN,
          },
        ],
      },
    };
    const actual = isServiceProviderManager({ workspace } as RootState);
    expect(actual).toBe(false);
  });
});

describe('checkIsServiceManagerOnly', () => {
  it('follows the flag Mastermind sets on the organization', () => {
    expect(
      checkIsServiceManagerOnly({ is_service_provider_manager_only: true }),
    ).toBe(true);
    expect(
      checkIsServiceManagerOnly({ is_service_provider_manager_only: false }),
    ).toBe(false);
  });

  it('is false while the organization is not loaded', () => {
    expect(checkIsServiceManagerOnly(undefined)).toBe(false);
  });
});

describe('checkHasServiceProviderRole', () => {
  const user = (permissions) =>
    ({ is_staff: false, is_support: false, permissions }) as any;
  const providerPermission = (role_name) => ({
    scope_type: 'service_provider',
    scope_uuid: 'provider',
    customer_uuid: 'provider_org',
    role_name,
  });

  it('is true for any role on a provider of the organization', () => {
    for (const role of [RoleEnum.CUSTOMER_MANAGER, 'CUSTOM.PROVIDER_ROLE']) {
      expect(
        checkHasServiceProviderRole(
          { uuid: 'provider_org' },
          user([providerPermission(role)]),
        ),
      ).toBe(true);
    }
  });

  it('is false for another organization or a non-provider role', () => {
    expect(
      checkHasServiceProviderRole(
        { uuid: 'another_org' },
        user([providerPermission(RoleEnum.CUSTOMER_MANAGER)]),
      ),
    ).toBe(false);
    expect(
      checkHasServiceProviderRole(
        { uuid: 'provider_org' },
        user([
          {
            scope_type: 'offering',
            customer_uuid: 'provider_org',
            role_name: RoleEnum.OFFERING_MANAGER,
          },
        ]),
      ),
    ).toBe(false);
  });
});

describe('service provider access for custom roles', () => {
  // The least-privilege operator role from the support request: provider-side
  // rights on the organization, but none of an owner's or a manager's.
  const OPERATOR = 'CUSTOMER.SERVICE_PROVIDER_OPERATOR';
  const CONSUMER = 'CUSTOMER.CONSUMER_ONLY';
  const CONSUMER_APPROVER = 'CUSTOMER.CONSUMER_APPROVER';
  const TEAM_VIEWER = 'CUSTOMER.TEAM_VIEWER';
  let originalRoles;

  beforeEach(() => {
    originalRoles = ENV.roles;
    ENV.roles = [
      ...originalRoles,
      {
        name: OPERATOR,
        permissions: [
          PermissionEnum.LIST_ORDERS,
          PermissionEnum.APPROVE_ORDER,
          PermissionEnum.REJECT_ORDER,
          PermissionEnum.LIST_RESOURCES,
          PermissionEnum.UPDATE_RESOURCE_OPTIONS,
          PermissionEnum.GET_SERVICE_PROVIDER_STATISTICS,
          PermissionEnum.GET_SERVICE_PROVIDER_REVENUE,
          PermissionEnum.LIST_SERVICE_PROVIDER_CUSTOMERS,
          PermissionEnum.LIST_SERVICE_PROVIDER_CUSTOMER_PROJECTS,
          PermissionEnum.LIST_SERVICE_PROVIDER_PROJECTS,
        ],
      },
      {
        name: CONSUMER,
        permissions: [
          PermissionEnum.LIST_ORDERS,
          PermissionEnum.LIST_RESOURCES,
        ],
      },
      {
        name: TEAM_VIEWER,
        permissions: [PermissionEnum.VIEW_CUSTOMER_TEAM],
      },
      {
        name: CONSUMER_APPROVER,
        permissions: [
          PermissionEnum.LIST_ORDERS,
          PermissionEnum.APPROVE_ORDER,
          PermissionEnum.REJECT_ORDER,
          PermissionEnum.LIST_RESOURCES,
          PermissionEnum.UPDATE_RESOURCE_OPTIONS,
        ],
      },
    ] as any;
  });

  afterEach(() => {
    ENV.roles = originalRoles;
  });

  const userWith = (role_name, scope_uuid = 'provider_a') =>
    ({
      is_staff: false,
      is_support: false,
      permissions: [
        {
          scope_type: 'customer',
          scope_uuid,
          customer_uuid: scope_uuid,
          role_name,
        },
      ],
    }) as any;

  it('opens the provider workspace to a custom provider role', () => {
    expect(
      checkCanAccessServiceProvider({ uuid: 'provider_a' }, userWith(OPERATOR)),
    ).toBe(true);
  });

  it('keeps the provider workspace of another organization closed', () => {
    expect(
      checkCanAccessServiceProvider({ uuid: 'provider_b' }, userWith(OPERATOR)),
    ).toBe(false);
  });

  it('keeps it closed to a role with consumer-side permissions only', () => {
    expect(
      checkCanAccessServiceProvider({ uuid: 'provider_a' }, userWith(CONSUMER)),
    ).toBe(false);
  });

  it('keeps it closed to a consumer role that approves orders and edits options', () => {
    // On an organization these are consumer-side rights too.
    expect(
      checkCanAccessServiceProvider(
        { uuid: 'provider_a' },
        userWith(CONSUMER_APPROVER),
      ),
    ).toBe(false);
  });

  it('still opens it to owners and service provider managers', () => {
    expect(
      checkCanAccessServiceProvider(
        { uuid: 'provider_a' },
        userWith(RoleEnum.CUSTOMER_OWNER),
      ),
    ).toBe(true);
    expect(
      checkCanAccessServiceProvider({ uuid: 'provider_a' }, {
        is_staff: false,
        permissions: [
          {
            scope_type: 'service_provider',
            scope_uuid: 'provider',
            customer_uuid: 'provider_a',
            role_name: RoleEnum.CUSTOMER_MANAGER,
          },
        ],
      } as any),
    ).toBe(true);
  });

  it('guards the provider workspace route like its tab, keeping support', () => {
    const state = (user) =>
      ({ workspace: { user, customer: { uuid: 'provider_a' } } }) as RootState;

    expect(canAccessServiceProviderWorkspace(state(userWith(OPERATOR)))).toBe(
      true,
    );
    // A typed /providers/ address must not open for a consumer-side role.
    expect(
      canAccessServiceProviderWorkspace(state(userWith(CONSUMER_APPROVER))),
    ).toBe(false);
    expect(
      canAccessServiceProviderWorkspace(
        state(userWith(OPERATOR, 'provider_b')),
      ),
    ).toBe(false);
    expect(
      canAccessServiceProviderWorkspace(
        state({ is_staff: false, is_support: true, permissions: [] }),
      ),
    ).toBe(true);
  });

  it('allows the operator only the customer lists its role grants', () => {
    const provider = { uuid: 'provider_a' };
    const operator = userWith(OPERATOR);
    expect(
      checkServiceProviderPermission(
        provider,
        operator,
        PermissionEnum.LIST_SERVICE_PROVIDER_CUSTOMERS,
      ),
    ).toBe(true);
    expect(
      checkServiceProviderPermission(
        provider,
        operator,
        PermissionEnum.LIST_SERVICE_PROVIDER_PROJECTS,
      ),
    ).toBe(true);
    expect(
      checkServiceProviderPermission(
        provider,
        operator,
        PermissionEnum.LIST_SERVICE_PROVIDER_USERS,
      ),
    ).toBe(false);
  });

  it('guards a provider tab by the permission on the provider organization', () => {
    const state = (user) =>
      ({ workspace: { user, customer: { uuid: 'provider_a' } } }) as RootState;
    const canListCustomers = hasServiceProviderPermission(
      PermissionEnum.LIST_SERVICE_PROVIDER_CUSTOMERS,
    );
    const canManageMaintenance = hasServiceProviderPermission(
      PermissionEnum.MANAGE_MAINTENANCE_ANNOUNCEMENT,
    );

    expect(canListCustomers(state(userWith(OPERATOR)))).toBe(true);
    expect(canManageMaintenance(state(userWith(OPERATOR)))).toBe(false);
    expect(canListCustomers(state(userWith(OPERATOR, 'provider_b')))).toBe(
      false,
    );
    expect(
      canManageMaintenance(
        state({ is_staff: false, is_support: true, permissions: [] }),
      ),
    ).toBe(true);
  });

  it('shows the provider team to whom Mastermind shows it', () => {
    const state = (user) =>
      ({ workspace: { user, customer: { uuid: 'provider_a' } } }) as RootState;

    // The ticket's operator holds neither CUSTOMER.VIEW_TEAM nor a role on
    // the ServiceProvider, so the team list would come back empty.
    expect(canViewServiceProviderTeam(state(userWith(OPERATOR)))).toBe(false);
    expect(canViewServiceProviderTeam(state(userWith(TEAM_VIEWER)))).toBe(true);
    expect(
      canViewServiceProviderTeam(state(userWith(TEAM_VIEWER, 'provider_b'))),
    ).toBe(false);
    expect(
      canViewServiceProviderTeam(
        state({
          is_staff: false,
          permissions: [
            {
              scope_type: 'service_provider',
              scope_uuid: 'provider',
              customer_uuid: 'provider_a',
              role_name: OPERATOR,
            },
          ],
        }),
      ),
    ).toBe(true);
    expect(
      canViewServiceProviderTeam(
        state({ is_staff: false, is_support: true, permissions: [] }),
      ),
    ).toBe(true);
  });
});
