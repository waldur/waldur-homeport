import { getUserLocale } from '@/i18n/LanguageUtilsService';

/**
 * Format a numeric value with locale-aware thousands separators.
 * When `compact` is true, uses compact notation (e.g. 1.2M, 1K)
 * suitable for dense UI like dashboard cards.
 *
 * `maximumFractionDigits` applies to both notations. Left unset, compact keeps
 * its one place and the plain notation keeps Intl's own default of three —
 * which is a cap, not a promise, so a caller that can hold more precision than
 * that has to say so. See `formatComponentQuantity`, where the precision a
 * component declares for its limit is what decides.
 */
export const formatUsageValue = (
  value: number | string,
  compact?: boolean,
  maximumFractionDigits?: number,
): string => {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);

  const locale = getUserLocale();

  if (compact) {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: maximumFractionDigits ?? 1,
    }).format(num);
  }

  // An undefined option is the same to Intl as an absent one, so the default
  // path formats exactly as it did before the option was threaded through.
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(num);
};
