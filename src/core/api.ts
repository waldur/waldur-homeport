import Qs from 'qs';
import { formDataBodySerializer, RequestResult } from 'waldur-js-client';
import { client } from 'waldur-js-client/client.gen';

import { setRedirect } from '@waldur/auth/AuthRedirectStorage';
import { localLogout } from '@waldur/auth/AuthService';
import { getToken } from '@waldur/auth/TokenStorage';
import { ENV } from '@waldur/core/config';
import { cleanObject } from '@waldur/core/utils';
import { getLanguageKey } from '@waldur/i18n/LanguageStorage';
import { router } from '@waldur/router';
import { getImpersonatedUserUuid } from '@waldur/workspace/WorkspaceStorage';

const querySerializer = (params) =>
  Qs.stringify(params, { arrayFormat: 'repeat' });

export function initApiClient() {
  const headers = {
    Accept: 'application/json',
  };

  headers['X-IMPERSONATED-USER-UUID'] = getImpersonatedUserUuid();

  if (getLanguageKey()) {
    headers['Accept-Language'] = getLanguageKey();
  }
  client.setConfig({
    auth: () => (getToken() ? 'Token ' + getToken() : undefined),
    baseUrl: ENV.apiEndpoint,
    throwOnError: true,
    headers,
    querySerializer,
  });
}

client.interceptors.response.use((response) => {
  if (
    response?.status === 401 &&
    response.url !== ENV.apiEndpoint + 'api-auth/password/'
  ) {
    if (router.globals.transition) {
      const target = router.globals.transition.targetState();
      setRedirect({
        toState: target.name(),
        toParams: target.params(),
      });
    } else if (router.globals.$current.name === 'login') {
      setRedirect(router.globals.params as any);
    } else if (router.globals.$current.name) {
      setRedirect({
        toState: router.globals.$current.name,
        toParams: router.globals.params
          ? cleanObject(router.globals.params)
          : undefined,
      });
    }
    localLogout();
  }
  return response;
});

export const getIconUrl = (name: string) =>
  `${ENV.apiEndpoint}api/icons/${name}/`;

const fixURL = (endpoint: string) =>
  endpoint.startsWith('http')
    ? endpoint
    : `${ENV.apiEndpoint}${endpoint.startsWith('/api') ? '' : 'api'}${endpoint}`;

export const fetchResultCount = (result: Awaited<RequestResult>): number =>
  parseInt(result.response.headers.get('x-result-count'), 10);

export async function get<T = any>(endpoint: string): Promise<T> {
  const response = await fetch(
    fixURL(endpoint),
    getToken()
      ? {
          headers: { Authorization: `Token ${getToken()}` },
        }
      : {},
  );
  const contentType = response.headers
    .get('content-type')
    .toLowerCase()
    .split(';')[0]
    .trim();
  if (contentType === 'application/json') {
    return await response.json();
  } else {
    return (await response.blob()) as T;
  }
}

export function parseSelectData<TData = {}>(
  result: Awaited<RequestResult<TData>>,
) {
  return {
    options: Array.isArray(result.data) ? (result.data as TData) : [],
    totalItems: fetchResultCount(result),
  };
}

export async function post(endpoint: string, data?: object) {
  await fetch(fixURL(endpoint), {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${getToken()}`,
    },
  });
}

export const getNextPageUrl = (response) => {
  // Extract next page URL from header links
  const link = response.headers['link'] || response.headers.get('link');
  if (!link) {
    return null;
  }

  const nextLink = link
    .split(', ')
    .filter((s) => s.indexOf('rel="next"') > -1)[0];
  if (!nextLink) {
    return null;
  }

  return nextLink.split(';')[0].slice(1, -1);
};

export async function getAllPages<T>(
  fetchPage: (page: number) => Promise<{ data: T[]; response }>,
): Promise<T[]> {
  let results: T[] = [];
  let nextUrl: string | undefined;
  let page = 1;

  do {
    const result = await fetchPage(page);
    results = results.concat(result.data);

    page += 1;
    if (result.response) {
      nextUrl = getNextPageUrl(result.response);
    }
  } while (nextUrl);

  return results;
}

export const formDataOptions = {
  ...formDataBodySerializer,
  headers: {
    'Content-Type': null,
  },
};

export const fileSerializer = (image) => {
  if (image === null) {
    return '' as null;
  } else if (image instanceof File) {
    return image;
  } else {
    return undefined;
  }
};

export function getNextPageNumber(link: string): number {
  if (link) {
    const parts = Qs.parse(link.split('/?')[1]);
    if (parts && typeof parts.page === 'string') {
      return parseInt(parts.page, 10);
    }
  } else {
    return null;
  }
}

export const parseNextPage = (result) =>
  getNextPageNumber(getNextPageUrl(result.response));

export const count = (url: string, query?) =>
  client
    .head({
      url,
      query,
      parseAs: 'text',
      security: [
        {
          name: 'Authorization',
          type: 'apiKey',
        },
      ],
    })
    .then(fetchResultCount);
