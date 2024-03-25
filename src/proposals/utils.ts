import { DateTime } from 'luxon';

import { formatDate, parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import {
  Call,
  CallOfferingState,
  CallState,
  ProposalState,
  ReviewState,
  Round,
  RoundAllocationStrategy,
  RoundAllocationTime,
  RoundFormData,
  RoundReviewStrategy,
} from '@waldur/proposals/types';

export const getRoundReviewStrategyOptions = () =>
  [
    { value: 'after_round', label: translate('After round is closed') },
    { value: 'after_proposal', label: translate('After proposal submission') },
  ] as { value: RoundReviewStrategy; label: string }[];

export const formatRoundReviewStrategy = (value: RoundReviewStrategy) =>
  getRoundReviewStrategyOptions().find((option) => option.value === value)
    ?.label || value;

export const getRoundAllocationStrategyOptions = () =>
  [
    { value: 'by_call_manager', label: translate('By call manager') },
    {
      value: 'automatic',
      label: translate('Automatic based on review scoring'),
    },
  ] as { value: RoundAllocationStrategy; label: string }[];

export const formatRoundAllocationStrategy = (value: RoundAllocationStrategy) =>
  getRoundAllocationStrategyOptions().find((option) => option.value === value)
    ?.label || value;

export const getRoundAllocationTimeOptions = () =>
  [
    { value: 'on_decision', label: translate('On decision') },
    { value: 'fixed_date', label: translate('Fixed date') },
  ] as { value: RoundAllocationTime; label: string }[];

export const formatRoundAllocationTime = (value: RoundAllocationTime) =>
  getRoundAllocationTimeOptions().find((option) => option.value === value)
    ?.label || value;

export const getCallStateActions = () =>
  [
    { label: translate('Activate'), value: 'active', action: 'activate' },
    { label: translate('Archive'), value: 'archived', action: 'archive' },
  ] as { value: CallState; label: string; action: string }[];

export const getCallStateOptions = () =>
  [
    { value: 'archived', label: translate('Archived') },
    { value: 'active', label: translate('Active') },
    { value: 'draft', label: translate('Draft') },
  ] as { value: CallState; label: string }[];

export const formatCallState = (value: CallState) =>
  getCallStateOptions().find((option) => option.value === value)?.label ||
  value;

export const getCallOfferingStateOptions = () =>
  [
    { value: 'requested', label: translate('Requested') },
    { value: 'accepted', label: translate('Accepted') },
    { value: 'canceled', label: translate('Canceled') },
  ] as { value: CallOfferingState; label: string }[];

export const formatCallOfferingState = (value: CallOfferingState) =>
  getCallOfferingStateOptions().find((option) => option.value === value)
    ?.label || value;

export const getProposalStateOptions = () =>
  [
    {
      label: translate('Draft'),
      value: 'draft',
    },
    {
      label: translate('Team verification'),
      value: 'team_verification',
    },
    {
      label: translate('Submitted'),
      value: 'submitted',
    },
    {
      label: translate('In review'),
      value: 'in_review',
    },
    {
      label: translate('In revision'),
      value: 'in_revision',
    },
    {
      label: translate('Accepted'),
      value: 'accepted',
    },
    {
      label: translate('Rejected'),
      value: 'rejected',
    },
    {
      label: translate('Canceled'),
      value: 'canceled',
    },
  ] as { value: ProposalState; label: string }[];

export const formatProposalState = (value: ProposalState) =>
  getProposalStateOptions().find((option) => option.value === value)?.label ||
  value;

export const getReviewStateOptions = () =>
  [
    { value: 'created', label: translate('Created') },
    { value: 'in_review', label: translate('In review') },
    { value: 'submitted', label: translate('Submitted') },
    { value: 'rejected', label: translate('Rejected') },
  ] as { value: ReviewState; label: string }[];

export const formatReviewState = (value: ReviewState) =>
  getReviewStateOptions().find((option) => option.value === value)?.label ||
  value;

export const getRoundStatus = (round: Round) => {
  const now = DateTime.now();
  const start = parseDate(round.start_time);
  if (start > now)
    return { label: translate('Scheduled'), code: 1, color: 'secondary' };
  else {
    const end = parseDate(round.cutoff_time);
    if (end < now)
      return { label: translate('Ended'), code: -1, color: 'danger' };
    else return { label: translate('Open'), code: 0, color: 'success' };
  }
};

export const getCallStatus = (call: Call) => {
  if (call.state == 'active')
    return { label: translate('Active'), color: 'success' };
  else if (call.state == 'draft')
    return { label: translate('Draft'), color: 'danger' };
  else if (call.state == 'archived')
    return { label: translate('Archived'), color: 'secondary' };
  else {
    return { label: call.state, color: 'secondary' };
  }
};

/** Returns round items in sort of [earliest open, earliest scheduled, oldest ended] */
export const getSortedRoundsWithStatus = (
  rounds: Round[],
): Array<
  Round & {
    state: ReturnType<typeof getRoundStatus>;
  }
> => {
  const roundsWithState = rounds.map((round) => {
    Object.assign(round, { state: getRoundStatus(round) });
    return round as any;
  });
  const endedRounds = roundsWithState
    .filter((round) => round.state.code === -1)
    .sort((a, b) =>
      formatDate(a.cutoff_time) < formatDate(b.cutoff_time) ? 1 : -1,
    );
  const openRounds = roundsWithState
    .filter((round) => round.state.code === 0)
    .sort((a, b) =>
      formatDate(a.cutoff_time) > formatDate(b.cutoff_time) ? 1 : -1,
    );
  const scheduledRounds = roundsWithState
    .filter((round) => round.state.code === 1)
    .sort((a, b) =>
      formatDate(a.cutoff_time) > formatDate(b.cutoff_time) ? 1 : -1,
    );
  return openRounds.concat(scheduledRounds).concat(endedRounds);
};

export const getRoundInitialValues = (round: Round): RoundFormData => ({
  ...round,
  // FIX: we don't have timezone in round object on the backend?
  timezone: DateTime.local().zoneName,
});
