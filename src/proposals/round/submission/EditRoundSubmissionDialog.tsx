import { FC, useCallback, useMemo } from 'react';
import {
  proposalProtectedCallsRoundsUpdate,
  ProtectedRound,
  ProtectedRoundRequest,
} from 'waldur-js-client';

import { parseDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { WizardFormFirstPage } from '@/proposals/update/rounds/WizardFormFirstPage';
import { getRoundInitialValues } from '@/proposals/utils';
import { WizardFormContainer } from '@/wizard';

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
  const initialValues = useMemo(
    () => getRoundInitialValues(props.resolve.round),
    [props.resolve.round],
  );
  const { closeDialog } = useModal();

  const updateRoundMutation = useManagedMutation<
    any,
    any,
    ProtectedRoundRequest
  >({
    mutationFn: (formData) =>
      proposalProtectedCallsRoundsUpdate({
        path: {
          uuid: props.resolve.call.uuid,
          obj_uuid: props.resolve.round.uuid,
        },
        body: {
          ...initialValues,
          ...formData,
        },
      }),
    successMessage: translate('Round has been updated.'),
    errorMessage: translate('Unable to update round.'),
    refetch: props.resolve.refetch,
    onSuccess: closeDialog,
  });

  const submit = useCallback(
    (formData: ProtectedRoundRequest) =>
      updateRoundMutation.mutateAsync(formData),
    [updateRoundMutation],
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
      initialValues={initialValues}
      validate={validate}
    />
  );
};
