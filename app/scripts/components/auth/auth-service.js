/*
 * For security reasons, third-party authentication backends, such as SAML2 or OpenID,
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

// @ngInject
export default function authService(
  $http, $auth, $rootScope, $window, $state, usersService, currentStateService, ncUtilsFlash, ENV) {
  let vm = this;

  vm.signin = signin;
  vm.signup = signup;
  vm.activate = activate;
  vm.logout = logout;
  vm.localLogout = localLogout;
  vm.isAuthenticated = isAuthenticated;
  vm.authenticate = authenticate;
  vm.getDownloadLink = getDownloadLink;
  vm.getLink = getLink;
  vm.loginSuccess = loginSuccess;

  function signin(username, password) {
    $rootScope.$broadcast('enableRequests');
    return $auth.login({username: username, password: password}).then(loginSuccess);
  }

  function authenticate(provider) {
    $rootScope.$broadcast('enableRequests');
    return $auth.authenticate(provider).then(loginSuccess);
  }

  function loginSuccess(response) {
    vm.user = response.data;
    setAuthenticationMethod(response.data.method);
    setAuthHeader(vm.user.token);
    $auth.setToken(vm.user.token);
    vm.user.isAuthenticated = true;
    $rootScope.$broadcast('authService:signin');
  }

  function signup(user) {
    $rootScope.$broadcast('enableRequests');
    return $http.post(ENV.apiEndpoint + 'api-auth/registration/', user);
  }

  function activate(user) {
    return $http.post(ENV.apiEndpoint + 'api-auth/activation/', user).then(loginSuccess);
  }

  function setAuthenticationMethod(method) {
    localStorage['authenticationMethod'] = method;
  }

  function resetAuthenticationMethod() {
    localStorage.removeItem('authenticationMethod');
  }

  function getAuthenticationMethod() {
    return localStorage['authenticationMethod'];
  }

  function logout() {
    const authenticationMethod = getAuthenticationMethod();
    if (authenticationMethod === 'saml2' && ENV.plugins.WALDUR_AUTH_SAML2.ENABLE_SINGLE_LOGOUT) {
      ncUtilsFlash.success(gettext('SAML2 single logout has been started. Please wait until it completes.'));
      $window.location = ENV.apiEndpoint + 'api-auth/saml2/logout/';
    } else {
      localLogout();
    }
  }

  function localLogout() {
    $rootScope.$broadcast('logoutStart');
    delete $http.defaults.headers.common.Authorization;
    vm.user = {isAuthenticated: false};
    usersService.currentUser = null;
    usersService.cleanAllCache();
    $auth.logout();
    $rootScope.$broadcast('abortRequests');
    $state.go('login');
    resetAuthenticationMethod();
  }

  function setAuthHeader(token) {
    $http.defaults.headers.common.Authorization = 'Token ' + token;
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
}
