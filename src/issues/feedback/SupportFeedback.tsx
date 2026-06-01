import { useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { Form as BootstrapForm } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { supportFeedbacksCreate } from 'waldur-js-client';

import { SubmitButton, TextGroup } from '@/form';
import { withFormGroup } from '@/form/withFormGroup';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useTitle } from '@/navigation/title';
import { RateStars } from '@/proposals/proposal/create-review/RateStars';
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

const EvaluationGroup = withFormGroup(EvaluationField);

export const SupportFeedback = () => {
  useTitle(translate('Feedback'));
  const router = useRouter();

  const initialValues = useMemo(
    () => ({
      evaluation: parseInt(router.globals.params?.evaluation || '0', 10),
    }),
    [router.globals.params?.evaluation],
  );

  const { mutate, isPending } = useManagedMutation({
    mutationFn: (formData: any) =>
      supportFeedbacksCreate({
        body: {
          ...formData,
          token: router.globals.params.token,
        },
      }),
    successMessage: translate('Thank you for your response!'),
    errorMessage: translate('Unable to send feedback.'),
    closeModal: false,
    onSuccess: () => {
      router.stateService.go('login');
    },
  });

  return (
    <Form
      onSubmit={mutate}
      initialValues={initialValues}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit} className="center-vertically">
          <div className="size-sm">
            <EvaluationGroup
              name="evaluation"
              label={translate('Evaluation')}
            />

            <TextGroup
              name="comment"
              label={translate('Comment')}
              maxLength={150}
              rows={2}
              disabled={isPending}
            />

            <BootstrapForm.Group>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SubmitButton
                  disabled={invalid}
                  submitting={isPending}
                  label={translate('Submit')}
                />
              </div>
            </BootstrapForm.Group>
          </div>
        </form>
      )}
    />
  );
};
