import { createSelector } from 'reselect';

export const selectServiceUsage = state => state.serviceUsage.data;
export const selectServiceProviderUuid = state => state.serviceUsage.selectedServiceProviderUuid;
export const selectInfoPanelStatus = state => state.serviceUsage.infoPanelIsVisible;

export const selectServiceProvider = createSelector(
  selectServiceUsage, selectServiceProviderUuid,
  (serviceUsage, serviceProviderUuid) => {
    return serviceUsage.organizations[serviceProviderUuid];
  }
);

export const selectServiceProviderConsumers = createSelector(
  selectServiceUsage, selectServiceProviderUuid,
  (serviceUsage, serviceProviderUuid) => {
    return serviceUsage.usage.reduce((acc, entry) => {
      if (entry.provider_to_consumer.provider_uuid === serviceProviderUuid) {
        acc.push({
          ...entry.data,
          name: serviceUsage.organizations[entry.provider_to_consumer.consumer_uuid].name,
        });
      }
      return acc;
    }, []);
  }
);

export const selectCountriesToRender = createSelector(
  selectServiceUsage,
  serviceUsage => {
    return Object.keys(serviceUsage.service_providers).reduce((acc, providerUuid) => {
      const countryOfProvider = serviceUsage.organizations[providerUuid].country;
      if (acc.indexOf(countryOfProvider) === -1) {
        acc.push(countryOfProvider);
      }
      const countriesOfConsumers = serviceUsage.service_providers[providerUuid];
      countriesOfConsumers.map(consumerUuid => {
        const countryOfConsumer = serviceUsage.organizations[consumerUuid].country;
        if (acc.indexOf(countryOfConsumer) === -1) {
          acc.push(countryOfConsumer);
        }
      });
      return acc;
    }, []);
  }
);

export const propertySelectorFactory = target => createSelector(
  selectServiceUsage,
  serviceUsage => {
    const names = [];
    const namesObjects = [];
    Object.keys(serviceUsage.service_providers).map(providerUuid => {
      const name = serviceUsage.organizations[providerUuid][target];
      if (names.indexOf(name) === -1) {
        namesObjects.push({
          name: serviceUsage.organizations[providerUuid][target],
        });
        names.push(name);
      }
      serviceUsage.service_providers[providerUuid].map(consumerUuid => {
        const consumerName = serviceUsage.organizations[consumerUuid][target];
        if (names.indexOf(consumerName) === -1) {
          namesObjects.push({
            name: consumerName,
          });
          names.push(consumerName);
        }
      });
    });
    return namesObjects;
  }
);
