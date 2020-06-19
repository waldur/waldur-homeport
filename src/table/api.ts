import Axios, { AxiosResponse } from 'axios';

import { getNextPageUrl } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { parseQueryString } from '@waldur/core/utils';

import { Fetcher, TableRequest } from './types';

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

export const parseResponse = (url, params) =>
  Axios.request({
    method: 'GET',
    url,
    params,
  }).then((response: AxiosResponse<any>) => {
    const resultCount = parseInt(response.headers['x-result-count'], 10);
    return {
      rows: Array.isArray(response.data) ? response.data : [],
      resultCount,
      nextPage: getNextPageNumber(getNextPageUrl(response)),
    };
  });

export function createFetcher(endpoint: string): Fetcher {
  return (request: TableRequest) => {
    const url = `${ENV.apiEndpoint}api/${endpoint}/`;
    const params = {
      page: request.currentPage,
      page_size: request.pageSize,
      ...request.filter,
    };
    return parseResponse(url, params);
  };
}

export async function fetchAll(
  fetch: Fetcher,
  filter?: Record<string, string>,
) {
  const request: TableRequest = {
    pageSize: 50,
    currentPage: 1,
    filter,
  };

  let response = await fetch(request);
  let result = [];

  // eslint-disable-next-line no-constant-condition
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
