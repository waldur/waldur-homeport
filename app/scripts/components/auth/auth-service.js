// @ngInject
export default function authService($http, $auth, usersService, $rootScope, $window, ENV) {
    /*jshint validthis: true */
  var vm = this;

  vm.signin = signin;
  vm.signup = signup;
  vm.activate = activate;
  vm.signout = signout;
  vm.isAuthenticated = isAuthenticated;
  vm.authenticate = authenticate;
  vm.getDownloadLink = getDownloadLink;
  vm.getLink = getLink;
  vm.loginSuccess = loginSuccess;

  function signin(username, password) {
    return $auth.login({username: username, password: password}).then(loginSuccess);
  }

  function authenticate(provider) {
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
    return $http.post(ENV.apiEndpoint + 'api-auth/registration/', user);
  }

  function activate(user) {
    return $http.post(ENV.apiEndpoint + 'api-auth/activation/', user).then(loginSuccess);
  }

  $rootScope.$on('authService:signout', function () {
    vm.signout();
  });

  function signout() {
    delete $http.defaults.headers.common.Authorization;
    vm.user = {isAuthenticated: false};
    usersService.currentUser = null;
    usersService.cleanAllCache();
    $auth.logout();
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
