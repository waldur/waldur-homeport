import * as React from 'react';
import ReactStars from 'react-rating-stars-component';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { addFeedback } from '@waldur/issues/feedback/api';
import { SUPPORT_FEEDBACK_FORM_ID } from '@waldur/issues/feedback/constants';
import { useTitle } from '@waldur/navigation/title';
import './SupportFeedback.scss';
import { showError, showSuccess, stateGo } from '@waldur/store/coreSaga';

const SupportFeedbackContainer = (props) => {
  useTitle(translate('Feedback'));
  const dispatch = useDispatch();

  const submitRequest = async (formData) => {
    try {
      await addFeedback({
        ...formData,
        token: props.$stateParams.token,
      });
      dispatch(showSuccess(translate('Thank you for your response!')));
      dispatch(stateGo('login'));
    } catch (error) {
      const errorMessage = `${translate('Unable to send feedback.')} ${format(
        error,
      )}`;
      dispatch(showError(errorMessage));
    }
  };

  return (
    <>
      <form
        onSubmit={props.handleSubmit(submitRequest)}
        className="form-horizontal center-vertically"
      >
        <FormContainer
          submitting={props.submitting}
          labelClass="col-sm-2"
          controlClass="col-sm-8"
        >
          <Field
            name="evaluation"
            label={translate('Evaluation')}
            component={(fieldProps) => (
              <ReactStars
                count={5}
                size={24}
                edit={true}
                isHalf={false}
                activeColor="#ffd700"
                value={fieldProps.input.value}
                onChange={(value) => fieldProps.input.onChange(value)}
              />
            )}
          />

          <TextField
            name="comment"
            label={translate('Comment')}
            maxLength={150}
            rows={2}
          />

          <div className="form-group">
            <div
              className="col-sm-8 col-sm-offset-2"
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <SubmitButton
                disabled={props.invalid}
                submitting={props.submitting}
                label={translate('Submit')}
              />
            </div>
          </div>
        </FormContainer>
      </form>
    </>
  );
};

const mapStateToProps = (_state, ownProps) => ({
  initialValues: {
    evaluation: parseInt(ownProps.$stateParams.evaluation),
  },
});

const connector = connect(mapStateToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: SUPPORT_FEEDBACK_FORM_ID,
  }),
);

export const SupportFeedback = enhance(SupportFeedbackContainer);
