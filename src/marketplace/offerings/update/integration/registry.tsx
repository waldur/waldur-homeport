import { getProviderType } from '@waldur/marketplace/common/registry';

import { ProviderConfig } from './types';

const providers: { [key: string]: ProviderConfig } = {};

export const register = (provider: ProviderConfig) => {
  providers[provider.type] = provider;
};

export const findProvider = (type) => providers[type];

export const getTypeDisplay = (type) =>
  providers[type] ? providers[type].name : type;

export const getServiceIcon = (type) =>
  `images/appstore/${providers[type].icon}`;

export const getSerializer = (type) => {
  const conf = findProvider(type);
  return (conf && conf.serializer) || ((x) => x);
};

export const getServiceSettingsForm = (type) => {
  const providerType = getProviderType(type);
  if (providerType) {
    const providerConfig = findProvider(providerType);
    return providerConfig.component;
  }
};
