import { data } from './api';
import { getTotal } from './HeatMapCalculator';

describe('HeatMapCalculator', () => {
  it('should calculate total resources for specific entity(provider or consumer)', () => {
    const country = 'Estonia';
    const totalProvidedResources = getTotal(data, country, 'provider');
    const totalConsumedResources = getTotal(data, country, 'consumer');
    expect(totalProvidedResources).toEqual(200000);
    expect(totalConsumedResources).toEqual(800000);
  });
});
