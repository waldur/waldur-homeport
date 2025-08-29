import { client } from 'waldur-js-client/client.gen';

import { queryClient } from '@waldur/Application';
import { fetchResultCount, parseNextPage } from '@waldur/core/api';

import { Fetcher, FetcherOptions, TableRequest } from './types';

export const parseResponse = async (
  url: string,
  query?,
  options?,
  parser?: FetcherOptions['parser'],
) => {
  const result = await client.get({
    url,
    query,
    security: [
      {
        name: 'Authorization',
        type: 'apiKey',
      },
    ],
    ...options,
  });
  const contentType = result.response.headers
    .get('content-type')
    .toLowerCase()
    .split(';')[0]
    .trim();
  if (contentType !== 'application/json') {
    throw new Error('Unexpected response content type');
  }
  const rows = parser ? parser(result.data) : (result.data as any[]);
  const resultCount = fetchResultCount(result);
  return {
    rows,
    resultCount,
    nextPage: parseNextPage(result),
  };
};

export function createFetcher(
  endpoint: string,
  options?: FetcherOptions,
): Fetcher {
  return (request: TableRequest) => {
    const { params: optionsParams, parser, ...restOptions } = options || {};
    const { params: requestOptionsParams, ...restRequestOptions } =
      request.options || {};
    const mergedParams = {
      page: request.currentPage,
      page_size: request.pageSize,
      ...request.filter,
      ...optionsParams,
      ...requestOptionsParams,
    };
    const mergedOptions = { ...restOptions, ...restRequestOptions };
    return queryClient.fetchQuery({
      queryKey: ['table', endpoint, mergedParams],
      queryFn: () =>
        parseResponse(`/api/${endpoint}/`, mergedParams, mergedOptions, parser),
      staleTime: request.options?.staleTime,
    });
  };
}

export async function fetchAll(fetch: Fetcher, request: TableRequest) {
  let response = await fetch(request);
  let result = [];

  while (true) {
    result = result.concat(response.rows);
    if (response.nextPage) {
      request.currentPage = response.nextPage;
      response = await fetch(request);
    } else {
      break;
    }
  }
  return result;
}

export const ANONYMOUS_CONFIG = {
  transformRequest: [
    (data, headers) => {
      delete headers.Authorization;
      return data;
    },
  ],
};
