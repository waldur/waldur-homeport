import { translate } from '@/i18n';

/**
 * Label for a storage quota cell. A volume without a volume type has no
 * `type_name` in the API payload, so it gets the plain label.
 */
export const getStorageTitle = (typeName?: string | null) =>
  typeName
    ? translate('{type} storage', { type: typeName })
    : translate('Storage');
