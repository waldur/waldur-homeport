import { Star } from '@phosphor-icons/react';
import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import ReactStars from 'react-rating-stars-component';
import { useDispatch } from 'react-redux';
import { Field, reduxForm, InjectedFormProps } from 'redux-form';

import {
  RATING_STAR_ACTIVE_COLOR,
  RATING_STAR_INACTIVE_COLOR,
} from '@waldur/core/constants';
import { Panel } from '@waldur/core/Panel';
import { Tip } from '@waldur/core/Tooltip';
import { FormGroup, SubmitButton, TextField, FieldError } from '@waldur/form';
import { FloatingButton } from '@waldur/form/FloatingButton';
import { TosNotification } from '@waldur/form/TosNotification';
import { VStepperFormStepProps } from '@waldur/form/VStepperFormStep';
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
    <div className="d-flex flex-column gap-5">
      <Panel title={props.title} id={props.id}>
        <Field
          name="summary_score"
          component={(fieldProps) => (
            <FormGroup {...fieldProps} label={translate('Rate')}>
              <div className="d-flex align-items-center gap-4">
                <ReactStars
                  count={5}
                  size={20}
                  edit={true}
                  isHalf={false}
                  emptyIcon={<Star weight="fill" />}
                  filledIcon={<Star weight="fill" />}
                  color={RATING_STAR_INACTIVE_COLOR}
                  activeColor={RATING_STAR_ACTIVE_COLOR}
                  value={fieldProps.input.value || 0}
                  onChange={(value) => fieldProps.input.onChange(value)}
                />
                <span className="text-gray-700 mt-2">
                  {fieldProps.input.value === 1
                    ? translate('1 star')
                    : translate('{count} stars', {
                        count: fieldProps.input.value,
                      })}
                </span>
              </div>
            </FormGroup>
          )}
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
          placeholder={translate('Add your notes here')}
        >
          <TextField />
        </Field>
        {/* <Button onClick={handleSubmit(updateReview)}>
          {translate('Save summary')}
        </Button> */}
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
      </Panel>

      <SubmitButton
        submitting={props.submitting}
        label={translate('Submit review')}
      />
      <TosNotification className="text-center text-grey-500 mb-0" />
    </div>
  );
};

export default reduxForm<FormData, VStepperFormStepProps>({
  form: REVIEW_SUMMARY_FORM_ID,
  enableReinitialize: false,
})(FormSummaryStep);
