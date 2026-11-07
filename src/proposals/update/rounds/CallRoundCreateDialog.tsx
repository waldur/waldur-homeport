import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';
import {
  BulkRoundCreateRequestRequest,
  proposalProtectedCallsRoundsBulkSet,
  proposalProtectedCallsRoundsSet,
  ProtectedRoundRequest,
} from 'waldur-js-client';

import { parseDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { openEndedRoundBlockedReason } from '@/proposals/roundCutoff';
import { AllocationTime, Call } from '@/proposals/types';
import { roundTimesInZone } from '@/proposals/utils';
import { findAllocationDecision } from '@/proposals/workflow/constants';
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '@/proposals/workflow/queries';
import { ProgressStep, WizardFormContainer } from '@/wizard';

import { WizardFormFirstPage } from './WizardFormFirstPage';
import { WizardFormThirdPage } from './WizardFormThirdPage';

interface CallRoundCreateDialogProps {
  resolve: {
    call: Call;
    refetch(): void;
  };
}

const steps: ProgressStep[] = [
  {
    key: 'submission',
    label: translate('Submission'),
    completed: false,
  },
  {
    key: 'allocation',
    label: translate('Allocation'),
    completed: false,
  },
];

const validate = (values: ProtectedRoundRequest & { open_ended?: boolean }) => {
  const errors: any = {};
  if (values.open_ended || !values.cutoff_time) {
    return errors;
  }
  if (parseDate(values.start_time) > parseDate(values.cutoff_time)) {
    errors.cutoff_time = translate('Cutoff date must be after start date');
  }
  return errors;
};

export const CallRoundCreateDialog: FC<CallRoundCreateDialogProps> = (
  props,
) => {
  const { closeDialog } = useModal();

  // Allocation timing is a call-level policy on the allocation decision step;
  // the round only needs an allocation date when the call uses fixed-date mode.
  const { data: workflowSteps } = useQuery({
    queryKey: callWorkflowStepsKey(props.resolve.call.uuid),
    queryFn: () => fetchCallWorkflowSteps(props.resolve.call.uuid),
  });
  const allocationMode = (findAllocationDecision(workflowSteps)
    ?.allocation_time || 'on_decision') as AllocationTime;

  const openEndedBlocked = openEndedRoundBlockedReason(
    props.resolve.call,
    allocationMode,
  );

  const wizardForms = useMemo(
    () => [
      (stepProps) => (
        <WizardFormFirstPage
          {...stepProps}
          openEndedBlockedReason={openEndedBlocked}
        />
      ),
      // No review page: a review is due when its workflow step is, set per
      // round on the round's steps.
      (stepProps) => (
        <WizardFormThirdPage {...stepProps} allocationMode={allocationMode} />
      ),
    ],
    [allocationMode, openEndedBlocked],
  );

  const createRoundMutation = useManagedMutation<
    any,
    any,
    ProtectedRoundRequest
  >({
    mutationFn: (formData) =>
      proposalProtectedCallsRoundsSet({
        path: { uuid: props.resolve.call.uuid },
        body: formData,
      }),
    successMessage: translate('Round has been created.'),
    errorMessage: translate('Unable to create round.'),
    refetch: props.resolve.refetch,
  });

  const bulkCreateRoundsMutation = useManagedMutation<
    any,
    any,
    BulkRoundCreateRequestRequest
  >({
    mutationFn: (formData) =>
      proposalProtectedCallsRoundsBulkSet({
        path: { uuid: props.resolve.call.uuid },
        body: formData,
      }),
    successMessage: translate('Rounds have been created.'),
    errorMessage: translate('Unable to create rounds.'),
    refetch: props.resolve.refetch,
  });

  const createRound = useCallback(
    async (
      formData: ProtectedRoundRequest & {
        open_ended?: boolean;
        repeats?: boolean;
        cadence?: string;
        custom_interval_months?: number | null;
        submission_window_days?: number;
        number_of_rounds?: number;
      },
    ) => {
      try {
        if (formData.repeats) {
          await bulkCreateRoundsMutation.mutateAsync({
            start_time: roundTimesInZone(formData).start_time,
            cadence: formData.cadence as any,
            custom_interval_months: formData.custom_interval_months ?? null,
            submission_window_days: formData.submission_window_days!,
            number_of_rounds: formData.number_of_rounds!,
          });
        } else {
          const { open_ended, ...round } = formData;
          await createRoundMutation.mutateAsync(
            roundTimesInZone(
              open_ended ? { ...round, cutoff_time: null } : round,
            ),
          );
        }
        closeDialog();
      } catch {
        // Error handled by useManagedMutation
      }
    },
    [createRoundMutation, bulkCreateRoundsMutation, closeDialog],
  );
  return (
    <WizardFormContainer
      form="CallRoundForm"
      onSubmit={createRound}
      steps={steps}
      title={translate('New round')}
      wizardForms={wizardForms}
      initialValues={{ timezone: DateTime.local().zoneName }}
      submitLabel={translate('Create')}
      validate={validate}
      modalProps={{ bodyClassName: 'min-h-[600px]' }}
    />
  );
};
