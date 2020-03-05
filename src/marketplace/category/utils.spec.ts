import { countSelectedFilters, countSelectedFilterValues } from './utils';

describe('countSelectedFilters', () => {
  it('should count total number of selected filters', () => {
    const filterValues = {
      'boolean-approved-5': 'true',
      'choice-security_at_rest-3': 'very_secure',
      'list-security_in_transit-0': 'option2',
      'list-security_in_transit-1': 'option1',
    };
    expect(countSelectedFilters(filterValues)).toEqual(3);
  });
});

describe('countSelectedFilterValues', () => {
  it('should count selected values for a particular filter', () => {
    const filterValues = {
      'boolean-approved-5': 'true',
      'choice-security_at_rest-3': 'very_secure',
      'list-security_in_transit-0': 'option2',
      'list-security_in_transit-1': 'option1',
    };
    expect(
      countSelectedFilterValues(filterValues, 'security_in_transit'),
    ).toEqual(2);
  });
});
