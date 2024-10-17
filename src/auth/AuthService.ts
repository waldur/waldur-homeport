import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import {
  clearImpersonationData,
  UsersService,
} from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';

import {
  getAuthenticationMethod,
  resetAuthenticationMethod,
  setAuthenticationMethod,
} from './AuthMethodStorage';
import { getRedirect, resetRedirect, setRedirect } from './AuthRedirectStorage';
import { getToken, removeToken, setToken } from './TokenStorage';

function setAuthHeader(token) {
  setToken(token);
  Axios.defaults.headers.Authorization = 'Token ' + token;
}

function loginSuccess(response) {
  setAuthenticationMethod(response.data.method);
  setAuthHeader(response.data.token);
  store.dispatch(setCurrentUser(response.data));
}

function isAuthenticated() {
  return !!getToken();
}

function getDownloadLink(href) {
  if (href) {
    return href + '?x-auth-token=' + getToken() + '&download=true';
  }
}

function getLink(href) {
  if (href) {
    return href + '?x-auth-token=' + getToken();
  }
}

async function signin(username, password) {
  const response = await Axios.post<{ token: string }>(
    ENV.apiEndpoint + 'api-auth/password/',
    {
      username,
      password,
    },
  );
  setAuthHeader(response.data.token);
  const user = await UsersService.getCurrentUser();
  loginSuccess({ data: { ...user, method: 'local' } });
}

function storeRedirect() {
  if (
    router.globals.params?.toState &&
    router.globals.params?.toState !== 'profile.details'
  ) {
    setRedirect({
      toState: router.globals.params.toState,
      toParams: router.globals.params.toParams,
    });
  }
}

function redirectOnSuccess() {
  const redirect = getRedirect();
  if (redirect) {
    resetRedirect();
    return router.stateService.go(redirect.toState, redirect.toParams, {
      reload: true,
      custom: {
        fallbackState: 'profile.details',
      },
    });
  } else {
    return router.stateService.go('profile.details', { reload: true });
  }
}

export function clearTokenHeader() {
  delete Axios.defaults.headers.Authorization;
}

function clearAuthCache() {
  store.dispatch(setCurrentUser(undefined));
  clearImpersonationData();
  clearTokenHeader();
  removeToken();
  resetAuthenticationMethod();
}

function localLogout() {
  clearAuthCache();
  router.stateService.go('login');
}

export const AuthService = {
  setAuthenticationMethod,
  resetAuthenticationMethod,
  getAuthenticationMethod,
  setAuthHeader,
  loginSuccess,
  isAuthenticated,
  getDownloadLink,
  getLink,
  signin,
  redirectOnSuccess,
  localLogout,
  clearAuthCache,
  storeRedirect,
};
