import {
  CheckCircleIcon,
  GavelIcon,
  ListChecksIcon,
  MegaphoneIcon,
  SealCheckIcon,
  StopCircleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import {
  proposalProtectedCallsRoundsClose,
  proposalProtectedCallsRoundsStartDeciding,
  ProtectedCallRequest,
  ProtectedRound,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { getRoundLifecycleActions } from '@/proposals/roundLifecycle';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';

const PublishRoundResultsDialog = lazyComponent(() =>
  import('@/proposals/round/lifecycle/PublishRoundResultsDialog').then((m) => ({
    default: m.PublishRoundResultsDialog,
  })),
);

const CompleteRoundDialog = lazyComponent(() =>
  import('@/proposals/round/lifecycle/CompleteRoundDialog').then((m) => ({
    default: m.CompleteRoundDialog,
  })),
);

const EditRoundCompletionRuleDialog = lazyComponent(() =>
  import('@/proposals/round/lifecycle/EditRoundCompletionRuleDialog').then(
    (m) => ({ default: m.EditRoundCompletionRuleDialog }),
  ),
);

const RecordRoundAdoptionDialog = lazyComponent(() =>
  import('@/proposals/round/lifecycle/RecordRoundAdoptionDialog').then((m) => ({
    default: m.RecordRoundAdoptionDialog,
  })),
);

interface RoundLifecycleActionsProps {
  row: ProtectedRound;
  refetch: () => void;
  call: Call;
  /** CALL.CLOSE_ROUNDS: close, decide, publish, complete, record adoption. */
  canCloseRounds: boolean;
  /** CALL.UPDATE: the completion rule is a round setting, edited as such. */
  canUpdate: boolean;
}

/**
 * The round's post-cut-off steps. Only the ones the backend accepts in the
 * round's current stage are offered.
 */
export const RoundLifecycleActions: FC<RoundLifecycleActionsProps> = ({
  row,
  refetch,
  call,
  canCloseRounds,
  canUpdate,
}) => {
  const { openDialog } = useModal();
  const available = getRoundLifecycleActions(row);
  const path = { uuid: call.uuid, obj_uuid: row.uuid };

  const close = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProtectedCallsRoundsClose({
        path,
        // The schema reuses the call's request body for this action; the
        // backend reads nothing from it.
        body: {} as ProtectedCallRequest,
      }),
    successMessage: translate('The round has been closed.'),
    errorMessage: translate('Unable to close the round.'),
    refetch,
    confirmation: {
      title: translate('Close round'),
      body: [
        translate(
          'Close round "{name}" now? Its cut-off moves to this moment and no more proposals can be submitted to it.',
          { name: row.name },
        ),
        call.carry_over_drafts
          ? translate(
              "Unsubmitted drafts move to the call's next round; if there is none, they are cancelled.",
            )
          : translate('Unsubmitted drafts are cancelled.'),
        translate('Evaluation of the submitted proposals starts.'),
      ].join(' '),
    },
  });

  const startDeciding = useManagedMutation<any, any, void>({
    mutationFn: () => proposalProtectedCallsRoundsStartDeciding({ path }),
    successMessage: translate('The round has moved to the decision stage.'),
    errorMessage: translate('Unable to start the decision stage.'),
    refetch,
    confirmation: {
      title: translate('Start deciding'),
      body: translate(
        'The proposals of round "{name}" have been evaluated and go to the decision body. Continue?',
        { name: row.name },
      ),
    },
  });

  // Every lifecycle action goes through the backend's check that the call
  // is active, so none is offered as usable on a draft or archived call.
  const callInactive = call.state !== 'active';
  const inactiveReason = callInactive
    ? translate('Only a round of an active call can move on.')
    : undefined;
  const heldDecisions = (row.held_decisions_count ?? 0) > 0;
  const show = (action: boolean) => canCloseRounds && action;

  return (
    <>
      {show(available.close) && (
        <ActionItem
          title={translate('Close round')}
          action={() => close.mutate()}
          disabled={callInactive || close.isPending}
          tooltip={
            callInactive
              ? translate('Only a round of an active call can be closed.')
              : undefined
          }
          iconNode={<StopCircleIcon weight="bold" />}
        />
      )}
      {show(available.startDeciding) && (
        <ActionItem
          title={translate('Start deciding')}
          action={() => startDeciding.mutate()}
          disabled={callInactive || startDeciding.isPending}
          tooltip={inactiveReason}
          iconNode={<GavelIcon weight="bold" />}
        />
      )}
      {show(available.publishResults) && (
        <ActionItem
          title={translate('Publish results')}
          disabled={callInactive}
          tooltip={inactiveReason}
          action={() =>
            openDialog(PublishRoundResultsDialog, {
              resolve: { round: row, call, refetch },
            })
          }
          iconNode={<MegaphoneIcon weight="bold" />}
        />
      )}
      {show(available.complete) && (
        <ActionItem
          title={translate('Complete round')}
          action={() =>
            openDialog(CompleteRoundDialog, {
              resolve: { round: row, call, refetch },
            })
          }
          // Completing is refused while decisions are held: a release that
          // failed at publication must be retried first.
          disabled={callInactive || heldDecisions}
          tooltip={
            inactiveReason ??
            (heldDecisions
              ? translate('Publish again to release the held decisions first.')
              : undefined)
          }
          iconNode={<CheckCircleIcon weight="bold" />}
        />
      )}
      {canUpdate && available.completionRule && (
        <ActionItem
          title={translate('Undecided proposals rule')}
          action={() =>
            openDialog(EditRoundCompletionRuleDialog, {
              resolve: { round: row, call, refetch },
            })
          }
          iconNode={<ListChecksIcon weight="bold" />}
        />
      )}
      {show(available.recordAdoption) && (
        <ActionItem
          disabled={callInactive}
          tooltip={inactiveReason}
          title={
            row.adopted_at
              ? translate('Edit adoption record')
              : translate('Record adoption')
          }
          action={() =>
            openDialog(RecordRoundAdoptionDialog, {
              resolve: { round: row, call, refetch },
            })
          }
          iconNode={<SealCheckIcon weight="bold" />}
        />
      )}
    </>
  );
};
