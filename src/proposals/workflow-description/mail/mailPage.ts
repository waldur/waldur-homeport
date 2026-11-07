import { translate } from '@/i18n';

import { recipientLabel, triggerLabel } from './labels';
import { MailTarget } from './queries';

/** The page where a mail's rules and wording are changed. */
export const CALL_MAIL_STATE = 'protected-call.mail';

/** The page's URL parameters for a mail. */
export const mailPageParams = (target: MailTarget) => ({
  step: target.step,
  step_name: target.stepName,
  trigger: target.trigger,
  recipient: target.recipient,
  days_before:
    target.daysBefore === null || target.daysBefore === undefined
      ? undefined
      : String(target.daysBefore),
  mail_type: target.mailType,
  variant: target.variant,
});

/** The mail a page's URL parameters name. */
export const mailTargetFromParams = (
  params: Record<string, string | undefined>,
): MailTarget => ({
  step: params.step || undefined,
  stepName: params.step_name || undefined,
  trigger: params.trigger || undefined,
  recipient: params.recipient || undefined,
  daysBefore: params.days_before ? Number(params.days_before) : null,
  mailType: params.mail_type || undefined,
  variant: params.variant || undefined,
});

/** "Step: event → audience" for a step's mail; the mail's own label else. */
export const mailTitle = (target: MailTarget, label?: string): string =>
  target.step
    ? translate('{step}: {event} → {audience}', {
        step: target.stepName ?? target.step,
        event: triggerLabel(target.trigger ?? '', target.daysBefore),
        audience: recipientLabel(target.recipient ?? ''),
      })
    : (label ?? translate('Mail'));
