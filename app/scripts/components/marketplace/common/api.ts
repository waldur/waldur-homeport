import { getAll } from '@waldur/core/api';
import { Category, Product } from '@waldur/marketplace/types';

export const getCategories = (): Promise<Category[]> => getAll('/marketplace-categories/');
export const getProducts = (options?: {}): Promise<Product[]> =>
  getAll('/marketplace-offerings/', options);
