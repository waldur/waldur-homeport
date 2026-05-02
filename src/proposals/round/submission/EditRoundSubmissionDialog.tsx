import { DateTime } from 'luxon';
import { FC, useCallback } from 'react';
import {
  proposalProtectedCallsRoundsUpdate,
  ProtectedRound,
  ProtectedRoundRequest,
} from 'waldur-js-client';

import { parseDate } from '@/core/dateUtils';
import { WizardFormContainer } from '@/form/WizardFormContainer';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { WizardFormFirstPage } from '@/proposals/update/rounds/WizardFormFirstPage';
import { getRoundInitialValues } from '@/proposals/utils';

interface EditRoundSubmissionDialogProps {
  resolve: {
    round: ProtectedRound;
    call: Call;
    refetch(): void;
  };
}

const validate = (values: ProtectedRoundRequest) => {
  const errors: any = {};
  if (parseDate(values.start_time) > parseDate(values.cutoff_time)) {
    errors.cutoff_time = translate('Cutoff date must be after start date');
  }
  return errors;
};

export const EditRoundSubmissionDialog: FC<EditRoundSubmissionDialogProps> = (
  props,
) => {
  const { closeDialog } = useModal();
  const submit = useCallback(
    (formData: ProtectedRoundRequest, _dispatch, formProps) => {
      return proposalProtectedCallsRoundsUpdate({
        path: {
          uuid: props.resolve.call.uuid,
          obj_uuid: props.resolve.round.uuid,
        },
        body: {
          ...getRoundInitialValues(props.resolve.round),
          ...formData,
        },
      }).then(() => {
        formProps.destroy();
        closeDialog();
        props.resolve.refetch();
      });
    },
    [],
  );

  return (
    <WizardFormContainer
      form="RoundEditForm"
      title={translate('Edit round submission')}
      submitLabel={translate('Edit')}
      onSubmit={submit}
      steps={[
        { key: 'submission', label: translate('Submission'), completed: false },
      ]}
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
