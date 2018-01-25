import { $http, ENV } from './services';

export const getList = (endpoint: string, params?: any) => {
  const options = params ? {params} : undefined;
  return $http
    .get(`${ENV.apiEndpoint}api${endpoint}`, options)
    .then(response => response.data);
};

export const getFirst = (endpoint: string, params?: any) =>
  getList(endpoint, params).then(list => list[0]);

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
