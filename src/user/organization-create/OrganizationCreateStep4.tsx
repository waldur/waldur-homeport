import { FunctionComponent, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector, shallowEqual } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';

import { ChecklistQuestionField } from './ChecklistQuestionField';
import { QuestionWithMetadata } from './utils';

interface OrganizationCreateStep4Props extends WizardFormStepProps {
  getChecklistData?: () => Promise<{
    allQuestions: any[];
    customerQuestions: any[];
    intentQuestions: any[];
    checklistCustomerUuid: string;
    checklistIntentUuid: string;
  }>;
}

export const OrganizationCreateStep4: FunctionComponent<
  OrganizationCreateStep4Props
> = (props) => {
  const [checklistQuestions, setChecklistQuestions] = useState<
    QuestionWithMetadata[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [checklistFetched, setChecklistFetched] = useState(false);

  const selector = formValueSelector(props.form);

  // Get all form values for dependency evaluation
  const allFormValues = useSelector((state) => {
    const questionFields = checklistQuestions.reduce(
      (acc, q) => {
        acc[`question_${q.uuid}`] = selector(state, `question_${q.uuid}`);
        return acc;
      },
      {} as Record<string, any>,
    );
    return questionFields;
  }, shallowEqual);

  // Fetch checklist for country on mount
  useEffect(() => {
    if (checklistFetched) return;

    const fetchChecklist = async () => {
      if (!props.getChecklistData) {
        return;
      }

      setLoading(true);
      try {
        const data = await props.getChecklistData();
        setChecklistQuestions(data.intentQuestions);
        setChecklistFetched(true);
      } catch {
        setChecklistQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [checklistFetched]);

  return (
    <WizardForm {...props}>
      <div className="d-flex flex-column gap-5">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-8">
            <h5 className="mb-4 fw-semibold">{translate('Your Intent')}</h5>
            <p className="text-muted mb-6">
              {translate(
                'Please provide additional information about your organization and goals.',
              )}
            </p>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="d-flex flex-column gap-4">
                {checklistQuestions.map((question) => (
                  <ChecklistQuestionField
                    key={question.uuid}
                    question={question}
                    allQuestions={checklistQuestions}
                    formValues={allFormValues}
                  />
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </WizardForm>
  );
};
