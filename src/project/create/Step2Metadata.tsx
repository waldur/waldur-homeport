import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import {
  projectsChecklistTemplateRetrieve,
  QuestionAdmin,
} from 'waldur-js-client';

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
  const customerUuid = props.values.customer?.uuid;
  const {
    data: checklistData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ProjectsChecklistTemplate', customerUuid],
    queryFn: () =>
      customerUuid
        ? projectsChecklistTemplateRetrieve({
            query: { parent_uuid: customerUuid },
          }).then((res) => res.data)
        : null,
    staleTime: 3 * 60 * 1000,
  });

  const questions = checklistData?.questions || [];

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
              question={question as QuestionAdmin}
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
