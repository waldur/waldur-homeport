import { DateTime } from 'luxon';

/**
 * Get the current billing period in YYYY-MM format
 */
export const getCurrentBillingPeriod = (): string => {
  return DateTime.now().toFormat('yyyy-MM');
};

/**
 * Format billing period for display
 */
export const formatBillingPeriod = (period: string): string => {
  const date = DateTime.fromFormat(period, 'yyyy-MM');
  if (!date.isValid) return period;
  return date.toFormat('MMMM yyyy');
};

/**
 * Get the previous N billing periods
 */
export const getPreviousBillingPeriods = (count: number): string[] => {
  const periods: string[] = [];
  for (let i = 0; i < count; i++) {
    const date = DateTime.now().minus({ months: i });
    periods.push(date.toFormat('yyyy-MM'));
  }
  return periods;
};
