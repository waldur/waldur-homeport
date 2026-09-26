import { describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';

import {
  canAccessCallManagement,
  canManageCallReviews,
  canUpdateCall,
} from './utils';

/**
 * Mirrors the backend's CALL_PERMISSION_SOURCES = ["*", "manager"]: the
 * permission counts when held on the call itself or on its managing
 * organisation. The call organizer only ever satisfies the second.
 */
const call: any = {
  uuid: 'call-uuid',
  manager_uuid: 'managing-org-uuid',
  customer_uuid: 'customer-uuid',
};

const onCall = (role_name: string) => ({
  role_name,
  scope_type: 'call',
  scope_uuid: 'call-uuid',
  customer_uuid: 'customer-uuid',
});

const onManagingOrg = (role_name: string) => ({
  role_name,
  scope_type: 'call_organizer',
  scope_uuid: 'managing-org-uuid',
  customer_uuid: 'customer-uuid',
});

const withRoles = (fn: () => void) => {
  vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
    { name: 'CALL.MANAGER', permissions: [PermissionEnum.UPDATE_CALL] },
    {
      name: 'CUSTOMER.CALL_ORGANIZER',
      permissions: [PermissionEnum.UPDATE_CALL],
    },
    { name: 'CALL.PANEL_MEMBER', permissions: [] },
    { name: 'CALL.REVIEWER', permissions: [] },
    // Owners manage call teams, but hold no CALL.UPDATE.
    {
      name: 'CUSTOMER.OWNER',
      permissions: [PermissionEnum.UPDATE_CALL_PERMISSION],
    },
  ] as any);
  try {
    fn();
  } finally {
    vi.restoreAllMocks();
  }
};

describe('canUpdateCall', () => {
  it('allows a call manager (role on the call)', () => {
    withRoles(() =>
      expect(
        canUpdateCall({ permissions: [onCall('CALL.MANAGER')] } as any, call),
      ).toBe(true),
    );
  });

  it('allows a call organizer (role on the managing organisation)', () => {
    withRoles(() =>
      expect(
        canUpdateCall(
          { permissions: [onManagingOrg('CUSTOMER.CALL_ORGANIZER')] } as any,
          call,
        ),
      ).toBe(true),
    );
  });

  it('allows staff', () => {
    withRoles(() =>
      expect(
        canUpdateCall({ is_staff: true, permissions: [] } as any, call),
      ).toBe(true),
    );
  });

  it('denies reviewers and panel members', () => {
    withRoles(() => {
      expect(
        canUpdateCall({ permissions: [onCall('CALL.REVIEWER')] } as any, call),
      ).toBe(false);
      expect(
        canUpdateCall(
          { permissions: [onCall('CALL.PANEL_MEMBER')] } as any,
          call,
        ),
      ).toBe(false);
    });
  });

  // Owners hold the call team-management permissions but not CALL.UPDATE, so
  // the backend refuses their writes; see ProtectedCallViewSet.
  it('denies an organization owner', () => {
    withRoles(() =>
      expect(
        canUpdateCall({ permissions: [onCall('CUSTOMER.OWNER')] } as any, call),
      ).toBe(false),
    );
  });

  // Guards the checkScope fix: a second, non-granting role must not mask the
  // granting one, whichever order the server lists them in.
  it('allows a manager who is also a panel member, in either order', () => {
    withRoles(() => {
      expect(
        canUpdateCall(
          {
            permissions: [onCall('CALL.PANEL_MEMBER'), onCall('CALL.MANAGER')],
          } as any,
          call,
        ),
      ).toBe(true);
      expect(
        canUpdateCall(
          {
            permissions: [onCall('CALL.MANAGER'), onCall('CALL.PANEL_MEMBER')],
          } as any,
          call,
        ),
      ).toBe(true);
    });
  });
});

const ownerOf = (customerUuid: string) => ({
  role_name: 'CUSTOMER.OWNER',
  scope_type: 'customer',
  scope_uuid: customerUuid,
  customer_uuid: customerUuid,
});

describe('canAccessCallManagement', () => {
  // Broader than canUpdateCall on purpose: the owner holds no CALL.UPDATE but
  // does hold the team-management permissions exercised from the Team tab.
  it('admits an organization owner even though they cannot edit', () => {
    withRoles(() => {
      const owner: any = { permissions: [ownerOf('customer-uuid')] };
      expect(canUpdateCall(owner, call)).toBe(false);
      expect(canAccessCallManagement(owner, call)).toBe(true);
    });
  });

  it('admits call managers, organizers and staff', () => {
    withRoles(() => {
      expect(
        canAccessCallManagement(
          { permissions: [onCall('CALL.MANAGER')] } as any,
          call,
        ),
      ).toBe(true);
      expect(
        canAccessCallManagement(
          { permissions: [onManagingOrg('CUSTOMER.CALL_ORGANIZER')] } as any,
          call,
        ),
      ).toBe(true);
      expect(
        canAccessCallManagement(
          { is_staff: true, permissions: [] } as any,
          call,
        ),
      ).toBe(true);
    });
  });

  // The reason the page renders a 403 instead of a read-only form.
  it('shuts out reviewers and panel members', () => {
    withRoles(() => {
      expect(
        canAccessCallManagement(
          { permissions: [onCall('CALL.REVIEWER')] } as any,
          call,
        ),
      ).toBe(false);
      expect(
        canAccessCallManagement(
          { permissions: [onCall('CALL.PANEL_MEMBER')] } as any,
          call,
        ),
      ).toBe(false);
    });
  });

  it('does not admit an owner of a different organization', () => {
    withRoles(() =>
      expect(
        canAccessCallManagement(
          { permissions: [ownerOf('other-customer')] } as any,
          call,
        ),
      ).toBe(false),
    );
  });
});

describe('support users', () => {
  const support: any = { is_support: true, permissions: [] };

  // The backend lets support read every call but write none, so the pages
  // open for them and every control on them stays locked.
  it('are admitted to the management pages but may not edit', () => {
    withRoles(() => {
      expect(canAccessCallManagement(support, call)).toBe(true);
      expect(canUpdateCall(support, call)).toBe(false);
      expect(canManageCallReviews(support, call)).toBe(false);
    });
  });
});

describe('canManageCallReviews', () => {
  const withReviewRoles = (fn: () => void) => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'CALL.MANAGER',
        permissions: [PermissionEnum.MANAGE_PROPOSAL_REVIEW],
      },
      {
        name: 'CUSTOMER.CALL_ORGANIZER',
        permissions: [PermissionEnum.MANAGE_PROPOSAL_REVIEW],
      },
      { name: 'CALL.PANEL_MEMBER', permissions: [] },
      { name: 'CUSTOMER.OWNER', permissions: [] },
    ] as any);
    try {
      fn();
    } finally {
      vi.restoreAllMocks();
    }
  };

  it('allows call managers, organizers and staff', () => {
    withReviewRoles(() => {
      expect(
        canManageCallReviews(
          { permissions: [onCall('CALL.MANAGER')] } as any,
          call,
        ),
      ).toBe(true);
      expect(
        canManageCallReviews(
          { permissions: [onManagingOrg('CUSTOMER.CALL_ORGANIZER')] } as any,
          call,
        ),
      ).toBe(true);
      expect(
        canManageCallReviews({ is_staff: true, permissions: [] } as any, call),
      ).toBe(true);
    });
  });

  it('denies panel members and organization owners', () => {
    withReviewRoles(() => {
      expect(
        canManageCallReviews(
          { permissions: [onCall('CALL.PANEL_MEMBER')] } as any,
          call,
        ),
      ).toBe(false);
      expect(
        canManageCallReviews(
          { permissions: [ownerOf('customer-uuid')] } as any,
          call,
        ),
      ).toBe(false);
    });
  });
});
