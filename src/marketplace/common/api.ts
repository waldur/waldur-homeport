import Axios, { AxiosRequestConfig } from 'axios';

import { ENV } from '@waldur/configs/default';
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
  getSelectData,
  parseResultCount,
  put,
} from '@waldur/core/api';
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
import { Customer, Project } from '@waldur/workspace/types';

import { OfferingDocument } from '../offerings/store/types';
import { Resource } from '../resources/types';
import { ComponentUsage, ResourcePlanPeriod } from '../resources/usage/types';

export const getPlugins = () =>
  get<PluginMetadata[]>('/marketplace-plugins/').then(
    (response) => response.data,
  );

export const getCategories = (options?: {}) =>
  getAll<Category>('/marketplace-categories/', options);

export const getCategoryOptions = (options?: {}) =>
  getSelectData<Category>('/marketplace-categories/', options);

export const getCategoryUsages = (options?: {}) =>
  getAll<CategoryComponentUsage>(
    '/marketplace-category-component-usages/',
    options,
  );

export const getComponentUsages = (resource_uuid: string) =>
  getAll<ComponentUsage>('/marketplace-component-usages/', {
    params: { resource_uuid },
  });

export const getCategory = (id: string, options?: AxiosRequestConfig) =>
  getById<Category>('/marketplace-categories/', id, options);

export const getOfferingsList = (params?: {}) =>
  getList<Offering>('/marketplace-offerings/', params);

export const getOfferingsOptions = (params?: {}) =>
  getSelectData<Offering>('/marketplace-offerings/', params);

export const getAllOfferings = (options?: {}) =>
  getAll<Offering>('/marketplace-offerings/', options);

export const getOfferingsCount = (options?: {}) =>
  Axios.head(
    `${ENV.apiEndpoint}api/marketplace-offerings/`,
    options,
  ).then((response) => parseResultCount(response));

export const getResourcesCount = (options?: {}) =>
  Axios.head(
    `${ENV.apiEndpoint}api/marketplace-resources/`,
    options,
  ).then((response) => parseResultCount(response));

export const getProviderOfferings = (customerUuid: string) =>
  getAllOfferings({ params: { customer_uuid: customerUuid } });

export const getPlan = (id: string) => getById<any>('/marketplace-plans/', id);

export const getOffering = (id: string, options?: AxiosRequestConfig) =>
  getById<Offering>('/marketplace-offerings/', id, options);

export const createOffering = (data) =>
  post<Offering>('/marketplace-offerings/', data);

export const updateOffering = (offeringId, data) =>
  patch<Offering>(`/marketplace-offerings/${offeringId}/`, data);

export const updateResource = (resourceId: string, data) =>
  put<Resource>(`/marketplace-resources/${resourceId}/`, data);

export const updateResourceEndDate = (resourceUuid: string, end_date: string) =>
  patch<Resource>(`/marketplace-resources/${resourceUuid}/`, {
    end_date,
  });

export const updateResourceEndDateByProvider = (
  resourceUuid: string,
  end_date: string,
) =>
  post(`/marketplace-resources/${resourceUuid}/set_end_date_by_provider/`, {
    end_date,
  });

export const getResourceDetails = (resourceId: string) =>
  get<any>(`/marketplace-resources/${resourceId}/details/`).then(
    (response) => response.data,
  );

export const getResourcePlanPeriods = (resourceId: string) =>
  getAll<ResourcePlanPeriod>(
    `/marketplace-resources/${resourceId}/plan_periods/`,
  );

export const submitReport = (resourceId: string, payload) =>
  post(`/marketplace-resources/${resourceId}/submit_report/`, payload);

export const setBackendId = (resourceId: string, payload) =>
  post(`/marketplace-resources/${resourceId}/set_backend_id/`, payload);

export const uploadOfferingThumbnail = (offeringId, thumbnail) =>
  sendForm<Offering>(
    'PATCH',
    `${ENV.apiEndpoint}api/marketplace-offerings/${offeringId}/`,
    { thumbnail },
  );

export const updateOfferingAttributes = (offeringId, data) =>
  post(`/marketplace-offerings/${offeringId}/update_attributes/`, data);

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

export const getCartItem = (id: string) =>
  getById<OrderItemResponse>('/marketplace-cart-items/', id);

export const addCartItem = (data: object) =>
  post('/marketplace-cart-items/', data).then((response) => response.data);

export const removeCartItem = (id: string) =>
  deleteById('/marketplace-cart-items/', id);

export const updateCartItem = (id: string, data: object) =>
  patch(`/marketplace-cart-items/${id}/`, data).then(
    (response) => response.data,
  );

export const submitCart = (data: object) =>
  post<SubmitCartRequest>('/marketplace-cart-items/submit/', data).then(
    (response) => response.data,
  );

export const getOrdersList = (params?: {}) =>
  getList<OrderItemResponse>('/marketplace-orders/', params);

export const getOrderItemList = (params?: {}) =>
  getList<OrderItemResponse>('/marketplace-order-items/', params);

export const getOrderDetails = (id: string) =>
  getById<Order>('/marketplace-orders/', id);

export const getOrderItem = (id) =>
  getById<OrderItemDetailsType>('/marketplace-order-items/', id);

export const terminateOrderItem = (id) =>
  post(`/marketplace-order-items/${id}/terminate/`);

export const approveOrderItem = (id) =>
  post(`/marketplace-order-items/${id}/approve/`);

export const rejectOrderItem = (id) =>
  post(`/marketplace-order-items/${id}/reject/`);

export const approveOrder = (orderUuid: string) =>
  post(`/marketplace-orders/${orderUuid}/approve/`).then(
    (response) => response.data,
  );

export const rejectOrder = (orderUuid: string) =>
  post(`/marketplace-orders/${orderUuid}/reject/`).then(
    (response) => response.data,
  );

export const getCustomerList = (params?: {}) =>
  getSelectData<Customer>('/customers/', params);

export const getProjectList = (params?: {}) =>
  getSelectData<Project>('/projects/', params);

export const getOrganizationDivisionList = (params?: {}) =>
  getSelectData('/divisions/', params);

export const getDivisionTypesList = (params?: {}) =>
  getSelectData('/division-types/', params);

export const getAllOrganizationDivisions = () => getAll('/divisions/', {});

export const getCustomersDivisionUuids = (accounting_is_running: boolean) =>
  getAll('/customers/', {
    params: { accounting_is_running, size: 200, field: ['division_uuid'] },
  });

export const updateOfferingState = (offeringUuid, action, reason) =>
  post(
    `/marketplace-offerings/${offeringUuid}/${action}/`,
    reason && { paused_reason: reason },
  ).then((response) => response.data);

export const uploadOfferingImage = (formData, offering) => {
  const reqData = {
    image: formData.images,
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

export const deleteOfferingImage = (imageUuid: string) =>
  deleteById('/marketplace-screenshots/', imageUuid);

export const getServiceProviderList = (params?: {}) =>
  getSelectData<ServiceProvider>('/marketplace-service-providers/', params);

export const getUsers = (params?: {}) => getSelectData('/users/', params);

export const createServiceProvider = (params) =>
  post<ServiceProvider>('/marketplace-service-providers/', params).then(
    (response) => response.data,
  );

export const getServiceProviderByCustomer = (params) =>
  getFirst<ServiceProvider>('/marketplace-service-providers/', params);

export const getServiceProviderSecretCode = (id) =>
  get(`/marketplace-service-providers/${id}/api_secret_code/`).then(
    (response) => response.data,
  );

export const generateServiceProviderSecretCode = (id) =>
  post(`/marketplace-service-providers/${id}/api_secret_code/`).then(
    (response) => response.data,
  );

export const submitUsageReport = (payload) =>
  post(`/marketplace-component-usages/set_usage/`, payload).then(
    (response) => response.data,
  );

export const getResource = (id: string) =>
  getById<Resource>('/marketplace-resources/', id);

export const switchPlan = (resource_uuid: string, plan_url: string) =>
  post(`/marketplace-resources/${resource_uuid}/switch_plan/`, {
    plan: plan_url,
  }).then((response) => response.data);

export const terminateResource = (resource_uuid: string) =>
  post(`/marketplace-resources/${resource_uuid}/terminate/`).then(
    (response) => response.data,
  );

export const moveResource = (resourceUuid: string, projectUrl: string) =>
  post(`/marketplace-resources/${resourceUuid}/move_resource/`, {
    project: {
      url: projectUrl,
    },
  });

export const changeLimits = (
  resource_uuid: string,
  limits: Record<string, number>,
) =>
  post(`/marketplace-resources/${resource_uuid}/update_limits/`, {
    limits,
  }).then((response) => response.data);

export const getImportableResources = (offering_uuid: string) =>
  getAll<ImportableResource>(
    `/marketplace-offerings/${offering_uuid}/importable_resources/`,
  );

export const importResource = ({ offering_uuid, ...payload }) =>
  post<Resource>(
    `/marketplace-offerings/${offering_uuid}/import_resource/`,
    payload,
  ).then((response) => response.data);

export const syncGoogleCalendar = (uuid: string) =>
  post(`/booking-offerings/${uuid}/google_calendar_sync/`).then(
    (response) => response.data,
  );

export const publishGoogleCalendar = (uuid: string) =>
  post(`/booking-offerings/${uuid}/share_google_calendar/`).then(
    (response) => response.data,
  );

export const unpublishGoogleCalendar = (uuid: string) =>
  post(`/booking-offerings/${uuid}/unshare_google_calendar/`).then(
    (response) => response.data,
  );

export const updateOfferingConfirmationMessage = (
  offeringUuid,
  template_confirmation_comment,
  secretOptions,
) =>
  patch(`/marketplace-offerings/${offeringUuid}/`, {
    secret_options: {
      ...secretOptions,
      template_confirmation_comment,
    },
  });

export const updateOfferingAccessPolicy = (
  offeringUuid: string,
  divisions: string[],
) =>
  post(`/marketplace-offerings/${offeringUuid}/update_divisions/`, {
    divisions,
  });

export const updateOfferingLogo = (offeringUuid: string, formData) =>
  sendForm(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-offerings/${offeringUuid}/update_thumbnail/`,
    {
      thumbnail: formData.images,
    },
  );

export const createOfferingUser = (payload) =>
  post(`/marketplace-offering-users/`, payload);
