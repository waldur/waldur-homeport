import { getNextPageUrl } from '@waldur/core/api';
import { ENV, $http } from '@waldur/core/services';

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
    }).then((response: angular.IHttpResponse<any>) => {
      const resultCount = parseInt(response.headers()['x-result-count'], 10);
      return {
        rows: Array.isArray(response.data) ? response.data : [],
        resultCount,
        nextPage: getNextPageNumber(getNextPageUrl(response)),
      };
    });
  };
}

// TODO: Implement support for filtering
export async function fetchAll(fetch: Fetcher) {
  const request = {
    pageSize: 50,
    currentPage: 1,
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
    return parseInt(link.split('/?page=')[1].split('&')[0], 10);
  } else {
    return null;
  }
}
