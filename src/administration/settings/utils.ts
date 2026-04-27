import { titleCase } from '@/core/utils';

/**
 * Parse a comma-separated string into an array.
 * Numbers are converted to numeric type, other values remain as strings.
 */
export const parseListFieldValue = (value: string): (string | number)[] => {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map((s) => (isNaN(Number(s)) ? s : Number(s)));
};

/**
 * Format an array into a comma-separated string for display.
 */
export const formatListFieldValue = (value: unknown[]): string => {
  return value.join(', ');
};

export const getKeyTitle = (key) =>
  titleCase(key.toLowerCase().replaceAll('_', ' '));

export const SIDEBAR_STYLE_PRIMARY = 'primary';
