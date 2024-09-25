import { useQuery } from '@tanstack/react-query';

import { translate } from '@waldur/i18n';

import { getAllOrganizationGroups } from './api';

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

export const useOrganizationGroups = () =>
  useQuery(
    ['organizationGroups'],
    () =>
      getAllOrganizationGroups().then((items) => {
        return items.map((item) => ({
          ...item,
          name: [item.parent_name, item.name].filter(Boolean).join(' ➔ '),
          value: item.url,
        }));
      }),
    { staleTime: 5 * 60 * 1000 },
  );
