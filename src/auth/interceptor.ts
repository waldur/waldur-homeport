import { RawParams } from '@uirouter/react';
import Axios from 'axios';
import Qs from 'qs';

import { ENV } from '@waldur/configs/default';
import { cleanObject, wait } from '@waldur/core/utils';
import { router } from '@waldur/router';

import { AuthService } from './AuthService';
import { getToken } from './TokenStorage';

export function initAuthToken() {
  // When application starts up, we need to inject auth token if it exists
  const token = getToken();
  if (token) {
    Axios.defaults.headers.common['Authorization'] = 'Token ' + token;
  }
}

Axios.defaults.paramsSerializer = (params) =>
  Qs.stringify(params, { arrayFormat: 'repeat' });

// On 401 error received, user session has expired and he should logged out
Axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function invalidTokenInterceptor(error) {
    if (
      error.response?.status === 401 &&
      error.config.url !== ENV.apiEndpoint + 'api-auth/password/' &&
      !error.config.hasOwnProperty('__skipLogout__')
    ) {
      let params: { toState: string; toParams: RawParams };
      if (router.globals.transition) {
        const target = router.globals.transition.targetState();
        params = {
          toState: target.name(),
          toParams: target.params(),
        };
      } else if (router.globals.$current.name === 'login') {
        params = router.globals.params as any;
      } else if (router.globals.$current.name) {
        params = {
          toState: router.globals.$current.name,
          toParams: router.globals.params
            ? cleanObject(router.globals.params)
            : undefined,
        };
      }
      AuthService.localLogout(params);
    }
    return Promise.reject(error);
  },
);

Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 429) {
      // If the error has status code 429, retry the request
      return wait(1000).then(() => Axios.request(error.config));
    }
    return Promise.reject(error);
  },
);
