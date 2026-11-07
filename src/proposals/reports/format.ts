import { formatDate } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { getUserLocale } from '@/i18n/LanguageUtilsService';

type Num = number | null | undefined;

const isNumber = (value: Num): value is number =>
  value !== null && value !== undefined && !Number.isNaN(value);

/** "4,200": a count in the user's locale; empty when unknown. */
export const formatNumber = (value: Num): string =>
  isNumber(value) ? formatUsageValue(value) : '';

/** "2.5": days, to one decimal; empty when there is nothing to measure. */
export const formatDays = (value: Num): string =>
  isNumber(value) ? formatUsageValue(value, false, 1) : '';

/** "+12.5" or "-3": days late (positive) or early (negative). */
export const formatSignedDays = (value: Num): string => {
  if (!isNumber(value)) return '';
  const days = formatUsageValue(Math.abs(value), false, 1);
  if (value > 0) return `+${days}`;
  if (value < 0) return `-${days}`;
  return days;
};

/** "64%": a 0-1 share as a percentage; empty when undefined. */
export const formatShare = (value: Num): string =>
  isNumber(value)
    ? new Intl.NumberFormat(getUserLocale(), {
        style: 'percent',
        maximumFractionDigits: 0,
      }).format(value)
    : '';

/** "4.36": a mean review score on the 1-5 scale. */
export const formatScore = (value: Num): string =>
  isNumber(value) ? formatUsageValue(value, false, 2) : '';

/** "6 Nov 2026", or empty without a date. */
export const formatOptionalDate = (value: string | null | undefined): string =>
  value ? formatDate(value) : '';
