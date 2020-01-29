import { sendForm } from '@waldur/core/api';
import { $http, $rootScope, ENV } from '@waldur/core/services';

import { ProviderCreateFormData } from './types';

const serializeDetails = (provider: ProviderCreateFormData) => {
  const serializer = provider.type.serializer || (x => x);
  return serializer(provider.details);
};

export const updateProvider = provider =>
  sendForm('patch', getSettingsUrl(provider.details.uuid), {
    name: provider.name,
    ...serializeDetails(provider),
  });

export const fetchProvider = uuid => $http.get(getSettingsUrl(uuid));

const getSettingsUrl = uuid => `${ENV.apiEndpoint}api/service-settings/${uuid}/`;

export const refreshProjectList = () =>
  $rootScope.$broadcast('refreshProjectList');

export const refreshProvidersList = () =>
  $rootScope.$broadcast('refreshProviderList');
