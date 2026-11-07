import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { hasOwnProposalView, proposalViewOf } from './proposalView';

describe('proposalViewOf', () => {
  it('names the view each route of the proposal page is', () => {
    expect(proposalViewOf('call-management.proposal-details')).toBe(
      'call_manager',
    );
    expect(proposalViewOf('provider-call-proposal')).toBe('offering_team');
    expect(proposalViewOf('proposal-review')).toBe('reviewer');
    expect(proposalViewOf('proposals.manage-proposal')).toBe('applicant');
  });
});

describe('hasOwnProposalView', () => {
  const proposal = {
    call_uuid: 'call-1',
    call_managing_organisation_uuid: 'org-1',
    offering_team_providers: [],
  } as any;
  const onTeam = {
    ...proposal,
    offering_team_providers: [{ uuid: 'south', name: 'South' }],
  };
  const user = { uuid: 'u', permissions: [] } as any;
  let features: typeof ENV.FEATURES;

  beforeEach(() => {
    features = ENV.FEATURES;
    ENV.FEATURES = {
      marketplace: { show_call_management_functionality: true },
    } as any;
  });
  afterEach(() => {
    ENV.FEATURES = features;
  });

  it('is an offering team’s', () => {
    expect(hasOwnProposalView(user, onTeam)).toBe(true);
  });

  it('is not an evaluator’s, whose work is on the plain page', () => {
    expect(hasOwnProposalView(user, proposal)).toBe(false);
  });

  it('is nobody’s without call management, which has no such views', () => {
    ENV.FEATURES = { marketplace: {} } as any;
    expect(hasOwnProposalView(user, onTeam)).toBe(false);
  });
});
