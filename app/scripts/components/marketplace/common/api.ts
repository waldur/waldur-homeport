import { getAll, getById, sendForm } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { State } from '@waldur/marketplace/cart/types';
import { Category, Product, Provider } from '@waldur/marketplace/types';

export const getCategories = () =>
  getAll<Category>('/marketplace-categories/');

export const getCategory = (id: string) =>
  getById<Category>('/marketplace-categories/', id);

export const getProducts = (options?: {}) =>
  getAll<Product>('/marketplace-offerings/', options);

export const getProviderOfferings = (customerUuid: string) =>
  getProducts({params: {customer_uuid: customerUuid}});

export const getProduct = id =>
  getById<Product>('/marketplace-offerings/', id);

export const createOffering = data =>
  sendForm<Product>('POST', `${ENV.apiEndpoint}api/marketplace-offerings/`, data);

export const getOrderDetails = (id: string) =>
  getById<State>('/marketplace-orders/', id);

export const getProvider = (id: string) =>
  getById<Provider>('/customers/', id);
