import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

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

export const FONT_FAMILIES = [
  {
    label: 'Inter',
    value: 'Inter',
  },
  {
    label: 'Maven Pro',
    value: 'Maven Pro',
  },
];

export const SIDEBAR_STYLE_PRIMARY = 'primary';

export const SIDEBAR_STYLES = [
  {
    label: translate('Primary'),
    value: SIDEBAR_STYLE_PRIMARY,
  },
  {
    label: translate('Dark primary'),
    value: 'accent',
  },
  {
    label: translate('Light primary'),
    value: 'accent-light',
  },
  {
    label: translate('Dark'),
    value: 'dark',
  },
  {
    label: translate('Light'),
    value: 'light',
  },
  {
    label: translate('Match theme'),
    value: 'auto',
  },
];
