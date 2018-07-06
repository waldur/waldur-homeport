import { getList, post } from '@waldur/core/api';
import { Category } from '@waldur/marketplace/types';
import { Offering } from '@waldur/offering/types';

export const loadCategories = () => getList<Category>('/marketplace-categories/');
export const createOffering = data => post<Offering>('/marketplace-offerings/', data);
