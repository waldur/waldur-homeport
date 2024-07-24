import { translate } from '@waldur/i18n';

export const SLUG_COLUMN = {
  title: translate('Slug'),
  render: ({ row }) => <>{row.slug}</>,
  keys: ['slug'],
  optional: true,
  id: 'slug',
};
