import { describe, expect, it } from 'vitest';

import { reviewerSuggestionAccess } from './access';

const collecting: any = {
  status: 'active',
  collects_reviewer_suggestions: true,
  completer: 'proposal_role',
  completer_proposal_role_uuid: 'chair',
  contributor_proposal_role_uuid: 'rapporteur',
  can_suggest_reviewers: true,
};

const access = (overrides: Record<string, any> = {}) =>
  reviewerSuggestionAccess({
    steps: [collecting],
    activeStep: collecting,
    heldRoles: [],
    onApplicantTeam: false,
    canInvite: false,
    ...overrides,
  });

describe('reviewerSuggestionAccess', () => {
  it('lets only the holders of the contributor role suggest', () => {
    expect(access().canSuggest).toBe(false);
    expect(access({ heldRoles: [{ role_uuid: 'chair' }] }).canSuggest).toBe(
      false,
    );
    expect(
      access({ heldRoles: [{ role_uuid: 'rapporteur' }] }).canSuggest,
    ).toBe(true);
  });

  it('does not suggest once the backend takes no more suggestions', () => {
    // The holder's contribution is submitted, say.
    expect(
      access({
        heldRoles: [{ role_uuid: 'rapporteur' }],
        activeStep: { ...collecting, can_suggest_reviewers: false },
      }).canSuggest,
    ).toBe(false);
  });

  it('does not suggest once no collecting step is active', () => {
    const heldRoles = [{ role_uuid: 'rapporteur' }];
    expect(access({ heldRoles, activeStep: undefined }).canSuggest).toBe(false);
    expect(
      access({
        heldRoles,
        activeStep: { ...collecting, collects_reviewer_suggestions: false },
      }).canSuggest,
    ).toBe(false);
  });

  it('lets the completer role read every suggestion of any collecting step', () => {
    const heldRoles = [{ role_uuid: 'chair' }];
    expect(access({ heldRoles }).readsAll).toBe(true);
    // Read also once the step is over, as the backend allows.
    const completed = { ...collecting, status: 'completed' };
    expect(
      access({ heldRoles, steps: [completed], activeStep: undefined }).readsAll,
    ).toBe(true);
    expect(
      access({
        heldRoles,
        steps: [{ ...collecting, status: 'skipped' }],
      }).readsAll,
    ).toBe(false);
    // A contributor who does not complete the step does not.
    expect(access({ heldRoles: [{ role_uuid: 'rapporteur' }] }).readsAll).toBe(
      false,
    );
  });

  it('lets those who invite read, and nobody on the applicant team', () => {
    expect(access({ canInvite: true }).readsAll).toBe(true);
    expect(
      access({
        canInvite: true,
        onApplicantTeam: true,
        heldRoles: [{ role_uuid: 'rapporteur' }, { role_uuid: 'chair' }],
      }),
    ).toEqual({ canSuggest: false, readsAll: false });
  });
});
