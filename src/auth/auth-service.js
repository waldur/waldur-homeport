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

import { translate } from '@waldur/i18n';

export class AuthService {
  // @ngInject
  constructor(
    $auth,
    $http,
    $rootScope,
    $window,
    $state,
    $uiRouterGlobals,
    usersService,
    currentStateService,
    ncUtilsFlash,
    ENV,
  ) {
    this.$auth = $auth;
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.$window = $window;
    this.$state = $state;
    this.$uiRouterGlobals = $uiRouterGlobals;
    this.usersService = usersService;
    this.currentStateService = currentStateService;
    this.ncUtilsFlash = ncUtilsFlash;
    this.ENV = ENV;
  }

  async signin(username, password) {
    this.$rootScope.$broadcast('enableRequests');
    const response = await this.$auth.login({
      username,
      password,
    });
    this.loginSuccess(response);
  }

  async authenticate(provider) {
    this.$rootScope.$broadcast('enableRequests');
    const response = await this.$auth.authenticate(provider);
    this.loginSuccess(response);
  }

  signup(user) {
    this.$rootScope.$broadcast('enableRequests');
    return Axios.post(this.ENV.apiEndpoint + 'api-auth/registration/', user);
  }

  async activate(user) {
    const url = this.ENV.apiEndpoint + 'api-auth/activation/';
    const response = await Axios.post(url, user);
    this.loginSuccess(response);
  }

  loginSuccess(response) {
    this.user = response.data;
    this.setAuthenticationMethod(response.data.method);
    this.setAuthHeader(this.user.token);
    this.$auth.setToken(this.user.token);
    this.user.isAuthenticated = true;
    this.$rootScope.$broadcast('authService:signin');
  }

  redirectOnSuccess() {
    const { toState, toParams } = this.$uiRouterGlobals.params;
    if (toState) {
      return this.$state.go(toState, toParams, { reload: true });
    } else {
      return this.$state.go('profile.details', { reload: true });
    }
  }

  setAuthenticationMethod(method) {
    localStorage['authenticationMethod'] = method;
  }

  resetAuthenticationMethod() {
    localStorage.removeItem('authenticationMethod');
  }

  getAuthenticationMethod() {
    return localStorage['authenticationMethod'];
  }

  logout() {
    const authenticationMethod = this.getAuthenticationMethod();
    if (
      authenticationMethod === 'saml2' &&
      this.ENV.plugins.WALDUR_AUTH_SAML2.ENABLE_SINGLE_LOGOUT
    ) {
      this.ncUtilsFlash.success(
        translate(
          'SAML2 single logout has been started. Please wait until it completes.',
        ),
      );
      this.$window.location = this.ENV.apiEndpoint + 'api-auth/saml2/logout/';
    } else {
      this.localLogout();
    }
  }

  localLogout(params) {
    this.$rootScope.$broadcast('logoutStart');
    delete this.$http.defaults.headers.common['Authorization'];
    delete Axios.defaults.headers.common['Authorization'];
    this.user = { isAuthenticated: false };
    this.usersService.currentUser = null;
    this.usersService.cleanAllCache();
    this.$auth.logout();
    this.$rootScope.$broadcast('abortRequests');
    this.$state.go('login', params);
    this.resetAuthenticationMethod();
  }

  setAuthHeader(token) {
    this.$http.defaults.headers.common['Authorization'] = 'Token ' + token;
    Axios.defaults.headers.common['Authorization'] = 'Token ' + token;
  }

  isAuthenticated() {
    return this.$auth.isAuthenticated();
  }

  getDownloadLink(href) {
    if (href) {
      return href + '?x-auth-token=' + this.$auth.getToken() + '&download=true';
    }
  }

  getLink(href) {
    if (href) {
      return href + '?x-auth-token=' + this.$auth.getToken();
    }
  }
}
