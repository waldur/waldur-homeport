import { ChatTextIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo, useState } from 'react';

import { AccordionCard, BaseButton } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission, userHasRole } from '@/permissions/hasPermission';
import {
  asCostRow,
  compareAward,
  hasReachedAllocationDecision,
  canEditAward,
  isAwardDecisionOpen,
  isAwardSectionShown,
  useAwardedResources,
  withAwardedResourcesStep,
} from '@/proposals/awardedResources';
import { useCallFixedDuration } from '@/proposals/callQueries';
import { ProposalCostTotal } from '@/proposals/ProposalCostTotal';
import { useProposalResourceRows } from '@/proposals/useProposalResourceRows';
import { isReviewInFinalState } from '@/proposals/utils';
import { FormSteps } from '@/wizard';
import { useUser } from '@/workspace/hooks';

import { ProposalUsersListSummary } from '../team/ProposalUsersListSummary';
import { Call, Proposal, ProposalReview } from '../types';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';

import {
  AllocationOutcomeSection,
  AllocationStartBanner,
} from './AllocationOutcomeSection';
import { AwardedResourcesSection } from './AwardedResourcesSection';
import { AwardResponseActions } from './AwardResponseActions';
import {
  ComplianceSummary,
  useShowsComplianceSection,
} from './create/ComplianceSummary';
import { ProjectDetailsSummary } from './create/ProjectDetailsSummary';
import { ProposalDetailsOverviewStep } from './create/ProposalDetailsOverviewStep';
import { ResourceRequestsSummary } from './create/ResourceRequestsSummary';
import { createProposalSteps } from './create/steps';
import {
  CreateManualAssignmentDialog,
  useCanCreateReview,
} from './create/utils';
import { SubmitReviewDialog } from './create-review/SubmitReviewDialog';
import { StepChecklistSection } from './StepChecklistSection';
import {
  canViewTechnicalAssessment,
  TECHNICAL_ASSESSMENT_STEP,
} from './technicalAssessmentAccess';
import { TechnicalAssessmentSection } from './TechnicalAssessmentSection';
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

  // Listed only for a viewer who may read the answers; see
  // useShowsComplianceSection.
  const hasCompliance = useShowsComplianceSection(proposal);
  // The team card opens by default when there is no compliance section above
  // it. It follows that until the viewer folds or unfolds it themselves, so a
  // section that turns out to be unavailable leaves the team open.
  const [teamOpen, setTeamOpen] = useState<boolean>();

  const formSteps = useMemo(() => {
    const fakeCallForSteps = hasCompliance
      ? { compliance_checklist: 'exists' }
      : undefined;
    const steps = createProposalSteps(fakeCallForSteps);
    return steps;
  }, [hasCompliance]);

  const { openDialog } = useModal();
  const user = useUser();
  const canCreateReview = useCanCreateReview(proposal);

  const isCallManagerView = state.name?.startsWith('call-management');

  // The figures the applicant saw beside their form: the person deciding the
  // allocation needs the same total and the same project length.
  const { data: resourceRows } = useProposalResourceRows(proposal.uuid);
  const fixedDurationDays = useCallFixedDuration(proposal.call_uuid);

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

  // The active step's attached checklist is shown on the detail. The call
  // manager (and staff) may fill it; the backend is the final authority on who
  // may answer, so non-editors get a read-only view.
  const activeStep = useMemo(
    () => (workflowStates ?? []).find((s) => s.status === 'active'),
    [workflowStates],
  );
  const canEditStepChecklist =
    !!user?.is_staff ||
    hasPermission(user, {
      permission: PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
      scopeId: proposal.call_uuid,
      callOrganizerId: proposal.call_managing_organisation_uuid,
    });
  // The technical_assessment step is owned by offering managers (technical
  // reviewers), whom we can't reliably identify client-side. Let any
  // non-applicant viewer attempt to answer it while active — the backend
  // (user_can_answer_step_checklist) is the final authority and rejects others.
  const isApplicant = user?.uuid === proposal.created_by_uuid;
  // Mirror the backend _is_reviewer_only_view: a reviewer/panel member who is
  // not staff/support, the applicant, or a call manager. Used to conceal
  // team-admin metadata (role expiration) from reviewers.
  const isReviewerOnly =
    !user?.is_staff &&
    !user?.is_support &&
    !isApplicant &&
    !userHasRole(user, 'CALL.MANAGER', proposal.call_uuid) &&
    (userHasRole(user, 'CALL.REVIEWER', proposal.call_uuid) ||
      userHasRole(user, 'CALL.PANEL_MEMBER', proposal.call_uuid));
  const canReadTechnicalAssessment = canViewTechnicalAssessment({
    user,
    proposal,
    workflowStates,
    resourceRows,
  });
  const canEditActiveStepChecklist =
    canEditStepChecklist ||
    (activeStep?.step === TECHNICAL_ASSESSMENT_STEP && !isApplicant);

  // The award exists once the allocation decision has opened. Reviewers and
  // panel members are never shown it, so they are not asked; the applicant is
  // asked and the backend answers 403 until the decision is released, which
  // the query settles as "not shown".
  // The Applicant tab previews the page as the applicant has it, and the
  // applicant is not shown a decision held for the round's publication, nor
  // the award it grants. `decision_held` is true only for the call team.
  const awardHeldFromApplicant =
    !isCallManagerView && proposal.decision_held === true;
  const canQueryAwards =
    hasReachedAllocationDecision(proposal, workflowStates) &&
    !isReviewerOnly &&
    !awardHeldFromApplicant;
  // Not while the decision is held for the round's publication: the backend
  // refuses award edits then, until the decision is reopened.
  const awardsEditable = canEditAward(
    canEditStepChecklist,
    proposal,
    activeStep,
  );
  const awardsQuery = useAwardedResources(proposal.uuid, canQueryAwards);
  // A disabled query still hands back what the Call manager tab cached.
  const awards = canQueryAwards ? awardsQuery.data : undefined;
  const awardRows = useMemo(
    () =>
      awards?.length
        ? compareAward((resourceRows as any[]) ?? [], awards)
        : undefined,
    [awards, resourceRows],
  );

  // The progress rail lists the award section whenever it is on the page.
  const navSteps = useMemo(
    () =>
      withAwardedResourcesStep(
        formSteps,
        canQueryAwards && isAwardSectionShown(awards, awardsEditable),
      ),
    [formSteps, canQueryAwards, awards, awardsEditable],
  );

  // Once an award exists and may be read, it is what will be provisioned, so
  // the sidebar totals it rather than the request — and says so.
  const costRows = useMemo(
    () => (awards?.length ? awards.map(asCostRow) : resourceRows || []),
    [awards, resourceRows],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <SidebarLayout.Container>
      <SidebarLayout.Body className="mb-10">
        <AllocationStartBanner proposal={proposal} />
        <AllocationOutcomeSection proposal={proposal} awardRows={awardRows} />
        <ProposalDetailsOverviewStep
          id="step-general"
          params={{ proposal, canViewReviews: isCallManagerView }}
        />
        <ProjectDetailsSummary proposal={proposal} reviews={reviews} />
        {hasCompliance && (
          <div id="step-compliance">
            <ComplianceSummary proposal={proposal} />
          </div>
        )}
        <ResourceRequestsSummary
          proposal={proposal}
          reviews={reviews}
          awardRows={awardRows}
        />
        {canQueryAwards && (
          <AwardedResourcesSection
            proposal={proposal}
            editable={awardsEditable}
            decisionOpen={isAwardDecisionOpen(proposal, activeStep)}
            decisionHeld={proposal.decision_held === true}
          />
        )}
        {activeStep?.checklist_status?.has_checklist && !isApplicant && (
          // Applicants don't fill evaluation-step checklists on the detail page
          // (they can't view them either — the backend 403s), so rendering the
          // section for them only produced an empty accordion + error noise.
          <StepChecklistSection
            proposal={proposal}
            step={activeStep}
            canEdit={canEditActiveStepChecklist}
            refetch={refetch}
          />
        )}
        <TechnicalAssessmentSection
          proposal={proposal}
          enabled={canReadTechnicalAssessment}
        />
        <AccordionCard
          id="step-team"
          title={translate('Project team')}
          subtitle={translate('Team members and their roles in the project.')}
          isOpen={teamOpen ?? !hasCompliance}
          onToggle={setTeamOpen}
        >
          <ProposalUsersListSummary
            scope={proposal}
            reviews={reviews}
            hideExpiration={isReviewerOnly}
          />
        </AccordionCard>
      </SidebarLayout.Body>
      <SidebarLayout.Sidebar transparent>
        <Panel title={translate('Progress')} cardBordered className="mb-5">
          <FormSteps steps={navSteps} hideStatusIcons />
        </Panel>
        <ProposalCostTotal
          rows={costRows}
          fixedDurationDays={fixedDurationDays}
          panel
          title={awards?.length ? translate('Summary of the award') : undefined}
        />
        {isCallManagerView && review && !isReviewInFinalState(review.state) && (
          <BaseButton
            variant="primary"
            onClick={() =>
              openDialog(SubmitReviewDialog, { resolve: { review, refetch } })
            }
            className="w-100 mt-2"
            iconNode={<PaperPlaneTiltIcon weight="bold" />}
            label={translate('Submit review')}
            size="lg"
          />
        )}
        {isCallManagerView && canCreateReview && (
          <BaseButton
            variant="secondary"
            onClick={() =>
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
            label={translate('Create review')}
            size="lg"
          />
        )}
        {isCallManagerView && hasWorkflow && (
          <WorkflowStepActions proposal={proposal} refetch={refetch} />
        )}
        {/* Applicant-facing award accept/decline (self-gates on the
            award_response step + the proposal creator). */}
        <AwardResponseActions
          proposal={proposal}
          refetch={refetch}
          awardRows={awardRows}
        />
      </SidebarLayout.Sidebar>
    </SidebarLayout.Container>
  );
};
