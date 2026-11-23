import { getDateLocale, translate } from 'waldur-i18n-runtime';
import {
  ProposalStates,
  RequestedOfferingStates,
  StepContributionStatus,
} from 'waldur-js-client';
import { BadgeVariant } from 'waldur-ui';

export const DASH = '—';

const DAY_MS = 24 * 60 * 60 * 1000;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** A Date for an API value. A date-only value is that day in the local
 *  zone: `new Date('2026-09-10')` is UTC midnight, the 9th west of UTC. */
const toDate = (value: string): Date | null => {
  const date = DATE_ONLY.test(value)
    ? new Date(
        Number(value.slice(0, 4)),
        Number(value.slice(5, 7)) - 1,
        Number(value.slice(8, 10)),
      )
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** 26 Feb 2027, in the app's date locale (not the browser's). */
export const formatDate = (value?: string | null) => {
  const date = value ? toDate(value) : null;
  return date
    ? date.toLocaleDateString(getDateLocale(), {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : DASH;
};

/** "in 3 days", "2 days ago", "today": how far a due date is, in whole
 *  calendar days, so a date three days out never reads as two. */
export const formatRelative = (value?: string | null) => {
  const date = value ? toDate(value) : null;
  if (!date) {
    return DASH;
  }
  const days = Math.round((startOfDay(date) - startOfDay(new Date())) / DAY_MS);
  return new Intl.RelativeTimeFormat(getDateLocale(), {
    numeric: 'auto',
  }).format(days, 'day');
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
