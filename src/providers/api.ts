import { sendForm } from '@waldur/core/api';
import { $http, $state, $rootScope, ENV } from '@waldur/core/services';

import { ProviderCreateFormData } from './types';

const serializeDetails = (provider: ProviderCreateFormData) => {
  const serializer = provider.type.serializer || (x => x);
  return serializer(provider.details);
};

export const createProvider = (provider: ProviderCreateFormData) =>
  sendForm('post', `${ENV.apiEndpoint}api/${provider.type.endpoint}/`, {
    name: provider.name,
    customer: provider.customer.url,
    available_for_all: true,
    ...serializeDetails(provider),
  });

export const updateProvider = provider =>
  sendForm('patch', getSettingsUrl(provider.details.uuid), {
    name: provider.name,
    ...serializeDetails(provider),
  });

export const fetchProvider = uuid => $http.get(getSettingsUrl(uuid));

const getSettingsUrl = uuid => `${ENV.apiEndpoint}api/service-settings/${uuid}/`;

export const gotoProviderDetails = provider =>
  $state.go('organization.providers', {
    uuid: provider.customer_uuid,
    providerType: provider.service_type,
    providerUuid: provider.uuid,
  });

export const gotoProvidersList = customer =>
  $state.go('organization.providers', {uuid: customer.uuid});

export const refreshProjectList = () =>
  $rootScope.$broadcast('refreshProjectList');

export const refreshProvidersList = () =>
  $rootScope.$broadcast('refreshProviderList');
