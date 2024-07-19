import { DateTime } from 'luxon';

import { translate } from '@waldur/i18n';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { RoleEnum } from '@waldur/permissions/enums';
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
import { User } from '@waldur/workspace/types';

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

export const getNonCanceledProposalStates = () => {
  const proposalStates = getProposalStateOptions();
  return proposalStates
    .filter((state) => state.value !== 'canceled')
    .map((state) => state.value);
};

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
  if (!round) {
    return null;
  } else if (round.status === 'scheduled') {
    return {
      label: translate('Scheduled'),
      value: round.status,
      color: 'secondary',
    };
  } else if (round.status === 'open') {
    return { label: translate('Open'), value: round.status, color: 'success' };
  } else if (round.status === 'ended') {
    return { label: translate('Ended'), value: round.status, color: 'danger' };
  }
};

export const getRoundsWithStatus = (rounds: Round[]) =>
  rounds.map((round) => ({
    ...round,
    status: getRoundStatus(round),
  }));

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

export const getRoundInitialValues = (round: Round): RoundFormData => ({
  ...round,
  // FIX: we don't have timezone in round object on the backend?
  timezone: DateTime.local().zoneName,
});

export const checkIsCallManager = (call: Call, user: User): boolean =>
  !!user?.permissions?.find(
    (permission) =>
      permission.scope_type === 'call' &&
      permission.scope_uuid === call?.uuid &&
      permission.role_name === RoleEnum.CALL_MANAGER,
  );

export const getCallBreadcrumbItems = (call: Call): IBreadcrumbItem[] => [
  {
    key: 'organizations',
    text: translate('Organizations'),
    to: 'organizations',
  },
  {
    key: 'organization.dashboard',
    text: call?.customer_name || '...',
    to: 'organization.dashboard',
    params: call ? { uuid: call.customer_uuid } : undefined,
    ellipsis: 'xl',
    maxLength: 11,
  },
  {
    key: 'call-list',
    text: translate('Calls for proposals'),
    to: 'call-management.call-list',
    params: call ? { uuid: call.customer_uuid } : undefined,
    ellipsis: 'xl',
  },
  {
    key: 'call',
    text: call?.name || '...',
    truncate: true,
    active: true,
  },
];
