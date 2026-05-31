import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  NestedRound,
  ProposalReviewStateEnum,
  ProtectedRound,
  ProtectedRoundRequest,
} from 'waldur-js-client';
import { User } from 'waldur-js-client';

import { translate } from '@/i18n';
import { usePresetBreadcrumbItems } from '@/navigation/header/breadcrumb/utils';
import { IBreadcrumbItem } from '@/navigation/types';
import { RoleEnum } from '@/permissions/enums';
import {
  Call,
  CallOfferingState,
  CallState,
  ProposalState,
  RoundAllocationStrategy,
  RoundAllocationTime,
  RoundReviewStrategy,
} from '@/proposals/types';

export const getRoundReviewStrategyOptions = () =>
  [
    { value: 'after_round', label: translate('After round is closed') },
    { value: 'after_proposal', label: translate('After proposal submission') },
  ] as { value: RoundReviewStrategy; label: string }[];

export const formatRoundReviewStrategy = (value: RoundReviewStrategy) =>
  getRoundReviewStrategyOptions().find(
    (option) => option.value === value?.toLowerCase(),
  )?.label || value;

export const getRoundAllocationStrategyOptions = () =>
  [
    { value: 'by_call_manager', label: translate('By call manager') },
    {
      value: 'automatic',
      label: translate('Automatic based on review scoring'),
    },
  ] as { value: RoundAllocationStrategy; label: string }[];

export const formatRoundAllocationStrategy = (value: RoundAllocationStrategy) =>
  getRoundAllocationStrategyOptions().find(
    (option) => option.value === value?.toLowerCase(),
  )?.label || value;

export const getRoundAllocationTimeOptions = () =>
  [
    { value: 'on_decision', label: translate('On decision') },
    { value: 'fixed_date', label: translate('Fixed date') },
  ] as { value: RoundAllocationTime; label: string }[];

export const formatRoundAllocationTime = (value: RoundAllocationTime) =>
  getRoundAllocationTimeOptions().find(
    (option) => option.value === value?.toLowerCase(),
  )?.label || value;

export const getCallStateOptions = () =>
  [
    { value: 'archived', label: translate('Archived') },
    { value: 'active', label: translate('Active') },
    { value: 'draft', label: translate('Draft') },
  ] as { value: CallState; label: string }[];

export const formatCallState = (value: CallState) =>
  getCallStateOptions().find((option) => option.value === value)?.label ||
  value;

const getCallOfferingStateOptions = () =>
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
      label: translate('Submitted'),
      value: 'submitted',
    },
    {
      label: translate('In review'),
      value: 'in_review',
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
    { value: 'in_review', label: translate('In review') },
    { value: 'submitted', label: translate('Submitted') },
    { value: 'rejected', label: translate('Rejected') },
  ] as { value: ProposalReviewStateEnum; label: string }[];

export const formatReviewState = (value: ProposalReviewStateEnum) =>
  getReviewStateOptions().find((option) => option.value === value)?.label ||
  value;

export const getReviewStateBadgeVariant = (value: ProposalReviewStateEnum) =>
  value === 'in_review' || value === 'submitted'
    ? 'warning'
    : value === 'rejected'
      ? 'danger'
      : 'secondary';

export const isReviewInFinalState = (state: ProposalReviewStateEnum) =>
  !['in_review'].includes(state);

export const getRoundStatus = (round: NestedRound) => {
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

export const getRoundsWithStatus = (rounds: NestedRound[]) =>
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
    return { label: translate('Archived'), color: 'gray' };
  else {
    return { label: call.state, color: 'secondary' };
  }
};

export const getRoundInitialValues = (
  round: ProtectedRound,
): ProtectedRoundRequest => ({
  ...round,
  // FIX: we don't have timezone in round object on the backend?
  // @ts-ignore
  timezone: DateTime.local().zoneName,
});

export const checkIsCallManager = (call: Call, user: User): boolean =>
  !!user?.permissions?.find(
    (permission) =>
      permission.scope_type === 'call' &&
      permission.scope_uuid === call?.uuid &&
      permission.role_name === RoleEnum.CALL_MANAGER,
  );

export const useCallBreadcrumbItems = (
  call: Pick<Call, 'customer_uuid' | 'customer_name' | 'name'>,
): IBreadcrumbItem[] => {
  const { getOrganizationBreadcrumbItem } = usePresetBreadcrumbItems();

  return useMemo(
    () => [
      {
        key: 'organizations',
        text: translate('Organizations'),
        to: 'organizations',
      },
      call?.customer_uuid
        ? getOrganizationBreadcrumbItem({
            uuid: call.customer_uuid,
            name: call?.customer_name || '...',
          })
        : {
            key: 'organization.dashboard',
            text: '...',
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
    ],
    [call],
  );
};

/**
 * Simplified breadcrumb for public call pages.
 * Uses public routes that don't require organization access.
 */
export const usePublicCallBreadcrumbItems = (
  call: Pick<Call, 'name'>,
): IBreadcrumbItem[] => {
  return useMemo(
    () => [
      {
        key: 'calls-list',
        text: translate('Calls for proposals'),
        to: 'public-calls.list-public',
      },
      {
        key: 'call',
        text: call?.name || '...',
        truncate: true,
        active: true,
      },
    ],
    [call],
  );
};
