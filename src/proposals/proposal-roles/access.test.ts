import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';

import {
  changesAnyHolder,
  evaluatorAccess,
  moveLeadRefusal,
  revokeHolderRefusal,
} from './access';

const proposal = {
  uuid: 'proposal-uuid',
  state: 'in_review',
  call_uuid: 'call-uuid',
  call_managing_organisation_uuid: 'org-uuid',
  created_by_uuid: 'author-uuid',
} as any;

const onCall = (role_name: string) => ({
  role_name,
  scope_type: 'call',
  scope_uuid: 'call-uuid',
});

const onProposal = (role_name: string) => ({
  role_name,
  scope_type: 'proposal',
  scope_uuid: 'proposal-uuid',
});

const user = (uuid: string, permissions: any[] = []) =>
  ({ uuid, is_staff: false, permissions }) as any;

const manager = user('manager-uuid', [onCall('CALL.MANAGER')]);
const panelMember = user('panel-uuid', [onCall('CALL.PANEL_MEMBER')]);

const assignmentStep = {
  kind: 'assignment',
  completer: 'panel_member',
  completer_proposal_role_uuid: null,
} as any;

const reportStep = {
  kind: 'assessment',
  completer: 'proposal_role',
  completer_proposal_role_uuid: 'rapporteur',
} as any;

const access = (
  viewer: any,
  activeStep: any = undefined,
  heldRoles: any[] = [],
) => evaluatorAccess({ user: viewer, proposal, activeStep, heldRoles });

describe('evaluatorAccess', () => {
  beforeEach(() => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'CALL.MANAGER',
        permissions: [PermissionEnum.UPDATE_CALL],
      },
      { name: 'CALL.PANEL_MEMBER', permissions: [] },
      { name: 'PROPOSAL.MEMBER', permissions: [] },
    ] as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lets only the lead complete a step its lead alone contributes to', () => {
    const leadOnlyReport = {
      ...reportStep,
      contributors_lead_only: true,
      contributor_proposal_role_uuid: 'rapporteur',
    };
    expect(
      access(panelMember, leadOnlyReport, [
        { role_uuid: 'rapporteur', is_lead: false },
      ]).completesActiveStep,
    ).toBe(false);
    expect(
      access(panelMember, leadOnlyReport, [
        { role_uuid: 'rapporteur', is_lead: true },
      ]).completesActiveStep,
    ).toBe(true);
    expect(
      access(panelMember, reportStep, [
        { role_uuid: 'rapporteur', is_lead: false },
      ]).completesActiveStep,
    ).toBe(true);
  });

  it('lets those overseeing the call manage and see evaluators', () => {
    expect(access(manager)).toMatchObject({
      canManageEvaluators: true,
      canViewEvaluators: true,
    });
  });

  it('keeps a call manager who wrote the proposal away from its evaluators', () => {
    const author = user('author-uuid', [onCall('CALL.MANAGER')]);
    expect(access(author, assignmentStep)).toEqual({
      canManageEvaluators: false,
      canViewEvaluators: false,
      completesActiveStep: false,
    });
  });

  it('keeps every member of the applicant team away, not only the author', () => {
    const member = user('member-uuid', [
      onCall('CALL.MANAGER'),
      onProposal('PROPOSAL.MEMBER'),
    ]);
    expect(access(member, reportStep, [{ role_uuid: 'rapporteur' }])).toEqual({
      canManageEvaluators: false,
      canViewEvaluators: false,
      completesActiveStep: false,
    });
  });

  it('lets the completer of a running assignment step manage evaluators and complete it', () => {
    expect(access(panelMember, assignmentStep)).toEqual({
      canManageEvaluators: true,
      canViewEvaluators: true,
      completesActiveStep: true,
    });
    // Outside the assignment step a panel member picks nobody.
    expect(
      access(panelMember, { ...assignmentStep, kind: 'assessment' }),
    ).toMatchObject({ canManageEvaluators: false, canViewEvaluators: false });
  });

  it('lets a holder see evaluators and complete the step their role completes', () => {
    const holder = user('holder-uuid');
    expect(access(holder, reportStep, [{ role_uuid: 'rapporteur' }])).toEqual({
      canManageEvaluators: false,
      canViewEvaluators: true,
      completesActiveStep: true,
    });
    expect(access(holder, reportStep, [{ role_uuid: 'other' }])).toEqual({
      canManageEvaluators: false,
      canViewEvaluators: true,
      completesActiveStep: false,
    });
  });

  it('gives a bystander nothing', () => {
    expect(access(user('someone'), assignmentStep)).toEqual({
      canManageEvaluators: false,
      canViewEvaluators: false,
      completesActiveStep: false,
    });
  });
});

describe('changesAnyHolder', () => {
  beforeEach(() => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      { name: 'CALL.MANAGER', permissions: [PermissionEnum.UPDATE_CALL] },
      { name: 'CALL.PANEL_MEMBER', permissions: [] },
    ] as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is for staff and those overseeing the call, not a peer', () => {
    expect(changesAnyHolder({ ...panelMember, is_staff: true }, proposal)).toBe(
      true,
    );
    expect(changesAnyHolder(manager, proposal)).toBe(true);
    expect(changesAnyHolder(panelMember, proposal)).toBe(false);
    expect(changesAnyHolder(undefined, proposal)).toBe(false);
  });

  it('is not for a call manager on the applicant team', () => {
    const author = user('author-uuid', [onCall('CALL.MANAGER')]);
    expect(changesAnyHolder(author, proposal)).toBe(false);
  });
});

describe('peer rules on holders', () => {
  const alice = { uuid: 'a', user_uuid: 'alice', is_lead: true };
  const bob = { uuid: 'b', user_uuid: 'bob', is_lead: false };

  it('lets a peer make someone the lead only of a role without one', () => {
    expect(
      moveLeadRefusal({
        changesAny: false,
        userUuid: 'bob',
        holders: [{ ...alice, is_lead: false }, bob],
        to: bob,
      }),
    ).toBeUndefined();
    expect(
      moveLeadRefusal({
        changesAny: false,
        userUuid: 'bob',
        holders: [alice, bob],
        to: bob,
      }),
    ).toMatch(/only its lead hands it over/);
  });

  it('lets the lead hand the lead over', () => {
    expect(
      moveLeadRefusal({
        changesAny: false,
        userUuid: 'alice',
        holders: [alice, bob],
        to: bob,
      }),
    ).toBeUndefined();
  });

  it('lets those overseeing the call move any lead', () => {
    expect(
      moveLeadRefusal({
        changesAny: true,
        userUuid: 'manager',
        holders: [alice, bob],
        to: bob,
      }),
    ).toBeUndefined();
  });

  it('lets a peer revoke only their own role', () => {
    expect(
      revokeHolderRefusal({ changesAny: false, userUuid: 'bob', holder: bob }),
    ).toBeUndefined();
    expect(
      revokeHolderRefusal({
        changesAny: false,
        userUuid: 'bob',
        holder: alice,
      }),
    ).toMatch(/Only the call manager/);
    expect(
      revokeHolderRefusal({ changesAny: true, userUuid: 'bob', holder: alice }),
    ).toBeUndefined();
  });
});
