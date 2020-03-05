import { translate } from '@waldur/i18n';

// See also: https://github.com/erikras/redux-form/issues/1852
export const parseIntField = value => parseInt(value, 10) || 0;
export const formatIntField = value => (value ? value.toString() : 0);
export const validateNonNegative = value =>
  value < 0 ? translate('Value should not be negative.') : undefined;

export const maxAmount = limit => value =>
  parseInt(value, 10) > parseInt(limit, 10)
    ? translate('Value should not be greater than {limit}.', { limit })
    : undefined;

export const minAmount = limit => value =>
  parseInt(value, 10) < parseInt(limit, 10)
    ? translate('Value should not be lesser than {limit}.', { limit })
    : undefined;

interface BillingPeriodDescription {
  periods: string[];
  multipliers: number[];
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
      };

    case 'day':
      return {
        periods: [
          translate('Price per day'),
          translate('Price per 30 days'),
          translate('Price per 365 days'),
        ],
        multipliers: [1, 30, 365],
      };

    case 'half_month':
      return {
        periods: [
          translate('Price per half-month'),
          translate('Price per month'),
          translate('Price per year'),
        ],
        multipliers: [1, 2, 24],
      };

    case 'month':
      return {
        periods: [translate('Price per month'), translate('Price per year')],
        multipliers: [1, 12],
      };

    default:
      return {
        periods: [translate('Price for consumption')],
        multipliers: [1],
      };
  }
}
