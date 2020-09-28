/*
 * For security reasons, third-party authentication backends, such as SAML2,
 * expect that when user is logged out, he is redirected to the logout URL so that
 * user session would be cleaned both in Waldur and authentication backend.
 *
 * Consider the following workflow:
 *
 * 1) When login is completed, authentication method is persisted in the localStorage
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
 * 5) Authentication token and authentication method is cleaned up in the local storage.
 */
import Axios from 'axios';

import {
  $state,
  $auth,
  $http,
  $uiRouterGlobals,
  ENV,
} from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/coreSaga';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';

function setAuthenticationMethod(method) {
  localStorage['authenticationMethod'] = method;
}

function resetAuthenticationMethod() {
  localStorage.removeItem('authenticationMethod');
}

function getAuthenticationMethod() {
  return localStorage['authenticationMethod'];
}

function setAuthHeader(token) {
  $http.defaults.headers.common['Authorization'] = 'Token ' + token;
  Axios.defaults.headers.common['Authorization'] = 'Token ' + token;
}

function loginSuccess(response) {
  setAuthenticationMethod(response.data.method);
  setAuthHeader(response.data.token);
  $auth.setToken(response.data.token);
  store.dispatch(setCurrentUser(response.data));
}

function isAuthenticated() {
  return $auth.isAuthenticated();
}

function getDownloadLink(href) {
  if (href) {
    return href + '?x-auth-token=' + $auth.getToken() + '&download=true';
  }
}

function getLink(href) {
  if (href) {
    return href + '?x-auth-token=' + $auth.getToken();
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

async function authenticate(provider) {
  const response = await $auth.authenticate(provider);

  setAuthHeader(response.data.token);
  const user = await UsersService.getCurrentUser();
  loginSuccess({ data: { ...user, method: provider } });
}

function signup(user) {
  return Axios.post(ENV.apiEndpoint + 'api-auth/registration/', user);
}

async function activate(user) {
  const url = ENV.apiEndpoint + 'api-auth/activation/';
  const response = await Axios.post(url, user);
  loginSuccess(response);
}

function redirectOnSuccess() {
  const { toState, toParams } = $uiRouterGlobals.params;
  if (toState) {
    return $state.go(toState, toParams, { reload: true });
  } else {
    return $state.go('profile.details', { reload: true });
  }
}

function localLogout(params?) {
  store.dispatch(setCurrentUser(undefined));
  delete $http.defaults.headers.common['Authorization'];
  delete Axios.defaults.headers.common['Authorization'];
  $auth.logout();
  $state.go('login', params);
  resetAuthenticationMethod();
}

function logout() {
  const authenticationMethod = getAuthenticationMethod();
  if (
    authenticationMethod === 'saml2' &&
    ENV.plugins.WALDUR_AUTH_SAML2.ENABLE_SINGLE_LOGOUT
  ) {
    store.dispatch(
      showSuccess(
        translate(
          'SAML2 single logout has been started. Please wait until it completes.',
        ),
      ),
    );
    window.location.href = ENV.apiEndpoint + 'api-auth/saml2/logout/';
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
  authenticate,
  signup,
  activate,
  redirectOnSuccess,
  localLogout,
  logout,
};
