import { AxiosRequestConfig } from 'axios';

import {
  get,
  getAll,
  getById,
  post,
  sendForm,
  getList,
  getFirst,
  patch,
  deleteById,
} from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { Customer } from '@waldur/customer/types';
import { SubmitCartRequest } from '@waldur/marketplace/cart/types';
import {
  Order,
  OrderItemResponse,
  OrderItemDetailsType,
} from '@waldur/marketplace/orders/types';
import {
  Category,
  Offering,
  ServiceProvider,
  CategoryComponentUsage,
  PluginMetadata,
  ImportableResource,
} from '@waldur/marketplace/types';

import { OfferingDocument } from '../offerings/store/types';
import { Resource } from '../resources/types';
import { ResourcePlanPeriod } from '../resources/usage/types';

export const getPlugins = () =>
  get<PluginMetadata[]>('/marketplace-plugins/').then(
    response => response.data,
  );

export const getCategories = (options?: {}) =>
  getAll<Category>('/marketplace-categories/', options);

export const getCategoryUsages = (options?: {}) =>
  getAll<CategoryComponentUsage>(
    '/marketplace-category-component-usages/',
    options,
  );

export const getCategory = (id: string, options?: AxiosRequestConfig) =>
  getById<Category>('/marketplace-categories/', id, options);

export const getOfferingsList = (params?: {}) =>
  getList<Offering>('/marketplace-offerings/', params);

export const getAllOfferings = (options?: {}) =>
  getAll<Offering>('/marketplace-offerings/', options);

export const getProviderOfferings = (customerUuid: string) =>
  getAllOfferings({ params: { customer_uuid: customerUuid } });

export const getPlan = (id: string) => getById<any>('/marketplace-plans/', id);

export const getOffering = (id: string, options?: AxiosRequestConfig) =>
  getById<Offering>('/marketplace-offerings/', id, options);

export const createOffering = data =>
  post<Offering>('/marketplace-offerings/', data);

export const updateOffering = (offeringId, data) =>
  patch<Offering>(`/marketplace-offerings/${offeringId}/`, data);

export const getResourcePlanPeriods = (resourceId: string) =>
  getAll<ResourcePlanPeriod>(
    `/marketplace-resources/${resourceId}/plan_periods/`,
  );

export const uploadOfferingThumbnail = (offeringId, thumbnail) =>
  sendForm<Offering>(
    'PATCH',
    `${ENV.apiEndpoint}api/marketplace-offerings/${offeringId}/`,
    { thumbnail },
  );

export const uploadOfferingDocument = (
  offeringUrl: string,
  document: OfferingDocument,
) =>
  sendForm<Offering>(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-offering-files/`,
    { offering: offeringUrl, ...document },
  );

export const getCartItems = (projectUrl: string) =>
  getAll('/marketplace-cart-items/', { params: { project: projectUrl } });

export const addCartItem = (data: object) =>
  post('/marketplace-cart-items/', data).then(response => response.data);

export const removeCartItem = (id: string) =>
  deleteById('/marketplace-cart-items/', id);

export const updateCartItem = (id: string, data: object) =>
  patch(`/marketplace-cart-items/${id}/`, data).then(response => response.data);

export const submitCart = (data: object) =>
  post<SubmitCartRequest>('/marketplace-cart-items/submit/', data).then(
    response => response.data,
  );

export const getOrdersList = (params?: {}) =>
  getList<OrderItemResponse>('/marketplace-orders/', params);

export const getOrderItemList = (params?: {}) =>
  getList<OrderItemResponse>('/marketplace-order-items/', params);

export const getOrderDetails = (id: string) =>
  getById<Order>('/marketplace-orders/', id);

export const getOrderItem = id =>
  getById<OrderItemDetailsType>('/marketplace-order-items/', id);

export const terminateOrderItem = id =>
  post(`/marketplace-order-items/${id}/terminate/`);

export const approveOrder = (orderUuid: string) =>
  post(`/marketplace-orders/${orderUuid}/approve/`).then(
    response => response.data,
  );

export const rejectOrder = (orderUuid: string) =>
  post(`/marketplace-orders/${orderUuid}/reject/`).then(
    response => response.data,
  );

export const getCustomerList = (params?: {}) =>
  getList<Customer>('/customers/', params);

export const getProjectList = (params?: {}) =>
  getList<Customer>('/projects/', params);

export const getCustomer = (id: string) => getById<Customer>('/customers/', id);

export const updateOfferingState = (offeringUuid, action, reason) =>
  post(
    `/marketplace-offerings/${offeringUuid}/${action}/`,
    reason && { paused_reason: reason },
  ).then(response => response.data);

export const uploadOfferingScreenshot = (formData, offering) => {
  const reqData = {
    image: formData.screenshots,
    name: formData.name,
    description: formData.description,
    offering: offering.url,
  };
  return sendForm(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-screenshots/`,
    reqData,
  );
};

export const deleteOfferingScreenshot = (screenshotUuid: string) =>
  deleteById('/marketplace-screenshots/', screenshotUuid);

export const getServiceProviderList = (params?: {}) =>
  getList<ServiceProvider>('/marketplace-service-providers/', params);

export const createServiceProvider = params =>
  post<ServiceProvider>('/marketplace-service-providers/', params).then(
    response => response.data,
  );

export const getServiceProviderByCustomer = params =>
  getFirst<ServiceProvider>('/marketplace-service-providers/', params);

export const getServiceProviderSecretCode = id =>
  get(`/marketplace-service-providers/${id}/api_secret_code/`).then(
    response => response.data,
  );

export const generateServiceProviderSecretCode = id =>
  post(`/marketplace-service-providers/${id}/api_secret_code/`).then(
    response => response.data,
  );

export const submitUsageReport = payload =>
  post(`/marketplace-component-usages/set_usage/`, payload).then(
    response => response.data,
  );

export const getResource = (id: string) =>
  getById<OrderItemResponse>('/marketplace-resources/', id);

export const switchPlan = (resource_uuid: string, plan_url: string) =>
  post(`/marketplace-resources/${resource_uuid}/switch_plan/`, {
    plan: plan_url,
  }).then(response => response.data);

export const terminateResource = (resource_uuid: string) =>
  post(`/marketplace-resources/${resource_uuid}/terminate/`).then(
    response => response.data,
  );

export const changeLimits = (
  resource_uuid: string,
  limits: Record<string, number>,
) =>
  post(`/marketplace-resources/${resource_uuid}/update_limits/`, {
    limits,
  }).then(response => response.data);

export const getImportableResources = (offering_uuid: string) =>
  getAll<ImportableResource>(
    `/marketplace-offerings/${offering_uuid}/importable_resources/`,
  );

export const importResource = ({ offering_uuid, ...payload }) =>
  post<Resource>(
    `/marketplace-offerings/${offering_uuid}/import_resource/`,
    payload,
  ).then(response => response.data);
