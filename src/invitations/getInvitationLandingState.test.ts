import { describe, expect, it } from 'vitest';

import { getInvitationLandingState } from './getInvitationLandingState';

const plainUser = { is_staff: false, permissions: [] } as any;
const staffUser = { is_staff: true, permissions: [] } as any;

const invitation = (scope_type: string) => ({
  scope_type,
  scope_uuid: 'scope-1',
  customer_uuid: 'customer-1',
});

describe('getInvitationLandingState', () => {
  it('sends an organization invitation to the organization', () => {
    expect(
      getInvitationLandingState(invitation('customer'), plainUser),
    ).toEqual({ state: 'organization.dashboard', params: { uuid: 'scope-1' } });
  });

  it('sends a project invitation to the project', () => {
    expect(getInvitationLandingState(invitation('project'), plainUser)).toEqual(
      { state: 'project.dashboard', params: { uuid: 'scope-1' } },
    );
  });

  it('sends a proposal invitation to the proposal, not the organization', () => {
    expect(
      getInvitationLandingState(invitation('proposal'), plainUser),
    ).toEqual({
      state: 'proposals.manage-proposal',
      params: { proposal_uuid: 'scope-1' },
    });
  });

  it('sends a call manager to the call management page', () => {
    expect(getInvitationLandingState(invitation('call'), staffUser)).toEqual({
      state: 'protected-call.manage',
      params: { call_uuid: 'scope-1' },
    });
  });

  it('sends a call member who cannot manage the call to its public page', () => {
    expect(getInvitationLandingState(invitation('call'), plainUser)).toEqual({
      state: 'public-call.details',
      params: { call_uuid: 'scope-1' },
    });
  });

  it('sends an offering manager to the provider offering page', () => {
    expect(
      getInvitationLandingState(invitation('offering'), staffUser),
    ).toEqual({
      state: 'marketplace-offering-details',
      params: { uuid: 'customer-1', offering_uuid: 'scope-1' },
    });
  });

  it('sends an offering role that cannot open the offering to the profile', () => {
    expect(
      getInvitationLandingState(invitation('offering'), plainUser),
    ).toEqual({ state: 'profile.details' });
  });

  it('falls back to the profile for other or missing scopes', () => {
    expect(
      getInvitationLandingState(invitation('call_organizer'), plainUser),
    ).toEqual({ state: 'profile.details' });
    expect(getInvitationLandingState(undefined, plainUser)).toEqual({
      state: 'profile.details',
    });
  });
});
