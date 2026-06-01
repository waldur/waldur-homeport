/**
 * Helper to mock a paginated list response from waldur-js-client.
 * Includes the necessary 'x-result-count' header used by fetchResultCount.
 * @param data Array of items to return in the 'data' field.
 * @param totalCount Optional total count for 'x-result-count' header. Defaults to data.length.
 */
export const mockListResponse = (data: any[], totalCount?: number) => {
  const headers = new Headers();
  headers.append('x-result-count', (totalCount ?? data.length).toString());
  headers.append('content-type', 'application/json');
  return {
    data,
    response: {
      headers,
    },
  } as any;
};
