import { FC } from 'react';
import {
  proposalProtectedCallsRoundsDestroy,
  ProtectedRound,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

/**
 * Whether the round holds any proposal. The backend refuses to delete such a
 * round, so the action is disabled up front. `has_proposals` counts every
 * proposal whoever asks; the proposals list may leave out what the viewer is
 * not shown, so it only stands in where the flag is absent.
 */
const roundHasProposals = (
  row: ProtectedRound & { has_proposals?: boolean },
): boolean => row.has_proposals ?? (row.proposals?.length ?? 0) > 0;

interface RoundDeleteActionProps {
  row: ProtectedRound;
  refetch: () => void;
  call: Call;
}

export const RoundDeleteAction: FC<RoundDeleteActionProps> = ({
  row,
  refetch,
  call,
}) => {
  const { mutate: deleteRound, isPending: isDeleting } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      proposalProtectedCallsRoundsDestroy({
        path: {
          uuid: call.uuid,
          obj_uuid: row.uuid,
        },
      }),
    successMessage: translate('Round has been deleted.'),
    errorMessage: translate('Unable to delete round.'),
    refetch,
    confirmation: {
      title: translate('Confirm deletion'),
      body: translate(
        'Are you sure you want to delete round "{name}"? This action cannot be undone.',
        { name: row.name },
      ),
      options: { forDeletion: true },
    },
  });

  const hasProposals = roundHasProposals(row);

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => deleteRound()}
      disabled={hasProposals || isDeleting}
      tooltip={
        hasProposals
          ? translate('Cannot delete a round that has proposals')
          : undefined
      }
    />
  );
};
