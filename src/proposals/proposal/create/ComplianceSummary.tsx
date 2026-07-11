import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { proposalProposalsChecklistRetrieve } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { CHECKLIST_NO_CONFIGURED_MSG } from '@/marketplace-checklist/constants';
import { ParsedAnswer } from '@/project/metadata/ParsedAnswer';
import { Proposal } from '@/proposals/types';
import { useNotify } from '@/store/notify';

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
      proposalProposalsChecklistRetrieve({
        path: { uuid: proposal.uuid },
        query: { include_all: true },
      })
        .then((response) => response.data)
        .catch((err) => {
          const status = err.response?.status;
          if (
            (status === 400 &&
              err.response?.data?.detail === CHECKLIST_NO_CONFIGURED_MSG) ||
            status === 401 ||
            status === 403
          ) {
            // Not configured, or the viewer isn't permitted to see the
            // compliance answers — hide the section silently rather than
            // firing (and, via React Query's default retry, repeating) an
            // error toast on a read-only preview.
            return null;
          }
          showErrorResponse(
            err,
            translate('Unable to load compliance checklist.'),
          );
          throw err;
        }),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
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
