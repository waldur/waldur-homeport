import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import {
  projectsChecklistTemplateRetrieve,
  QuestionAdmin,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { FormFieldError } from '@/form/FormFieldError';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { QuestionAnswerField } from '@/marketplace-checklist/QuestionAnswerField';
import { WizardModal, WizardStepProps } from '@/wizard';

export const Step2Metadata: FC<WizardStepProps> = (props) => {
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
    staleTime: UI_STALE_TIME,
  });

  const questions = checklistData?.questions || [];

  // Store questions in the form data to access it in the submit function
  useEffect(() => {
    if (questions?.length) {
      props.form.change('questions', questions);
    }
  }, [questions]);

  return (
    <WizardModal {...props} submitDisabled={Boolean(error) || isLoading}>
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
    </WizardModal>
  );
};
