import { describe, expect, it } from 'vitest';

import {
  coiStateForOverseers,
  coiStateLabel,
  emptyPoolMessage,
  eligibilityLabel,
  holdersLabel,
  isRoleUsed,
  rolesUsedBySteps,
} from './constants';

describe('evaluator role labels', () => {
  it('names who may hold a role', () => {
    expect(eligibilityLabel('call_role:panel_member')).toBe(
      'Panel members of the call',
    );
    expect(eligibilityLabel('any_user')).toBe('Any user');
    expect(eligibilityLabel('panel:chair')).toBe(
      "The chair of the proposal's panel",
    );
    expect(eligibilityLabel('panel:member')).toBe(
      "Members of the proposal's panel",
    );
  });

  it('counts holders', () => {
    expect(holdersLabel({ min_holders: 1, max_holders: 1 })).toBe('1');
    expect(holdersLabel({ min_holders: 1, max_holders: 3 })).toBe('1–3');
    expect(holdersLabel({ min_holders: 2, max_holders: null })).toBe(
      'At least 2',
    );
  });

  it('describes the conflict-of-interest state', () => {
    expect(
      coiStateLabel({
        coi_confirmation_required: true,
        coi_confirmed_at: null,
      }),
    ).toBe('Awaiting confirmation');
    expect(
      coiStateLabel({
        coi_confirmation_required: true,
        coi_confirmed_at: '2026-10-07',
        coi_declaration_only: true,
      }),
    ).toBe('Confirmed by declaration');
    expect(coiStateLabel({ coi_declaration_only: false })).toBe(
      'No conflict on record',
    );
    expect(
      coiStateLabel({
        coi_confirmation_required: true,
        coi_confirmed_at: '2026-10-07',
        has_standing_conflict: true,
      }),
    ).toBe('Conflict recorded: no access');
  });

  it('tells those overseeing a holder yet to confirm from one to replace', () => {
    expect(
      coiStateForOverseers({
        coi_confirmation_required: true,
        coi_confirmed_at: null,
      }),
    ).toBe('Has not yet confirmed having no conflict of interest');
    expect(
      coiStateForOverseers({
        coi_confirmation_required: true,
        coi_confirmed_at: '2026-10-07',
        has_standing_conflict: true,
      }),
    ).toBe('Conflict of interest recorded: replace the holder');
    expect(coiStateForOverseers({ coi_declaration_only: false })).toBe(
      'No conflict on record',
    );
  });

  it('says which call role an empty list of candidates lacks', () => {
    expect(emptyPoolMessage('call_role:panel_member')).toBe(
      'The call has no panel members — add them in the Team tab.',
    );
    expect(emptyPoolMessage('any_user')).toBeUndefined();
  });
});

describe('rolesUsedBySteps', () => {
  const rapporteur = { uuid: 'aaaa1111-0000-0000-0000-000000000000' };
  const chair = { uuid: 'bbbb2222000000000000000000000000' };
  const orphan = { uuid: 'cccc3333000000000000000000000000' };

  it('counts the roles enabled steps assign, take contributions from or are completed by', () => {
    const used = rolesUsedBySteps([
      { is_enabled: true, assigns_roles: ['aaaa1111000000000000000000000000'] },
      {
        is_enabled: true,
        contributor_proposal_role_uuid: null,
        completer_proposal_role: chair.uuid,
      },
      { is_enabled: false, contributor_proposal_role_uuid: orphan.uuid },
    ]);
    expect(isRoleUsed(used, rapporteur)).toBe(true);
    expect(isRoleUsed(used, chair)).toBe(true);
    // A disabled step needs nobody.
    expect(isRoleUsed(used, orphan)).toBe(false);
  });

  it('finds no role used by a call without steps naming one', () => {
    expect(isRoleUsed(rolesUsedBySteps([{ is_enabled: true }]), orphan)).toBe(
      false,
    );
  });
});
