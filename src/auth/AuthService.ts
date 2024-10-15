/*
 * For security reasons, third-party authentication backends, such as SAML2,
 * expect that when user is logged out, he is redirected to the logout URL so that
 * user session would be cleaned both in Waldur and authentication backend.
 *
 * Consider the following workflow:
 *
 * 1) When login is completed, authentication method is persisted in the authStorage
 *    with key authenticationMethod so that it wouldn't be reset when page is refreshed.
 *
 * 2) When logout is initiated, it is first checked whether there's authentication method and
 *    corresponding logout link in the environment configuration with key logoutUrlMap.
 *
 * 3) User is redirected to the logout URL if it is defined.
 *
 * 4) After user is successfully logged out from third-party authentication backend, such as SAML2,
 *    he is redirected back to the HomePort.
 *
 * 5) Authentication token and authentication method is cleaned up in the auth storage.
 */
import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { cleanObject } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';
import { showSuccess } from '@waldur/store/notify';
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
import { OIDC_TYPES, SAML2_IDP } from './providers/constants';
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

function storeCurrentState() {
  if (router.globals.$current.name) {
    setRedirect({
      toState: router.globals.$current.name,
      toParams: router.globals.params
        ? cleanObject(router.globals.params)
        : undefined,
    });
  }
}

export function clearTokenHeader() {
  delete Axios.defaults.headers.Authorization;
}

function clearAuthCache() {
  storeCurrentState();
  store.dispatch(setCurrentUser(undefined));
  clearImpersonationData();
  clearTokenHeader();
  removeToken();
  resetAuthenticationMethod();
}

function localLogout(params?) {
  clearAuthCache();
  router.stateService.go('login', params);
}

function logout() {
  const authenticationMethod = getAuthenticationMethod();
  if (
    authenticationMethod === SAML2_IDP &&
    ENV.plugins.WALDUR_AUTH_SAML2.ENABLE_SINGLE_LOGOUT
  ) {
    store.dispatch(
      showSuccess(
        translate(
          'SAML2 single logout has been started. Please wait until it completes.',
        ),
      ),
    );
    clearAuthCache();
    window.location.href = ENV.apiEndpoint + 'api-auth/saml2/logout/';
  } else if (OIDC_TYPES.includes(authenticationMethod)) {
    clearAuthCache();
    router.stateService.go('home.oidc_logout', {
      provider: authenticationMethod,
    });
  } else {
    localLogout();
  }
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
  logout,
  storeRedirect,
};
