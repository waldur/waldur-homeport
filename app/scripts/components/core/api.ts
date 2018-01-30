import { $http, ENV } from './services';

export const get = (endpoint: string, options?: any) =>
  $http.get(`${ENV.apiEndpoint}api${endpoint}`, options);

export const getList = (endpoint, params?) => {
  const options = params ? {params} : undefined;
  return get(endpoint, options).then(response =>
    Array.isArray(response.data) ?
    response.data :
    []
  );
};

export const getFirst = (endpoint, params?) =>
  getList(endpoint, params).then(data => data[0]);

export const post = (endpoint: string, options?: any) =>
  $http.post(`${ENV.apiEndpoint}api${endpoint}`, options);

export const sendForm = (method: string, url: string, options) => {
  const data = new FormData();
  for (const name of Object.keys(options)) {
    if (options[name] !== undefined) {
      data.append(name, options[name]);
    }
  }
  return $http({
    method,
    url,
    data,
    transformRequest: x => x,
    headers: {'Content-Type': undefined},
  });
};
