// @ngInject
export default function authService(
  $http, $auth, $rootScope, $window, $state, usersService, currentStateService,  ENV) {
  let vm = this;

  vm.signin = signin;
  vm.signup = signup;
  vm.activate = activate;
  vm.logout = logout;
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

  function logout() {
    $rootScope.$broadcast('logoutStart');
    delete $http.defaults.headers.common.Authorization;
    vm.user = {isAuthenticated: false};
    usersService.currentUser = null;
    usersService.cleanAllCache();
    $auth.logout();
    $rootScope.$broadcast('abortRequests');
    $state.go('login');
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
