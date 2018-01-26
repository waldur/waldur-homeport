import { $http, ENV } from './services';

export const get = (endpoint: string, options?: any) =>
  $http.get(`${ENV.apiEndpoint}api${endpoint}`, options);

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
