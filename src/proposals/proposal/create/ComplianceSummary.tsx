import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { proposalProposalsChecklistRetrieve } from 'waldur-js-client';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { CHECKLIST_NO_CONFIGURED_MSG } from '@waldur/marketplace-checklist/constants';
import { ParsedAnswer } from '@waldur/project/metadata/ParsedAnswer';
import { Proposal } from '@waldur/proposals/types';
import { useNotify } from '@waldur/store/hooks';

interface ComplianceSummaryProps {
  proposal: Proposal;
}

export const ComplianceSummary: FC<ComplianceSummaryProps> = ({ proposal }) => {
  const { showErrorResponse } = useNotify();

  const {
    data: checklistData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ProposalChecklistSummary', proposal.uuid],
    queryFn: () =>
      proposalProposalsChecklistRetrieve({ path: { uuid: proposal.uuid } })
        .then((response) => response.data)
        .catch((err) => {
          if (
            err.response?.status === 400 &&
            err.response?.data?.detail === CHECKLIST_NO_CONFIGURED_MSG
          ) {
            return null;
          }
          showErrorResponse(
            err,
            translate('Unable to load compliance checklist.'),
          );
          throw err;
        }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <AccordionCard
        title={translate('Compliance checklist')}
        subtitle={translate(
          'Compliance questions answered during proposal submission.',
        )}
        defaultOpen={false}
      >
        <LoadingSpinner />
      </AccordionCard>
    );
  }

  if (error || !checklistData) {
    return null; // Don't show anything if no compliance checklist
  }

  return (
    <AccordionCard
      title={translate('Compliance checklist')}
      subtitle={translate(
        'Compliance questions answered during proposal submission.',
      )}
      defaultOpen={false}
    >
      <FormTable>
        {checklistData.questions?.map((question) => (
          <FormTable.Item
            key={question.uuid}
            label={question.description}
            value={
              <ParsedAnswer
                question={question as any}
                answer={question.existing_answer as any}
              />
            }
          />
        ))}
      </FormTable>
    </AccordionCard>
  );
};
