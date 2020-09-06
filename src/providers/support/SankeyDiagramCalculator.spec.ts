import { data } from './api';
import SankeyDiagramCalculator from './SankeyDiagramCalculator';

describe('SankeyDiagramCalculator', () => {
  it('should return total number of resources provided by particular organization', () => {
    const totalResourcesSum = new SankeyDiagramCalculator().getResourcesSum(
      data,
      'uni_of_tartu',
    );
    expect(totalResourcesSum).toEqual(200000);
  });

  it('should return total number of provided resources in specific country', () => {
    const totalResourcesSumForCountry = new SankeyDiagramCalculator().getResourcesSumForCountry(
      data,
      'Estonia',
    );
    expect(totalResourcesSumForCountry).toEqual(200000);
  });

  it('should calculate portion of provided resources against total sum', () => {
    const portionOfResources = new SankeyDiagramCalculator().calculateValue(
      data,
      'uni_of_tartu',
      'tampere',
    );
    expect(portionOfResources).toEqual(5);
  });

  it('should calculate total resources for a country', () => {
    const totalResourcesForCountry = new SankeyDiagramCalculator().calculateValueForCountry(
      data,
      'uni_of_tartu',
    );
    expect(totalResourcesForCountry).toEqual(10);
  });
});
