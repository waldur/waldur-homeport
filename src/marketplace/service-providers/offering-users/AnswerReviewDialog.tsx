import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { Answer, QuestionWithAnswer } from 'waldur-js-client';

import { SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ParsedAnswer } from '@waldur/project/metadata/ParsedAnswer';
import { useNotify } from '@waldur/store/hooks';

interface AnswerReviewDialogProps {
  resolve: {
    question: QuestionWithAnswer;
    offeringUserUuid: string;
    answer?: Answer;
    refetch?(): void;
  };
}

export const AnswerReviewDialog: FC<AnswerReviewDialogProps> = ({
  resolve,
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const onSubmit = async (formData: { comment }) => {
    try {
      await Promise.resolve({
        path: { uuid: resolve.offeringUserUuid },
        body: { comment: formData.comment },
      });

      showSuccess(translate('Review submitted.'));
      if (resolve.refetch) resolve.refetch();
      closeDialog();
    } catch (e) {
      showErrorResponse(e, translate('Unable to submit review'));
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      {({ invalid, handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Review')}
            closeButton
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Save')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <h6 className="fw-bold mb-3">{translate('Question')}:</h6>
            <p className="text-gray-700 fs-6 mb-6">
              {resolve.question.description}
            </p>
            <h6 className="fw-bold mb-3">{translate('Answer')}:</h6>
            <p className="text-gray-700 fs-6">
              <ParsedAnswer
                question={resolve.question as any}
                answer={resolve.question.existing_answer as any}
              />
            </p>
            <hr />
            <FormGroup label={translate('Comment')} spaceless>
              <Field
                name="comment"
                placeholder={translate('Enter a description...')}
                component={TextField as any}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
