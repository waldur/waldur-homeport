import { getAll, getById, post, sendForm, getList } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { State } from '@waldur/marketplace/orders/types';
import { Category, Offering, Provider } from '@waldur/marketplace/types';

export const getCategories = () =>
  getAll<Category>('/marketplace-categories/');

export const getCategory = (id: string) =>
  getById<Category>('/marketplace-categories/', id);

export const getOfferingsList = (params?: {}) =>
  getList<Offering>('/marketplace-offerings/', params);

export const getAllOfferings = (options?: {}) =>
  getAll<Offering>('/marketplace-offerings/', options);

export const getProviderOfferings = (customerUuid: string) =>
  getAllOfferings({params: {customer_uuid: customerUuid}});

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

export const updateOfferingState = (offeringUuid, action) =>
  post(`/marketplace-offerings/${offeringUuid}/${action}/`).then(response => response.data);
