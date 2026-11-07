import {
  WorkflowDescription,
  WorkflowDescriptionRule,
  WorkflowDescriptionStep,
} from 'waldur-js-client';

import { translate } from '@/i18n';

import { recipientLabel, triggerLabel } from './mail/labels';
import { actorTitle, applicantLabelText } from './summary';

const yesNo = (value: boolean) => (value ? translate('Yes') : translate('No'));

/** The role matrix's Export: one line per step and role, not per step. */
export const roleMatrixExportFields = () => [
  translate('Step'),
  translate('Step enabled'),
  translate('Role'),
  translate('Sees the step'),
  translate('Reads its outputs'),
  translate('Contributes'),
  translate('Completes'),
  translate('Notified'),
  translate('Notified on'),
  translate('Applicant label'),
];

/** The five flags, the notifying triggers and, for the applicant, the label
 * their tracker shows -- for the roles in `actorKeys`, or every role. */
export const roleMatrixExportRows = (
  steps: WorkflowDescriptionStep[],
  description: WorkflowDescription,
  actorKeys?: string[],
): string[][] => {
  const actors = new Map(description.actors.map((a) => [a.key, a]));
  return steps.flatMap((step) =>
    step.roles
      .filter((cell) => !actorKeys || actorKeys.includes(cell.actor))
      .map((cell) => {
        const actor = actors.get(cell.actor);
        return [
          step.name,
          yesNo(step.enabled),
          actor ? actorTitle(actor) : cell.actor,
          yesNo(cell.sees.value),
          yesNo(cell.reads_outputs.value),
          yesNo(cell.contributes.value),
          yesNo(cell.completes.value),
          yesNo(cell.notified.value),
          cell.notified.triggers
            .map((t) =>
              t.days_before != null
                ? `${t.trigger} (${t.days_before})`
                : t.trigger,
            )
            .join(', '),
          cell.actor === 'applicant'
            ? applicantLabelText(step.applicant.label_kind, step.name)
            : '',
        ];
      }),
  );
};

/** A line of the notification matrix: one event of one step, with the
 * rules that mail someone on it. */
export interface NotificationMatrixRow {
  id: string;
  stepKey: string;
  stepName: string;
  stepEnabled: boolean;
  trigger: string;
  daysBefore: number | null;
  rules: WorkflowDescriptionRule[];
}

export const notificationMatrixRows = (
  description: WorkflowDescription,
  hideDisabled = false,
): NotificationMatrixRow[] => {
  const result: NotificationMatrixRow[] = [];
  for (const step of description.steps) {
    if (hideDisabled && !step.enabled) continue;
    const byEvent = new Map<string, NotificationMatrixRow>();
    for (const rule of step.notifications) {
      const id = `${step.key}:${rule.trigger}:${rule.days_before ?? ''}`;
      if (!byEvent.has(id)) {
        byEvent.set(id, {
          id,
          stepKey: step.key,
          stepName: step.name,
          stepEnabled: step.enabled,
          trigger: rule.trigger,
          daysBefore: rule.days_before,
          rules: [],
        });
      }
      byEvent.get(id)!.rules.push(rule);
    }
    result.push(...byEvent.values());
  }
  return result;
};

/** The notification matrix's Export: one line per rule, not per event. */
export const notificationMatrixExportFields = () => [
  translate('Step'),
  translate('Step enabled'),
  translate('Event'),
  translate('Recipient'),
  translate('Proposal role'),
  translate('Enabled'),
  translate('Customized'),
  translate('Resolves to'),
];

/** Who gets which mail, and whether the rule is on and worded for this
 * call. */
export const notificationMatrixExportRows = (
  rows: NotificationMatrixRow[],
): string[][] =>
  rows.flatMap((row) =>
    row.rules.map((rule) => [
      row.stepName,
      yesNo(row.stepEnabled),
      triggerLabel(rule.trigger, rule.days_before),
      recipientLabel(rule.recipient),
      rule.proposal_role ?? '',
      yesNo(rule.enabled),
      yesNo(rule.customised),
      rule.actors.join(', '),
    ]),
  );
