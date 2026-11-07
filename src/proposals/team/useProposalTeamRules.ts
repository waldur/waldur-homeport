import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { proposalProposalsListUsersList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { RoleEnum } from '@/permissions/enums';
import { GenericPermission } from '@/permissions/types';
import { Proposal } from '@/proposals/types';
import { invalidateProposalCanSubmit } from '@/proposals/useProposalCanSubmit';
import { useUser } from '@/workspace/hooks';

import { useProposalEditLocked } from './proposalEditLock';
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
    // Not everyone who reads the proposal reads its team; a 403 here leaves
    // the count unknown rather than leaving the page.
    meta: { skipGlobalErrorRedirect: true },
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

  const locked = useProposalEditLocked();

  return useMemo(() => {
    if (!proposal) {
      return undefined;
    }
    // Locked until the viewer, off the team, unlocks editing: the team reads
    // as it is, and nobody is added, invited or removed meanwhile.
    if (locked) {
      return {
        grantableRoles: [],
        dropdown: null,
        canManageTeam: false,
        canOversee: canOverseeProposal(user, proposal),
        readOnly: true,
        canRemoveRow: () => false,
        getRemoveDisabledReason: getRemoveReason,
        teamNote: translate(
          'Read-only until you unlock editing at the top of the page.',
        ),
        onTeamChange,
      };
    }
    const grantableRoles = getGrantableProposalRoleNames(user, proposal);
    const canChangeTeam = grantableRoles.length > 0;
    const teamNote =
      canChangeTeam || !isOnProposalTeam(user, proposal)
        ? null
        : proposal.state === 'draft'
          ? translate('Only a proposal manager can change the proposal team.')
          : proposal.state === 'accepted'
            ? translate(
                'The team is settled once the award is accepted: manage the people on the awarded project instead.',
              )
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
  }, [user, proposal, locked, canRemoveRow, getRemoveReason, onTeamChange]);
};
