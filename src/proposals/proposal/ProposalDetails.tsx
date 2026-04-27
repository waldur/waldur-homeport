import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { AccordionCard } from '@/core/AccordionCard';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { FormSteps } from '@/form/FormSteps';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';

import { ProposalUsersListSummary } from '../team/ProposalUsersListSummary';
import { Proposal, ProposalReview } from '../types';

import { ComplianceSummary } from './create/ComplianceSummary';
import { ProjectDetailsSummary } from './create/ProjectDetailsSummary';
import { ProposalDecisionResult } from './create/ProposalDecisionResult';
import { ProposalDetailsOverviewStep } from './create/ProposalDetailsOverviewStep';
import { ResourceRequestsSummary } from './create/ResourceRequestsSummary';
import { createProposalSteps } from './create/steps';
import { useProposalDecisionActions } from './create/utils';

interface ProposalDetails {
  proposal: Proposal;
  reviews?: ProposalReview[];
  isLoading?;
  error?;
  refetch;
}

export const ProposalDetails = ({
  proposal,
  reviews = [],
  isLoading,
  error,
  refetch,
}: ProposalDetails) => {
  const { state } = useCurrentStateAndParams();

  // Calculate steps based on proposal compliance status (same logic as submission step)
  const proposalHasCompliance = proposal.compliance_status !== null;

  const formSteps = useMemo(() => {
    const fakeCallForSteps = proposalHasCompliance
      ? { compliance_checklist: 'exists' }
      : undefined;
    const steps = createProposalSteps(fakeCallForSteps);
    return steps;
  }, [proposalHasCompliance]);

  const {
    canPerformDecisionActions,
    handleApproveProposal,
    handleRejectProposal,
  } = useProposalDecisionActions(proposal, refetch);

  const isCallManagerView = state.name?.startsWith('call-management');

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  const hasSubmittedReviews = useMemo(() => {
    return reviews && Array.isArray(reviews) && reviews.length > 0;
  }, [reviews]);

  return (
    <SidebarLayout.Container>
      <SidebarLayout.Body className="mb-10">
        {(['rejected', 'accepted'].includes(proposal.state) ||
          (isCallManagerView && hasSubmittedReviews)) && (
          <ProposalDecisionResult proposal={proposal} reviews={reviews} />
        )}
        <ProposalDetailsOverviewStep id="step-general" params={{ proposal }} />
        <ProjectDetailsSummary proposal={proposal} reviews={reviews} />
        {proposalHasCompliance && (
          <div id="step-compliance">
            <ComplianceSummary proposal={proposal} />
          </div>
        )}
        <ResourceRequestsSummary proposal={proposal} reviews={reviews} />
        <AccordionCard
          id="step-team"
          title={translate('Project team')}
          subtitle={translate('Team members and their roles in the project.')}
          defaultOpen={!proposalHasCompliance}
        >
          <ProposalUsersListSummary scope={proposal} reviews={reviews} />
        </AccordionCard>
      </SidebarLayout.Body>
      <SidebarLayout.Sidebar transparent>
        <Panel title={translate('Progress')} cardBordered className="mb-5">
          <FormSteps steps={formSteps} />
        </Panel>
        {canPerformDecisionActions && isCallManagerView && (
          <>
            <ActionButton
              variant="primary"
              action={handleApproveProposal}
              className="w-100 mt-2"
              iconNode={<CheckCircleIcon weight="bold" />}
              title={translate('Accept')}
            />
            <ActionButton
              variant="danger"
              action={handleRejectProposal}
              className="w-100 mt-2"
              iconNode={<XCircleIcon weight="bold" />}
              title={translate('Reject')}
            />
          </>
        )}
      </SidebarLayout.Sidebar>
    </SidebarLayout.Container>
  );
};
