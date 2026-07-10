import { ChatTextIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { AccordionCard } from '@/core/AccordionCard';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { isReviewInFinalState } from '@/proposals/utils';
import { ActionButton } from '@/table/ActionButton';
import { FormSteps } from '@/wizard';

import { ProposalUsersListSummary } from '../team/ProposalUsersListSummary';
import { Call, Proposal, ProposalReview } from '../types';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';

import { AwardResponseActions } from './AwardResponseActions';
import { ComplianceSummary } from './create/ComplianceSummary';
import { ProjectDetailsSummary } from './create/ProjectDetailsSummary';
import { ProposalDetailsOverviewStep } from './create/ProposalDetailsOverviewStep';
import { ResourceRequestsSummary } from './create/ResourceRequestsSummary';
import { createProposalSteps } from './create/steps';
import {
  CreateManualAssignmentDialog,
  useCanCreateReview,
} from './create/utils';
import { SubmitReviewDialog } from './create-review/SubmitReviewDialog';
import { WorkflowStepActions } from './WorkflowStepActions';

interface ProposalDetails {
  proposal: Proposal;
  reviews?: ProposalReview[];
  /** The viewer's own review, if any — drives the "Submit review" action. */
  review?: ProposalReview;
  isLoading?;
  error?;
  refetch;
}

export const ProposalDetails = ({
  proposal,
  reviews = [],
  review,
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

  const { openDialog } = useModal();
  const canCreateReview = useCanCreateReview(proposal);

  const isCallManagerView = state.name?.startsWith('call-management');

  // Proposal decisions are made by completing the per-proposal workflow steps
  // (see WorkflowStepActions) — the single decision/provisioning path. The
  // legacy one-click Accept/Reject shortcut has been removed.
  const { data: workflowStates } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposal.uuid),
    queryFn: () => fetchProposalWorkflowStates(proposal.uuid),
  });
  const hasWorkflow = (workflowStates ?? []).some(
    (s) => s.status !== 'skipped',
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <SidebarLayout.Container>
      <SidebarLayout.Body className="mb-10">
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
        {isCallManagerView && review && !isReviewInFinalState(review.state) && (
          <ActionButton
            variant="primary"
            action={() =>
              openDialog(SubmitReviewDialog, { resolve: { review, refetch } })
            }
            className="w-100 mt-2"
            iconNode={<PaperPlaneTiltIcon weight="bold" />}
            title={translate('Submit review')}
          />
        )}
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
        {isCallManagerView && hasWorkflow && (
          <WorkflowStepActions proposal={proposal} refetch={refetch} />
        )}
        {/* Applicant-facing award accept/decline (self-gates on the
            award_response step + the proposal creator). */}
        <AwardResponseActions proposal={proposal} refetch={refetch} />
      </SidebarLayout.Sidebar>
    </SidebarLayout.Container>
  );
};
