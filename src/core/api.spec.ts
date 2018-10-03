import { getNextPageUrl } from './api';

describe('getNextPageUrl', () => {
  const fakeResponse = links => ({
    headers: () => links,
  });
  it('parses links header and returns next URL', () => {
    const links = '<https://example.com/api/customers/>; rel="first", ' +
                  '<https://example.com/api/customers/?page=2>; rel="next", ' +
                  '<https://example.com/api/customers/?page=13>; rel="last"';
    const response = fakeResponse(links);
    const nextPage = getNextPageUrl(response);
    expect(nextPage).toBe('https://example.com/api/customers/?page=2');
  });

  it('returns null if header does not contain links', () => {
    const response = fakeResponse(null);
    const nextPage = getNextPageUrl(response);
    expect(nextPage).toBe(null);
  });

  it('returns null if headers link do not contain next url', () => {
    const links = '<https://example.com/api/customers/>; rel="first"';
    const response = fakeResponse(links);
    const nextPage = getNextPageUrl(response);
    expect(nextPage).toBe(null);
  });
});
