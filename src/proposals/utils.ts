import { DateTime } from 'luxon';

import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import {
  CallRoundFormData,
  ProposalCall,
  ProposalCallRound,
} from '@waldur/proposals/types';

export const getCallRoundStrategyOptions = () => [
  { value: 1, label: 'One-time' },
  { value: 2, label: 'Regular' },
];

export const getCallReviewStrategyOptions = () => [
  { value: 1, label: 'After round is closed' },
  { value: 2, label: 'After proposal submission' },
];

export const getCallAllocationStrategyOptions = () => [
  { value: 1, label: 'By call manager' },
  { value: 2, label: 'Automatic based on review scoring' },
];

export const getCallAllocationTimesOptions = () => [
  { value: 1, label: 'On decision' },
  { value: 2, label: 'Fixed date' },
];

export const getProposalCallInitialValues = (call: ProposalCall) => {
  return {
    ...call,
    round_strategy: getCallRoundStrategyOptions().find(
      (op) => op.label === call.round_strategy,
    )?.value,
    review_strategy: getCallReviewStrategyOptions().find(
      (op) => op.label === call.review_strategy,
    )?.value,
    allocation_strategy: getCallAllocationStrategyOptions().find(
      (op) => op.label === call.allocation_strategy,
    )?.value,
  };
};

export const getRoundStatus = (round: ProposalCallRound) => {
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

export const getCallRoundInitialValues = (
  round: ProposalCallRound,
): CallRoundFormData => {
  return {
    ...round,
    deciding_entity: getCallAllocationStrategyOptions().find(
      (op) => op.label === round.deciding_entity,
    )?.value,
    review_strategy: getCallReviewStrategyOptions().find(
      (op) => op.label === round.review_strategy,
    )?.value,
    allocation_time: getCallAllocationTimesOptions().find(
      (op) => op.label === round.allocation_time,
    )?.value,
    // FIX: we don't have timezone in round object on the backend?
    timezone: DateTime.local().zoneName,
  };
};

export const callOfferingStateAliases = (state: string): string => {
  switch (state) {
    case 'Requested': {
      return translate('Requested');
    }
    case 'Accepted': {
      return translate('Accepted');
    }
    default: {
      return state;
    }
  }
};
