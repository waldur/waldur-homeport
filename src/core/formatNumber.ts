import { getUserLocale } from '@/i18n/LanguageUtilsService';

/**
 * Format a numeric value with locale-aware thousands separators.
 * When `compact` is true, uses compact notation (e.g. 1.2M, 1K)
 * suitable for dense UI like dashboard cards.
 */
export const formatUsageValue = (
  value: number | string,
  compact?: boolean,
  maximumFractionDigits: number = 1,
): string => {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);

  const locale = getUserLocale();

  if (compact) {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits,
    }).format(num);
  }

  return new Intl.NumberFormat(locale).format(num);
};
