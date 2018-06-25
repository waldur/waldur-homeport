import { getAll } from '@waldur/core/api';
import { Category } from '@waldur/marketplace/types';

export const getCategories = (): Promise<Category[]> => getAll('/marketplace-categories/');
