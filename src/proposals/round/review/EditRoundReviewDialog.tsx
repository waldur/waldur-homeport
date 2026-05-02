import { FC, useCallback, useMemo } from 'react';
import {
  proposalProtectedCallsRoundsUpdate,
  ProtectedRound,
  ProtectedRoundRequest,
} from 'waldur-js-client';

import { WizardFormContainer } from '@/form/WizardFormContainer';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
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
    [],
  );
  const { closeDialog } = useModal();
  const submit = useCallback(
    (formData: ProtectedRoundRequest, _dispatch, formProps) => {
      return proposalProtectedCallsRoundsUpdate({
        path: {
          uuid: props.resolve.call.uuid,
          obj_uuid: props.resolve.round.uuid,
        },
        body: {
          ...initialValues,
          ...formData,
        },
      }).then(() => {
        formProps.destroy();
        closeDialog();
        props.resolve.refetch();
      });
    },
    [initialValues],
  );

  return (
    <WizardFormContainer
      form="RoundEditForm"
      title={translate('Edit round review')}
      onSubmit={submit}
      submitLabel={translate('Edit')}
      steps={[{ key: 'review', label: translate('Review'), completed: false }]}
      wizardForms={[WizardFormSecondPage]}
      initialValues={{
        review_strategy: initialValues.review_strategy,
        review_duration_in_days: initialValues.review_duration_in_days,
        minimum_number_of_reviewers: initialValues.minimum_number_of_reviewers,
        cutoff_time: initialValues.cutoff_time, // this is only for calculate "Latest review completion date"
      }}
    />
  );
};
