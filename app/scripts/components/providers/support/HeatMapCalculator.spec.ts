import { data } from './api';
import HeatMapCalculator from './HeatMapCalculator';

describe('HeatMapCalculator', () => {
  beforeAll(() => {
    this.HeatMapCalculator = new HeatMapCalculator();
  });

  it('should calculate total resources for specific entity(provider or consumer)', () => {
    const country = 'Estonia';
    const totalProvidedResources = this.HeatMapCalculator.calculateTotalResources(data, country, 'provider');
    const totalConsumedResources = this.HeatMapCalculator.calculateTotalResources(data, country, 'consumer');
    expect(totalProvidedResources).toEqual(200000);
    expect(totalConsumedResources).toEqual(800000);
  });
});
