import { useRouter } from '@uirouter/react';
import { Form } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';
import { supportFeedbacksCreate } from 'waldur-js-client';

import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { SUPPORT_FEEDBACK_FORM_ID } from '@waldur/issues/feedback/constants';
import { useTitle } from '@waldur/navigation/title';
import { RateStars } from '@waldur/proposals/proposal/create-review/RateStars';
import { router } from '@waldur/router';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import './SupportFeedback.scss';

const SupportFeedbackContainer = (props) => {
  useTitle(translate('Feedback'));
  const dispatch = useDispatch();
  const router = useRouter();

  const submitRequest = async (formData) => {
    try {
      await supportFeedbacksCreate({
        body: {
          ...formData,
          token: router.globals.params.token,
        },
      });
      dispatch(showSuccess(translate('Thank you for your response!')));
      router.stateService.go('login');
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to send feedback.')));
    }
  };

  return (
    <form
      onSubmit={props.handleSubmit(submitRequest)}
      className="center-vertically"
    >
      <FormContainer submitting={props.submitting}>
        <Field
          name="evaluation"
          label={translate('Evaluation')}
          component={(fieldProps) => (
            <RateStars
              count={10}
              size={24}
              edit
              isHalf={false}
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

        <Form.Group>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Submit')}
            />
          </div>
        </Form.Group>
      </FormContainer>
    </form>
  );
};

const mapStateToProps = () => ({
  initialValues: {
    evaluation: parseInt(router.globals.params?.evaluation || 0, 10),
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
