import { useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { Form as BootstrapForm } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { supportFeedbacksCreate } from 'waldur-js-client';

import { FormContainer, SubmitButton, TextField } from '@/form';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { RateStars } from '@/proposals/proposal/create-review/RateStars';
import { useNotify } from '@/store/notify';
import './SupportFeedback.scss';

const EvaluationField = (props) => (
  <RateStars
    count={10}
    size={24}
    edit
    isHalf={false}
    value={props.input.value}
    onChange={props.input.onChange}
  />
);

export const SupportFeedback = () => {
  useTitle(translate('Feedback'));
  const { showErrorResponse, showSuccess } = useNotify();
  const router = useRouter();

  const initialValues = useMemo(
    () => ({
      evaluation: parseInt(router.globals.params?.evaluation || '0', 10),
    }),
    [router.globals.params?.evaluation],
  );

  const submitRequest = async (formData) => {
    try {
      await supportFeedbacksCreate({
        body: {
          ...formData,
          token: router.globals.params.token,
        },
      });
      showSuccess(translate('Thank you for your response!'));
      router.stateService.go('login');
    } catch (error) {
      showErrorResponse(error, translate('Unable to send feedback.'));
    }
  };

  return (
    <Form
      onSubmit={submitRequest}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} className="center-vertically">
          <FormContainer submitting={submitting}>
            <EvaluationField
              name="evaluation"
              label={translate('Evaluation')}
            />

            <TextField
              name="comment"
              label={translate('Comment')}
              maxLength={150}
              rows={2}
            />

            <BootstrapForm.Group>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Submit')}
                />
              </div>
            </BootstrapForm.Group>
          </FormContainer>
        </form>
      )}
    />
  );
};
