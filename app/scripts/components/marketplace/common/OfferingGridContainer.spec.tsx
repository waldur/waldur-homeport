import { formatAttributesFilter } from './OfferingGridContainer';

describe('formatAttributesFilter', () => {
  it('should properly format data from redux form to comply with backend\'s expected format', () => {
    const filterQuery = {
      'secure_at_rest-0': 'very secure',
      'secure_at_rest-1': 'less secure',
    };
    const expected = {
      secure_at_rest: ['very secure', 'less secure'],
    };
    expect(formatAttributesFilter(filterQuery)).toEqual(expected);
  });
});
