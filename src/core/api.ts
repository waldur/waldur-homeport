import Axios, {
  AxiosPromise,
  Method,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

import { ENV } from './services';

const fixURL = (endpoint: string) =>
  endpoint.startsWith('http') ? endpoint : `${ENV.apiEndpoint}api${endpoint}`;

export const parseResultCount = (response: AxiosResponse): number =>
  parseInt(response.headers['x-result-count'], 10);

export function get<T = {}>(
  endpoint: string,
  options?: AxiosRequestConfig,
): AxiosPromise<T> {
  return Axios.get(fixURL(endpoint), options);
}

export function getList<T = {}>(endpoint: string, params?: {}): Promise<T[]> {
  const options = params ? { params } : undefined;
  return get<T>(endpoint, options).then((response) =>
    Array.isArray(response.data) ? response.data : [],
  );
}

export function getSelectData<T = {}>(endpoint: string, params?: {}): any {
  const options = params ? { params } : undefined;
  return get<T>(endpoint, options).then((response) => ({
    options: Array.isArray(response.data) ? response.data : [],
    totalItems: parseResultCount(response),
  }));
}

export function getFirst<T = {}>(endpoint, params?) {
  return getList<T>(endpoint, params).then((data) => data[0]);
}

export function getById<T = {}>(
  endpoint: string,
  id: string,
  options?: AxiosRequestConfig,
): Promise<T> {
  return get<T>(`${endpoint}${id}/`, options).then((response) => response.data);
}

export function remove<T = {}>(
  endpoint: string,
  options?: AxiosRequestConfig,
): AxiosPromise<T> {
  return Axios.delete(fixURL(endpoint), options);
}

export function deleteById<T = {}>(endpoint, id, options?: AxiosRequestConfig) {
  return remove<T>(`${endpoint}${id}/`, options).then(
    (response) => response.data,
  );
}

export function post<T = {}>(endpoint: string, data?: any): AxiosPromise<T> {
  return Axios.post(fixURL(endpoint), data);
}

export function patch<T = {}>(endpoint: string, data?: any): AxiosPromise<T> {
  return Axios.patch(fixURL(endpoint), data);
}

export function put<T = {}>(endpoint: string, data?: any): AxiosPromise<T> {
  return Axios.put(fixURL(endpoint), data);
}

export function sendForm<T = {}>(
  method: Method,
  url: string,
  options,
): AxiosPromise<T> {
  const data = new FormData();
  for (const name of Object.keys(options)) {
    if (options[name] !== undefined) {
      data.append(name, options[name]);
    }
  }
  return Axios.request({
    method,
    url,
    data,
    transformRequest: (x) => x,
    headers: { 'Content-Type': undefined },
  });
}

export const getNextPageUrl = (response) => {
  // Extract next page URL from header links
  const link = response.headers['link'];
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

export async function getAll<T = {}>(
  endpoint: string,
  options?: AxiosRequestConfig,
): Promise<T[]> {
  let response = await get(endpoint, options);
  let result = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Array.isArray(response.data)) {
      result = result.concat(response.data);
    }
    const url = getNextPageUrl(response);
    if (url) {
      response = await Axios.get(url);
    } else {
      break;
    }
  }
  return result;
}
