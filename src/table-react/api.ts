import { IHttpResponse } from 'angular';

import { getNextPageUrl } from '@waldur/core/api';
import { ENV, $http } from '@waldur/core/services';
import { parseQueryString } from '@waldur/core/utils';

import { Fetcher, TableRequest } from './types';

export function createFetcher(endpoint: string): Fetcher {
  return (request: TableRequest) => {
    const url = `${ENV.apiEndpoint}api/${endpoint}/`;
    const params = {
      page: request.currentPage,
      page_size: request.pageSize,
      ...request.filter,
    };
    return $http({
      method: 'GET',
      url,
      params,
    }).then((response: IHttpResponse<any>) => {
      const resultCount = parseInt(response.headers()['x-result-count'], 10);
      return {
        rows: Array.isArray(response.data) ? response.data : [],
        resultCount,
        nextPage: getNextPageNumber(getNextPageUrl(response)),
      };
    });
  };
}

export async function fetchAll(fetch: Fetcher, filter?: Record<string, string>) {
  const request: TableRequest = {
    pageSize: 50,
    currentPage: 1,
    filter,
  };

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

export function getNextPageNumber(link: string): number {
  if (link) {
    const parts = parseQueryString(link.split('/?')[1]);
    if (parts && parts.page) {
      return parseInt(parts.page, 10);
    }
  } else {
    return null;
  }
}
