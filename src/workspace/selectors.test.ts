import { describe, it, expect } from 'vitest';

import { RoleEnum } from '@/permissions/enums';
import { type RootState } from '@/store/reducers';

import {
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
