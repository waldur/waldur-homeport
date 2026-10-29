import { titleCase } from '@/core/utils';
import { translate } from '@/i18n';

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

export const isSettingModified = (
  item: { default?: unknown; type?: string } | undefined,
  value: unknown,
  // Only staff receive secret values; everyone else gets them blanked
  { secretsRedacted = false }: { secretsRedacted?: boolean } = {},
): boolean => {
  if (
    !item ||
    item.default === undefined ||
    value === undefined ||
    value === null
  ) {
    return false;
  }

  if (secretsRedacted && item.type === 'secret_field') {
    return false;
  }

  // The edit form holds a list as comma-separated text
  if (item.type === 'list_field' && typeof value === 'string') {
    return isSettingModified(item, parseListFieldValue(value));
  }

  if (item.type === 'boolean' || typeof item.default === 'boolean') {
    return Boolean(value) !== Boolean(item.default);
  }

  if (item.type === 'integer' || typeof item.default === 'number') {
    if (value === '' || value === ' ') return false;
    return Number(value) !== Number(item.default);
  }

  if (typeof item.default === 'string' && typeof value === 'string') {
    if (item.default === '' && value.trim() === '') {
      return false;
    }
    return value !== item.default;
  }

  if (Array.isArray(item.default) || typeof item.default === 'object') {
    try {
      return JSON.stringify(value) !== JSON.stringify(item.default);
    } catch {
      return false;
    }
  }

  return value !== item.default;
};

export const formatDefaultValue = (item: {
  default?: unknown;
  type?: string;
  options?: Array<{ value: string; label: string }>;
}): string => {
  if (
    item?.default === undefined ||
    item?.default === null ||
    item?.default === ''
  ) {
    return translate('Empty');
  }
  if (item.type === 'boolean' || typeof item.default === 'boolean') {
    return item.default ? translate('Yes') : translate('No');
  }
  if (
    (item.type === 'choice_field' || item.type === 'select') &&
    item.options
  ) {
    const match = item.options.find((opt) => opt.value === item.default);
    if (match) return match.label;
  }
  if (Array.isArray(item.default)) {
    return item.default.length > 0
      ? item.default.join(', ')
      : translate('Empty');
  }
  if (typeof item.default === 'object') {
    return JSON.stringify(item.default);
  }
  return String(item.default);
};
