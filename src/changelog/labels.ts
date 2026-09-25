import { translate } from '@/i18n';

export const getVersionsBehindLabel = (count: number) =>
  count === 1
    ? translate('1 version behind')
    : translate('{count} versions behind', { count });
