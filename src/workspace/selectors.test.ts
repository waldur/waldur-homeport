import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

import { ENV } from '@/core/config';
import { ImpersonationStorage } from '@/core/StorageManager';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { type RootState } from '@/store/reducers';

import {
  canAccessProviderOffering,
  canAccessServiceProviderWorkspace,
  canViewServiceProviderTeam,
  checkCanAccessServiceProvider,
  checkCanManageProject,
  checkHasServiceProviderRole,
  checkServiceProviderPermission,
  hasServiceProviderPermission,
  checkIsServiceManagerOnly,
  hasAnyOrganizationAccess,
  canViewAccounting,
  checkIsOwner,
  isOwnerOrStaff,
  isOwnerOrStaffOrReader,
  isServiceProviderManager,
  isStaffOrSupportOrImpersonating,
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

describe('canAccessProviderOffering', () => {
  let originalRoles;

  beforeEach(() => {
    originalRoles = ENV.roles;
    ENV.roles = [
      ...originalRoles,
      {
        name: RoleEnum.OFFERING_MANAGER,
        permissions: [PermissionEnum.UPDATE_OFFERING],
      },
      {
        name: RoleEnum.CUSTOMER_READER,
        permissions: [PermissionEnum.VIEW_CUSTOMER_TEAM],
      },
      {
        name: 'CUSTOM.OFFERING_EDITOR',
        permissions: [PermissionEnum.UPDATE_OFFERING],
      },
    ] as any;
  });

  afterEach(() => {
    ENV.roles = originalRoles;
  });

  const state = (user) =>
    ({ workspace: { user, customer: { uuid: 'provider_a' } } }) as RootState;
  const transition = (offering_uuid: string, uuid = 'provider_a') => ({
    params: () => ({ uuid, offering_uuid }),
  });

  const offeringManager = {
    is_staff: false,
    is_support: false,
    permissions: [
      {
        scope_type: 'offering',
        scope_uuid: 'offering-a',
        customer_uuid: 'provider_a',
        role_name: RoleEnum.OFFERING_MANAGER,
      },
    ],
  } as any;

  it('lets an offering manager open that offering', () => {
    expect(
      canAccessProviderOffering(
        state(offeringManager),
        transition('offering-a'),
      ),
    ).toBe(true);
  });

  it('refuses a different offering', () => {
    expect(
      canAccessProviderOffering(
        state(offeringManager),
        transition('offering-b'),
      ),
    ).toBe(false);
  });

  it('refuses an organization reader', () => {
    const reader = {
      is_staff: false,
      is_support: false,
      permissions: [
        {
          scope_type: 'customer',
          scope_uuid: 'provider_a',
          customer_uuid: 'provider_a',
          role_name: RoleEnum.CUSTOMER_READER,
        },
      ],
    } as any;
    expect(
      canAccessProviderOffering(state(reader), transition('offering-a')),
    ).toBe(false);
  });

  it('still opens the pages to the provider workspace and to a custom role', () => {
    expect(
      canAccessProviderOffering(
        state({ is_staff: false, is_support: true, permissions: [] }),
        transition('offering-a'),
      ),
    ).toBe(true);
    const editor = {
      is_staff: false,
      is_support: false,
      permissions: [
        {
          scope_type: 'customer',
          scope_uuid: 'provider_a',
          customer_uuid: 'provider_a',
          role_name: 'CUSTOM.OFFERING_EDITOR',
        },
      ],
    } as any;
    expect(
      canAccessProviderOffering(state(editor), transition('offering-b')),
    ).toBe(true);
  });

  const organizationEditor = {
    is_staff: false,
    is_support: false,
    permissions: [
      {
        scope_type: 'customer',
        scope_uuid: 'provider_a',
        customer_uuid: 'provider_a',
        role_name: 'CUSTOM.OFFERING_EDITOR',
      },
    ],
  } as any;

  it('reads the organization from the route, not the open workspace', () => {
    const noWorkspace = {
      workspace: { user: organizationEditor, customer: null },
    } as RootState;
    expect(
      canAccessProviderOffering(noWorkspace, transition('offering-a')),
    ).toBe(true);
  });

  it('refuses an organization editor on another organization', () => {
    expect(
      canAccessProviderOffering(
        state(organizationEditor),
        transition('offering-c', 'provider_b'),
      ),
    ).toBe(false);
  });
});

describe('organization role clones and accounting', () => {
  const OWNER_CLONE = 'CUSTOMER.acme.OWNER';
  const NO_ORDER_CLONE = 'CUSTOMER.acme.OWNER_NO_ORDER';
  const READER_CLONE = 'CUSTOMER.acme.READER';
  const ACCOUNTANT = 'CUSTOMER.ACCOUNTANT';
  const PROVIDER_ROLE = 'CUSTOMER.PROVIDER_ACCOUNTANT';
  let originalRoles;

  beforeEach(() => {
    originalRoles = ENV.roles;
    ENV.roles = [
      ...originalRoles,
      {
        name: RoleEnum.CUSTOMER_OWNER,
        template_name: null,
        permissions: [
          PermissionEnum.CREATE_ORDER,
          PermissionEnum.VIEW_CUSTOMER_ACCOUNTING,
        ],
      },
      {
        name: OWNER_CLONE,
        template_name: RoleEnum.CUSTOMER_OWNER,
        permissions: [PermissionEnum.CREATE_ORDER],
      },
      {
        name: NO_ORDER_CLONE,
        template_name: RoleEnum.CUSTOMER_OWNER,
        permissions: [PermissionEnum.VIEW_CUSTOMER_ACCOUNTING],
      },
      {
        name: READER_CLONE,
        template_name: RoleEnum.CUSTOMER_READER,
        permissions: [PermissionEnum.VIEW_CUSTOMER_TEAM],
      },
      {
        name: ACCOUNTANT,
        template_name: null,
        permissions: [PermissionEnum.VIEW_CUSTOMER_ACCOUNTING],
      },
      {
        name: PROVIDER_ROLE,
        template_name: null,
        permissions: [PermissionEnum.VIEW_CUSTOMER_ACCOUNTING],
      },
    ] as any;
  });

  afterEach(() => {
    ENV.roles = originalRoles;
  });

  const customer = { uuid: 'acme' };
  const userWith = (role_name: string, scope_uuid = 'acme') => ({
    is_staff: false,
    is_support: false,
    uuid: 'user_uuid',
    permissions: [{ scope_type: 'customer', scope_uuid, role_name }],
  });
  const state = (user) => ({ workspace: { user, customer } }) as RootState;

  it('treats a clone of the owner as an owner of its organization', () => {
    expect(checkIsOwner(customer, userWith(OWNER_CLONE) as any)).toBe(true);
    expect(checkIsOwner(customer, userWith(NO_ORDER_CLONE) as any)).toBe(true);
    expect(isOwnerOrStaff(state(userWith(NO_ORDER_CLONE)))).toBe(true);
  });

  it('does not treat other clones or custom roles as owners', () => {
    expect(checkIsOwner(customer, userWith(READER_CLONE) as any)).toBe(false);
    expect(checkIsOwner(customer, userWith(ACCOUNTANT) as any)).toBe(false);
    expect(checkIsOwner(customer, userWith(OWNER_CLONE, 'other') as any)).toBe(
      false,
    );
  });

  it('treats a clone of the reader as a reader', () => {
    expect(isOwnerOrStaffOrReader(state(userWith(READER_CLONE)))).toBe(true);
  });

  it('shows accounting to roles granting CUSTOMER.VIEW_ACCOUNTING', () => {
    expect(canViewAccounting(state(userWith(RoleEnum.CUSTOMER_OWNER)))).toBe(
      true,
    );
    expect(canViewAccounting(state(userWith(NO_ORDER_CLONE)))).toBe(true);
    expect(canViewAccounting(state(userWith(ACCOUNTANT)))).toBe(true);
    expect(canViewAccounting(state({ is_staff: true, permissions: [] }))).toBe(
      true,
    );
  });

  it('hides accounting from roles without the permission', () => {
    // An existing owner clone that nobody has granted the permission to.
    expect(canViewAccounting(state(userWith(OWNER_CLONE)))).toBe(false);
    expect(canViewAccounting(state(userWith(READER_CLONE)))).toBe(false);
    expect(canViewAccounting(state(userWith(ACCOUNTANT, 'other')))).toBe(false);
  });

  it('ignores the permission held on the service provider', () => {
    const user = {
      is_staff: false,
      permissions: [
        {
          scope_type: 'service_provider',
          scope_uuid: 'provider_uuid',
          customer_uuid: 'acme',
          role_name: PROVIDER_ROLE,
        },
      ],
    };
    expect(canViewAccounting(state(user))).toBe(false);
  });
});

describe('isStaffOrSupportOrImpersonating', () => {
  const state = (user) => ({ workspace: { user } }) as RootState;
  const regularUser = { is_staff: false, is_support: false, uuid: 'u' };

  beforeEach(() => {
    vi.spyOn(ImpersonationStorage, 'get').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is true for staff and support', () => {
    expect(
      isStaffOrSupportOrImpersonating(
        state({ ...regularUser, is_staff: true }),
      ),
    ).toBe(true);
    expect(
      isStaffOrSupportOrImpersonating(
        state({ ...regularUser, is_support: true }),
      ),
    ).toBe(true);
  });

  it('is false for a regular user', () => {
    expect(isStaffOrSupportOrImpersonating(state(regularUser))).toBe(false);
  });

  it('is true while staff impersonates a regular user', () => {
    vi.mocked(ImpersonationStorage.get).mockReturnValue('impersonated-uuid');
    expect(isStaffOrSupportOrImpersonating(state(regularUser))).toBe(true);
  });
});

describe('checkCanManageProject', () => {
  const ADMIN_CLONE = 'PROJECT.acme.ADMIN';
  const MANAGER_CLONE = 'PROJECT.acme.MANAGER';
  const OWNER_CLONE = 'CUSTOMER.acme.OWNER';
  const MEMBER_CLONE = 'PROJECT.acme.MEMBER';
  let originalRoles;

  beforeEach(() => {
    originalRoles = ENV.roles;
    ENV.roles = [
      ...originalRoles,
      {
        name: ADMIN_CLONE,
        template_name: RoleEnum.PROJECT_ADMIN,
        permissions: [],
      },
      {
        name: MANAGER_CLONE,
        template_name: RoleEnum.PROJECT_MANAGER,
        permissions: [],
      },
      {
        name: OWNER_CLONE,
        template_name: RoleEnum.CUSTOMER_OWNER,
        permissions: [],
      },
      {
        name: MEMBER_CLONE,
        template_name: RoleEnum.PROJECT_MEMBER,
        permissions: [],
      },
    ] as any;
  });

  afterEach(() => {
    ENV.roles = originalRoles;
  });

  const project = { uuid: 'project-uuid', customerUuid: 'acme' };
  const userWith = (
    scope_type: string,
    scope_uuid: string,
    role_name: string,
  ) =>
    ({
      is_staff: false,
      is_support: false,
      permissions: [{ scope_type, scope_uuid, role_name }],
    }) as any;

  it.each([
    ['staff', { is_staff: true, permissions: [] }],
    ['an owner', userWith('customer', 'acme', RoleEnum.CUSTOMER_OWNER)],
    ['a clone of the owner', userWith('customer', 'acme', OWNER_CLONE)],
    ['the admin', userWith('project', 'project-uuid', RoleEnum.PROJECT_ADMIN)],
    ['a clone of the admin', userWith('project', 'project-uuid', ADMIN_CLONE)],
    [
      'the manager',
      userWith('project', 'project-uuid', RoleEnum.PROJECT_MANAGER),
    ],
    [
      'a clone of the manager',
      userWith('project', 'project-uuid', MANAGER_CLONE),
    ],
  ])('lets %s manage the project', (_, user) => {
    expect(checkCanManageProject(user as any, project)).toBe(true);
  });

  it.each([
    ['nobody signed in', undefined],
    ['a member', userWith('project', 'project-uuid', RoleEnum.PROJECT_MEMBER)],
    [
      'a clone of the member',
      userWith('project', 'project-uuid', MEMBER_CLONE),
    ],
    [
      'customer support',
      userWith('customer', 'acme', RoleEnum.CUSTOMER_SUPPORT),
    ],
    ['global support', { is_staff: false, is_support: true, permissions: [] }],
    [
      'the admin of another project',
      userWith('project', 'other', RoleEnum.PROJECT_ADMIN),
    ],
    [
      'an owner of another organization',
      userWith('customer', 'other', RoleEnum.CUSTOMER_OWNER),
    ],
    // A role named like a project's, granted on an organization of that name.
    [
      'an admin role on a customer',
      userWith('customer', 'project-uuid', RoleEnum.PROJECT_ADMIN),
    ],
  ])('does not let %s manage the project', (_, user) => {
    expect(checkCanManageProject(user as any, project)).toBe(false);
  });
});
