import { useQuery } from '@tanstack/react-query';
import {
  proposalProposalsAddUser,
  proposalProposalsDeleteUser,
  proposalProposalsListUsersList,
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

/** Whether a failed team request was refused for lack of access. */
export const isAccessDenied = (error: unknown): boolean =>
  (error as any)?.response?.status === 403;

/**
 * Whether the viewer may read the proposal's team. Some who read the
 * proposal do not: an offering manager assessing a requested offering, say.
 * Their 403 means "no access", not an error, so it does not send the whole
 * page to the no-permission screen. Unknown (true) until answered.
 */
export const useProposalTeamReadable = (proposalUuid?: string): boolean => {
  const { error } = useQuery({
    queryKey: ['ProposalTeamReadable', proposalUuid],
    queryFn: () =>
      proposalProposalsListUsersList({
        path: { uuid: proposalUuid },
        query: { page_size: 1 },
      }).then(() => true),
    enabled: Boolean(proposalUuid),
    refetchOnWindowFocus: false,
    meta: { skipGlobalErrorRedirect: true },
  });
  return !isAccessDenied(error);
};
