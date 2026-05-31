import {
  ChatTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { AccordionCard } from '@/core/AccordionCard';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { FormSteps } from '@/wizard';

import { ProposalWorkflowActions } from '../manage/ProposalWorkflowActions';
import { ProposalUsersListSummary } from '../team/ProposalUsersListSummary';
import { Call, Proposal, ProposalReview } from '../types';

import { ComplianceSummary } from './create/ComplianceSummary';
import { ProjectDetailsSummary } from './create/ProjectDetailsSummary';
import { ProposalDetailsOverviewStep } from './create/ProposalDetailsOverviewStep';
import { ResourceRequestsSummary } from './create/ResourceRequestsSummary';
import { createProposalSteps } from './create/steps';
import {
  CreateManualAssignmentDialog,
  useCanCreateReview,
  useProposalDecisionActions,
} from './create/utils';

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

  const { openDialog } = useModal();
  const canCreateReview = useCanCreateReview(proposal);

  const isCallManagerView = state.name?.startsWith('call-management');

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <SidebarLayout.Container>
      <SidebarLayout.Body className="mb-10">
        {/* WorkflowTimeline lives in the page header (ProposalManagePage).
            The "Current step" card drives workflow transitions (complete /
            reject / advance). Applicants don't drive transitions, so hide it
            on the applicant tab — only the call-manager view shows it.
            Reviewers see a step badge on their own review page instead.
            TODO: Remove cast once the regenerated SDK ships
            `awaiting_manual_advance` on Proposal. */}
        {isCallManagerView && (
          <ProposalWorkflowActions
            proposalUuid={proposal.uuid}
            callUuid={proposal.call_uuid}
            awaitingManualAdvance={
              (proposal as any).awaiting_manual_advance ?? false
            }
          />
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
          <FormSteps steps={formSteps} hideStatusIcons />
        </Panel>
        {isCallManagerView && canCreateReview && (
          <ActionButton
            variant="secondary"
            action={() =>
              openDialog(CreateManualAssignmentDialog, {
                resolve: {
                  call: { uuid: proposal.call_uuid } as Call,
                  refetch,
                  initialProposal: proposal,
                },
                size: 'md',
              })
            }
            className="w-100 mt-2"
            iconNode={<ChatTextIcon weight="bold" />}
            title={translate('Create review')}
          />
        )}
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
