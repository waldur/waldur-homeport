import { getList, sendForm } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { Category } from '@waldur/marketplace/types';
import { Offering } from '@waldur/offering/types';

export const loadCategories = () => getList<Category>('/marketplace-categories/');
export const createOffering = data =>
  sendForm<Offering>('POST', `${ENV.apiEndpoint}api/marketplace-offerings/`, data);
