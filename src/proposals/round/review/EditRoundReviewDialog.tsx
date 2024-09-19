import { FC, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { updateCallRound } from '@waldur/proposals/api';
import { RoundFormData, Call, Round } from '@waldur/proposals/types';
import { WizardFormSecondPage } from '@waldur/proposals/update/rounds/WizardFormSecondPage';
import { getRoundInitialValues } from '@waldur/proposals/utils';

interface EditRoundReviewDialogProps {
  resolve: {
    round: Round;
    call: Call;
    refetch(): void;
  };
}

export const EditRoundReviewDialog: FC<EditRoundReviewDialogProps> = (
  props,
) => {
  const initialValues = useMemo(
    () => getRoundInitialValues(props.resolve.round),
    [props.resolve],
  );
  const dispatch = useDispatch();
  const submit = useCallback(
    (formData: RoundFormData, _dispatch, formProps) => {
      const updatedRound = {
        ...initialValues,
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
    [dispatch, props.resolve, initialValues],
  );

  return (
    <WizardFormContainer
      form="RoundEditForm"
      title={translate('Edit round review')}
      onSubmit={submit}
      submitLabel={translate('Edit')}
      steps={[translate('Review')]}
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
