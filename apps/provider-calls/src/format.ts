import { translate } from 'waldur-i18n-runtime';
import {
  ProposalStates,
  RequestedOfferingStates,
  StepContributionStatus,
} from 'waldur-js-client';
import { BadgeVariant } from 'waldur-ui';

export const DASH = '—';

export const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : DASH;

/** "in 3 days", "2 days ago", "today": how far a due date is. */
export const formatRelative = (value?: string | null) => {
  if (!value) {
    return DASH;
  }
  const days = Math.round(
    (new Date(value).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );
  return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(
    days,
    'day',
  );
};

export const formatAmount = (value: number | null | undefined, unit = '') =>
  value === null || value === undefined
    ? DASH
    : `${new Intl.NumberFormat().format(value)}${unit ? ` ${unit}` : ''}`;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

export const requestStateBadge = (
  state: RequestedOfferingStates,
): { label: string; variant: BadgeVariant } =>
  ({
    requested: { label: translate('Waiting for you'), variant: 'warning' },
    accepted: { label: translate('Accepted'), variant: 'success' },
    canceled: { label: translate('Declined'), variant: 'neutral' },
  })[state] as { label: string; variant: BadgeVariant };

export const slotStatusBadge = (
  status: StepContributionStatus,
): { label: string; variant: BadgeVariant } =>
  ({
    pending: { label: translate('Not started'), variant: 'warning' },
    accepted: { label: translate('Taken over'), variant: 'blue' },
    submitted: { label: translate('Submitted'), variant: 'success' },
    declined: { label: translate('Declined'), variant: 'neutral' },
    withdrawn: { label: translate('Withdrawn'), variant: 'neutral' },
    expired: { label: translate('Expired'), variant: 'danger' },
  })[status] as { label: string; variant: BadgeVariant };

export const proposalStateBadge = (
  state: ProposalStates,
): { label: string; variant: BadgeVariant } =>
  ({
    draft: { label: translate('Draft'), variant: 'neutral' },
    submitted: { label: translate('Submitted'), variant: 'blue' },
    in_review: { label: translate('In review'), variant: 'warning' },
    accepted: { label: translate('Accepted'), variant: 'success' },
    rejected: { label: translate('Rejected'), variant: 'danger' },
    canceled: { label: translate('Canceled'), variant: 'neutral' },
  })[state] as { label: string; variant: BadgeVariant };
