import { DateTime } from 'luxon';
import { FC, useCallback } from 'react';
import {
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

  const createRound = useCallback(
    async (formData: ProtectedRoundRequest, _dispatch, formProps) => {
      try {
        await createRoundMutation.mutateAsync(formData);
        formProps.destroy();
      } catch {
        // Error handled by useManagedMutation
      }
    },
    [createRoundMutation],
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
    />
  );
};
