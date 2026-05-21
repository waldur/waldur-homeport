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
import { WizardFormSecondPage } from '@/proposals/update/rounds/WizardFormSecondPage';
import { getRoundInitialValues } from '@/proposals/utils';

interface EditRoundReviewDialogProps {
  resolve: {
    round: ProtectedRound;
    call: Call;
    refetch(): void;
  };
}

export const EditRoundReviewDialog: FC<EditRoundReviewDialogProps> = (
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
      title={translate('Edit round review')}
      onSubmit={submit}
      submitLabel={translate('Edit')}
      steps={[{ key: 'review', label: translate('Review'), completed: false }]}
      wizardForms={[WizardFormSecondPage]}
      initialValues={initialValues}
    />
  );
};
