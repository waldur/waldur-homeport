'use strict';

(function() {
  angular.module('ncsaas')
    .service('authService', ['ENV', '$http', '$cookies', '$auth', '$window', authService]);

  function authService(ENV, $http, $cookies, $auth) {
    /*jshint validthis: true */
    var vm = this;

    vm.signin = signin;
    vm.signup = signup;
    vm.signout = signout;
    vm.getAuthCookie = getAuthCookie;
    vm.isAuthenticated = isAuthenticated;

    function signin(username, password) {
/*      var request = $http.post(ENV.apiEndpoint + 'api-auth/password/', {username: username, password: password})
        .then(success);*/
      var request = $auth.login({username: username, password: password})
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
      delete $cookies.token;
      delete $http.defaults.headers.common.Authorization;
      vm.user = {isAuthenticated: false};
      $auth.logout();
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

    function isAuthenticated() {
      return $auth.isAuthenticated();
    }

  }

})();
