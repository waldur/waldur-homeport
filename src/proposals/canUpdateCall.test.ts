import { describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';

import {
  canAccessCallManagement,
  canCloseRounds,
  canManageCallReviews,
  canOpenCallEditPage,
  canUpdateCall,
  getRoundMenuAccess,
  isOnCallTeam,
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

describe('isOnCallTeam', () => {
  it.each(['CALL.MANAGER', 'CALL.REVIEWER', 'CALL.PANEL_MEMBER'])(
    'admits a %s of the call',
    (role) => {
      withRoles(() => {
        expect(isOnCallTeam({ permissions: [onCall(role)] } as any, call)).toBe(
          true,
        );
      });
    },
  );

  it('admits the organiser of the managing organisation and staff', () => {
    withRoles(() => {
      expect(
        isOnCallTeam(
          { permissions: [onManagingOrg('CUSTOMER.CALL_ORGANIZER')] } as any,
          call,
        ),
      ).toBe(true);
      expect(
        isOnCallTeam({ is_staff: true, permissions: [] } as any, call),
      ).toBe(true);
    });
  });

  it('leaves out applicants, reviewers of other calls and anonymous visitors', () => {
    withRoles(() => {
      expect(isOnCallTeam({ permissions: [] } as any, call)).toBe(false);
      expect(
        isOnCallTeam(
          {
            permissions: [
              { ...onCall('CALL.REVIEWER'), scope_uuid: 'other-call-uuid' },
            ],
          } as any,
          call,
        ),
      ).toBe(false);
      expect(isOnCallTeam(undefined, call)).toBe(false);
    });
  });
});

describe('canCloseRounds and the round menu', () => {
  const withCloseRoundsRoles = (fn: () => void) => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      { name: 'CALL.UPDATER', permissions: [PermissionEnum.UPDATE_CALL] },
      { name: 'CALL.ROUND_CLOSER', permissions: [PermissionEnum.CLOSE_ROUNDS] },
      {
        name: 'CUSTOMER.CALL_ORGANIZER',
        permissions: [PermissionEnum.UPDATE_CALL, PermissionEnum.CLOSE_ROUNDS],
      },
      // As shipped: CLOSE_ROUNDS on the organization, no CALL.UPDATE.
      {
        name: 'CUSTOMER.OWNER',
        permissions: [
          PermissionEnum.UPDATE_CALL_PERMISSION,
          PermissionEnum.CLOSE_ROUNDS,
        ],
      },
    ] as any);
    try {
      fn();
    } finally {
      vi.restoreAllMocks();
    }
  };
  const closer = { permissions: [onCall('CALL.ROUND_CLOSER')] } as any;
  const updater = { permissions: [onCall('CALL.UPDATER')] } as any;
  const activeCall = { ...call, state: 'active' };

  it('follows CALL.CLOSE_ROUNDS on the call or its managing organisation', () =>
    withCloseRoundsRoles(() => {
      expect(canCloseRounds(closer, activeCall)).toBe(true);
      expect(
        canCloseRounds(
          { permissions: [onManagingOrg('CUSTOMER.CALL_ORGANIZER')] } as any,
          activeCall,
        ),
      ).toBe(true);
      expect(canCloseRounds(updater, activeCall)).toBe(false);
    }));

  it('allows staff', () =>
    withCloseRoundsRoles(() =>
      expect(
        canCloseRounds({ is_staff: true, permissions: [] } as any, activeCall),
      ).toBe(true),
    ));

  // The backend gives support no write on a call.
  it('denies support', () =>
    withCloseRoundsRoles(() =>
      expect(
        canCloseRounds(
          { is_support: true, permissions: [] } as any,
          activeCall,
        ),
      ).toBe(false),
    ));

  // The owner's CLOSE_ROUNDS sits on the customer, which is not among the
  // sources the backend checks: the call and its managing organisation.
  it('denies an organization owner', () =>
    withCloseRoundsRoles(() =>
      expect(
        canCloseRounds(
          { permissions: [ownerOf('customer-uuid')] } as any,
          activeCall,
        ),
      ).toBe(false),
    ));

  it('gives CALL.CLOSE_ROUNDS alone the lifecycle and not the edits', () =>
    withCloseRoundsRoles(() =>
      // Without CALL.UPDATE the call page is read-only (isReadOnly).
      expect(getRoundMenuAccess(closer, activeCall, true)).toEqual({
        canUpdate: false,
        canCloseRounds: true,
      }),
    ));

  it('gives CALL.UPDATE alone the edits and not the lifecycle', () =>
    withCloseRoundsRoles(() =>
      expect(getRoundMenuAccess(updater, activeCall, false)).toEqual({
        canUpdate: true,
        canCloseRounds: false,
      }),
    ));

  it('offers nothing on an archived call', () =>
    withCloseRoundsRoles(() =>
      expect(
        getRoundMenuAccess(closer, { ...call, state: 'archived' }, true),
      ).toBeNull(),
    ));
});

describe('canOpenCallEditPage', () => {
  const withCloserRole = (fn: () => void) => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      { name: 'CALL.ROUND_CLOSER', permissions: [PermissionEnum.CLOSE_ROUNDS] },
      { name: 'CALL.REVIEWER', permissions: [] },
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

  // The rounds are listed on the Edit page, so a round closer without
  // CALL.UPDATE must reach it; the Manage page is not theirs.
  it('admits a role carrying CALL.CLOSE_ROUNDS alone, on the call or its managing organisation', () =>
    withCloserRole(() => {
      for (const permission of [
        onCall('CALL.ROUND_CLOSER'),
        onManagingOrg('CALL.ROUND_CLOSER'),
      ]) {
        const closer = { permissions: [permission] } as any;
        expect(canOpenCallEditPage(closer, call)).toBe(true);
        expect(canAccessCallManagement(closer, call)).toBe(false);
        expect(canUpdateCall(closer, call)).toBe(false);
      }
    }));

  it('admits whoever canAccessCallManagement admits', () =>
    withCloserRole(() => {
      expect(
        canOpenCallEditPage(
          { permissions: [ownerOf('customer-uuid')] } as any,
          call,
        ),
      ).toBe(true);
      expect(
        canOpenCallEditPage({ is_support: true, permissions: [] } as any, call),
      ).toBe(true);
    }));

  it('still keeps reviewers and other organizations out', () =>
    withCloserRole(() => {
      expect(
        canOpenCallEditPage(
          { permissions: [onCall('CALL.REVIEWER')] } as any,
          call,
        ),
      ).toBe(false);
      expect(
        canOpenCallEditPage(
          { permissions: [ownerOf('other-customer-uuid')] } as any,
          call,
        ),
      ).toBe(false);
      expect(
        canOpenCallEditPage(
          {
            permissions: [
              { ...onCall('CALL.ROUND_CLOSER'), scope_uuid: 'other-call-uuid' },
            ],
          } as any,
          call,
        ),
      ).toBe(false);
    }));
});
