import { isEmpty } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const isValidAttribute = (data: any): boolean => {
  if (typeof data === 'string' && data.trim().length > 0) {
    return true;
  }
  if (typeof data === 'number' || typeof data === 'boolean') {
    return true;
  }
  if (typeof data === 'object' && !isEmpty(data)) {
    return true;
  }
  if (Array.isArray(data) && data.length > 0) {
    return true;
  }
  return false;
};

export const getOfferingPolicyActionOptions = () => [
  {
    value: 'block_creation_of_new_resources',
    label: translate('Block creation of new resources'),
  },
  {
    value: 'notify_organization_owners',
    label: translate('Notify organization owners'),
  },
];
