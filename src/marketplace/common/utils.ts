import { useQuery } from '@tanstack/react-query';
import { organizationGroupsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

export const parseIntField = (value) => parseInt(value, 10) || 0;

/**
 * Component limits can be fractional -- a storage tier measured in TiB may be
 * 0.1 -- so they get their own parser. parseIntField stays integer-only for its
 * other callers: node counts, vCPUs, prepaid durations.
 *
 * react-final-form re-parses on every keystroke and formats the result straight
 * back into the input, so any text that does not survive that round trip loses
 * the character the user just typed. Two shapes do not survive, and both are
 * states a decimal is typed *through* rather than typed *to*:
 *
 *   "1."   parses to 1, so the separator is erased and can never be entered
 *   "1.0"  parses to 1, so the zero is erased -- and the next keystroke lands
 *          against "1", turning an intended 1.05 into 15
 *
 * Both are handed back as text, so the input keeps what the user is looking at.
 * The value stops being a string as soon as the number is unambiguous, and the
 * limit serializers coerce either way.
 */
export const parseNumberField = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  const text = String(value).replace(',', '.');
  const parsed = parseFloat(text);
  const parts = text.split('.');
  const [whole, fraction] = parts;
  const midDecimal =
    parts.length === 2 && (fraction === '' || fraction.endsWith('0'));
  // "-" and "" allow the separator typed before any digit; a second separator,
  // or anything else that is not a number, still collapses to 0 rather than
  // being kept as text.
  if (
    midDecimal &&
    (Number.isFinite(parsed) || whole === '' || whole === '-')
  ) {
    return text;
  }
  return Number.isFinite(parsed) ? parsed : 0;
};

/** The precision an offering component declares for its limit. */
interface LimitPrecision {
  limit_decimal_places?: number | null;
}

/** How many decimal places this component accepts, 0 meaning whole numbers. */
const limitDecimalPlaces = (
  component: LimitPrecision | null | undefined,
): number => component?.limit_decimal_places || 0;

/**
 * The parser for a component's limit input.
 *
 * A component is integer-only unless the provider says otherwise, so the
 * integer parser stays the default: it keeps the browser's own step validation
 * meaningful and avoids the trailing-separator handling on inputs that can
 * never need it.
 */
export const getLimitParser = (component: LimitPrecision | null | undefined) =>
  limitDecimalPlaces(component) > 0 ? parseNumberField : parseIntField;

/**
 * The `step` for a component's limit input.
 *
 * Driven off the declared precision rather than "any", so a component that
 * accepts two places rejects a third in the browser instead of at the API.
 */
export const getLimitStep = (
  component: LimitPrecision | null | undefined,
): number => {
  const places = limitDecimalPlaces(component);
  return places > 0 ? 10 ** -places : 1;
};
export const formatIntField = (value) => (value ? value.toString() : 0);

/** Unlike parseIntField, keeps 0 distinct from "not set". */
export const parseFloatOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? null : parsed;
};
export const validateNonNegative = (value) =>
  value < 0 ? translate('Value should not be negative.') : undefined;

export const maxAmount = (limit) => (value) =>
  parseFloat(value) > parseFloat(limit)
    ? translate('Value should not be greater than {limit}.', { limit })
    : undefined;

export const minAmount = (limit) => (value) =>
  parseFloat(value) < parseFloat(limit)
    ? translate('Value should not be lesser than {limit}.', { limit })
    : undefined;

interface BillingPeriodDescription {
  periods: string[];
  multipliers: number[];
  periodKeys: string[];
}

export function getBillingPeriods(unit: string): BillingPeriodDescription {
  switch (unit) {
    case 'hour':
      return {
        periods: [
          translate('Price per hour'),
          translate('Price per day'),
          translate('Price per 30 days'),
          translate('Price per 365 days'),
        ],
        multipliers: [1, 24, 24 * 30, 24 * 365],
        periodKeys: ['hourly', 'daily', 'monthly', 'annual'],
      };

    case 'day':
      return {
        periods: [
          translate('Price per day'),
          translate('Price per 30 days'),
          translate('Price per 365 days'),
        ],
        multipliers: [1, 30, 365],
        periodKeys: ['daily', 'monthly', 'annual'],
      };

    case 'half_month':
      return {
        periods: [
          translate('Price per half-month'),
          translate('Price per month'),
          translate('Price per year'),
        ],
        multipliers: [1, 2, 24],
        periodKeys: ['half_month', 'monthly', 'annual'],
      };

    case 'month':
      return {
        periods: [translate('Price per month'), translate('Price per year')],
        multipliers: [1, 12],
        periodKeys: ['monthly', 'annual'],
      };

    default:
      return {
        periods: [translate('Price for consumption')],
        multipliers: [1],
        periodKeys: ['consumption'],
      };
  }
}

export const useOrganizationGroups = () => {
  const user = useUser();

  const query = useQuery({
    queryKey: ['organizationGroups'],

    queryFn: () =>
      getAllPages((page) =>
        organizationGroupsList({ query: { page, page_size: MAX_PAGE_SIZE } }),
      ).then((items) =>
        items.map((item) => ({
          ...item,
          value: item.url,
        })),
      ),

    staleTime: STALE_TIME,
  });

  const disabled = query.data?.length === 0 && !user.is_staff;
  const tooltip = disabled
    ? translate(
        'Access policies cannot be configured because no organization groups are defined.',
      )
    : undefined;

  return { ...query, disabled, tooltip };
};
