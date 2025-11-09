import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import { checklistsAdminQuestionsList } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { FormFieldError } from '@waldur/form/FormFieldError';
import {
  WizardFinalForm,
  WizardFinalFormStepProps,
} from '@waldur/form/WizardFinalForm';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { QuestionAnswerField } from '@waldur/marketplace-checklist/QuestionAnswerField';

export const Step2Metadata: FC<WizardFinalFormStepProps> = (props) => {
  // Fetch customer checklist questions
  const checklistUuid = props.values.customer?.project_metadata_checklist;
  const {
    data: questions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ChecklistQuestions', checklistUuid],
    queryFn: () =>
      checklistUuid
        ? checklistsAdminQuestionsList({
            query: { checklist_uuid: checklistUuid, page_size: 300 },
          }).then((res) => res.data)
        : null,
    staleTime: 3 * 60 * 1000,
  });

  // Store questions in the form data to access it in the submit function
  useEffect(() => {
    if (questions?.length) {
      props.form.change('questions', questions);
    }
  }, [questions]);

  return (
    <WizardFinalForm {...props} submitDisabled={Boolean(error) || isLoading}>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load questions.')}
          loadData={refetch}
        />
      ) : questions?.length ? (
        questions.map((question) => (
          <FormGroup
            key={question.uuid}
            label={question.description}
            required={question.required}
          >
            <QuestionAnswerField
              name={`metadata.${question.uuid}`}
              question={question}
            />
            <FormFieldError name={`metadata.${question.uuid}`} />
          </FormGroup>
        ))
      ) : (
        <p className="text-center">{translate('There is no checklist.')}</p>
      )}
    </WizardFinalForm>
  );
};
