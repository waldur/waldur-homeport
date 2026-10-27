import { FunctionComponent, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useFormState } from 'react-final-form';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { ChecklistQuestionField } from './ChecklistQuestionField';
import { OrganizationCreateFormValues } from './types';
import { QuestionWithMetadata } from './utils';

interface OrganizationCreateStep4Props {
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

  const { values } = useFormState<OrganizationCreateFormValues>({
    subscription: { values: true },
  });

  // Get all form values for dependency evaluation
  const allFormValues = checklistQuestions.reduce(
    (acc, q) => {
      const key = `question_${q.uuid}`;
      acc[key] = values[key];
      return acc;
    },
    {} as Record<string, any>,
  );

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
    <div className="flex flex-col gap-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-6">
          <h5 className="mb-3 font-semibold">{translate('Your Intent')}</h5>
          <p className="text-quaternary mb-5">
            {translate(
              'Please provide additional information about your organization and goals.',
            )}
          </p>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="flex flex-col gap-3">
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
  );
};
