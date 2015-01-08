'use strict';

// for csrf
(function() {
  angular.module('ncsaas')
    .config(['$httpProvider', csrf]);

  function csrf($httpProvider) {
    // $httpProvider.defaults.useXDomain = true;
    // delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }

})();

// redirects
(function() {
  angular.module('ncsaas')
    .config(['$httpProvider', initAuth]);

  function initAuth($httpProvider) {
    $httpProvider.interceptors.push(auth);

    function auth($q, $cookies) {
      var headerIsSet = false;
      function request(data) {

        if (!headerIsSet) {
          var token = $cookies.token;
          if (typeof token !== 'undefined' && token !== 'undefined') {
            $httpProvider.defaults.headers.common.Authorization = 'Token ' + token;
            headerIsSet = true;
          }
        }
        return data;
      }

      function responseError(rejection) {
        console.log(rejection);
        return $q.reject(rejection);
      }
      return {
        request: request,
        responseError: responseError
      };
    }

  }

})();
