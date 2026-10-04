import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { proposalProposalsListUsersList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { RoleEnum } from '@/permissions/enums';
import { GenericPermission } from '@/permissions/types';
import { Proposal } from '@/proposals/types';
import { invalidateProposalCanSubmit } from '@/proposals/useProposalCanSubmit';
import { useUser } from '@/workspace/hooks';

import {
  canInviteToProposal,
  canManageProposalTeam,
  canOverseeProposal,
  canRevokeAnyProposalRole,
  canRevokeProposalRow,
  getGrantableProposalRoleNames,
  getRemoveDisabledReason,
  isOnProposalTeam,
} from './teamRules';

const proposalManagersKey = (proposalUuid: string) => [
  'ProposalManagerCount',
  proposalUuid,
];

/**
 * How many active proposal managers the proposal has, up to two: enough to
 * tell whether removing one would leave it without any.
 */
const useProposalManagerCount = (proposal: Proposal | undefined) =>
  useQuery({
    queryKey: proposalManagersKey(proposal?.uuid),
    queryFn: () =>
      proposalProposalsListUsersList({
        path: { uuid: proposal.uuid },
        query: { role: [RoleEnum.PROPOSAL_MANAGER], page_size: 2 },
      }).then((response) => response.data.length),
    enabled: Boolean(proposal?.uuid),
    refetchOnWindowFocus: false,
  }).data;

/**
 * Everything a proposal team panel needs to know about the viewer's rights on
 * the team, in one place for the draft form and the proposal detail. Returns
 * undefined for a team that is not a proposal's.
 */
export const useProposalTeamRules = (proposal: Proposal | undefined) => {
  const user = useUser();
  const queryClient = useQueryClient();
  const managerCount = useProposalManagerCount(proposal);

  const proposalUuid = proposal?.uuid;
  // Called after a member was added or removed: whether the proposal may be
  // submitted (it needs a manager) and who is its last manager may change.
  const onTeamChange = useCallback(() => {
    if (!proposalUuid) return;
    invalidateProposalCanSubmit(queryClient, proposalUuid);
    queryClient.invalidateQueries({
      queryKey: proposalManagersKey(proposalUuid),
    });
  }, [queryClient, proposalUuid]);

  const canRemoveRow = useCallback(
    (row: GenericPermission) => canRevokeProposalRow(user, proposal, row),
    [user, proposal],
  );
  const getRemoveReason = useCallback(
    (row: GenericPermission) => getRemoveDisabledReason(row, managerCount),
    [managerCount],
  );

  return useMemo(() => {
    if (!proposal) {
      return undefined;
    }
    const grantableRoles = getGrantableProposalRoleNames(user, proposal);
    const canChangeTeam = grantableRoles.length > 0;
    const teamNote =
      canChangeTeam || !isOnProposalTeam(user, proposal)
        ? null
        : proposal.state === 'draft'
          ? translate('Only a proposal manager can change the proposal team.')
          : translate(
              'The team is fixed after submission; the call manager can change it.',
            );
    return {
      grantableRoles,
      /** Add member and invite: offered when any role may be granted. */
      dropdown: canChangeTeam
        ? {
            roles: grantableRoles,
            canAddUser: true,
            canInvite: canInviteToProposal(user, proposal),
          }
        : null,
      /** Invitations and the change log: those who manage the team. */
      canManageTeam: canManageProposalTeam(user, proposal),
      canOversee: canOverseeProposal(user, proposal),
      readOnly: !canRevokeAnyProposalRole(user, proposal),
      canRemoveRow,
      getRemoveDisabledReason: getRemoveReason,
      teamNote,
      onTeamChange,
    };
  }, [user, proposal, canRemoveRow, getRemoveReason, onTeamChange]);
};
