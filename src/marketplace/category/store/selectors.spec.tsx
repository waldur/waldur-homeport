import { formatAttributesFilter } from './selectors';

describe('formatAttributesFilter', () => {
  it("should properly format data from redux form to comply with backend's expected format", () => {
    const filterQuery = {
      'list-secure_at_rest-0': 'very secure',
      'list-secure_at_rest-1': 'less secure',
      'choice-secure_in_transit-1': 'low',
      'choice-secure_in_transit-2': 'high',
      'boolean-approved-2': 'true',
      'number-quantity-3': 4,
    };
    const expected = {
      secure_at_rest: ['very secure', 'less secure'],
      secure_in_transit: 'high',
      approved: true,
      quantity: 4,
    };
    expect(formatAttributesFilter(filterQuery)).toEqual(expected);
  });
});
