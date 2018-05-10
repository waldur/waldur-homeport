import { ENV, $http } from '@waldur/core/services';

import { Fetcher } from './types';

export function createFetcher(endpoint: string): Fetcher {
  return request => {
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
    }).then(response => {
      const resultCount = parseInt(response.headers()['x-result-count'], 10);
      const link = response.headers('link');
      return {
        rows: Array.isArray(response.data) ? response.data : [],
        resultCount,
        link,
      };
    });
  };
}

export async function fetchAll(fetch: Fetcher) {
  const request = {
    pageSize: 10,
    currentPage: 1,
  };

  let response = await fetch(request);
  let result = [];

  while (true) {
    result = result.concat(response.rows);
    const nextPage = parseInt(parseNextPage(response.link), 10);
    if (nextPage) {
      request.currentPage = nextPage;
      response = await fetch(request);
    } else {
      break;
    }
  }
  return result;
}

export const parseNextPage = link => {
  const nextLink = link.split(', ').filter(s => s.indexOf('rel="next"') > -1)[0];
  if (!nextLink) {
    return null;
  }
  const parsedLink = nextLink.split(';')[0].slice(1, -1);
  return parsedLink.split('/?page=')[1].split('&')[0];
};
