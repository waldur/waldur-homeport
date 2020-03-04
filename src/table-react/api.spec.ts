import { getNextPageNumber } from '@waldur/table-react/api';

describe('getNextPageNumber', () => {
  const link =
    '<https://rest-test.nodeconductor.com/api/users/?page=2&page_size=10>; rel="next"';
  it('should parse link from response and extract next page number', () => {
    expect(getNextPageNumber(link)).toEqual(2);
  });
});
