import { DateTime } from 'luxon';
import { FC, useCallback } from 'react';
import {
  BulkRoundCreateRequestRequest,
  proposalProtectedCallsRoundsBulkSet,
  proposalProtectedCallsRoundsSet,
  ProtectedRoundRequest,
} from 'waldur-js-client';

import { parseDate } from '@/core/dateUtils';
import { ProgressStep } from '@/core/ProgressSteps';
import { WizardFormContainer } from '@/form/WizardFormContainer';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';

import { WizardFormFirstPage } from './WizardFormFirstPage';
import { WizardFormSecondPage } from './WizardFormSecondPage';
import { WizardFormThirdPage } from './WizardFormThirdPage';

interface CallRoundCreateDialogProps {
  resolve: {
    call: Call;
    refetch(): void;
  };
}

const WizardForms = [
  WizardFormFirstPage,
  WizardFormSecondPage,
  WizardFormThirdPage,
];

const steps: ProgressStep[] = [
  {
    key: 'submission',
    label: translate('Submission'),
    completed: false,
  },
  {
    key: 'review',
    label: translate('Review'),
    completed: false,
  },
  {
    key: 'allocation',
    label: translate('Allocation'),
    completed: false,
  },
];

const validate = (values: ProtectedRoundRequest) => {
  const errors: any = {};
  if (parseDate(values.start_time) > parseDate(values.cutoff_time)) {
    errors.cutoff_time = translate('Cutoff date must be after start date');
  }
  return errors;
};

export const CallRoundCreateDialog: FC<CallRoundCreateDialogProps> = (
  props,
) => {
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
        repeats?: boolean;
        cadence?: string;
        custom_interval_months?: number | null;
        submission_window_days?: number;
        number_of_rounds?: number;
      },
      _dispatch,
      formProps,
    ) => {
      try {
        if (formData.repeats) {
          await bulkCreateRoundsMutation.mutateAsync({
            start_time: formData.start_time,
            cadence: formData.cadence as any,
            custom_interval_months: formData.custom_interval_months ?? null,
            submission_window_days: formData.submission_window_days!,
            number_of_rounds: formData.number_of_rounds!,
            review_strategy: formData.review_strategy,
            deciding_entity: formData.deciding_entity,
            allocation_time: formData.allocation_time,
            review_duration_in_days: formData.review_duration_in_days,
            minimum_number_of_reviewers: formData.minimum_number_of_reviewers,
            minimal_average_scoring: formData.minimal_average_scoring,
          });
        } else {
          await createRoundMutation.mutateAsync(formData);
        }
        formProps.destroy();
      } catch {
        // Error handled by useManagedMutation
      }
    },
    [createRoundMutation, bulkCreateRoundsMutation],
  );
  return (
    <WizardFormContainer
      form="CallRoundForm"
      onSubmit={createRound}
      steps={steps}
      title={translate('New round')}
      wizardForms={WizardForms}
      initialValues={{ timezone: DateTime.local().zoneName }}
      submitLabel={translate('Create')}
      validate={validate}
      modalProps={{ bodyClassName: 'min-h-600px' }}
    />
  );
};
