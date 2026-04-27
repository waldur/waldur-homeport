import { translate } from '@/i18n';

export const validateEmailPatterns = (value) => {
  if (!value) return undefined;
  const patterns = Array.isArray(value)
    ? value.filter(Boolean)
    : value.split(' ').filter(Boolean);

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
