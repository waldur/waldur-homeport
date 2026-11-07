import {
  WorkflowCheckFinding,
  WorkflowCheckSeverity,
  WorkflowCheckSummary,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  fieldPage,
  StepFormPage,
} from '@/proposals/update/workflow-steps/stepForm';
import { stepFieldLabel } from '@/proposals/workflow-description/explain';

export const severityLabel = (severity: WorkflowCheckSeverity): string =>
  ({
    error: translate('Error'),
    warning: translate('Warning'),
    info: translate('Note'),
  })[severity];

export const severityVariant = (
  severity: WorkflowCheckSeverity,
): 'danger' | 'warning' | 'info' =>
  (({ error: 'danger', warning: 'warning', info: 'info' }) as const)[severity];

/** "2 errors, 5 warnings", or null when the check found neither. */
export const summaryText = (
  summary: Pick<WorkflowCheckSummary, 'error' | 'warning'>,
): string | null => {
  const parts = [];
  if (summary.error) {
    parts.push(
      summary.error === 1
        ? translate('1 error')
        : translate('{count} errors', { count: summary.error }),
    );
  }
  if (summary.warning) {
    parts.push(
      summary.warning === 1
        ? translate('1 warning')
        : translate('{count} warnings', { count: summary.warning }),
    );
  }
  return parts.length ? parts.join(', ') : null;
};

/**
 * The tab of the call's edit page holding a call-level setting a finding
 * names, when one does. The resource pools are on the Manage page instead:
 * see CALL_MANAGE_TABS.
 */
const CALL_FIELD_TABS: Record<string, string> = {
  rounds: 'rounds',
  offerings: 'offerings',
  proposal_roles: 'evaluator-roles',
  panel_chair: 'team',
  panels: 'panels',
  budgets: 'resource-pools',
  budget_enforcement: 'allocation-settings',
  workflow_steps: 'steps-settings',
  target_decision_days: 'general-config',
  evaluation_start: 'general-config',
  reviewer_identity_visible_to_submitters: 'general-config',
};

/** Tabs of the call's Manage page, where a running call is adjusted. */
const CALL_MANAGE_TABS = new Set(['resource-pools']);

const callFieldTab = (field: string | null): string | undefined =>
  field ? CALL_FIELD_TABS[field] : undefined;

/** Where a finding's fix is: a page of a step's dialog, the Validation
 * tab's notification matrix (the step dialog does not edit notification
 * rules), or a call tab. */
export type FindingTarget =
  | { kind: 'step'; step: string; page: StepFormPage; field?: string }
  | { kind: 'notifications'; step: string }
  | { kind: 'call'; tab: string; page: 'edit' | 'manage' };

const NOTIFICATION_FIELDS = [
  'notification_rules',
  'recipient',
  'proposal_role',
];

export const findingTarget = (
  finding: WorkflowCheckFinding,
): FindingTarget | undefined => {
  if (finding.step) {
    if (finding.field && NOTIFICATION_FIELDS.includes(finding.field)) {
      return { kind: 'notifications', step: finding.step };
    }
    const page = finding.field ? fieldPage(finding.field) : undefined;
    return {
      kind: 'step',
      step: finding.step,
      // A setting the dialog has no page for opens the step at its start.
      page: page ?? 'basics',
      field: page ? (finding.field ?? undefined) : undefined,
    };
  }
  const tab = callFieldTab(finding.field);
  return tab
    ? {
        kind: 'call',
        tab,
        page: CALL_MANAGE_TABS.has(tab) ? 'manage' : 'edit',
      }
    : undefined;
};

const triggerLabel = (trigger: string): string =>
  ({
    step_started: translate('step started'),
    step_completed: translate('step completed'),
    step_rejected: translate('step rejected'),
    step_expired: translate('step expired'),
    deadline_approaching: translate('deadline approaching'),
    changes_requested: translate('changes requested'),
    changes_submitted: translate('changes submitted'),
    contribution_reopened: translate('contribution reopened'),
    contribution_submitted: translate('contribution submitted'),
  })[trigger] ?? trigger.replace(/_/g, ' ');

/** The event of the notification rule a finding is about, if it is one:
 * two rules of a step can raise the same finding. */
export const findingTrigger = (
  finding: WorkflowCheckFinding,
): string | null => {
  const ref = finding.because.find(
    (item) => item.source === 'rule' && item.field === 'trigger',
  );
  return ref?.detail ? triggerLabel(ref.detail) : null;
};

/** A call-level setting a finding names, as the edit page calls it. */
const callFieldLabel = (field: string): string =>
  ({
    rounds: translate('Rounds'),
    offerings: translate('Offerings'),
    proposal_roles: translate('Evaluator roles'),
    panel_chair: translate('Panel chair'),
    panels: translate('Panels'),
    budgets: translate('Resource pools'),
    budget_enforcement: translate('Budget enforcement'),
    workflow_steps: translate('Steps'),
    reviewer_pool: translate('Reviewer pool'),
    target_decision_days: translate('Target decision time'),
    evaluation_start: translate('Evaluation start'),
    reviewer_identity_visible_to_submitters: translate('Reviewer identity'),
  })[field] ?? field.replace(/_/g, ' ');

/** Where a finding is, in words: the step or the call, and the setting. */
export const findingWhere = (
  finding: WorkflowCheckFinding,
): { scope: string; setting: string | null } => ({
  scope: finding.step
    ? (finding.step_name ?? finding.step)
    : translate('Call settings'),
  setting: finding.field
    ? finding.step
      ? findingTrigger(finding)
        ? translate('{setting}, on {event}', {
            setting: stepFieldLabel(finding.field),
            event: findingTrigger(finding),
          })
        : stepFieldLabel(finding.field)
      : callFieldLabel(finding.field)
    : null,
});

const SEVERITY_ORDER: Record<WorkflowCheckSeverity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

/** Errors first, then warnings, then notes; otherwise as the check lists them. */
export const sortFindings = (
  findings: WorkflowCheckFinding[],
): WorkflowCheckFinding[] =>
  [...findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
