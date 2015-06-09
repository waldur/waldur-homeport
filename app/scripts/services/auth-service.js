'use strict';

(function() {
  angular.module('ncsaas')
    .service('authService', ['$http', '$auth', 'usersService', '$rootScope', '$window', 'ENV', authService]);

  function authService($http, $auth, usersService, $rootScope, $window, ENV) {
    /*jshint validthis: true */
    var vm = this;

    vm.signin = signin;
    vm.signup = signup;
    vm.signout = signout;
    vm.isAuthenticated = isAuthenticated;
    vm.authenticate = authenticate;

    function signin(username, password) {
      var request = $auth.login({username: username, password: password})
        .then(loginSuccess);

      return request;
    }

    function authenticate(provider) {
      var request = $auth.authenticate(provider)
        .then(loginSuccess);

      return request;
    }

    function loginSuccess(data) {
      vm.user = data.data;
      setAuthHeader(vm.user.token);
      vm.user.isAuthenticated = true;
    }

    function signup(username, password) {
      var request = $auth.signup({username: username, password: password})
        .then(success);

      function success(data) {
        vm.user = data;
        setAuthHeader(vm.user.token);
        vm.user.isAuthenticated = true;
      }

      return request;
    }

    $rootScope.$on('authService:signout', function () {
      vm.signout();
    });

    function signout(){
      delete $http.defaults.headers.common.Authorization;
      delete $window.localStorage[ENV.currentCustomerUuidStorageKey]
      vm.user = {isAuthenticated: false};
      usersService.currentUser = null;
      $auth.logout();
    }

    function setAuthHeader(token) {
      $http.defaults.headers.common.Authorization = 'Token ' + token;
    }

    function isAuthenticated() {
      return $auth.isAuthenticated();
    }

  }

})();
