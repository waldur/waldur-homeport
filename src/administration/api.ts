import Axios, { AxiosRequestConfig } from 'axios';

import { ENV } from '@waldur/configs/default';
import { get, parseResultCount } from '@waldur/core/api';

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
