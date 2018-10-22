import { ProviderConfig } from './types';

const providers: {[key: string]: ProviderConfig} = {};

export const register = (provider: ProviderConfig) => {
  providers[provider.type] = provider;
};

export const findProvider = type => providers[type];

export const getEnabledProviders = state => {
  const disabled = state.config.disabledServices
    .reduce((map, item) => ({...map, [item]: true}), {});

  const types = [];
  for (const category of state.config.serviceCategories) {
    for (const type of category.services) {
      const provider = providers[type];
      if (provider && !disabled[type]) {
        types.push(provider);
      }
    }
  }
  return types;
};

export const getTypeDisplay = type => providers[type] ? providers[type].name : type;

export const getServiceIcon = type => `images/appstore/${providers[type].icon}`;

export const getSerializer = type => {
  const conf = findProvider(type);
  return conf && conf.serializer || (x => x);
};
