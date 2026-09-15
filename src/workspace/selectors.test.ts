import { describe, it, expect } from 'vitest';

import { RoleEnum } from '@/permissions/enums';
import { type RootState } from '@/store/reducers';

import {
  checkHasServiceProviderRole,
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
