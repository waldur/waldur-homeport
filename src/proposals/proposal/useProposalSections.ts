import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { translate } from '@/i18n';
import { PROPOSAL_ACTIVITY_SECTION_ID } from '@/proposals/activity/ProposalActivitySection';
import { AWARDED_RESOURCES_SECTION_ID } from '@/proposals/awardedResources';
import { Proposal } from '@/proposals/types';

import {
  ALLOCATION_OUTCOME_SECTION_ID,
  showsAllocationOutcome,
} from './AllocationOutcomeSection';
import { useProposalContributions } from './contributions/queries';
import { groupContributionsByStep } from './contributions/StepContributionsSection';
import {
  isResponseStep,
  showsReleasedReports,
  showsStepInputs,
  stepInputsQuery,
  useReleasedReports,
} from './inputs/queries';
import { POST_AWARD_SECTION_ID } from './postAward';
import {
  showsMyReviewerSuggestions,
  showsSuggestedReviewers,
  useMyReviewerSuggestions,
  useSuggestedReviewers,
} from './reviewer-suggestions/queries';
import { STEP_ACTIONS_SECTION_ID } from './stepActions';
import { showsStepChecklist, stepChecklistQuery } from './StepChecklistSection';

/** One entry of the page's section rail: the card it scrolls to. */
export interface ProposalSection {
  id: string;
  label: string;
}

interface ProposalSectionsInput {
  proposal: Proposal;
  /** The sidebar holds the active step's actions for the viewer. */
  stepActionsShown?: boolean;
  workflowStates: ProposalWorkflowStepInstance[] | undefined;
  activeStep: ProposalWorkflowStepInstance | undefined;
  isApplicant: boolean;
  onApplicantTeam: boolean;
  /** The viewer may read the compliance answers. */
  hasCompliance: boolean;
  /** The viewer may read the proposal's team. */
  teamReadable: boolean;
  /** The award may be read, whether or not there is one to show. */
  canQueryAwards: boolean;
  /** The award section has something to show, or failed to load it. */
  awardShown: boolean;
  /** The extensions and final report section is on the page. */
  postAwardShown?: boolean;
  /** Steps reading earlier steps' outputs. */
  inputSteps: ProposalWorkflowStepInstance[];
  /** Steps whose contributions are read through a later step instead. */
  stepsReadAsInputs: string[];
  /** Completed steps whose report the viewer may release. */
  releasable: ProposalWorkflowStepInstance[];
  canViewEvaluators: boolean;
  canManageEvaluators: boolean;
  callRoleCount: number;
  heldRoleCount: number;
  collectsSuggestions: boolean;
  canSuggest: boolean;
  readsAllSuggestions: boolean;
  /** The applicant's view read by someone off the applicant team: the
   * evaluation's work is left to that role's own view. */
  preview?: boolean;
}

/** Whether the proposal's evaluation is over: decided, or ended. */
const isDecided = (
  proposal: Proposal,
  workflowStates: ProposalWorkflowStepInstance[] | undefined,
) =>
  ['accepted', 'rejected', 'canceled'].includes(proposal.state as string) ||
  (workflowStates ?? []).some(
    (step) => step.is_allocation_decision && step.status === 'completed',
  );

/**
 * Which cards the page opens before the viewer touches any: what needs
 * attention now is open, the rest folded. One rule for the whole page:
 *
 * - while the proposal is evaluated, the current step's own sections --
 *   its contributions, its inputs or the applicant's response, its
 *   checklist, the evaluators while it assigns them, the suggestions while
 *   it collects them and while the reviewers are then assigned, the award while it decides or awaits acceptance;
 * - once it is decided, the outcome, the award and the released reports;
 * - the applicant's released feedback, and reports the viewer may release;
 * - the details overview always; the submission's own details, resources,
 *   compliance answers and team are reference, folded.
 */
export const getOpenByDefault = ({
  proposal,
  workflowStates,
  activeStep,
  onApplicantTeam,
  releasable,
}: Pick<
  ProposalSectionsInput,
  'proposal' | 'workflowStates' | 'activeStep' | 'onApplicantTeam'
> & { releasable: unknown[] }) => {
  const decided = isDecided(proposal, workflowStates);
  const current = decided ? undefined : activeStep;
  const currentUuid = current?.call_step_uuid;
  const awardStep =
    !!current &&
    (current.is_allocation_decision || current.step === 'award_response');
  const open = new Set<string>(['step-general']);
  // An extension request or final report under way is what needs attention.
  if (proposal.state === 'accepted' && proposal.open_run_uuid) {
    open.add(POST_AWARD_SECTION_ID);
  }
  if (decided) {
    open.add(ALLOCATION_OUTCOME_SECTION_ID);
    open.add(AWARDED_RESOURCES_SECTION_ID);
    open.add('step-released-reports');
  }
  if (onApplicantTeam || releasable.length) {
    open.add('step-released-reports');
  }
  if (awardStep) {
    open.add(AWARDED_RESOURCES_SECTION_ID);
  }
  if (currentUuid) {
    open.add(`step-contributions-${currentUuid}`);
    open.add(`step-inputs-${currentUuid}`);
    open.add(`step-response-${currentUuid}`);
    open.add('step-checklist');
  }
  if (current?.kind === 'assignment') {
    open.add('step-evaluators');
  }
  if (current?.collects_reviewer_suggestions) {
    open.add('step-my-reviewer-suggestions');
    open.add('step-suggested-reviewers');
  }
  // The assignment after the suggestions were collected is where the call
  // manager invites and assigns the suggested reviewers.
  if (
    current?.kind === 'assignment' &&
    (workflowStates ?? []).some(
      (step) =>
        step.collects_reviewer_suggestions && step.status === 'completed',
    )
  ) {
    open.add('step-suggested-reviewers');
  }
  return open;
};

/** Which of the page's sections a parent renders; the rest gate themselves. */
export interface ProposalSectionVisibility {
  stepChecklist: boolean;
  evaluators: boolean;
  myReviewerSuggestions: boolean;
  suggestedReviewers: boolean;
  team: boolean;
}

/**
 * The proposal page's sections for this viewer, in page order, and which of
 * them the page renders. The body and the section rail both read it, so a
 * section is listed exactly when it is on the page.
 *
 * Sections that only know they are empty once their data has loaded read the
 * same queries here; the cache shares them, so nothing is fetched twice.
 */
export const useProposalSections = (
  input: ProposalSectionsInput,
): {
  show: ProposalSectionVisibility;
  rail: ProposalSection[];
  /** The cards open before the viewer toggles any; see getOpenByDefault. */
  openByDefault: Set<string>;
} => {
  const { proposal, activeStep, isApplicant, onApplicantTeam } = input;

  // The active step's checklist, unless it is filled elsewhere: applicants do
  // not fill evaluation checklists (the backend refuses them), a response
  // step shows its form with what it responds to, and a step split per
  // requested offering is filled on the contribution cards. Nor is it asked
  // for when the backend says the viewer may not read it.
  const preview = Boolean(input.preview);
  const stepChecklistAllowed = Boolean(
    !preview &&
    activeStep?.checklist_status?.has_checklist &&
    activeStep.checklist_status.can_read !== false &&
    !isApplicant &&
    !onApplicantTeam &&
    !isResponseStep(activeStep) &&
    // A step with contributors has its form on their contribution cards:
    // nobody answers it on the step in their place.
    (activeStep.contributor_source ?? 'none') === 'none' &&
    !activeStep.per_requested_offering,
  );
  const checklist = useQuery({
    ...stepChecklistQuery(proposal.uuid, activeStep ?? { step: '' }),
    enabled: stepChecklistAllowed,
  });

  const show: ProposalSectionVisibility = {
    stepChecklist: stepChecklistAllowed,
    evaluators:
      !preview &&
      input.canViewEvaluators &&
      ((input.canManageEvaluators && input.callRoleCount > 0) ||
        input.heldRoleCount > 0),
    myReviewerSuggestions:
      !preview && !onApplicantTeam && input.heldRoleCount > 0,
    suggestedReviewers:
      !preview && input.collectsSuggestions && input.readsAllSuggestions,
    team: input.teamReadable,
  };

  const releasedReports = useReleasedReports(proposal.uuid);
  const inputResults = useQueries({
    queries: input.inputSteps.map((step) =>
      stepInputsQuery(proposal.uuid, step.call_step_uuid),
    ),
  });
  const { data: contributions } = useProposalContributions(proposal.uuid);
  const mySuggestions = useMyReviewerSuggestions(
    proposal.uuid,
    show.myReviewerSuggestions,
  );
  const allSuggestions = useSuggestedReviewers(
    proposal.uuid,
    show.suggestedReviewers,
  );

  const sections: ProposalSection[] = [];
  const add = (shown: boolean, id: string, label: string) => {
    if (shown) sections.push({ id, label });
  };

  add(
    !!input.stepActionsShown,
    STEP_ACTIONS_SECTION_ID,
    translate('Current step'),
  );
  add(
    showsAllocationOutcome(proposal),
    ALLOCATION_OUTCOME_SECTION_ID,
    translate('Allocation outcome'),
  );
  add(true, 'step-general', translate('Details overview'));
  add(true, 'step-project', translate('Project details'));
  add(
    input.hasCompliance,
    'step-compliance',
    translate('Compliance checklist'),
  );
  add(true, 'step-resource-requests', translate('Resource requests'));
  add(
    input.canQueryAwards && input.awardShown,
    AWARDED_RESOURCES_SECTION_ID,
    translate('Awarded resources'),
  );
  add(
    !!input.postAwardShown,
    POST_AWARD_SECTION_ID,
    translate('Extensions and final report'),
  );
  add(
    showsReleasedReports({
      reports: releasedReports.data,
      isError: releasedReports.isError,
      releasable: input.releasable,
    }),
    'step-released-reports',
    translate('Feedback to the applicant'),
  );
  input.inputSteps.forEach((step, index) => {
    const result = inputResults[index];
    if (!result || !showsStepInputs(result)) return;
    if (isResponseStep(step)) {
      add(true, `step-response-${step.call_step_uuid}`, step.step_name);
    } else if (!preview) {
      add(
        true,
        `step-inputs-${step.call_step_uuid}`,
        translate('{step}: inputs', { step: step.step_name }),
      );
    }
  });
  add(
    show.stepChecklist && showsStepChecklist(checklist),
    'step-checklist',
    activeStep?.checklist_status?.checklist_name || translate('Checklist'),
  );
  for (const { step } of preview
    ? []
    : groupContributionsByStep(
        contributions,
        input.workflowStates,
        input.stepsReadAsInputs,
      )) {
    add(
      true,
      `step-contributions-${step.call_step_uuid}`,
      translate('{step}: contributions', { step: step.step_name }),
    );
  }
  add(show.evaluators, 'step-evaluators', translate('Evaluators'));
  add(
    show.myReviewerSuggestions &&
      showsMyReviewerSuggestions(mySuggestions, input.canSuggest),
    'step-my-reviewer-suggestions',
    translate('Suggested reviewers'),
  );
  add(
    show.suggestedReviewers && showsSuggestedReviewers(allSuggestions),
    'step-suggested-reviewers',
    translate('Reviewers suggested by the evaluators'),
  );
  add(show.team, 'step-team', translate('Project team'));
  add(true, PROPOSAL_ACTIVITY_SECTION_ID, translate('Activity'));

  // The rail keeps its identity while the same sections are listed.
  const key = sections
    .map((section) => `${section.id}:${section.label}`)
    .join('|');
  const railRef = useRef(sections);
  railRef.current = sections;
  const rail = useMemo(() => railRef.current, [key]);

  const openByDefault = getOpenByDefault({
    proposal,
    workflowStates: input.workflowStates,
    activeStep,
    onApplicantTeam,
    releasable: input.releasable,
  });
  // Stable while the same cards are open, for the page's context value.
  const openKey = Array.from(openByDefault).sort().join('|');
  const openRef = useRef(openByDefault);
  openRef.current = openByDefault;

  const stableOpen = useMemo(() => openRef.current, [openKey]);
  return { show, rail, openByDefault: stableOpen };
};
