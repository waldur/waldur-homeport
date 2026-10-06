import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { proposalProposalsReopenDecision } from 'waldur-js-client';

import { DateTimeGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Proposal } from '@/proposals/types';

import { proposalWorkflowStatesKey } from './queries';

interface ReopenDecisionFormValues {
  reason?: string;
  deadline?: string | Date | null;
}

interface ReopenDecisionDialogProps {
  resolve: {
    proposal: Proposal;
    refetch?(): void;
  };
}

// The backend trims the reason, so spaces alone would arrive empty.
const validateReason = (value?: string) =>
  value?.trim() ? undefined : translate('This field is required.');

const validateReopenDeadline = (value: string | Date | null) => {
  if (!value) return undefined;
  return new Date(value) <= new Date()
    ? translate('The deadline must be in the future.')
    : undefined;
};

/**
 * Takes back a decision held for the round's publication, e.g. when the board
 * changes an outcome while adopting the list. The decision step becomes
 * active again; nothing is sent to the applicant.
 */
export const ReopenDecisionDialog: FC<ReopenDecisionDialogProps> = ({
  resolve: { proposal, refetch },
}) => {
  const openedAt = useMemo(() => new Date(), []);
  const reopen = useManagedMutation<any, any, ReopenDecisionFormValues>({
    mutationFn: (values) =>
      proposalProposalsReopenDecision({
        path: { uuid: proposal.uuid },
        body: {
          reason: values.reason!.trim(),
          deadline: values.deadline
            ? new Date(values.deadline).toISOString()
            : null,
        },
      }),
    successMessage: translate('The decision has been reopened.'),
    errorMessage: translate('Unable to reopen the decision.'),
    refetch,
    invalidateQueries: [{ queryKey: proposalWorkflowStatesKey(proposal.uuid) }],
  });

  return (
    <Form<ReopenDecisionFormValues>
      onSubmit={(values) => reopen.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Reopen decision')}
            subtitle={translate(
              "The allocation decision becomes active again with its outcome cleared, and the proposal counts as undecided until it is decided anew. The applicant is not notified. The reopening is recorded in the event log of the proposal, without the reason or the outcome taken back, and the applicant's team sees that entry only once the round publishes its results.",
            )}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Reopen decision')}
                />
              </>
            }
          >
            <TextGroup
              name="reason"
              label={translate('Reason')}
              required
              validate={validateReason}
              maxLength={1000}
              placeholder={translate(
                'For example, the board changed the outcome when adopting the list',
              )}
            />
            <DateTimeGroup
              name="deadline"
              label={translate('New deadline')}
              description={translate(
                'Optional. Without one, a deadline that has passed is cleared and one still ahead is kept.',
              )}
              // A Date, not "today": with times enabled it bounds the hours
              // and minutes of today as well as earlier days.
              minDate={openedAt}
              validate={validateReopenDeadline}
              // Show a refused deadline at once rather than only after the
              // picker closes, so submit is never disabled without a word.
              forceTouched
              placeholder={translate('Select date and time...')}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
