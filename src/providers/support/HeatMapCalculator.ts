import { Feature, UsageData } from './types';

export const getTotal = (usageData: UsageData, country: string, entity: string) => {
  const key = `${entity}_uuid`;
  return usageData.usage.reduce((total, entry) => {
    const uuid = entry.provider_to_consumer[key];
    if (usageData.organizations[uuid].country === country) {
      total += entry.data.cpu;
    }
    return total;
  }, 0);
};

export const getDiff = (usage: UsageData, country: string) =>
  getTotal(usage, country, 'provider') - getTotal(usage, country, 'consumer');

export const getColor = diff => {
  if (diff > 0) {
    return '#1BBBE3';
  } else if (diff < 0) {
    return '#FF4233';
  } else {
    return '#FF4233';
  }
};

export const getStyle = (feature: Feature) => ({
  fillColor: getColor(feature.properties.diff),
  weight: 2,
  opacity: 1,
  color: 'white',
  dashArray: '3',
  fillOpacity: 0.7,
});

export const getDataForCountry = (usage: UsageData, country: string) => {
  return Object.keys(usage.service_providers).reduce((acc, uuid) => {
    if (usage.organizations[uuid].country === country) {
      acc.providers.push(usage.organizations[uuid]);
    }
    usage.service_providers[uuid].map(consumerUuid => {
      if (usage.organizations[consumerUuid].country === country
        && acc.consumers.indexOf(usage.organizations[consumerUuid]) === -1) {
        acc.consumers.push(usage.organizations[consumerUuid]);
      }
    });
    return acc;
  }, {providers: [], consumers: []});
};

export const getChartData = (serviceUsage: UsageData, countries: string[], features: Feature[]) => {
  const chartData = [];
  countries.map(country => {
    features.map(feature => {
      if (feature.properties.name === country) {
        chartData.push({
            ...feature,
            properties: {
              ...feature.properties,
              diff: getDiff(serviceUsage, country),
              data: getDataForCountry(serviceUsage, country),
            },
          });
        }
      });
  });
  return chartData;
};
