import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import ReactStars from 'react-rating-stars-component';
import { useDispatch } from 'react-redux';
import { Field, reduxForm, InjectedFormProps } from 'redux-form';

import { RATING_STAR_ACTIVE_COLOR } from '@waldur/core/constants';
import { Tip } from '@waldur/core/Tooltip';
import { FieldError, FormGroup, TextField } from '@waldur/form';
import { FloatingButton } from '@waldur/form/FloatingButton';
import {
  VStepperFormStepCard,
  VStepperFormStepProps,
} from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { updateProposalReview } from '@waldur/proposals/api';
import { REVIEW_SUMMARY_FORM_ID } from '@waldur/proposals/constants';
import { getReviewStateOptions } from '@waldur/proposals/utils';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface FormData {
  summary_score: number;
  summary_public_comment: string;
  summary_private_comment: string;
}

type FormSummaryStepProps = VStepperFormStepProps &
  InjectedFormProps<FormData, VStepperFormStepProps>;

const FormSummaryStep: React.FC<FormSummaryStepProps> = (props) => {
  const { handleSubmit, params } = props;

  useEffect(() => {
    props.initialize({
      summary_score: params.reviews[0].summary_score,
      summary_public_comment: params.reviews[0].summary_public_comment,
      summary_private_comment: params.reviews[0].summary_private_comment,
    });
  }, [params]);

  const dispatch = useDispatch();

  const updateReview = async (formData: FormData) => {
    try {
      await updateProposalReview(formData, params.reviews[0].uuid);
      dispatch(showSuccess(translate('Review has been updated.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to update review.')));
    }
  };

  // Disable the button if the review is not in "in_review" or "created" state
  const disabled =
    params.reviews[0].state !== getReviewStateOptions()[1].value &&
    params.reviews[0].state !== getReviewStateOptions()[0].value;
  const Btn = (
    <Button disabled={disabled} onClick={handleSubmit(updateReview)}>
      {translate('Save summary')}
    </Button>
  );

  return (
    <VStepperFormStepCard
      title={translate('Summary')}
      step={props.step}
      id={props.id}
      completed={props.observed}
    >
      <Field
        name="summary_score"
        component={(fieldProps) => (
          <ReactStars
            count={5}
            size={24}
            edit={true}
            isHalf={false}
            activeColor={RATING_STAR_ACTIVE_COLOR}
            value={fieldProps.input.value || 0}
            onChange={(value) => fieldProps.input.onChange(value)}
          />
        )}
        label={translate('Final score')}
      />
      <Field
        name="summary_public_comment"
        component={FormGroup}
        maxLength={1000}
        label={translate('Comments')}
        placeholder={translate('Add your comment here')}
      >
        <TextField />
      </Field>
      <Field
        name="summary_private_comment"
        component={FormGroup}
        maxLength={1000}
        label={translate('Notes (not visible to user)')}
        placeholder={translate('Add your comment here')}
      >
        <TextField />
      </Field>
      <FloatingButton>
        {disabled ? (
          <Tip
            label={
              <FieldError
                error={translate('Reviews in final states are not editable')}
              />
            }
            id="save-summary-button-errors"
          >
            {Btn}
          </Tip>
        ) : (
          Btn
        )}
      </FloatingButton>
    </VStepperFormStepCard>
  );
};

export default reduxForm<FormData, VStepperFormStepProps>({
  form: REVIEW_SUMMARY_FORM_ID,
  enableReinitialize: false,
})(FormSummaryStep);
