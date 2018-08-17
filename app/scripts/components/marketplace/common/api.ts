import { getAll, getById } from '@waldur/core/api';
import { Category, Product } from '@waldur/marketplace/types';

export const getCategories = () =>
  getAll<Category>('/marketplace-categories/');

export const getProducts = (options?: {}) =>
  getAll<Product>('/marketplace-offerings/', options);

export const getProduct = id =>
  getById<Product>('/marketplace-offerings/', id);
