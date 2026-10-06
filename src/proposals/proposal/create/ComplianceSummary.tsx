import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { proposalProposalsChecklistRetrieve } from 'waldur-js-client';

import { AccordionCard } from 'waldur-ui';

import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { CHECKLIST_NO_CONFIGURED_MSG } from '@/marketplace-checklist/constants';
import { ParsedAnswer } from '@/project/metadata/ParsedAnswer';
import { usesCallVocabulary } from '@/proposals/presentation';
import { Proposal } from '@/proposals/types';
import { useNotify } from '@/store/notify';

import { proposalHasCompliance } from './complianceUtils';

/** Rendered twice below — the loading card and the loaded one — so the two
 *  cannot drift apart when the wording changes. */
const complianceSubtitle = () =>
  usesCallVocabulary()
    ? translate('Compliance questions answered during proposal submission.')
    : translate(
        'Compliance questions answered when the request was submitted.',
      );

/**
 * The applicant's compliance answers. Resolves to null when the call has no
 * checklist or the viewer may not read the answers, so a caller can leave the
 * section out. Shared by the section and the page that lists it in its
 * navigation, which then issue one request between them.
 */
const useProposalComplianceChecklist = (
  proposalUuid: string | undefined,
  enabled = true,
) => {
  const { showErrorResponse } = useNotify();

  return useQuery({
    queryKey: ['ProposalChecklistSummary', proposalUuid],
    queryFn: () =>
      proposalProposalsChecklistRetrieve({
        path: { uuid: proposalUuid },
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
    enabled: enabled && !!proposalUuid,
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });
};

/**
 * Whether a page lists the compliance section for the current viewer: the
 * proposal was submitted under a checklist and the viewer may read the
 * answers. Listed while the answers load, so the navigation does not jump;
 * dropped once they turn out to be unavailable, since the section then
 * renders nothing for the navigation to point at.
 */
export const useShowsComplianceSection = (
  proposal: Pick<Proposal, 'uuid' | 'compliance_status'> | undefined,
): boolean => {
  const mayHaveCompliance = proposalHasCompliance(proposal);
  const { data, error } = useProposalComplianceChecklist(
    proposal?.uuid,
    mayHaveCompliance,
  );
  return mayHaveCompliance && data !== null && !error;
};

interface ComplianceSummaryProps {
  proposal: Proposal;
  /** Anchor for in-page navigation, set while loading too so a link to the
   *  section lands on it from the start. */
  id?: string;
}

export const ComplianceSummary: FC<ComplianceSummaryProps> = ({
  proposal,
  id,
}) => {
  const {
    data: checklistData,
    isLoading,
    error,
  } = useProposalComplianceChecklist(proposal.uuid);

  if (isLoading) {
    return (
      <AccordionCard
        id={id}
        title={translate('Compliance checklist')}
        subtitle={complianceSubtitle()}
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
      id={id}
      title={translate('Compliance checklist')}
      subtitle={complianceSubtitle()}
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
