import { sendForm } from '@waldur/core/api';
import { $rootScope, ENV } from '@waldur/core/services';

import { ProviderCreateFormData } from './types';

const serializeDetails = (provider: ProviderCreateFormData) => {
  const serializer = provider.type.serializer || (x => x);
  return serializer(provider.details);
};

const getSettingsUrl = uuid =>
  `${ENV.apiEndpoint}api/service-settings/${uuid}/`;

export const updateProvider = provider =>
  sendForm('patch', getSettingsUrl(provider.details.uuid), {
    name: provider.name,
    ...serializeDetails(provider),
  });

export const refreshProjectList = () =>
  $rootScope.$broadcast('refreshProjectList');
