import { ENV } from '@waldur/configs/default';
import { omit } from '@waldur/core/utils';
import { createDynamicFetcher } from '@waldur/table/api';

export const fetchProviderCustomers = createDynamicFetcher(
  (request) =>
    `${ENV.apiEndpoint}api/marketplace-service-providers/${request.filter.provider_uuid}/customers/`,
  (filter) => omit(filter, 'provider_uuid'),
);

export const fetchProviderUsers = createDynamicFetcher(
  (request) =>
    `${ENV.apiEndpoint}api/marketplace-service-providers/${request.filter.provider_uuid}/users/`,
  (filter) => omit(filter, 'provider_uuid'),
);

export const fetchProviderProjects = createDynamicFetcher(
  (request) =>
    `${ENV.apiEndpoint}api/marketplace-service-providers/${request.filter.provider_uuid}/customer_projects/`,
  (filter) => omit(filter, 'provider_uuid'),
);

export const fetchProviderUserCustomers = createDynamicFetcher(
  (request) =>
    `${ENV.apiEndpoint}api/marketplace-service-providers/${request.filter.provider_uuid}/user_customers/`,
  (filter) => omit(filter, 'provider_uuid'),
);
