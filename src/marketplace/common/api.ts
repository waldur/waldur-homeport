import Axios, { AxiosRequestConfig } from 'axios';

import { ENV } from '@waldur/configs/default';
import {
  deleteById,
  get,
  getAll,
  getById,
  getFirst,
  getList,
  getSelectData,
  parseResultCount,
  patch,
  post,
  put,
  sendForm,
} from '@waldur/core/api';
import { GeolocationPoint } from '@waldur/map/types';
import { OrderDetailsType } from '@waldur/marketplace/orders/types';
import {
  Category,
  CategoryComponentUsage,
  CategoryGroup,
  ImportableResource,
  Offering,
  OfferingPermission,
  OrganizationGroup,
  Plan,
  PluginMetadata,
  ServiceProvider,
} from '@waldur/marketplace/types';
import { Customer, Project } from '@waldur/workspace/types';

import { PlanUsageRow } from '../../reporting/plan-usage/types';
import { Resource } from '../resources/types';
import { ComponentUsage, ResourcePlanPeriod } from '../resources/usage/types';

export const getPlugins = () =>
  get<PluginMetadata[]>('/marketplace-plugins/').then(
    (response) => response.data,
  );

export const getCategoryGroups = (options?: AxiosRequestConfig) =>
  getAll<CategoryGroup>('/marketplace-category-groups/', options);

export const getCategoryGroup = (id: string, options?: AxiosRequestConfig) =>
  getById<CategoryGroup>('/marketplace-category-groups/', id, options);

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
  params?: {},
) =>
  getAll<ComponentUsage>('/marketplace-component-usages/', {
    params: { resource_uuid, date_after, ...(params || {}) },
  });

export const getCategory = (id: string, options?: AxiosRequestConfig) =>
  getById<Category>('/marketplace-categories/', id, options);

export const getPublicOfferingsList = (params?: {}) =>
  getList<Offering>('/marketplace-public-offerings/', params);

export const getProviderOfferingsOptions = (params?: {}) =>
  getSelectData<Offering>('/marketplace-provider-offerings/', params);

export const getPublicOfferingsOptions = (params?: {}) =>
  getSelectData<Offering>('/marketplace-public-offerings/', params);

export const getAllProviderOfferings = (options?: {}) =>
  getAll<Offering>('/marketplace-provider-offerings/', options);

export const getAllOfferingPermissions = (options?: AxiosRequestConfig) =>
  getAll<OfferingPermission>('/marketplace-offering-permissions/', options);

export const getProviderOfferings = (customerUuid: string) =>
  getAllProviderOfferings({ params: { customer_uuid: customerUuid } });

export const getPlan = (id: string) => getById<any>('/marketplace-plans/', id);

export const createPlan = (payload) => post(`/marketplace-plans/`, payload);

export const archivePlan = (planId) =>
  post(`/marketplace-plans/${planId}/archive/`);

export const updatePlan = (planId, data) =>
  put(`/marketplace-plans/${planId}/`, data);

export const updatePlanQuotas = (planId, data) =>
  post(`/marketplace-plans/${planId}/update_quotas/`, data);

export const updatePlanPrices = (planId, data) =>
  post(`/marketplace-plans/${planId}/update_prices/`, data);

export const getOfferingPlans = (offeringUuid: string) =>
  getAll<Plan>('/marketplace-plans/', {
    params: { offering_uuid: offeringUuid },
  });

export const getOfferingPlansUsage = (offeringUuid: string) =>
  getAll<PlanUsageRow>('/marketplace-plans/usage_stats/', {
    params: { offering_uuid: offeringUuid },
  });

export const createOfferingRole = (offering, name) =>
  post(`/marketplace-offering-user-roles/`, {
    offering,
    name,
  });

export const deleteOfferingRole = (roleId) =>
  deleteById(`/marketplace-offering-user-roles/`, roleId);

export const createResourceUser = (payload) =>
  post('/marketplace-resource-users/', payload);

export const deleteResourceUser = (userId) =>
  deleteById('/marketplace-resource-users/', userId);

export const getProviderOffering = (id: string, options?: AxiosRequestConfig) =>
  getById<Offering>('/marketplace-provider-offerings/', id, options);

export const getPublicOffering = (id: string, options?: AxiosRequestConfig) =>
  getById<Offering>('/marketplace-public-offerings/', id, options);

export const createProviderOffering = (data) =>
  post<Offering>('/marketplace-provider-offerings/', data);

export const updateOfferingIntegration = (offeringId, data) =>
  post<Offering>(
    `/marketplace-provider-offerings/${offeringId}/update_integration/`,
    data,
  );

export const deleteProviderOffering = (offeringId) =>
  deleteById<Offering>(`/marketplace-provider-offerings/`, offeringId);

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

export const submitResourceOptions = (resourceId: string, payload) =>
  post(`/marketplace-resources/${resourceId}/update_options/`, payload);

export const setBackendId = (resourceId: string, payload) =>
  post(`/marketplace-resources/${resourceId}/set_backend_id/`, payload);

export const setSlug = (resourceId: string, payload) =>
  post(`/marketplace-resources/${resourceId}/set_slug/`, payload);

export const updateOfferingLocation = (offeringId, data) =>
  post<GeolocationPoint>(
    `/marketplace-provider-offerings/${offeringId}/update_location/`,
    data,
  );

export const updateOfferingAttributes = (offeringId, data) =>
  post(
    `/marketplace-provider-offerings/${offeringId}/update_attributes/`,
    data,
  );

export const updateOfferingOptions = (offeringId, data) =>
  post(`/marketplace-provider-offerings/${offeringId}/update_options/`, data);

export const updateOfferingResourceOptions = (offeringId, data) =>
  post(
    `/marketplace-provider-offerings/${offeringId}/update_resource_options/`,
    data,
  );

export const removeProviderOfferingComponent = (offeringId, data) =>
  post(
    `/marketplace-provider-offerings/${offeringId}/remove_offering_component/`,
    data,
  );

export const createProviderOfferingComponent = (offeringId, data) =>
  post(
    `/marketplace-provider-offerings/${offeringId}/create_offering_component/`,
    data,
  );

export const updateOfferingComponent = (offeringId, data) =>
  post(
    `/marketplace-provider-offerings/${offeringId}/update_offering_component/`,
    data,
  );

export const updateOfferingSecretOptions = (offeringId, data) =>
  post(
    `/marketplace-provider-offerings/${offeringId}/update_integration/`,
    data,
  );

export const getOrder = (id) =>
  getById<OrderDetailsType>('/marketplace-orders/', id);

export const createOrder = (payload) => post(`/marketplace-orders/`, payload);

export const cancelOrder = (id) => post(`/marketplace-orders/${id}/cancel/`);

export const approveOrderByConsumer = (orderUuid: string) =>
  post(`/marketplace-orders/${orderUuid}/approve_by_consumer/`).then(
    (response) => response.data,
  );

export const approveOrderByProvider = (id) =>
  post(`/marketplace-orders/${id}/approve_by_provider/`);

export const rejectOrderByConsumer = (orderUuid: string) =>
  post(`/marketplace-orders/${orderUuid}/reject_by_consumer/`).then(
    (response) => response.data,
  );

export const rejectOrderByProvider = (id) =>
  post(`/marketplace-orders/${id}/reject_by_provider/`);

export const cancelTerminationOrder = (id) =>
  post(`/remote-waldur-api/cancel_termination/${id}/`);

export const getCustomerList = (params?: {}) =>
  getSelectData<Customer>('/customers/', params);

export const getProjectList = (params?: {}) =>
  getSelectData<Project>('/projects/', params);

export const getOrganizationGroupList = (params?: {}) =>
  getSelectData('/organization-groups/', params);

export const getOrganizationGroupTypesList = (params?: {}) =>
  getSelectData('/organization-group-types/', params);

export const getAllOrganizationGroups = (options?) =>
  getAll<OrganizationGroup>('/organization-groups/', options);

export const updateOfferingState = (offeringUuid, action, reason) =>
  post(
    `/marketplace-provider-offerings/${offeringUuid}/${action}/`,
    reason && { paused_reason: reason },
  ).then((response) => response.data);

export const uploadOfferingImage = (formData, offering) => {
  const reqData = {
    image: formData.image,
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

export const getRuntimeStates = (projectUuid?, categoryUuid?) => {
  let url = '/marketplace-runtime-states/';

  if (projectUuid) {
    url += projectUuid + '/';
  }

  return get(url, {
    params: { category_uuid: categoryUuid },
  }).then((response) => response.data);
};

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

export const updateOfferingOverview = (offeringId, data) =>
  post(`/marketplace-provider-offerings/${offeringId}/update_overview/`, data);

export const updateOfferingDescription = (offeringId, data) =>
  post(
    `/marketplace-provider-offerings/${offeringId}/update_description/`,
    data,
  );

export const asyncRunOfferingScript = (
  offeringUuid: string,
  plan: string,
  type: string,
) =>
  post(`/marketplace-script-dry-run/${offeringUuid}/async_run/`, {
    plan,
    type,
  });

export const getAsyncDryRun = (uuid) =>
  get(`/marketplace-script-async-dry-run/${uuid}/`);

export const updateOfferingAccessPolicy = (
  offeringUuid: string,
  organizationGroups: string[],
) =>
  post(
    `/marketplace-provider-offerings/${offeringUuid}/update_organization_groups/`,
    {
      organization_groups: organizationGroups,
    },
  );

export const updateOfferingLogo = (offeringUuid: string, formData) =>
  sendForm(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-provider-offerings/${offeringUuid}/update_thumbnail/`,
    {
      thumbnail: formData.images,
    },
  );

export const createOfferingUser = (payload) =>
  post(`/marketplace-offering-users/`, payload);

export const updateOfferingUserRestrictionStatus = (uuid, data) =>
  post(`/marketplace-offering-users/${uuid}/update_restricted/`, data);

export const pullRemoteOfferingDetails = (uuid) =>
  post(`/remote-waldur-api/pull_offering_details/${uuid}/`);

export const pullRemoteOfferingUsers = (uuid) =>
  post(`/remote-waldur-api/pull_offering_users/${uuid}/`);

export const pullRemoteOfferingUsage = (uuid) =>
  post(`/remote-waldur-api/pull_offering_usage/${uuid}/`);

export const pullRemoteOfferingResources = (uuid) =>
  post(`/remote-waldur-api/pull_offering_resources/${uuid}/`);

export const pullRemoteOfferingOrders = (uuid) =>
  post(`/remote-waldur-api/pull_offering_orders/${uuid}/`);

export const pullRemoteOfferingInvoices = (uuid) =>
  post(`/remote-waldur-api/pull_offering_invoices/${uuid}/`);

export const pullRemoteOfferingRobotAccounts = (uuid) =>
  post(`/remote-waldur-api/pull_offering_robot_accounts/${uuid}/`);

export const pushRemoteOfferingProjectData = (uuid) =>
  post(`/remote-waldur-api/push_project_data/${uuid}/`);

export const countOrders = (params) =>
  Axios.request({
    method: 'HEAD',
    url: ENV.apiEndpoint + 'api/marketplace-orders/',
    params,
  }).then(parseResultCount);

export const countRobotAccounts = (params) =>
  Axios.request({
    method: 'HEAD',
    url: ENV.apiEndpoint + 'api/marketplace-robot-accounts/',
    params,
  }).then(parseResultCount);

export const countLexisLinks = (params?) =>
  Axios.request({
    method: 'HEAD',
    url: ENV.apiEndpoint + 'api/lexis-links/',
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

export const createOfferingEndpoint = (offeringId, endpoint) =>
  post(`/marketplace-provider-offerings/${offeringId}/add_endpoint/`, endpoint);

export const deleteOfferingEndpoint = (offeringId, endpointId) =>
  post(`/marketplace-provider-offerings/${offeringId}/delete_endpoint/`, {
    uuid: endpointId,
  });

export const syncCustomScriptResource = (payload) =>
  post(`/marketplace-script-sync-resource/`, payload);

export const createLexisLink = (data) =>
  post(`/lexis-links/`, data).then((response) => response.data);

export const deleteLexisLink = (lexisLinkURL: string) =>
  Axios.delete(lexisLinkURL);

export const unlinkOrder = (orderUuid: string) =>
  post(`/marketplace-orders/${orderUuid}/unlink/`);
