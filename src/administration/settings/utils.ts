import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const getKeyTitle = (key) =>
  titleCase(key.toLowerCase().replaceAll('_', ' '));

export const SIDEBAR_STYLES = [
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
];
