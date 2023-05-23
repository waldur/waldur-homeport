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
  OrganizationGroup,
  OfferingPermission,
  Image,
} from '@waldur/marketplace/types';
import { Customer, Project } from '@waldur/workspace/types';

import { OfferingDocument } from '../offerings/store/types';
import { PlanUsageRow } from '../resources/plan-usage/types';
import { Resource } from '../resources/types';
import { ComponentUsage, ResourcePlanPeriod } from '../resources/usage/types';

export const getPlugins = () =>
  get<PluginMetadata[]>('/marketplace-plugins/').then(
    (response) => response.data,
  );

export const getCategories = (options?: AxiosRequestConfig) =>
  getAll<Category>('/marketplace-categories/', options);

export const getCategoryOptions = (options?: {}) =>
  getSelectData<Category>('/marketplace-categories/', options);

export const getCategoryUsages = (options?: {}) =>
  getAll<CategoryComponentUsage>(
    '/marketplace-category-component-usages/',
    options,
  );

export const getComponentUsages = (
  resource_uuid: string,
  date_after?: string,
) =>
  getAll<ComponentUsage>('/marketplace-component-usages/', {
    params: { resource_uuid, date_after },
  });

export const getCategory = (id: string, options?: AxiosRequestConfig) =>
  getById<Category>('/marketplace-categories/', id, options);

export const getProviderOfferingsList = (params?: {}) =>
  getList<Offering>('/marketplace-provider-offerings/', params);

export const getPublicOfferingsList = (params?: {}) =>
  getList<Offering>('/marketplace-public-offerings/', params);

export const getProviderOfferingsOptions = (params?: {}) =>
  getSelectData<Offering>('/marketplace-provider-offerings/', params);

export const getAllProviderOfferings = (options?: {}) =>
  getAll<Offering>('/marketplace-provider-offerings/', options);

export const getAllPublicOfferings = (options?: {}) =>
  getAll<Offering>('/marketplace-public-offerings/', options);

export const getOfferingsByServiceProvider = (options?: {}) =>
  get('/marketplace-provider-offerings/groups/', options);

export const getProviderOfferingsCount = (options?: {}) =>
  Axios.head(
    `${ENV.apiEndpoint}api/marketplace-provider-offerings/`,
    options,
  ).then((response) => parseResultCount(response));

export const getAllOfferingPermissions = (options?: AxiosRequestConfig) =>
  getAll<OfferingPermission>('/marketplace-offering-permissions/', options);

export const getResourcesCount = (options?: {}) =>
  Axios.head(`${ENV.apiEndpoint}api/marketplace-resources/`, options).then(
    (response) => parseResultCount(response),
  );

export const getProviderOfferings = (customerUuid: string) =>
  getAllProviderOfferings({ params: { customer_uuid: customerUuid } });

export const getPlan = (id: string) => getById<any>('/marketplace-plans/', id);

export const getOfferingPlansUsage = (offeringUuid: string) =>
  getAll<PlanUsageRow>('/marketplace-plans/usage_stats/', {
    params: { offering_uuid: offeringUuid },
  });

export const getProviderOffering = (id: string, options?: AxiosRequestConfig) =>
  getById<Offering>('/marketplace-provider-offerings/', id, options);

export const getProviderOfferingStats = (uuid: string) =>
  get<{ resources_count; customers_count }>(
    `/marketplace-provider-offerings/${uuid}/stats`,
  ).then((response) => response.data);

export const getPublicOffering = (id: string, options?: AxiosRequestConfig) =>
  getById<Offering>('/marketplace-public-offerings/', id, options);

export const createProviderOffering = (data) =>
  post<Offering>('/marketplace-provider-offerings/', data);

export const updateProviderOffering = (offeringId, data) =>
  patch<Offering>(`/marketplace-provider-offerings/${offeringId}/`, data);

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

export const updateResourceEndDateByStaff = (
  resourceUuid: string,
  end_date: string,
) =>
  post(`/marketplace-resources/${resourceUuid}/set_end_date_by_staff/`, {
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

export const getResourceOffering = (id: string, options?: AxiosRequestConfig) =>
  get<Offering>(`/marketplace-resources/${id}/offering/`, options).then(
    (response) => response.data,
  );

export const getSubResourcesOfferings = (resourceId: string) =>
  getAll<{ uuid; type }>(
    `/marketplace-resources/${resourceId}/offering_for_subresources/`,
  );

export const submitReport = (resourceId: string, payload) =>
  post(`/marketplace-resources/${resourceId}/submit_report/`, payload);

export const setBackendId = (resourceId: string, payload) =>
  post(`/marketplace-resources/${resourceId}/set_backend_id/`, payload);

export const uploadProviderOfferingThumbnail = (offeringId, thumbnail) =>
  sendForm<Offering>(
    'PATCH',
    `${ENV.apiEndpoint}api/marketplace-provider-offerings/${offeringId}/`,
    { thumbnail },
  );

export const uploadProviderOfferingHeroImage = (offeringId, image) =>
  sendForm<Offering>(
    'PATCH',
    `${ENV.apiEndpoint}api/marketplace-provider-offerings/${offeringId}/`,
    { image },
  );

export const updateProviderOfferingAttributes = (offeringId, data) =>
  post(
    `/marketplace-provider-offerings/${offeringId}/update_attributes/`,
    data,
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

export const cancelTerminationOrderItem = (id) =>
  post(`/marketplace-order-items/${id}/cancel_termination/`);

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

export const getOrganizationGroupList = (params?: {}) =>
  getSelectData('/divisions/', params);

export const getOrganizationGroupTypesList = (params?: {}) =>
  getSelectData('/division-types/', params);

export const getAllOrganizationGroups = (options?) =>
  getAll<OrganizationGroup>('/divisions/', options);

export const getCustomersOrganizationGroupUuids = (
  accounting_is_running: boolean,
  options?,
) =>
  getAll('/customers/', {
    params: { accounting_is_running, size: 200, field: ['division_uuid'] },
    ...options,
  });

export const updateProviderOfferingState = (offeringUuid, action, reason) =>
  post(
    `/marketplace-provider-offerings/${offeringUuid}/${action}/`,
    reason && { paused_reason: reason },
  ).then((response) => response.data);

export const getOfferingImages = (uuid: string) =>
  getAll<Image>(`/marketplace-screenshots/?offering_uuid=${uuid}`);

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

export const getRuntimeStates = (projectUuid) =>
  get(`/marketplace-runtime-states/${projectUuid}/`).then(
    (response) => response.data,
  );

export const createServiceProvider = (params) =>
  post<ServiceProvider>('/marketplace-service-providers/', params).then(
    (response) => response.data,
  );

export const updateServiceProvider = (uuid, params) =>
  patch(`/marketplace-service-providers/${uuid}/`, params);

export const getServiceProviderByCustomer = (params, options?) =>
  getFirst<ServiceProvider>('/marketplace-service-providers/', params, options);

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

export const getResource = (id: string, options?: AxiosRequestConfig) =>
  getById<Resource>('/marketplace-resources/', id, options);

export const switchPlan = (resource_uuid: string, plan_url: string) =>
  post(`/marketplace-resources/${resource_uuid}/switch_plan/`, {
    plan: plan_url,
  }).then((response) => response.data);

export const terminateResource = (resource_uuid: string, data?) =>
  post(`/marketplace-resources/${resource_uuid}/terminate/`, data).then(
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
    `/marketplace-provider-offerings/${offering_uuid}/importable_resources/`,
  );

export const importResource = ({ offering_uuid, ...payload }) =>
  post<Resource>(
    `/marketplace-provider-offerings/${offering_uuid}/import_resource/`,
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

export const updateProviderOfferingOverview = (offeringId, data) =>
  post(`/marketplace-provider-offerings/${offeringId}/update_overview/`, data);

export const updateProviderOfferingDescription = (offeringId, category) =>
  post(`/marketplace-provider-offerings/${offeringId}/update_description/`, {
    category,
  });

export const updateProviderOfferingConfirmationMessage = (
  offeringUuid,
  template_confirmation_comment,
  secretOptions,
) =>
  patch(`/marketplace-provider-offerings/${offeringUuid}/`, {
    secret_options: {
      ...secretOptions,
      template_confirmation_comment,
    },
  });

export const runOfferingScript = (
  offeringUuid: string,
  plan: string,
  type: string,
) =>
  post(`/marketplace-script-dry-run/${offeringUuid}/run/`, {
    plan,
    type,
  });

export const updateProviderOfferingAccessPolicy = (
  offeringUuid: string,
  organizationGroups: string[],
) =>
  post(`/marketplace-provider-offerings/${offeringUuid}/update_divisions/`, {
    divisions: organizationGroups,
  });

export const updateProviderOfferingLogo = (offeringUuid: string, formData) =>
  sendForm(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-provider-offerings/${offeringUuid}/update_thumbnail/`,
    {
      thumbnail: formData.images,
    },
  );

export const createOfferingUser = (payload) =>
  post(`/marketplace-offering-users/`, payload);

export const pullRemoteOfferingDetails = (uuid) =>
  post(`/remote-waldur-api/pull_offering_details/${uuid}/`);

export const pullRemoteOfferingUsers = (uuid) =>
  post(`/remote-waldur-api/pull_offering_users/${uuid}/`);

export const pullRemoteOfferingUsage = (uuid) =>
  post(`/remote-waldur-api/pull_offering_usage/${uuid}/`);

export const pullRemoteOfferingResources = (uuid) =>
  post(`/remote-waldur-api/pull_offering_resources/${uuid}/`);

export const pullRemoteOfferingOrderItems = (uuid) =>
  post(`/remote-waldur-api/pull_offering_order_items/${uuid}/`);

export const pullRemoteOfferingInvoices = (uuid) =>
  post(`/remote-waldur-api/pull_offering_invoices/${uuid}/`);

export const countOrderItems = (params) =>
  Axios.request({
    method: 'HEAD',
    url: ENV.apiEndpoint + 'api/marketplace-order-items/',
    params,
  }).then(parseResultCount);

export const countRobotAccounts = (params) =>
  Axios.request({
    method: 'HEAD',
    url: ENV.apiEndpoint + 'api/marketplace-robot-accounts/',
    params,
  }).then(parseResultCount);

export const createRobotAccount = (payload) =>
  post(`/marketplace-robot-accounts/`, payload);

export const deleteRobotAccount = (id) =>
  deleteById(`/marketplace-robot-accounts/`, id);

export const updateRobotAccount = (id, payload) =>
  patch(`/marketplace-robot-accounts/${id}/`, payload);

export const updateOfferingUser = (provider_uuid, user_uuid, username) =>
  post(
    `/marketplace-service-providers/${provider_uuid}/set_offerings_username/`,
    { user_uuid, username },
  );
