import { isEmpty } from '@waldur/core/utils';

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
