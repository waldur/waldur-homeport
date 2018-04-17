export default class HeatMapCalculator {
  keyForEntities = {
    provider: 'provider_uuid',
    consumer: 'consumer_uuid',
  };

  getKeyForEntity(entity) {
    return this.keyForEntities[entity];
  }

  calculateTotalResources(data, country, entity) {
    const key = this.getKeyForEntity(entity);
    return data.usage.reduce((total, entry) => {
      const uuid = entry.provider_to_consumer[key];
      if (data.organizations[uuid].country === country) {
        total += entry.data.cpu;
      }
      return total;
    }, 0);
  }

  getTotalMetricsDiff = (data, country) => {
    const totalProviderMetrics = this.calculateTotalResources(data, country, 'provider');
    const totalConsumerMetrics = this.calculateTotalResources(data, country, 'consumer');
    return totalProviderMetrics - totalConsumerMetrics;
  }

  getColor = diff => {
    if (diff > 0) {
      return '#1BBBE3';
    } else if (diff < 0) {
      return '#FF4233';
    } else {
      return '#FF4233';
    }
  }
}
