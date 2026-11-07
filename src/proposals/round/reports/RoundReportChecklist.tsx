import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  roundMeetingNotesChecklistRetrieve,
  roundMeetingNotesSubmitAnswers,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ComplianceStatusBadge } from '@/proposals/proposal/ComplianceStatusBadge';
import { extractComplianceAnswers } from '@/proposals/proposal/create/complianceUtils';
import {
  checklistInitialValues,
  ChecklistQuestions,
} from '@/proposals/proposal/StepChecklistSection';

const roundReportChecklistKey = (reportUuid: string) =>
  ['round-report-checklist', reportUuid] as const;

/**
 * The form of a round report's step, answered once for the report by its
 * author while it is a draft; read-only for everyone else who reads it.
 */
export const RoundReportChecklist: FC<{
  reportUuid: string;
  canEdit: boolean;
}> = ({ reportUuid, canEdit }) => {
  const { data, isLoading } = useQuery({
    queryKey: roundReportChecklistKey(reportUuid),
    queryFn: () =>
      roundMeetingNotesChecklistRetrieve({
        path: { uuid: reportUuid },
        query: { include_all: true },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
  });
  const questions = useMemo(() => data?.questions ?? [], [data]);
  const initialValues = useMemo(
    () => checklistInitialValues(questions),
    [questions],
  );

  const save = useManagedMutation<any, any, Record<string, unknown>>({
    mutationFn: (values) =>
      roundMeetingNotesSubmitAnswers({
        path: { uuid: reportUuid },
        body: extractComplianceAnswers(values, { questions }),
      }),
    successMessage: translate('Answers saved.'),
    errorMessage: translate('Unable to save the answers.'),
    invalidateQueries: [{ queryKey: roundReportChecklistKey(reportUuid) }],
    closeModal: false,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (!questions.length) {
    return null;
  }
  return (
    <Form
      onSubmit={(values) => save.mutate(values)}
      initialValues={initialValues}
    >
      {({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-3">
            <h5 className="mb-0">{data?.checklist?.name}</h5>
            {data?.completion ? (
              <ComplianceStatusBadge
                status={{
                  has_checklist: true,
                  is_completed: data.completion.is_completed,
                  completion_percentage: data.completion.completion_percentage,
                }}
              />
            ) : null}
          </div>
          <ChecklistQuestions
            questions={questions}
            values={values}
            canEdit={canEdit}
          />
          {canEdit ? (
            <div className="flex justify-end mt-3">
              <SubmitButton
                submitting={save.isPending}
                label={translate('Save answers')}
              />
            </div>
          ) : null}
        </form>
      )}
    </Form>
  );
};
