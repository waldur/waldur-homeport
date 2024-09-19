import { DateTime } from 'luxon';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { parseDate } from '@waldur/core/dateUtils';
import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { updateCallRound } from '@waldur/proposals/api';
import { RoundFormData, Call, Round } from '@waldur/proposals/types';
import { WizardFormFirstPage } from '@waldur/proposals/update/rounds/WizardFormFirstPage';
import { getRoundInitialValues } from '@waldur/proposals/utils';

interface EditRoundSubmissionDialogProps {
  resolve: {
    round: Round;
    call: Call;
    refetch(): void;
  };
}

const validate = (values: RoundFormData) => {
  const errors: any = {};
  if (parseDate(values.start_time) > parseDate(values.cutoff_time)) {
    errors.cutoff_time = translate('Cutoff date must be after start date');
  }
  return errors;
};

export const EditRoundSubmissionDialog: FC<EditRoundSubmissionDialogProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const submit = useCallback(
    (formData: RoundFormData, _dispatch, formProps) => {
      const updatedRound = {
        ...getRoundInitialValues(props.resolve.round),
        ...formData,
      };
      return updateCallRound(
        props.resolve.call.uuid,
        props.resolve.round.uuid,
        updatedRound,
      ).then(() => {
        formProps.destroy();
        dispatch(closeModalDialog());
        props.resolve.refetch();
      });
    },
    [dispatch, props.resolve],
  );

  return (
    <WizardFormContainer
      form="RoundEditForm"
      title={translate('Edit round submission')}
      submitLabel={translate('Edit')}
      onSubmit={submit}
      steps={[translate('Submission')]}
      wizardForms={[WizardFormFirstPage]}
      initialValues={{
        timezone: DateTime.local().zoneName,
        start_time: props.resolve.round.start_time,
        cutoff_time: props.resolve.round.cutoff_time,
      }}
      validate={validate}
    />
  );
};
