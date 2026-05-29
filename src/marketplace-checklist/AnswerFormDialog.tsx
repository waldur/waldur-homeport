import { FORM_ERROR } from 'final-form';
import { FC, useState } from 'react';
import { Form } from 'react-final-form';
import { Answer, projectsSubmitAnswers, QuestionAdmin } from 'waldur-js-client';

import { FieldError, SubmitButton } from '@/form';
import { FormFieldError } from '@/form/FormFieldError';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

import { QuestionAnswerField } from './QuestionAnswerField';

interface AnswerFormDialogProps {
  resolve: {
    question: QuestionAdmin;
    projectUuid: string;
    /** For edit mode */
    answer?: Answer;
    /** If not set, the question will replaced as title */
    title?: string;
    refetch?(): void;
  };
}

export const AnswerFormDialog: FC<AnswerFormDialogProps> = ({ resolve }) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const [hasFileError, setHasFileError] = useState(false);

  const question = resolve.question;

  const onSubmit = async (formData: { answer_data }) => {
    const answer = formData.answer_data;

    try {
      // File answers are sent as base64-encoded JSON ({ name, content }), so the
      // request stays a regular JSON payload for every question type.
      await projectsSubmitAnswers({
        path: { uuid: resolve.projectUuid },
        body: [
          {
            question_uuid: question.uuid,
            answer_data: answer ?? null,
          },
        ],
      });
      if (resolve.answer?.uuid) {
        showSuccess(translate('Answer submitted.'));
      } else {
        showSuccess(translate('Answer has been updated.'));
      }
      if (resolve.refetch) resolve.refetch();
      closeDialog();
    } catch (e) {
      showErrorResponse(e, translate('Unable to submit answer'));
      if (e.response && e.response.status === 400) {
        return { [FORM_ERROR]: e };
      }
      if (e?.[0]?.non_field_errors) {
        return { [FORM_ERROR]: e?.[0]?.non_field_errors };
      }
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ answer_data: resolve.answer?.answer_data }}
    >
      {({
        invalid,
        handleSubmit,
        submitting,
        submitError,
        modifiedSinceLastSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={resolve.title || question.description}
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={
                    (invalid && !modifiedSinceLastSubmit) || hasFileError
                  }
                  submitting={submitting}
                  label={translate('Save')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <FormGroup
              label={resolve.title ? question.description : undefined}
              required={question.required}
              spaceless
            >
              <QuestionAnswerField
                name="answer_data"
                question={question}
                onRejectionChange={setHasFileError}
              />
              <FormFieldError name="answer_data" />
            </FormGroup>

            {submitError && <FieldError error={submitError} />}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
