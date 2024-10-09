import { DateTime } from 'luxon';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { parseDate } from '@waldur/core/dateUtils';
import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createCallRound } from '@waldur/proposals/api';
import { RoundFormData, Call } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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

const steps = [
  translate('Submission'),
  translate('Review'),
  translate('Allocation'),
];

const validate = (values: RoundFormData) => {
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
    async (formData: RoundFormData, _dispatch, formProps) => {
      try {
        await createCallRound(props.resolve.call.uuid, formData).then(() => {
          formProps.destroy();
          dispatch(closeModalDialog());
          props.resolve.refetch();
        });
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
