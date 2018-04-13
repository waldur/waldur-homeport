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
// export const calculateTotalConsumerResources = createSelector(
//   selectServiceUsage,
// );

// => {
//   return data.usage.reduce((total, entry) => {
//     const consumerUuid = entry.provider_to_consumer.consumer_uuid;
//     if (data.organizations[consumerUuid].country === country) {
//       total += entry.data.cpu;
//       total += entry.data.gpu;
//       total += entry.data.ram;
//     }
//     return total;
//   }, 0);
// }
