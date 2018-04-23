import { data } from './api';
import SankeyDiagramCalculator from './SankeyDiagramCalculator';

describe('SankeyDiagramCalculator', () => {
  beforeAll(() => {
    this.sankeyDiagramCalculator = new SankeyDiagramCalculator();
    this.data = data;
  });

  it('should return total number of resources provided by particular organization', () => {
    const totalResourcesSum = this.sankeyDiagramCalculator.getResourcesSum(this.data, 'uni_of_tartu');
    expect(totalResourcesSum).toEqual(200000);
  });

  it('should return total number of provided resources in specific country', () => {
    const totalResourcesSumForCountry = this.sankeyDiagramCalculator.getResourcesSumForCountry(this.data, 'Estonia');
    expect(totalResourcesSumForCountry).toEqual(200000);
  });

  it('should calculate portion of provided resources against total sum', () => {
    const portionOfResources = this.sankeyDiagramCalculator.calculateValue(this.data, 'uni_of_tartu', 'tampere');
    expect(portionOfResources).toEqual(5);
  });

  it('should calculate total resources for a country', () => {
    const totalResourcesForCountry = this.sankeyDiagramCalculator.calculateValueForCountry(this.data, 'uni_of_tartu');
    expect(totalResourcesForCountry).toEqual(10);
  });

});
