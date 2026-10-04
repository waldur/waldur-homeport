import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';

import {
  canChangeProposalRole,
  canEditProposal,
  canInviteToProposal,
  canManageProposalTeam,
  canRevokeProposalRow,
  canSubmitProposal,
  getGrantableProposalRoleNames,
  getRemoveDisabledReason,
  isOnProposalTeam,
} from './teamRules';

const ROLES = [
  {
    name: RoleEnum.PROPOSAL_MANAGER,
    content_type: 'proposal',
    is_active: true,
    permissions: [
      PermissionEnum.MANAGE_PROPOSAL,
      PermissionEnum.UPDATE_PROPOSAL,
    ],
  },
  {
    name: RoleEnum.PROPOSAL_ADMIN,
    content_type: 'proposal',
    is_active: true,
    permissions: [PermissionEnum.UPDATE_PROPOSAL],
  },
  {
    name: RoleEnum.PROPOSAL_MEMBER,
    content_type: 'proposal',
    is_active: true,
    permissions: [],
  },
  {
    // A custom role carrying PROPOSAL.MANAGE but not PROPOSAL.UPDATE, such
    // as one that predates the split.
    name: 'PROPOSAL.LEGACY_MANAGER',
    content_type: 'proposal',
    is_active: false,
    permissions: [PermissionEnum.MANAGE_PROPOSAL],
  },
  {
    name: RoleEnum.CALL_MANAGER,
    content_type: 'call',
    is_active: true,
    permissions: [PermissionEnum.UPDATE_CALL],
  },
];

const proposal = (state = 'draft') =>
  ({
    uuid: 'proposal-1',
    state,
    call_uuid: 'call-1',
    call_managing_organisation_uuid: 'organizer-1',
    created_by_uuid: 'creator',
  }) as any;

const withRole = (uuid: string, role_name: string, scope_type = 'proposal') =>
  ({
    uuid,
    is_staff: false,
    permissions: [
      {
        role_name,
        scope_type,
        scope_uuid: scope_type === 'proposal' ? 'proposal-1' : 'call-1',
      },
    ],
  }) as any;

const manager = withRole('manager', RoleEnum.PROPOSAL_MANAGER);
const admin = withRole('admin', RoleEnum.PROPOSAL_ADMIN);
const member = withRole('member', RoleEnum.PROPOSAL_MEMBER);
const callManager = withRole('call-manager', RoleEnum.CALL_MANAGER, 'call');
const staff = { uuid: 'staff', is_staff: true, permissions: [] } as any;

describe('proposal team rules', () => {
  beforeEach(() => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue(ROLES as any);
  });
  afterEach(() => vi.restoreAllMocks());

  describe('editing and submitting', () => {
    it('lets managers and administrators edit, members not', () => {
      expect(canEditProposal(manager, proposal())).toBe(true);
      expect(canEditProposal(admin, proposal())).toBe(true);
      expect(canEditProposal(member, proposal())).toBe(false);
    });

    it('lets the manager submit but not the administrator', () => {
      expect(canSubmitProposal(manager, proposal())).toBe(true);
      expect(canSubmitProposal(admin, proposal())).toBe(false);
      expect(canSubmitProposal(member, proposal())).toBe(false);
    });

    it('needs PROPOSAL.UPDATE to edit, and to submit as well', () => {
      const legacy = withRole('legacy', 'PROPOSAL.LEGACY_MANAGER');
      expect(canEditProposal(legacy, proposal())).toBe(false);
      expect(canSubmitProposal(legacy, proposal())).toBe(false);
    });

    it('lets the creator and staff edit and submit', () => {
      const creator = { uuid: 'creator', permissions: [] } as any;
      expect(canEditProposal(creator, proposal())).toBe(true);
      expect(canSubmitProposal(creator, proposal())).toBe(true);
      expect(canSubmitProposal(staff, proposal())).toBe(true);
    });
  });

  describe('managing the team', () => {
    it('is for managers, call managers and staff, not administrators', () => {
      expect(canManageProposalTeam(manager, proposal())).toBe(true);
      expect(canManageProposalTeam(callManager, proposal())).toBe(true);
      expect(canManageProposalTeam(staff, proposal())).toBe(true);
      expect(canManageProposalTeam(admin, proposal())).toBe(false);
      expect(canManageProposalTeam(member, proposal())).toBe(false);
    });
  });

  describe('the last proposal manager', () => {
    const managerRow = { role_name: RoleEnum.PROPOSAL_MANAGER };

    it('cannot be removed', () => {
      expect(getRemoveDisabledReason(managerRow, 1)).toBe(
        'A proposal must keep at least one proposal manager. Grant the role to someone else first.',
      );
    });

    it('can be removed when another manager remains', () => {
      expect(getRemoveDisabledReason(managerRow, 2)).toBeUndefined();
    });

    it('leaves other roles and an unknown count alone', () => {
      expect(
        getRemoveDisabledReason({ role_name: RoleEnum.PROPOSAL_ADMIN }, 1),
      ).toBeUndefined();
      expect(getRemoveDisabledReason(managerRow, undefined)).toBeUndefined();
    });
  });

  describe('changing the team of a draft', () => {
    it('lets a proposal manager grant every proposal role', () => {
      expect(getGrantableProposalRoleNames(manager, proposal())).toEqual([
        RoleEnum.PROPOSAL_MANAGER,
        RoleEnum.PROPOSAL_ADMIN,
        RoleEnum.PROPOSAL_MEMBER,
      ]);
    });

    it('lets an administrator or a member grant nothing', () => {
      expect(getGrantableProposalRoleNames(admin, proposal())).toEqual([]);
      expect(getGrantableProposalRoleNames(member, proposal())).toEqual([]);
    });

    it('lets a call manager grant every proposal role', () => {
      expect(getGrantableProposalRoleNames(callManager, proposal())).toEqual([
        RoleEnum.PROPOSAL_MANAGER,
        RoleEnum.PROPOSAL_ADMIN,
        RoleEnum.PROPOSAL_MEMBER,
      ]);
    });

    it('lets a manager revoke any role of others but not their own', () => {
      const row = (user_uuid: string, role_name: string) => ({
        user_uuid,
        role_name,
      });
      expect(
        canRevokeProposalRow(
          manager,
          proposal(),
          row('other', RoleEnum.PROPOSAL_ADMIN),
        ),
      ).toBe(true);
      expect(
        canRevokeProposalRow(
          manager,
          proposal(),
          row('other', RoleEnum.PROPOSAL_MEMBER),
        ),
      ).toBe(true);
      expect(
        canRevokeProposalRow(
          manager,
          proposal(),
          row('manager', RoleEnum.PROPOSAL_MANAGER),
        ),
      ).toBe(false);
      expect(
        canRevokeProposalRow(
          admin,
          proposal(),
          row('other', RoleEnum.PROPOSAL_MEMBER),
        ),
      ).toBe(false);
    });
  });

  it('lets nobody, staff included, change their own role', () => {
    expect(
      canRevokeProposalRow(staff, proposal(), {
        user_uuid: 'staff',
        role_name: RoleEnum.PROPOSAL_MEMBER,
      }),
    ).toBe(false);
    expect(
      canRevokeProposalRow(staff, proposal(), {
        user_uuid: 'other',
        role_name: RoleEnum.PROPOSAL_MEMBER,
      }),
    ).toBe(true);
  });

  describe('changing the team after submission', () => {
    it('fixes the team for the applicant', () => {
      expect(
        getGrantableProposalRoleNames(manager, proposal('submitted')),
      ).toEqual([]);
      expect(canInviteToProposal(manager, proposal('submitted'))).toBe(false);
    });

    it('lets a call manager still change and invite anyone', () => {
      expect(
        getGrantableProposalRoleNames(callManager, proposal('submitted')),
      ).toEqual([
        RoleEnum.PROPOSAL_MANAGER,
        RoleEnum.PROPOSAL_ADMIN,
        RoleEnum.PROPOSAL_MEMBER,
      ]);
      expect(
        canChangeProposalRole(
          callManager,
          proposal('submitted'),
          RoleEnum.PROPOSAL_MEMBER,
          'revoke',
        ),
      ).toBe(true);
      expect(canInviteToProposal(callManager, proposal('submitted'))).toBe(
        true,
      );
    });

    it('lets staff change any role', () => {
      expect(
        canChangeProposalRole(
          staff,
          proposal('submitted'),
          RoleEnum.PROPOSAL_MEMBER,
          'revoke',
        ),
      ).toBe(true);
      expect(canInviteToProposal(staff, proposal('submitted'))).toBe(true);
    });
  });

  it('counts the creator and role holders as the applicant team', () => {
    expect(isOnProposalTeam(member, proposal())).toBe(true);
    expect(
      isOnProposalTeam({ uuid: 'creator', permissions: [] } as any, proposal()),
    ).toBe(true);
    expect(isOnProposalTeam(callManager, proposal())).toBe(false);
  });
});
