import Axios, { AxiosRequestConfig } from 'axios';

import { ENV } from '@waldur/configs/default';
import { get, getAll, parseResultCount, post, put } from '@waldur/core/api';

export const getCustomersCount = () =>
  Axios.head(`${ENV.apiEndpoint}api/customers/`).then((response) =>
    parseResultCount(response),
  );

export const getProjectsCount = () =>
  Axios.head(`${ENV.apiEndpoint}api/projects/`).then((response) =>
    parseResultCount(response),
  );

export const getUsersCount = () =>
  Axios.head(`${ENV.apiEndpoint}api/users/`).then((response) =>
    parseResultCount(response),
  );

export const getCategoriesCount = () =>
  Axios.head(`${ENV.apiEndpoint}api/marketplace-categories/`).then((response) =>
    parseResultCount(response),
  );

export const getProviderOfferingsCount = (configs?: AxiosRequestConfig<any>) =>
  Axios.head(
    `${ENV.apiEndpoint}api/marketplace-provider-offerings/`,
    configs,
  ).then((response) => parseResultCount(response));

export const getResourcesCount = (configs?: AxiosRequestConfig<any>) =>
  Axios.head(`${ENV.apiEndpoint}api/marketplace-resources/`, configs).then(
    (response) => parseResultCount(response),
  );

export const getVersion = () =>
  get<{ version: string | number }>('/version/').then(
    (response) => response.data,
  );

export const getIdentityProviders = () =>
  getAll<{ provider }>('/identity-providers/');

export const getIdentityProvider = (type) =>
  get<{ client_id; logout_url }>(`/identity-providers/${type}/`).then(
    (response) => response.data,
  );

export const createIdentityProvider = (formData) =>
  post('/identity-providers/', formData);

export const updateIdentityProvider = (provider, formData) =>
  put(`/identity-providers/${provider}/`, formData);

export const deleteToken = (tokenURL: string) => Axios.delete(tokenURL);
