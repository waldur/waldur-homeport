import { RawParams } from '@uirouter/react';
import Axios from 'axios';
import Qs from 'qs';

import { ENV } from '@waldur/configs/default';
import { router } from '@waldur/router';

import { AuthService } from './AuthService';

export function initAuthToken() {
  // When application starts up, we need to inject auth token if it exists
  const token = localStorage['AUTH_TOKEN'];
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
      error.response &&
      error.response.status === 401 &&
      error.config.url !== ENV.apiEndpoint + 'api-auth/password/'
    ) {
      let params: { toState: string; toParams: RawParams };
      if (router.globals.transition) {
        const target = router.globals.transition.targetState();
        params = {
          toState: target.name(),
          toParams: target.params(),
        };
      } else if (router.globals.$current.name) {
        params = {
          toState: router.globals.$current.name,
          toParams: router.globals.$current.params,
        };
      }
      AuthService.localLogout(params);
    }
    return Promise.reject(error);
  },
);
