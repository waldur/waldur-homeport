import { RequestResult } from 'waldur-js-client';
import { client } from 'waldur-js-client/client.gen';

import { queryClient } from '@waldur/Application';
import { fetchResultCount, parseNextPage } from '@waldur/core/api';

import { Fetcher, FetcherOptions, TableRequest } from './types';

const processApiResponse = (
  result: Awaited<RequestResult>,
  parser?: FetcherOptions['parser'],
) => {
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
  const nextPage = parseNextPage(result);
  return {
    rows,
    resultCount,
    nextPage,
  };
};

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
  return processApiResponse(result, parser);
};

type SdkFunction<QueryPayload = any, PathPayload = any> = (options?: {
  query?: QueryPayload;
  path?: PathPayload;
}) => RequestResult;

/**
 * Creates a fetcher function for a table, using a type-safe SDK function.
 * @param sdkFunction - The SDK function to call for fetching data.
 * @param options - Default options for the fetcher.
 */

export function createFetcher<QueryPayload = any, PathPayload = any>(
  sdkFunction: SdkFunction<QueryPayload, PathPayload>,
  options?: FetcherOptions<QueryPayload, PathPayload>,
): Fetcher {
  return (request: TableRequest) => {
    const {
      query: optionsParams,
      path: pathParams,
      parser,
      ...restOptions
    } = options || {};

    const { params: requestOptionsParams, ...restRequestOptions } =
      request.options || {};

    const mergedQueryParams = {
      page: request.currentPage,
      page_size: request.pageSize,
      ...request.filter,
      ...optionsParams,
      ...requestOptionsParams,
    };

    const mergedOptions = { ...restOptions, ...restRequestOptions };

    return queryClient.fetchQuery({
      queryKey: ['table', request.tableKey, pathParams, mergedQueryParams],
      queryFn: async () => {
        const result = await sdkFunction({
          path: pathParams,
          query: mergedQueryParams,
          ...mergedOptions,
        });
        return processApiResponse(result, parser);
      },
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
