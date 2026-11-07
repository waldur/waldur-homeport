import { RoundStep } from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';

/** A date as the API takes it, from what a date-time field holds. */
export const toIsoDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  return (value instanceof Date ? value : new Date(value)).toISOString();
};

/**
 * Opening a round step is refused while some proposals of the round have not
 * reached it, and the refusal says how many in `lagging_count`. Returns that
 * count and the backend's message, or null for any other error.
 */
export const getLaggingRefusal = (
  error: any,
): { count: number; detail: string } | null => {
  const status = error?.status ?? error?.response?.status;
  if (status !== 400) return null;
  const body = getErrorBody(error) as
    { lagging_count?: number; detail?: string } | undefined;
  if (typeof body?.lagging_count !== 'number') return null;
  return { count: body.lagging_count, detail: body.detail ?? '' };
};

/** Where a step run once per round stands in the round, for people. */
export const roundStepState = (step: RoundStep): string => {
  if (!step.round_scoped) {
    return step.proposals_awaiting_advance
      ? translate('{count} waiting to be moved on', {
          count: step.proposals_awaiting_advance,
        })
      : '';
  }
  if (!step.opened_at) {
    return step.proposals_at_step
      ? translate('Not opened: {count} proposal(s) waiting', {
          count: step.proposals_at_step,
        })
      : translate('Not opened');
  }
  if (step.has_reports) {
    return translate('Open: {submitted} of {total} report(s) submitted', {
      submitted: step.reports_submitted,
      total: step.reports_total,
    });
  }
  return step.proposals_at_step
    ? translate('Open: {count} proposal(s) to complete for the round', {
        count: step.proposals_at_step,
      })
    : translate('Open');
};
