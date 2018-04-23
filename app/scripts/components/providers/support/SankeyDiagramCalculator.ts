export default class SankeyDiagramCalculator {
  getResourcesSum(serviceUsage, providerUuid) {
    return serviceUsage.usage.reduce((total, entry) => {
      if (entry.provider_to_consumer.provider_uuid === providerUuid) {
        total += entry.data.cpu;
      }
      return total;
    }, 0);
  }

  calculateValue(serviceUsage, providerUuid, consumerUuid) {
    const totalProviderResources = this.getResourcesSum(serviceUsage, providerUuid);
    const providerResources = serviceUsage.usage.reduce((value, entry) => {
      if (entry.provider_to_consumer.provider_uuid === providerUuid &&
        entry.provider_to_consumer.consumer_uuid === consumerUuid) {
        value += entry.data.cpu;
      }
      return value;
    }, 0);
    return Math.round(providerResources * 10 / totalProviderResources);
  }

  getResourcesSumForCountry(serviceUsage, countryName) {
    return serviceUsage.usage.reduce((total, entry) => {
      const country = serviceUsage.organizations[entry.provider_to_consumer.provider_uuid].country;
      if (countryName === country) {
        total += entry.data.cpu;
      }
      return total;
    }, 0);
  }

  calculateValueForCountry(serviceUsage, providerUuid) {
    const country = serviceUsage.organizations[providerUuid].country;
    const totalProviderResourcesForCountry = this.getResourcesSumForCountry(serviceUsage, country);
    const providerResources = serviceUsage.usage.reduce((value, entry) => {
      if (entry.provider_to_consumer.provider_uuid === providerUuid) {
        value += entry.data.cpu;
      }
      return value;
    }, 0);
    return Math.round(providerResources * 10 / totalProviderResourcesForCountry);
  }
}
