import { FC } from 'react';
import { Form } from 'react-final-form';
import { Answer, QuestionWithAnswer } from 'waldur-js-client';

import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ParsedAnswer } from '@/project/metadata/ParsedAnswer';

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
  const onSubmitMutation = useManagedMutation<any, any, { comment: string }>({
    mutationFn: (formData) =>
      Promise.resolve({
        path: { uuid: resolve.offeringUserUuid },
        body: { comment: formData.comment },
      }),
    successMessage: translate('Review submitted.'),
    errorMessage: translate('Unable to submit review'),
    refetch: resolve.refetch,
  });

  return (
    <Form<{ comment: string }>
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
    >
      {({ invalid, handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Review')}
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
            <TextGroup
              name="comment"
              placeholder={translate('Enter a description...')}
              label={translate('Comment')}
              spaceless
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
