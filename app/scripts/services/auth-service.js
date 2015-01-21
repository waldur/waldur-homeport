'use strict';

(function() {
  angular.module('ncsaas')
    .service('authService', ['ENV', '$http', '$cookies', authService]);

  function authService(ENV, $http, $cookies) {
    /*jshint validthis: true */
    var vm = this;

    vm.signin = signin;
    vm.signup = signup;
    vm.signout = signout;

    function signin(username, password) {
      var request = $http.post(ENV.apiEndpoint + 'api-auth/password/', {username: username, password: password})
        .then(success);

      function success(data) {
        vm.user = data.data;
        setAuthCookie(vm.user.token);
        vm.user.isAuthenticated = true;
      }

      return request;
    }

    function signup(username, password) {
      var request = $http.post(ENV.apiEndpoint + 'api-auth/register/', {username: username, password: password})
        .then(success);

      function success(data) {
        vm.user = data;
        setAuthCookie(vm.user.token);
        vm.user.isAuthenticated = true;
      }

      return request;
    }

    function signout(){
      $cookies.token = undefined;
      delete $http.defaults.headers.common.Authorization;
      vm.user = {isAuthenticated: false};
    }

    function setAuthCookie(token) {
      $cookies.token = token;
      setAuthHeader(token);
    }

    function getAuthCookie() {
      return $cookies.token;
    }

    function setAuthHeader(token) {
      $http.defaults.headers.common.Authorization = 'Token ' + token;
    }

  }

})();
