import { translate } from '@/i18n';

/** Audiences a notification rule may address, in the matrix's order. */
export const RECIPIENTS = [
  'applicant',
  'responsible_role',
  'assigned_reviewers',
  'call_managers',
  'all_pool_reviewers',
  'panel_chair',
  'proposal_role',
  'proposal_role_lead',
  'offering_teams',
] as const;

export const TRIGGERS = [
  'step_started',
  'step_completed',
  'step_rejected',
  'step_expired',
  'deadline_approaching',
  'changes_requested',
  'changes_submitted',
  'contribution_reopened',
  'contribution_submitted',
] as const;

export const recipientLabel = (recipient: string): string =>
  ({
    applicant: translate('Applicant'),
    responsible_role: translate('Whoever completes the step'),
    assigned_reviewers: translate('Assigned reviewers'),
    call_managers: translate('Call managers'),
    all_pool_reviewers: translate('All pool reviewers'),
    panel_chair: translate('Panel chair and vice-chair'),
    proposal_role: translate('Evaluator role holders'),
    proposal_role_lead: translate('Evaluator role lead'),
    offering_teams: translate('Offering teams'),
  })[recipient] ?? recipient;

export const triggerLabel = (trigger: string, daysBefore?: number | null) => {
  const label =
    {
      step_started: translate('Step started'),
      step_completed: translate('Step completed'),
      step_rejected: translate('Step rejected'),
      step_expired: translate('Step expired'),
      deadline_approaching: translate('Deadline approaching'),
      changes_requested: translate('Changes requested'),
      changes_submitted: translate('Changes submitted'),
      contribution_reopened: translate('Contribution reopened'),
      contribution_submitted: translate('Contribution submitted'),
    }[trigger] ?? trigger;
  return daysBefore != null
    ? translate('{trigger} ({when})', {
        trigger: label,
        when: daysBeforeLabel(daysBefore),
      })
    : label;
};

/** "1 day before", "3 days before": a deadline reminder's lead time. */
export const daysBeforeLabel = (days: number): string =>
  days === 1
    ? translate('1 day before')
    : translate('{days} days before', { days });

export const sourceLabel = (source: string): string =>
  ({
    call: translate('Customized for this call'),
    portal: translate("Portal's wording"),
    default: translate('Default wording'),
  })[source] ?? source;
