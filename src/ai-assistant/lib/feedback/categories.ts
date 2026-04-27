import type { FeedbackCategoryEnum } from 'waldur-js-client';

import { translate } from '@/i18n';

interface FeedbackCategoryOption {
  key: FeedbackCategoryEnum;
  label: string;
}

const FEEDBACK_CATEGORIES: FeedbackCategoryOption[] = [
  { key: 'inaccurate', label: translate('Wrong or inaccurate') },
  { key: 'incomplete', label: translate('Incomplete answer') },
  { key: 'misunderstood', label: translate("Didn't understand my question") },
  { key: 'slow_or_failed', label: translate('Too slow or failed') },
  { key: 'other', label: translate('Other') },
];

export const FEEDBACK_SELECT_OPTIONS = FEEDBACK_CATEGORIES.map((c) => ({
  value: c.key,
  label: c.label,
}));

export const getFeedbackCategoryLabel = (key: string): string => {
  return FEEDBACK_CATEGORIES.find((c) => c.key === key)?.label ?? key;
};
