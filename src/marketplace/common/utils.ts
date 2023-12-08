import { translate } from '@waldur/i18n';

import { OrderResponse } from '../orders/types';
import { BillingPeriod } from '../types';

// See also: https://github.com/erikras/redux-form/issues/1852
export const parseIntField = (value) => parseInt(value, 10) || 0;
export const formatIntField = (value) => (value ? value.toString() : 0);
export const validateNonNegative = (value) =>
  value < 0 ? translate('Value should not be negative.') : undefined;

export const maxAmount = (limit) => (value) =>
  parseInt(value, 10) > parseInt(limit, 10)
    ? translate('Value should not be greater than {limit}.', { limit })
    : undefined;

export const minAmount = (limit) => (value) =>
  parseInt(value, 10) < parseInt(limit, 10)
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

export const getMaxUnit = (items: OrderResponse[]): BillingPeriod => {
  const units: string[] = items
    .filter((item) => item.plan)
    .map((item) => item.plan_unit);

  if (units.length === 0) {
    return null;
  }

  if (units.includes('month')) {
    return 'month';
  }

  if (units.includes('half_month')) {
    return 'month';
  }

  if (units.includes('day')) {
    return 'day';
  }

  return 'hour';
};
