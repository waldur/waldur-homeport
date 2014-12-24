'use strict';

(function() {
  angular.module('ncsaas')
    .service('auth', ['API', '$http', '$cookies', auth]);

  function auth(API, $http, $cookies) {
    /*jshint validthis: true */
    var vm = this;

    vm.signin = signin;
    vm.signup = signup;
    vm.signout = signout;

    function signin(username, password) {
      var request = $http.post(API + 'ncauth/signin/', {username: username, password: password})
        .then(success);

      function success(data) {
        vm.user = data.data;
        /*jshint camelcase: false*/
        setAuthCookie(vm.user.auth_token);
        vm.user.isAuthenticated = true;
      }

      return request;
    }

    function signup(username, password) {
      var request = $http.post(API + 'ncauth/signup/', {username: username, password: password})
        .then(success);

      function success(data) {
        vm.user = data;
        /*jshint camelcase: false*/
        setAuthCookie(vm.user.auth_token);
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
