import { getAll, getById, post, sendForm } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { State } from '@waldur/marketplace/cart/types';
import { Category, Offering, Provider } from '@waldur/marketplace/types';

export const getCategories = () =>
  getAll<Category>('/marketplace-categories/');

export const getCategory = (id: string) =>
  getById<Category>('/marketplace-categories/', id);

export const getOfferings = (options?: {}) =>
  getAll<Offering>('/marketplace-offerings/', options);

export const getProviderOfferings = (customerUuid: string) =>
  getOfferings({params: {customer_uuid: customerUuid}});

export const getOffering = id =>
  getById<Offering>('/marketplace-offerings/', id);

export const createOffering = data =>
  post<Offering>('/marketplace-offerings/', data);

export const uploadOfferingThumbnail = (offeringId, thumbnail) =>
  sendForm<Offering>('PATCH', `${ENV.apiEndpoint}api/marketplace-offerings/${offeringId}/`, {thumbnail});

export const getOrderDetails = (id: string) =>
  getById<State>('/marketplace-orders/', id);

export const getProvider = (id: string) =>
  getById<Provider>('/customers/', id);
