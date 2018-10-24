import { get, getAll, getById, post, sendForm, getList, getFirst } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { Customer } from '@waldur/customer/types';
import { State, OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Category, Offering, ServiceProvider } from '@waldur/marketplace/types';

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

export const getCustomer = (id: string) =>
  getById<Customer>('/customers/', id);

export const updateOfferingState = (offeringUuid, action) =>
  post(`/marketplace-offerings/${offeringUuid}/${action}/`).then(response => response.data);

export const createServiceProvider = params =>
  post<ServiceProvider>('/marketplace-service-providers/', params).then(response => response.data);

export const getServiceProviderByCustomer = params =>
  getFirst<ServiceProvider>('/marketplace-service-providers/', params);
