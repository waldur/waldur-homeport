import { getNextPageUrl } from '@waldur/core/api';
import { ENV, $http } from '@waldur/core/services';

import { Fetcher } from './types';

export function createFetcher(endpoint: string): Fetcher {
  return request => {
    const url = `${ENV.apiEndpoint}api/${endpoint}/`;
    const params = {
      page: request.currentPage,
      page_size: request.pageSize,
      ...request.filter,
    }; // TO_DO: In the next release params should consider filters for exporting.
    return $http({
      method: 'GET',
      url,
      params,
    }).then(response => {
      const resultCount = parseInt(response.headers()['x-result-count'], 10);
      return {
        rows: Array.isArray(response.data) ? response.data : [],
        resultCount,
        obj: response,
      };
    });
  };
}

export async function fetchAll(fetch: Fetcher) {
  const request = {
    pageSize: 50,
    currentPage: 1,
  };

  let response = await fetch(request);
  let result = [];

  while (true) {
    result = result.concat(response.rows);
    const nextLink = getNextPageUrl(response.obj);
    const nextPage = parseInt(getNextPageNumber(nextLink), 10);
    if (nextPage) {
      request.currentPage = nextPage;
      response = await fetch(request);
    } else {
      break;
    }
  }
  return result;
}

export const getNextPageNumber = link => {
  if (link) {
    return link.split('/?page=')[1].split('&')[0];
  } else {
    return null;
  }
};
