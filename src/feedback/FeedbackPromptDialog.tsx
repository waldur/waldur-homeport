import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  FeedbackPrompt,
  feedbackRequestsChecklistRetrieve,
  feedbackRequestsDismiss,
  feedbackRequestsLater,
  feedbackRequestsRetrieve,
  feedbackRequestsSubmitAnswers,
  QuestionAdmin,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { composeValidators, required } from '@/core/validators';
import { FormGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { QuestionAnswerField } from '@/marketplace-checklist/QuestionAnswerField';
import {
  DependencyInfo,
  evaluateQuestionVisibility,
} from '@/marketplace-checklist/questionDependencies';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { answerFieldName as fieldName, buildAnswers } from './answers';
import { RatingField, validateRating } from './RatingField';

interface FeedbackPromptDialogProps {
  resolve: { prompt: FeedbackPrompt };
}

export const FeedbackPromptDialog: FC<FeedbackPromptDialogProps> = ({
  resolve: { prompt },
}) => {
  const { closeDialog } = useModal();
  const { showErrorResponse } = useNotify();
  const path = { uuid: prompt.request_uuid };

  const { data, isLoading } = useQuery({
    queryKey: ['FeedbackPromptChecklist', prompt.request_uuid],
    queryFn: () =>
      feedbackRequestsChecklistRetrieve({
        path,
        query: { include_all: true },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
  });

  const fieldNames = useMemo(
    () =>
      (data?.questions || []).reduce(
        (acc, question) => {
          acc[question.description] = fieldName(question.uuid);
          return acc;
        },
        {} as Record<string, string>,
      ),
    [data],
  );

  // Answers kept by an earlier "Later" pre-fill the form.
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        (data?.questions || [])
          .filter((question) => question.existing_answer)
          .map((question) => [
            fieldName(question.uuid),
            question.existing_answer.answer_data,
          ]),
      ),
    [data],
  );

  const storedUuids = useMemo(
    () =>
      new Set<string>(
        (data?.questions || [])
          .filter((question) => question.existing_answer)
          .map((question) => question.uuid),
      ),
    [data],
  );

  const getVisibleQuestions = (values) =>
    (data?.questions || []).filter((question) =>
      evaluateQuestionVisibility(
        question.dependencies_info as DependencyInfo,
        fieldNames,
        values || {},
      ),
    );

  const toAnswers = (values) =>
    buildAnswers(
      data?.questions || [],
      new Set<string>(
        getVisibleQuestions(values).map((question) => question.uuid),
      ),
      values,
      storedUuids,
    );

  const finish = (action: () => Promise<unknown>, errorMessage: string) => {
    closeDialog();
    action().catch((error) => showErrorResponse(error, errorMessage));
  };
  const later = (values) =>
    finish(
      () => feedbackRequestsLater({ path, body: toAnswers(values) }),
      translate('Unable to save your answers.'),
    );

  const submitMutation = useManagedMutation<any, any, Record<string, any>>({
    mutationFn: async (values) => {
      await feedbackRequestsSubmitAnswers({ path, body: toAnswers(values) });
      // The request stays pending unless the backend counts it as answered.
      const { data: request } = await feedbackRequestsRetrieve({ path });
      if (request.state !== 'answered') {
        throw new Error(translate('Please answer the required questions.'));
      }
    },
    successMessage: translate('Thank you for your feedback.'),
    errorMessage: translate('Unable to submit your feedback.'),
  });

  return (
    <Form
      onSubmit={(values) => submitMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={prompt.survey.name}
            // Closing with × counts as "Later".
            onHide={() => later(values)}
            footer={
              <>
                <BaseButton
                  disabled={submitting}
                  disabledReason={translate(
                    'Your answers are being submitted.',
                  )}
                  variant="text-secondary"
                  size="lg"
                  label={translate("Don't ask again")}
                  onClick={() =>
                    finish(
                      () => feedbackRequestsDismiss({ path }),
                      translate('Unable to save your choice.'),
                    )
                  }
                />
                <BaseButton
                  disabled={submitting}
                  disabledReason={translate(
                    'Your answers are being submitted.',
                  )}
                  variant="tertiary"
                  size="lg"
                  label={translate('Later')}
                  onClick={() => later(values)}
                />
                <SubmitButton
                  disabled={invalid || isLoading}
                  disabledReason={
                    invalid
                      ? translate(
                          'Answer the required questions and fix the highlighted answers.',
                        )
                      : undefined
                  }
                  submitting={submitting}
                  label={translate('Submit')}
                />
              </>
            }
          >
            {prompt.survey.intro ? (
              <div className="mb-6 text-sm text-quaternary">
                <SafeMarkdown text={prompt.survey.intro} />
              </div>
            ) : null}
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              getVisibleQuestions(values).map((question, index, visible) => (
                <FormGroup
                  key={question.uuid}
                  label={question.description}
                  description={question.user_guidance}
                  required={question.required}
                  spaceless={index === visible.length - 1}
                >
                  {question.question_type === 'rating' ? (
                    <Field
                      name={fieldName(question.uuid)}
                      component={RatingField}
                      question={question}
                      validate={composeValidators(
                        ...(question.required ? [required] : []),
                        validateRating(question),
                      )}
                    />
                  ) : (
                    <QuestionAnswerField
                      name={fieldName(question.uuid)}
                      question={question as unknown as QuestionAdmin}
                    />
                  )}
                </FormGroup>
              ))
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
