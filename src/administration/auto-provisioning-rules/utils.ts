import { translate } from '@/i18n';

/**
 * Normalise a value coming from `CommaSeparatedListGroup` into an array.
 *
 * The control emits an array as soon as the user types into it, while a field
 * left untouched still holds the string the dialog seeded it with, so both
 * shapes reach the submit handler. Treating one as the other throws and the
 * form silently refuses to submit.
 */
export const toList = (
  value: string | string[] | undefined | null,
  separator: ',' | ' ' = ',',
): string[] => {
  if (!value) return [];
  const items = Array.isArray(value) ? value : value.split(separator);
  return items.map((item) => item.trim()).filter(Boolean);
};

export const validateEmailPatterns = (value) => {
  const patterns = toList(value, ' ');

  const emailLikeRegex = /@.+\..+/;

  for (const pattern of patterns) {
    if (!emailLikeRegex.test(pattern)) {
      return translate('Please use valid email patterns.');
    }
    try {
      new RegExp(pattern);
    } catch {
      return translate('Pattern is not a valid regex.');
    }
  }
  return undefined;
};
