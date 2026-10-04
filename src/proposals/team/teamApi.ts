import {
  proposalProposalsAddUser,
  proposalProposalsDeleteUser,
  proposalProtectedCallsAddUser,
  proposalProtectedCallsDeleteUser,
} from 'waldur-js-client';

/** The two scopes whose team this panel manages. */
export type TeamScopeType = 'proposal' | 'call';

/** The scope type of a team panel from the role types it offers. */
export const getTeamScopeType = (roleTypes?: string[]): TeamScopeType =>
  roleTypes?.includes('proposal') ? 'proposal' : 'call';

// Through the generated client rather than a bare fetch: its error carries
// the response body (e.g. "A proposal must keep at least one proposal
// manager"), so the toast can say why a change was refused.

export const addTeamUser = (
  scopeType: TeamScopeType,
  scopeUuid: string,
  body: { user: string; role: string; expiration_time?: string | null },
) =>
  scopeType === 'proposal'
    ? proposalProposalsAddUser({ path: { uuid: scopeUuid }, body })
    : proposalProtectedCallsAddUser({ path: { uuid: scopeUuid }, body });

export const deleteTeamUser = (
  scopeType: TeamScopeType,
  scopeUuid: string,
  body: { user: string; role: string },
) =>
  scopeType === 'proposal'
    ? proposalProposalsDeleteUser({ path: { uuid: scopeUuid }, body })
    : proposalProtectedCallsDeleteUser({ path: { uuid: scopeUuid }, body });
