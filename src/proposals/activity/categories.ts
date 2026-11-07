import { ProposalEnum, ReviewEnum, UsersEnum } from '@/EventsEnums';
import { translate } from '@/i18n';
import { usesCallVocabulary } from '@/proposals/presentation';

import { TEAM_EVENT_TYPES } from '../team/teamRules';

/**
 * The kinds of event a proposal's activity can be narrowed to. The backend
 * decides which events each viewer reads; these only pick among them.
 */
export type ActivityCategory = 'all' | 'workflow' | 'team' | 'reports';

const WORKFLOW_EVENT_TYPES = [
  ProposalEnum.proposal_created,
  ProposalEnum.proposal_submitted,
  ProposalEnum.proposal_step_started,
  ProposalEnum.proposal_step_completed,
  ProposalEnum.proposal_applicant_responded,
  ProposalEnum.proposal_decision_held,
  ProposalEnum.proposal_decision_published,
  ProposalEnum.proposal_decision_reopened,
  ProposalEnum.proposal_rejected_at_round_completion,
  ProposalEnum.proposal_workflow_advanced,
  ProposalEnum.proposal_canceled,
  ProposalEnum.proposal_draft_carried_over,
  ProposalEnum.proposal_evaluator_assigned,
  ProposalEnum.proposal_evaluator_revoked,
  // Changes made outside the applicant team: to the award, and to what the
  // applicant submitted.
  ProposalEnum.proposal_award_changed,
  ProposalEnum.proposal_edited_for_applicant,
  // A message the call's managers wrote to the applicants.
  ProposalEnum.proposal_notification_sent,
];

const ACTIVITY_TEAM_EVENT_TYPES = [
  ...TEAM_EVENT_TYPES,
  UsersEnum.user_invitation_updated,
  UsersEnum.user_invitation_deleted,
  UsersEnum.user_group_invitation_updated,
];

const REPORT_EVENT_TYPES = [
  ProposalEnum.proposal_contribution_submitted,
  ProposalEnum.proposal_report_released,
  ProposalEnum.proposal_document_added,
  ProposalEnum.proposal_document_removed,
  ReviewEnum.review_assigned,
  ReviewEnum.review_accepted,
  ReviewEnum.review_submitted,
  ReviewEnum.review_rejected,
  ReviewEnum.review_declined,
  ReviewEnum.review_canceled,
];

const CATEGORY_EVENT_TYPES: Record<
  Exclude<ActivityCategory, 'all'>,
  string[]
> = {
  workflow: WORKFLOW_EVENT_TYPES,
  team: ACTIVITY_TEAM_EVENT_TYPES,
  reports: REPORT_EVENT_TYPES,
};

/** The event types a category lists; ``undefined`` for all of them. */
export const getCategoryEventTypes = (
  category: ActivityCategory,
): string[] | undefined =>
  category === 'all' ? undefined : CATEGORY_EVENT_TYPES[category];

export const getActivityCategories = (): {
  key: ActivityCategory;
  title: string;
  help: string;
}[] => {
  const calls = usesCallVocabulary();
  return [
    {
      key: 'all',
      title: translate('All'),
      help: calls
        ? translate(
            'Everything that happened on this proposal that your role lets you see.',
          )
        : translate(
            'Everything that happened on this access request that your role lets you see.',
          ),
    },
    {
      key: 'workflow',
      title: translate('Workflow'),
      help: calls
        ? translate(
            'How the proposal moved through its evaluation: submission, each step starting and finishing, evaluators assigned, the award and the submission changed by the call team, decisions held, published or reopened, and the response to the award.',
          )
        : translate(
            'How the request moved through approval: submission, each approval step starting and finishing, changes made to it for you, the decision, and your response to what was granted.',
          ),
    },
    {
      key: 'team',
      title: translate('Team'),
      help: calls
        ? translate(
            'Who was added to or removed from the proposal team, role changes, and team invitations.',
          )
        : translate(
            'Who was added to or removed from the request team, role changes, and team invitations.',
          ),
    },
    {
      key: 'reports',
      title: translate('Reports'),
      help: calls
        ? translate(
            'Work handed in on the proposal: contributions submitted to steps, reviews, reports released to the applicant, and documents attached or removed.',
          )
        : translate(
            'Work handed in on the request: assessments submitted, feedback released to you, and documents attached or removed.',
          ),
    },
  ];
};
