import { ENV } from '@waldur/configs/default';
import { sendForm } from '@waldur/core/api';

import { ProviderCreateFormData } from './types';

const serializeDetails = (provider: ProviderCreateFormData) => {
  const serializer = provider.type.serializer || ((x) => x);
  return serializer(provider.details);
};

const getSettingsUrl = (uuid) =>
  `${ENV.apiEndpoint}api/service-settings/${uuid}/`;

export const updateProvider = (provider) =>
  sendForm('patch', getSettingsUrl(provider.details.uuid), {
    name: provider.name,
    ...serializeDetails(provider),
  });
