import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';

import { isAllocationDecisionStep } from '../workflow/constants';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';

/**
 * The comment recorded with the allocation decision, once the viewer may
 * read it. The backend strips it from the applicant's payload while the
 * decision is held for the round's publication, so a completed decision
 * with a comment is one the applicant is meant to see.
 */
export const getAllocationDecisionComment = (
  steps: ProposalWorkflowStepInstance[] | undefined,
): string | undefined => {
  const decision = (steps ?? []).find(isAllocationDecisionStep);
  if (decision?.status !== 'completed') return undefined;
  return decision.outcome_reason?.trim() || undefined;
};

export const AllocationDecisionComment: FC<{
  proposalUuid: string;
  className?: string;
}> = ({ proposalUuid, className }) => {
  const { data } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposalUuid),
    queryFn: () => fetchProposalWorkflowStates(proposalUuid),
  });
  const comment = getAllocationDecisionComment(data);
  if (!comment) return null;
  return (
    <AlertItem
      variant="info"
      type="floating"
      className={className}
      title={translate('Comment on the allocation decision')}
      body={<span className="whitespace-pre-line">{comment}</span>}
      data-testid="allocation-decision-comment"
    />
  );
};
