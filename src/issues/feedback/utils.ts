import { translate } from '@waldur/i18n';

export const feedbackOptions = () => [
  { value: 5, label: translate('Very positive') },
  { value: 4, label: translate('Positive') },
  { value: 3, label: translate('Neutral') },
  { value: 2, label: translate('Negative') },
  { value: 1, label: translate('Very negative') },
];
