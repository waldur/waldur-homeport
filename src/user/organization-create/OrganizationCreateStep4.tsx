import { FunctionComponent, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';

import { ENV } from '@waldur/core/config';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

import { ChecklistQuestionField } from './ChecklistQuestionField';
import { fetchChecklistWithMetadata, QuestionWithMetadata } from './utils';

export const OrganizationCreateStep4: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  const [checklistQuestions, setChecklistQuestions] = useState<
    QuestionWithMetadata[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Fetch checklist for country on mount
  useEffect(() => {
    const fetchChecklist = async () => {
      setLoading(true);
      try {
        const country = ENV.plugins.WALDUR_CORE.ONBOARDING_COUNTRY;
        const { intentQuestions } = await fetchChecklistWithMetadata(country);
        setChecklistQuestions(intentQuestions);
      } catch {
        setChecklistQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, []);

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
