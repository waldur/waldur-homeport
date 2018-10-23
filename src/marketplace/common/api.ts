import { get, getAll, getById, post, sendForm, getList } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { State, OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Category, Offering, Provider } from '@waldur/marketplace/types';
import { Customer } from '@waldur/workspace/types';

export const getPlugins = () =>
  get('/marketplace-plugins/').then(response => response.data);

export const getCategories = (options?: {}) =>
  getAll<Category>('/marketplace-categories/', options);

export const getCategory = (id: string, options?: {}) =>
  getById<Category>('/marketplace-categories/', id, options);

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

export const getOrderItem = id =>
  getById<OrderItemResponse>('/marketplace-order-items/', id);

export const setOrderState = (orderUuid, state) =>
  post(`/marketplace-orders/${orderUuid}/set_state_${state}/`).then(response => response.data);

export const getCustomerList = (params?: {}) =>
  getList<Customer>('/customers/', params);

export const getProvider = (id: string) =>
  getById<Provider>('/customers/', id);

export const updateOfferingState = (offeringUuid, action) =>
  post(`/marketplace-offerings/${offeringUuid}/${action}/`).then(response => response.data);
