import { describe, expect, it } from 'vitest';
import { NestedRound } from 'waldur-js-client';

import { RoleEnum } from '@/permissions/enums';
import { Call } from '@/proposals/types';

import {
  checkIsCallManager,
  getCallStatus,
  getNonCanceledProposalStates,
  getReviewStateBadgeVariant,
  getRoundsWithStatus,
  getRoundStatus,
  isReviewInFinalState,
} from './utils';

// This suite deliberately covers only the helpers that carry real logic
// (branching, filtering, permission matching). The plain label/state
// formatters (formatCallState, formatProposalState, …) are 1:1 lookups that
// just mirror their source tables, so they are intentionally not tested here.

describe('getNonCanceledProposalStates', () => {
  it('excludes only the canceled state, preserving order', () => {
    const states = getNonCanceledProposalStates();
    expect(states).not.toContain('canceled');
    expect(states).toEqual([
      'draft',
      'submitted',
      'in_review',
      'accepted',
      'rejected',
    ]);
  });
});

describe('getReviewStateBadgeVariant', () => {
  it('maps in-progress states to the warning variant', () => {
    expect(getReviewStateBadgeVariant('in_review')).toBe('warning');
    expect(getReviewStateBadgeVariant('submitted')).toBe('warning');
  });

  it('maps rejected to danger', () => {
    expect(getReviewStateBadgeVariant('rejected')).toBe('danger');
  });

  it('falls through to the neutral variant for anything else', () => {
    expect(getReviewStateBadgeVariant('other' as any)).toBe('secondary');
  });
});

describe('isReviewInFinalState', () => {
  it('treats only in_review as non-final', () => {
    expect(isReviewInFinalState('in_review')).toBe(false);
    expect(isReviewInFinalState('submitted')).toBe(true);
    expect(isReviewInFinalState('rejected')).toBe(true);
  });
});

describe('getRoundStatus', () => {
  it('returns null for a missing round', () => {
    expect(getRoundStatus(undefined as any)).toBeNull();
    expect(getRoundStatus(null as any)).toBeNull();
  });

  it('maps each round status to a label and color', () => {
    expect(getRoundStatus({ status: 'scheduled' } as NestedRound)).toEqual({
      label: 'Scheduled',
      value: 'scheduled',
      color: 'secondary',
    });
    expect(getRoundStatus({ status: 'open' } as NestedRound)).toEqual({
      label: 'Open',
      value: 'open',
      color: 'success',
    });
    expect(getRoundStatus({ status: 'ended' } as NestedRound)).toEqual({
      label: 'Ended',
      value: 'ended',
      color: 'danger',
    });
  });

  it('returns undefined for an unrecognised status', () => {
    expect(getRoundStatus({ status: 'paused' } as any)).toBeUndefined();
  });
});

describe('getRoundsWithStatus', () => {
  it('replaces each round status with its resolved descriptor', () => {
    const rounds = [
      { uuid: 'r1', status: 'open' },
      { uuid: 'r2', status: 'ended' },
    ] as unknown as NestedRound[];

    const result = getRoundsWithStatus(rounds);

    expect(result[0].uuid).toBe('r1');
    expect(result[0].status).toEqual({
      label: 'Open',
      value: 'open',
      color: 'success',
    });
    expect(result[1].status).toEqual({
      label: 'Ended',
      value: 'ended',
      color: 'danger',
    });
  });
});

describe('getCallStatus', () => {
  it('maps each call state to a label and color', () => {
    expect(getCallStatus({ state: 'active' } as Call)).toEqual({
      label: 'Active',
      color: 'success',
    });
    expect(getCallStatus({ state: 'draft' } as Call)).toEqual({
      label: 'Draft',
      color: 'danger',
    });
    expect(getCallStatus({ state: 'archived' } as Call)).toEqual({
      label: 'Archived',
      color: 'gray',
    });
  });

  it('falls back to the raw state with a neutral color when unknown', () => {
    expect(getCallStatus({ state: 'frozen' } as any)).toEqual({
      label: 'frozen',
      color: 'secondary',
    });
  });
});

describe('checkIsCallManager', () => {
  const call = { uuid: 'call-1' } as Call;

  const managerPermission = {
    scope_type: 'call',
    scope_uuid: 'call-1',
    role_name: RoleEnum.CALL_MANAGER,
  };

  it('returns true when the user holds the call-manager role for the call', () => {
    const user = { permissions: [managerPermission] } as any;
    expect(checkIsCallManager(call, user)).toBe(true);
  });

  it('returns false when the matching permission is for a different call', () => {
    const user = {
      permissions: [{ ...managerPermission, scope_uuid: 'other-call' }],
    } as any;
    expect(checkIsCallManager(call, user)).toBe(false);
  });

  it('returns false when the role is not call manager', () => {
    const user = {
      permissions: [{ ...managerPermission, role_name: 'CALL.REVIEWER' }],
    } as any;
    expect(checkIsCallManager(call, user)).toBe(false);
  });

  it('returns false when the scope type is not a call', () => {
    const user = {
      permissions: [{ ...managerPermission, scope_type: 'customer' }],
    } as any;
    expect(checkIsCallManager(call, user)).toBe(false);
  });

  it('returns false for a user without permissions', () => {
    expect(checkIsCallManager(call, {} as any)).toBe(false);
    expect(checkIsCallManager(call, undefined as any)).toBe(false);
  });
});
