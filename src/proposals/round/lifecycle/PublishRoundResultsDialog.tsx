import { FC, useState } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProtectedCallsRoundsPublishResults,
  ProtectedRound,
  PublishRoundResultsFailure,
  PublishRoundResultsResponse,
} from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { required } from '@/core/validators';
import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { getUndecidedRefusal } from '@/proposals/roundLifecycle';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/notify';

interface PublishRoundResultsDialogProps {
  resolve: {
    round: ProtectedRound;
    call: Call;
    refetch(): void;
  };
}

interface PublishFormValues {
  reason?: string;
}

/**
 * Publishes every decision of the round at once. The backend refuses while
 * some proposals of the round have no decision; the dialog then names how
 * many and lets the manager publish anyway with a reason, which is recorded
 * on the round. A decision that cannot be carried out stays held and is
 * listed here; publishing again retries it.
 */
export const PublishRoundResultsDialog: FC<PublishRoundResultsDialogProps> = ({
  resolve: { round, call, refetch },
}) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();
  const [refusal, setRefusal] = useState<{
    count: number;
    detail: string;
  } | null>(null);
  // Results already out, with decisions whose release failed still held:
  // publishing again retries them.
  const republishing = round.lifecycle_state === 'results_published';
  const [failed, setFailed] = useState<PublishRoundResultsFailure[] | null>(
    null,
  );

  const publish = useManagedMutation<
    PublishRoundResultsResponse,
    any,
    PublishFormValues
  >({
    mutationFn: (values) =>
      proposalProtectedCallsRoundsPublishResults({
        path: { uuid: call.uuid, obj_uuid: round.uuid },
        body: refusal
          ? { force: true, reason: values.reason }
          : { force: false },
      }).then((response) => response.data),
    refetch,
    closeModal: false,
    onSuccess: (data) => {
      const failedProposals = data?.failed_proposals ?? [];
      // Published, so a retry runs on a round whose results are already out,
      // where the backend no longer asks about undecided proposals: forcing
      // again would only demand a reason it does not use.
      setRefusal(null);
      if (failedProposals.length) {
        setFailed(failedProposals);
        return;
      }
      setFailed(null);
      showSuccess(translate('The results of the round have been published.'));
      closeDialog();
    },
    onError: (error) => {
      const undecided = !refusal && getUndecidedRefusal(error);
      if (undecided) {
        setRefusal(undecided);
        return;
      }
      showErrorResponse(error, translate('Unable to publish the results.'));
    },
  });

  if (failed) {
    return (
      <ModalDialog
        title={translate('Results published with failures')}
        footer={
          <>
            <CloseDialogButton variant="tertiary" />
            <BaseButton
              variant="primary"
              label={translate('Retry')}
              pending={publish.isPending}
              onClick={() => publish.mutate({})}
            />
          </>
        }
      >
        <AlertItem
          type="floating"
          variant="warning"
          title={translate(
            'The decisions on these proposals could not be carried out',
          )}
          body={translate(
            'They stay held and their applicants have not been told. Retry once the cause is fixed.',
          )}
        />
        <ul className="mt-4" data-testid="failed-proposals">
          {failed.map((proposal) => (
            <li key={proposal.uuid}>{proposal.name}</li>
          ))}
        </ul>
      </ModalDialog>
    );
  }

  return (
    <Form<PublishFormValues>
      onSubmit={(values) => {
        // mutate, not mutateAsync: a refusal is handled in onError and must
        // not surface as a rejected submit.
        publish.mutate(values);
      }}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Publish results of {name}', {
              name: round.name,
            })}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={publish.isPending}
                  invalid={invalid}
                  label={
                    refusal
                      ? translate('Publish anyway')
                      : republishing
                        ? translate('Retry')
                        : translate('Publish results')
                  }
                  variant={refusal ? 'danger' : 'primary'}
                />
              </>
            }
          >
            {republishing ? (
              <p data-testid="republish-note">
                {translate(
                  '{count} decision(s) of this round could not be carried out when its results were published and are still held. Publishing again retries them.',
                  { count: round.held_decisions_count },
                )}
              </p>
            ) : call.publish_results === 'with_round' ? (
              <p>
                {translate(
                  'Every decision held for this round is announced to its applicant now and carried out: awarded proposals continue to the award response or are allocated, the others are rejected.',
                )}
              </p>
            ) : (
              <p>
                {translate(
                  'This call announces each decision as it is made, so publishing only records that the round has reached this stage.',
                )}
              </p>
            )}
            {refusal ? (
              <>
                <AlertItem
                  type="floating"
                  variant="warning"
                  title={translate(
                    '{count} proposal(s) of this round have no decision yet',
                    { count: refusal.count },
                  )}
                  body={translate(
                    'Their decisions will be announced as they are made. To publish the others now, give a reason; it is recorded on the round.',
                  )}
                  data-testid="undecided-refusal"
                />
                <TextGroup
                  name="reason"
                  label={translate('Reason for publishing early')}
                  required
                  validate={required}
                  maxLength={1000}
                  className="mt-4"
                />
              </>
            ) : null}
          </ModalDialog>
        </form>
      )}
    />
  );
};
