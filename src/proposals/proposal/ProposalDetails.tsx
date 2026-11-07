import { ChatTextIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import {
  checkScope,
  hasPermission,
  userHasRole,
} from '@/permissions/hasPermission';
import { ProposalActivitySection } from '@/proposals/activity/ProposalActivitySection';
import {
  asCostRow,
  compareAward,
  hasReachedAllocationDecision,
  hasReleasedAllocationDecision,
  canEditAward,
  isAwardDecisionOpen,
  isAwardSectionShown,
  useAwardedResources,
} from '@/proposals/awardedResources';
import { useCallFixedDuration } from '@/proposals/callQueries';
import { ProposalCostTotal } from '@/proposals/ProposalCostTotal';
import { useProposalResourceRows } from '@/proposals/useProposalResourceRows';
import { isReviewInFinalState } from '@/proposals/utils';
import { FormSteps } from '@/wizard';
import { useUser } from '@/workspace/hooks';

import { changesAnyHolder, evaluatorAccess } from '../proposal-roles/access';
import { isRoleUsed, rolesUsedBySteps } from '../proposal-roles/constants';
import {
  useCallProposalRoles,
  useCallStepsNamingRoles,
  useMyProposalRoleAssignments,
} from '../proposal-roles/queries';
import { ProposalUsersListSummary } from '../team/ProposalUsersListSummary';
import { useProposalTeamReadable } from '../team/teamApi';
import { isOnProposalTeam } from '../team/teamRules';
import { Call, Proposal, ProposalReview } from '../types';
import { isTechnicalAssessmentStep } from '../workflow/constants';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '../workflow/queries';
import { activeStepsOf } from '../workflow/stages';

import { AllocationDecisionComment } from './AllocationDecisionComment';
import {
  AllocationOutcomeSection,
  AllocationStartBanner,
} from './AllocationOutcomeSection';
import { AwardedResourcesSection } from './AwardedResourcesSection';
import { AwardResponseActions } from './AwardResponseActions';
import { getOpenChangeRequests } from './changeRequests';
import { StepContributionsSection } from './contributions/StepContributionsSection';
import { ChangeRequestNotice } from './create/ChangeRequestNotice';
import {
  ComplianceSummary,
  useShowsComplianceSection,
} from './create/ComplianceSummary';
import { ProjectDetailsSummary } from './create/ProjectDetailsSummary';
import { ProposalDetailsOverviewStep } from './create/ProposalDetailsOverviewStep';
import { ResourceRequestsSummary } from './create/ResourceRequestsSummary';
import {
  CreateManualAssignmentDialog,
  useCanCreateReview,
} from './create/utils';
import { SubmitReviewDialog } from './create-review/SubmitReviewDialog';
import { ProposalEvaluatorsSection } from './evaluators/ProposalEvaluatorsSection';
import {
  stepsReadByApplicantElsewhere,
  releasableSteps,
  isOfferingTeamStep,
  isResponseStep,
  stepsShowingInputs,
} from './inputs/queries';
import { ReleasedReportsSection } from './inputs/ReleasedReportsSection';
import { StepInputsSection } from './inputs/StepInputsSection';
import { PostAwardSection, usePostAward } from './PostAwardSection';
import { useProposalView } from './proposalView';
import { ProposalViewNotice } from './ProposalViewNotice';
import { requestedSectionOf } from './requestedSection';
import { reviewerSuggestionAccess } from './reviewer-suggestions/access';
import { MyReviewerSuggestionsSection } from './reviewer-suggestions/MyReviewerSuggestionsSection';
import { SuggestedReviewersSection } from './reviewer-suggestions/SuggestedReviewersSection';
import {
  SectionOpenProvider,
  SectionOpenState,
  sectionOpenProps,
} from './sectionOpen';
import { stepActionAccess } from './stepActions';
import { StepChecklistSection } from './StepChecklistSection';
import { useProposalSections } from './useProposalSections';
import { WithdrawProposalAction } from './WithdrawProposalAction';
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
  // Listed only for a viewer who may read the answers; see
  // useShowsComplianceSection.
  const hasCompliance = useShowsComplianceSection(proposal);
  // The cards the viewer opened or folded themselves; every other card
  // follows the page's rule (useProposalSections' openByDefault).
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  // An offering manager assessing the proposal reads it but not its team.
  // One who reads only their offerings' part is on no team: not asked.
  const readsOwnOfferingsOnly = Boolean(proposal?.reads_own_offerings_only);
  const teamProbed = useProposalTeamReadable(
    readsOwnOfferingsOnly ? undefined : proposal?.uuid,
  );
  const teamReadable = !readsOwnOfferingsOnly && teamProbed;

  const { openDialog } = useModal();
  const user = useUser();
  const canCreateReview = useCanCreateReview(proposal);

  const { view, preview: previewCandidate } = useProposalView(proposal);
  const isCallManagerView = view === 'call_manager';

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
  // Steps of one stage run at once; the first of them is where the
  // proposal stands, as the backend's current step.
  const activeSteps = useMemo(
    () => activeStepsOf(workflowStates),
    [workflowStates],
  );
  const activeStep = activeSteps[0];
  const canEditStepChecklist =
    !!user?.is_staff ||
    hasPermission(user, {
      permission: PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
      scopeId: proposal.call_uuid,
      callOrganizerId: proposal.call_managing_organisation_uuid,
    });
  // A technical assessment is owned by offering managers (technical
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
  // Evaluator roles on the proposal (its rapporteurs, say). The whole
  // applicant team never sees them; see evaluatorAccess.
  const onApplicantTeam = isOnProposalTeam(user, proposal);
  // The API gives the applicant team the submitted reviews once the proposal
  // is decided, and only where the call shares reviews with applicants: any
  // it returns are theirs to read. A preview of the applicant's page reads the
  // call team's reviews, so it is not offered them.
  const applicantReadsReviews =
    view === 'applicant' && onApplicantTeam && reviews.length > 0;
  const { data: myRoleAssignments } = useMyProposalRoleAssignments(
    proposal.uuid,
    onApplicantTeam ? undefined : user?.uuid,
  );
  const heldRoles = useMemo(
    () => (myRoleAssignments ?? []).filter((a) => !a.awaits_coi_confirmation),
    [myRoleAssignments],
  );
  const { canManageEvaluators, canViewEvaluators } = evaluatorAccess({
    user,
    proposal,
    activeStep,
    heldRoles,
  });
  // The call's role vocabulary is for those who assign it; a holder reads
  // the assignments alone, and is not allowed the call's configuration.
  const { data: allCallProposalRoles } = useCallProposalRoles(
    proposal.call_uuid,
    canManageEvaluators,
  );
  // Only the roles some enabled step needs ask for holders; one no step
  // assigns or works with is left out, unless someone holds it already.
  const { data: callSteps } = useCallStepsNamingRoles(
    proposal.call_uuid,
    canManageEvaluators && Boolean(allCallProposalRoles?.length),
  );
  const callProposalRoles = useMemo(() => {
    if (!allCallProposalRoles || !callSteps) return allCallProposalRoles;
    const used = rolesUsedBySteps(callSteps);
    return allCallProposalRoles.filter((role) => isRoleUsed(used, role));
  }, [allCallProposalRoles, callSteps]);

  // Reviewers the evaluators suggest: each holder lists their own, and
  // suggests more while a step collecting them runs; the call's managers
  // invite them. Never the applicant team. Only once that step is reached:
  // before it, an empty section about suggestions nobody may make yet only
  // puzzles the call's managers.
  const collectsSuggestions = (workflowStates ?? []).some(
    (step) =>
      step.collects_reviewer_suggestions &&
      ['active', 'completed', 'expired'].includes(step.status),
  );
  const canInviteSuggested =
    !onApplicantTeam &&
    (!!user?.is_staff ||
      Boolean(
        hasPermission(user, {
          permission: PermissionEnum.UPDATE_CALL,
          scopeId: proposal.call_uuid,
          callOrganizerId: proposal.call_managing_organisation_uuid,
        }),
      ));
  // The call's managers, and whoever completes a running assignment step
  // (the panel's routing step); the backend decides for the step.
  const canChangePanel =
    !onApplicantTeam &&
    ['submitted', 'in_review'].includes(proposal.state) &&
    (canInviteSuggested ||
      (canManageEvaluators &&
        activeSteps.some((step) => step.kind === 'assignment')));
  const suggestionAccess = reviewerSuggestionAccess({
    steps: workflowStates,
    activeStep,
    heldRoles,
    onApplicantTeam,
    canInvite: canInviteSuggested,
  });

  // Steps reading earlier steps' outputs, and reports for the applicant.
  // A provider reading only its offerings' part holds work on its offering
  // team's steps alone; the others' inputs are refused it, so not asked.
  const inputSteps = useMemo(() => {
    const steps = stepsShowingInputs(workflowStates);
    return readsOwnOfferingsOnly ? steps.filter(isOfferingTeamStep) : steps;
  }, [workflowStates, readsOwnOfferingsOnly]);
  // The applicant team reads earlier steps through the step that responds
  // to them, and released reports as feedback, not as contribution cards of
  // their own -- but only those: a step read by an evaluator-only step shows
  // the applicant nothing of it.
  const stepsReadAsInputs = useMemo(
    () =>
      onApplicantTeam ? stepsReadByApplicantElsewhere(workflowStates) : [],
    [onApplicantTeam, workflowStates],
  );
  const releasable = useMemo(
    () => releasableSteps(workflowStates),
    [workflowStates],
  );

  const canEditActiveStepChecklist =
    canEditStepChecklist ||
    ((isTechnicalAssessmentStep(activeStep) ||
      activeStep?.completer === 'offering_manager') &&
      !isApplicant);

  // The award exists once the allocation decision has opened. Reviewers and
  // panel members are never shown it, so they are not asked; the applicant is
  // asked and the backend answers 403 until the decision is released, which
  // the query settles as "not shown".
  // The Applicant tab previews the page as the applicant has it, and the
  // applicant is not shown a decision held for the round's publication, nor
  // the award it grants. `decision_held` is true only for the call team.
  const awardHeldFromApplicant =
    !isCallManagerView && proposal.decision_held === true;
  // The applicant team reads the award once it is released to them; the
  // call team and providers as soon as the decision is under way.
  const canQueryAwards =
    (onApplicantTeam
      ? hasReleasedAllocationDecision(proposal, workflowStates)
      : hasReachedAllocationDecision(proposal, workflowStates)) &&
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

  // Whether the viewer completes a step without managing the call, decided
  // per active step: with several running, they may complete one and not
  // the other.
  const completesStep = useCallback(
    (step: ProposalWorkflowStepInstance) =>
      evaluatorAccess({ user, proposal, activeStep: step, heldRoles })
        .completesActiveStep,
    [user, proposal, heldRoles],
  );
  // Someone who also works on this page -- holding an evaluator role on the
  // proposal, or completing one of its active steps -- has it as their own
  // page, not as a preview of the applicant's.
  const preview =
    previewCandidate &&
    heldRoles.length === 0 &&
    !activeSteps.some((step) => completesStep(step));
  // A preview of the applicant's page acts on nothing: the viewer's own
  // work is on their own view's tab.
  const stepActionsShown = preview
    ? false
    : activeSteps.length
      ? activeSteps.some(
          (step) =>
            ((isCallManagerView && hasWorkflow) || completesStep(step)) &&
            stepActionAccess({
              user,
              proposal,
              activeStep: step,
              completesActiveStep: completesStep(step),
            }).shown,
        )
      : isCallManagerView &&
        hasWorkflow &&
        stepActionAccess({ user, proposal, activeStep: undefined }).shown;

  const postAward = usePostAward(proposal);

  // The section a link opened the page on starts open too.
  const targetSection = requestedSectionOf(proposal.uuid);

  // The sections on the page for this viewer, and the rail listing them.
  const { show, rail, openByDefault } = useProposalSections({
    proposal,
    postAwardShown: postAward.shown,
    stepActionsShown,
    workflowStates,
    activeStep,
    isApplicant,
    onApplicantTeam,
    preview,
    hasCompliance,
    teamReadable,
    canQueryAwards,
    awardShown:
      awardsQuery.isError || isAwardSectionShown(awards, awardsEditable),
    inputSteps,
    stepsReadAsInputs,
    releasable,
    canViewEvaluators,
    canManageEvaluators,
    callRoleCount: callProposalRoles?.length ?? 0,
    heldRoleCount: heldRoles.length,
    collectsSuggestions,
    canSuggest: suggestionAccess.canSuggest,
    readsAllSuggestions: suggestionAccess.readsAll,
  });

  // Once an award exists and may be read, it is what will be provisioned, so
  // the sidebar totals it rather than the request — and says so.
  const costRows = useMemo(
    () => (awards?.length ? awards.map(asCostRow) : resourceRows || []),
    [awards, resourceRows],
  );

  const openState = useMemo<SectionOpenState>(
    () => ({
      isOpen: (id) =>
        toggled[id] ?? (openByDefault.has(id) || id === targetSection),
      setOpen: (id, open) =>
        setToggled((current) => ({ ...current, [id]: open })),
    }),
    [toggled, openByDefault, targetSection],
  );
  // Picking a section in the rail opens it, as well as scrolling to it.
  const openFromRail = useCallback(
    (id: string) => setToggled((current) => ({ ...current, [id]: true })),
    [],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <SectionOpenProvider value={openState}>
      <SidebarLayout.Container fluid>
        <SidebarLayout.Body className="mb-8">
          {/* A draft has no evaluation yet: the applicant's page is the only
              one, nothing for a preview to leave out. */}
          {preview && proposal.state !== 'draft' && (
            <ProposalViewNotice proposal={proposal} preview />
          )}
          {/* What the applicant was asked to change, as their own page says
              it above the reopened form: here, where the page is read
              rather than edited -- a preview of the applicant's view, say. */}
          {view === 'applicant' &&
            getOpenChangeRequests(proposal).length > 0 && (
              <ChangeRequestNotice
                changeRequests={getOpenChangeRequests(proposal)}
                className="mb-4"
              />
            )}
          <AllocationStartBanner proposal={proposal} />
          {/* Why it was declined: the accepted proposal says it in its
              allocation outcome, a declined one has no such card. */}
          {proposal.state === 'rejected' && (
            <AllocationDecisionComment
              proposalUuid={proposal.uuid}
              className="mb-4"
            />
          )}
          <AllocationOutcomeSection
            proposal={proposal}
            awardRows={awardRows}
            canProvision={
              isCallManagerView ||
              checkScope(
                user,
                'call',
                proposal.call_uuid,
                PermissionEnum.UPDATE_CALL,
              )
            }
          />
          <ProposalDetailsOverviewStep
            id="step-general"
            params={{
              proposal,
              canViewReviews: isCallManagerView,
              applicantReadsReviews,
              workflowStates,
              reviews,
            }}
          />
          <ProjectDetailsSummary
            proposal={proposal}
            reviews={reviews}
            canChangePanel={canChangePanel}
            refetch={refetch}
          />
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
              refetch={refetch}
            />
          )}
          <PostAwardSection proposal={proposal} refetch={refetch} />
          <ReleasedReportsSection
            proposal={proposal}
            releasable={releasable}
            refetch={refetch}
          />
          <StepInputsSection
            proposal={proposal}
            // The preview keeps what the applicant answers, not what an
            // evaluation reads.
            steps={preview ? inputSteps.filter(isResponseStep) : inputSteps}
            isApplicant={isApplicant}
            refetch={refetch}
          />
          {show.stepChecklist && (
            <StepChecklistSection
              proposal={proposal}
              step={activeStep}
              canEdit={canEditActiveStepChecklist}
              refetch={refetch}
            />
          )}
          {!preview && (
            <StepContributionsSection
              proposal={proposal}
              workflowStates={workflowStates}
              hiddenStepUuids={stepsReadAsInputs}
              refetch={refetch}
            />
          )}
          {show.evaluators && (
            <ProposalEvaluatorsSection
              proposal={proposal}
              roles={callProposalRoles ?? []}
              canManage={canManageEvaluators}
              changesAnyHolder={changesAnyHolder(user, proposal)}
            />
          )}
          {show.myReviewerSuggestions && (
            <MyReviewerSuggestionsSection
              proposal={proposal}
              canSuggest={suggestionAccess.canSuggest}
            />
          )}
          {show.suggestedReviewers && (
            <SuggestedReviewersSection
              proposal={proposal}
              canInvite={canInviteSuggested}
            />
          )}
          {show.team && (
            <ProposalUsersListSummary
              scope={proposal}
              reviews={reviews}
              hideExpiration={isReviewerOnly}
              section={{
                id: 'step-team',
                title: translate('Project team'),
                subtitle: translate(
                  'Team members and their roles in the project.',
                ),
                openProps: sectionOpenProps(openState, 'step-team', false),
              }}
            />
          )}
          <ProposalActivitySection proposal={proposal} />
        </SidebarLayout.Body>
        <SidebarLayout.Sidebar transparent>
          {/* The step's actions come first: they are what the viewer is here
            for, and below the rail and the totals they sat a screen down. */}
          {stepActionsShown && (
            <WorkflowStepActions
              proposal={proposal}
              refetch={refetch}
              completesActiveStep={completesStep}
            />
          )}
          <Panel
            title={translate('On this page')}
            cardBordered
            className="mb-4"
          >
            <FormSteps steps={rail} hideStatusIcons onSelect={openFromRail} />
          </Panel>
          <ProposalCostTotal
            rows={costRows}
            fixedDurationDays={fixedDurationDays}
            chosenDurationMonths={
              proposal.awarded_duration_months ??
              proposal.requested_duration_months
            }
            panel
            listsAmounts={proposal.reads_own_offerings_only}
            title={
              proposal.reads_own_offerings_only
                ? awards?.length
                  ? translate("Summary of your offerings' award")
                  : translate('Summary of your offerings')
                : awards?.length
                  ? translate('Summary of the award')
                  : undefined
            }
          />
          {isCallManagerView &&
            review &&
            !isReviewInFinalState(review.state) && (
              <BaseButton
                variant="primary"
                onClick={() =>
                  openDialog(SubmitReviewDialog, {
                    resolve: { review, refetch },
                  })
                }
                className="w-full mt-1.5"
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
              className="w-full mt-1.5"
              iconNode={<ChatTextIcon weight="bold" />}
              label={translate('Assign reviewer')}
              size="lg"
            />
          )}
          {/* Applicant-facing award accept/decline (self-gates on the
            award_response step + the proposal creator). */}
          <AwardResponseActions
            proposal={proposal}
            refetch={refetch}
            awardRows={awardRows}
          />
          {/* The applicant's way out while evaluation is under way. */}
          <WithdrawProposalAction proposal={proposal} refetch={refetch} />
        </SidebarLayout.Sidebar>
      </SidebarLayout.Container>
    </SectionOpenProvider>
  );
};
