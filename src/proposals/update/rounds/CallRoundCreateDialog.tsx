import { DateTime } from 'luxon';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  proposalProtectedCallsRoundsSet,
  ProtectedRoundRequest,
} from 'waldur-js-client';

import { parseDate } from '@/core/dateUtils';
import { ProgressStep } from '@/core/ProgressSteps';
import { WizardFormContainer } from '@/form/WizardFormContainer';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
  const dispatch = useDispatch();
  const createRound = useCallback(
    async (formData: ProtectedRoundRequest, _dispatch, formProps) => {
      try {
        await proposalProtectedCallsRoundsSet({
          path: { uuid: props.resolve.call.uuid },
          body: formData,
        });
        formProps.destroy();
        dispatch(closeModalDialog());
        props.resolve.refetch();
        dispatch(showSuccess(translate('Round has been created.')));
      } catch (e) {
        dispatch(showErrorResponse(e));
      }
    },
    [dispatch, props.resolve],
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
