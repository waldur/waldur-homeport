import { translate } from '@waldur/i18n';

export const feedbackOptions = () => [
  { value: 10, label: translate('10 - Very positive') },
  { value: 9, label: '9' },
  { value: 8, label: '8' },
  { value: 7, label: '7' },
  { value: 6, label: '6' },
  { value: 5, label: '5' },
  { value: 4, label: '4' },
  { value: 3, label: '3' },
  { value: 2, label: '2' },
  { value: 1, label: translate('1 - Very negative') },
];
