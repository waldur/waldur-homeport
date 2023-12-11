import { ProposalProtectedCall } from './types';

export const getCallRoundStrategyOptions = () => [
  { value: 1, label: 'One-time' },
  { value: 2, label: 'Regular' },
];

export const getCallReviewStrategyOptions = () => [
  { value: 1, label: 'After round is closed' },
  { value: 2, label: 'After application submission' },
];

export const getCallAllocationStrategyOptions = () => [
  { value: 1, label: 'By call manager' },
  { value: 2, label: 'Automatic based on review scoring' },
];

export const getProposalCallInitialValues = (call: ProposalProtectedCall) => {
  return {
    ...call,
    round_strategy: getCallRoundStrategyOptions().find(
      (op) => op.label === call.round_strategy,
    ).value,
    review_strategy: getCallReviewStrategyOptions().find(
      (op) => op.label === call.review_strategy,
    ).value,
    allocation_strategy: getCallAllocationStrategyOptions().find(
      (op) => op.label === call.allocation_strategy,
    ).value,
  };
};
