import { FC, useState } from 'react';
import {
  CompleteRoundResponse,
  proposalProtectedCallsRoundsComplete,
  ProtectedRound,
} from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  getEffectiveCompletionRule,
  getHeldDecisionsRefusal,
  getUndecidedRefusal,
  undecidedAtCompletionLabel,
} from '@/proposals/roundLifecycle';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/notify';

interface CompleteRoundDialogProps {
  resolve: {
    round: ProtectedRound;
    call: Call;
    refetch(): void;
  };
}

type Outcome = Pick<
  CompleteRoundResponse,
  'rejected_proposals' | 'failed_proposals'
>;

const ProposalList: FC<{
  proposals: Outcome['rejected_proposals'];
  testId: string;
}> = ({ proposals, testId }) => (
  <ul className="mt-2" data-testid={testId}>
    {proposals.map((proposal) => (
      <li key={proposal.uuid}>{proposal.name}</li>
    ))}
  </ul>
);

/**
 * Closes a round whose results are published. What happens to proposals
 * still without a decision is the round's rule, or else the call's: blocked
 * until they are decided, or rejected automatically. A rejection that fails
 * leaves the round open; completing it again retries.
 */
export const CompleteRoundDialog: FC<CompleteRoundDialogProps> = ({
  resolve: { round, call, refetch },
}) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();
  const { rule, inherited } = getEffectiveCompletionRule(round, call);
  const [undecidedCount, setUndecidedCount] = useState<number | null>(null);
  const [heldCount, setHeldCount] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const complete = useManagedMutation<CompleteRoundResponse, any, void>({
    mutationFn: () =>
      proposalProtectedCallsRoundsComplete({
        path: { uuid: call.uuid, obj_uuid: round.uuid },
      }).then((response) => response.data),
    refetch,
    closeModal: false,
    onSuccess: (data) => {
      const rejected = data?.rejected_proposals ?? [];
      const failed = data?.failed_proposals ?? [];
      setUndecidedCount(null);
      setHeldCount(null);
      if (rejected.length || failed.length) {
        setOutcome({ rejected_proposals: rejected, failed_proposals: failed });
        if (!failed.length) {
          showSuccess(translate('The round has been completed.'));
        }
        return;
      }
      showSuccess(translate('The round has been completed.'));
      closeDialog();
    },
    onError: (error) => {
      const refusal = getUndecidedRefusal(error);
      if (refusal) {
        setHeldCount(null);
        setUndecidedCount(refusal.count);
        return;
      }
      const held = getHeldDecisionsRefusal(error);
      if (held) {
        setUndecidedCount(null);
        setHeldCount(held.count);
        // The rounds table may predate the failed release; reloading it
        // offers Publish results again, which the alert points to.
        refetch();
        return;
      }
      showErrorResponse(error, translate('Unable to complete the round.'));
    },
  });

  // A refusal, also of a retry from the outcome screen, which must not hide it.
  const refusalAlert =
    heldCount !== null ? (
      <AlertItem
        type="floating"
        variant="error"
        title={translate('{count} decision(s) are still held', {
          count: heldCount,
        })}
        body={translate(
          'Their release failed when the results were published. Publish the results again to release them, then complete the round.',
        )}
        data-testid="held-refusal"
      />
    ) : undecidedCount !== null ? (
      <AlertItem
        type="floating"
        variant="error"
        title={translate('{count} proposal(s) have no decision yet', {
          count: undecidedCount,
        })}
        body={translate(
          "Decide them before completing the round, or change the round's rule to reject them automatically.",
        )}
        data-testid="undecided-refusal"
      />
    ) : null;

  if (outcome) {
    const failed = outcome.failed_proposals.length > 0;
    return (
      <ModalDialog
        title={
          failed
            ? translate('The round could not be completed yet')
            : translate('The round has been completed')
        }
        footer={
          <>
            <CloseDialogButton
              variant={failed ? 'tertiary' : 'primary'}
              label={translate('Close')}
            />
            {failed ? (
              <BaseButton
                variant="primary"
                label={translate('Retry')}
                pending={complete.isPending}
                onClick={() => complete.mutate()}
              />
            ) : null}
          </>
        }
      >
        {refusalAlert ? <div className="mb-4">{refusalAlert}</div> : null}
        {outcome.rejected_proposals.length ? (
          <>
            <p className="mb-0">
              {translate(
                'These proposals had no decision and were rejected; their applicants have been told:',
              )}
            </p>
            <ProposalList
              proposals={outcome.rejected_proposals}
              testId="rejected-proposals"
            />
          </>
        ) : null}
        {failed ? (
          <>
            <AlertItem
              type="floating"
              variant="warning"
              title={translate('These proposals could not be rejected')}
              body={translate(
                'The round stays open. Retry once the cause is fixed.',
              )}
            />
            <ProposalList
              proposals={outcome.failed_proposals}
              testId="failed-proposals"
            />
          </>
        ) : null}
      </ModalDialog>
    );
  }

  return (
    <ModalDialog
      title={translate('Complete round {name}', { name: round.name })}
      footer={
        <>
          <CloseDialogButton variant="tertiary" />
          <BaseButton
            variant="primary"
            label={translate('Complete round')}
            pending={complete.isPending}
            onClick={() => complete.mutate()}
          />
        </>
      }
    >
      <p>
        {translate('Nothing more happens in a completed round.')}{' '}
        {translate('Undecided proposals: {rule} ({source}).', {
          rule: undecidedAtCompletionLabel(rule),
          source: inherited
            ? translate("the call's setting")
            : translate('set for this round'),
        })}
      </p>
      {refusalAlert ? (
        refusalAlert
      ) : rule === 'reject' ? (
        <AlertItem
          type="floating"
          variant="warning"
          title={translate(
            'Proposals still without a decision will be rejected automatically',
          )}
          body={translate(
            'Each is rejected where it stands and its applicant is told at once.',
          )}
          data-testid="reject-warning"
        />
      ) : null}
    </ModalDialog>
  );
};
