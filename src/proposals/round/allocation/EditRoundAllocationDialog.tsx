import { FC, useCallback, useMemo } from 'react';
import {
  proposalProtectedCallsRoundsUpdate,
  ProtectedRound,
  ProtectedRoundRequest,
} from 'waldur-js-client';

import { WizardFormContainer } from '@/form/WizardFormContainer';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { WizardFormThirdPage } from '@/proposals/update/rounds/WizardFormThirdPage';
import { getRoundInitialValues } from '@/proposals/utils';

interface EditRoundAllocationDialogProps {
  resolve: {
    round: ProtectedRound;
    call: Call;
    refetch(): void;
  };
}

export const EditRoundAllocationDialog: FC<EditRoundAllocationDialogProps> = (
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
      title={translate('Edit round allocation')}
      onSubmit={submit}
      submitLabel={translate('Edit')}
      steps={[
        { key: 'allocation', label: translate('Allocation'), completed: false },
      ]}
      wizardForms={[WizardFormThirdPage]}
      initialValues={{
        deciding_entity: initialValues.deciding_entity,
        minimal_average_scoring: initialValues.minimal_average_scoring,
        allocation_time: initialValues.allocation_time,
        allocation_date: initialValues.allocation_date,
      }}
    />
  );
};
