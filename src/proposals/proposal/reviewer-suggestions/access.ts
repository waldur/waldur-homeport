import {
  ProposalRoleAssignment,
  ProposalWorkflowStepInstance,
} from 'waldur-js-client';

type SuggestionStep = Pick<
  ProposalWorkflowStepInstance,
  | 'status'
  | 'collects_reviewer_suggestions'
  | 'completer'
  | 'completer_proposal_role_uuid'
  | 'contributor_proposal_role_uuid'
  | 'can_suggest_reviewers'
>;

export interface ReviewerSuggestionAccess {
  /** Suggests reviewers: holds the active collecting step's contributor
   * role, and the backend still takes suggestions from them -- not once
   * their contribution is submitted. */
  canSuggest: boolean;
  /** Reads every suggestion: invites them, or holds the evaluator role
   * completing a step that collects them. */
  readsAll: boolean;
}

/**
 * Who suggests reviewers for a proposal and who reads them all, as the
 * backend decides it; the backend remains the authority and refuses anyone
 * else.
 */
export const reviewerSuggestionAccess = ({
  steps,
  activeStep,
  heldRoles,
  onApplicantTeam,
  canInvite,
}: {
  steps: SuggestionStep[] | undefined;
  activeStep: SuggestionStep | undefined;
  heldRoles: Pick<ProposalRoleAssignment, 'role_uuid'>[];
  onApplicantTeam: boolean;
  canInvite: boolean;
}): ReviewerSuggestionAccess => {
  if (onApplicantTeam) {
    return { canSuggest: false, readsAll: false };
  }
  const holds = (roleUuid: string | null | undefined) =>
    !!roleUuid &&
    heldRoles.some((assignment) => assignment.role_uuid === roleUuid);
  const canSuggest =
    activeStep?.collects_reviewer_suggestions === true &&
    activeStep.can_suggest_reviewers === true &&
    holds(activeStep.contributor_proposal_role_uuid);
  const completesACollectingStep = (steps ?? []).some(
    (step) =>
      step.collects_reviewer_suggestions &&
      step.status !== 'skipped' &&
      step.completer === 'proposal_role' &&
      holds(step.completer_proposal_role_uuid),
  );
  return { canSuggest, readsAll: canInvite || completesACollectingStep };
};
