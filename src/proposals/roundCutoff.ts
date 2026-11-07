import { useQuery } from '@tanstack/react-query';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { findAllocationDecision } from '@/proposals/workflow/constants';
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '@/proposals/workflow/queries';

interface WithCutoff {
  cutoff_time?: string | null;
}

/** A round without a cut-off stays open until a call manager closes it. */
export const isOpenEnded = (round?: WithCutoff | null): boolean =>
  Boolean(round) && !round.cutoff_time;

export const continuouslyOpenLabel = () => translate('Continuously open');

/**
 * The round's cut-off as text: the date, or "Continuously open" for a round
 * without one. Null without a round.
 */
export const formatRoundCutoff = (
  round: WithCutoff | null | undefined,
  format: (value: string) => string = formatDateTime,
): string | null => {
  if (!round) return null;
  return round.cutoff_time
    ? format(round.cutoff_time)
    : continuouslyOpenLabel();
};

interface CallTiming {
  evaluation_start?: string | null;
  publish_results?: string | null;
}

/**
 * Why the call cannot run a round without a cut-off, or null. Mirrors the
 * backend: nothing may wait for a cut-off that never comes.
 */
export const openEndedRoundBlockedReason = (
  call: CallTiming,
  allocationTime?: string | null,
): string | null => {
  if (call.evaluation_start && call.evaluation_start !== 'on_submission') {
    return translate(
      'The call starts evaluation at the round cut-off, so its rounds need one.',
    );
  }
  if (call.publish_results && call.publish_results !== 'immediately') {
    return translate(
      'The call publishes results with the round, so its rounds need a cut-off.',
    );
  }
  if (allocationTime === 'fixed_date') {
    return translate(
      "The call allocates on the round's fixed date, so its rounds need a cut-off.",
    );
  }
  return null;
};

export const useOpenEndedRoundBlockedReason = (
  call: CallTiming & { uuid: string },
): string | null => {
  const { data: steps } = useQuery({
    queryKey: callWorkflowStepsKey(call.uuid),
    queryFn: () => fetchCallWorkflowSteps(call.uuid),
  });
  return openEndedRoundBlockedReason(
    call,
    findAllocationDecision(steps)?.allocation_time,
  );
};
